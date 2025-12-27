import { env } from "@/env";

const SHIPPO_BASE_URL = "https://api.goshippo.com";

interface ShippoAddress {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  email?: string;
}

interface ShippoParcel {
  length: number; // inches
  width: number;
  height: number;
  distance_unit: "in";
  weight: number; // lbs
  mass_unit: "lb";
}

interface ShippoRate {
  object_id: string;
  amount: string;
  currency: string;
  carrier: string;
  service: string;
  estimated_days: number;
  duration_terms: string;
}

interface ShippoValidationResult {
  object_id: string;
  is_valid: boolean;
  validation_results: {
    is_valid: boolean;
    messages: Array<{
      source: string;
      code: string;
      text: string;
      type: "warning" | "error";
    }>;
  };
}

interface ShippoTransaction {
  object_id: string;
  status: string;
  tracking_number: string;
  tracking_url_provider: string;
  label_url: string;
  rate: {
    carrier: string;
    service: string;
    amount: string;
  };
}

export class ShippoService {
  private apiKey: string;

  constructor() {
    this.apiKey = env.SHIPPO_API_KEY;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(`${SHIPPO_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `ShippoToken ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: response.statusText,
      }));
      throw new Error(
        `Shippo API error: ${error.detail || JSON.stringify(error)}`,
      );
    }

    return response.json();
  }

  /**
   * Validate a shipping address
   */
  async validateAddress(
    address: ShippoAddress,
  ): Promise<ShippoValidationResult> {
    return this.request<ShippoValidationResult>("/addresses", {
      method: "POST",
      body: JSON.stringify({
        ...address,
        validate: true,
      }),
    });
  }

  /**
   * Get shipping rates for a shipment
   * Returns available carrier rates for the given from/to addresses and parcels
   */
  async getRates(params: {
    fromAddress: ShippoAddress;
    toAddress: ShippoAddress;
    parcels: ShippoParcel[];
  }): Promise<{
    shipmentId: string;
    rates: ShippoRate[];
  }> {
    const shipment = await this.request<{
      object_id: string;
      rates: ShippoRate[];
    }>("/shipments", {
      method: "POST",
      body: JSON.stringify({
        address_from: params.fromAddress,
        address_to: params.toAddress,
        parcels: params.parcels,
        async: false, // Synchronous for immediate rates
      }),
    });

    // Sort rates by price (cheapest first)
    const sortedRates = shipment.rates.sort(
      (a, b) => parseFloat(a.amount) - parseFloat(b.amount),
    );

    return {
      shipmentId: shipment.object_id,
      rates: sortedRates,
    };
  }

  /**
   * Purchase a shipping label using a selected rate
   */
  async purchaseLabel(rateId: string): Promise<{
    transactionId: string;
    trackingNumber: string;
    trackingUrl: string;
    labelUrl: string;
    carrier: string;
    service: string;
    status: string;
  }> {
    const transaction = await this.request<ShippoTransaction>("/transactions", {
      method: "POST",
      body: JSON.stringify({
        rate: rateId,
        label_file_type: "PDF",
        async: false,
      }),
    });

    if (transaction.status === "ERROR" || transaction.status === "FAILURE") {
      throw new Error(
        `Failed to purchase shipping label: ${transaction.status}`,
      );
    }

    return {
      transactionId: transaction.object_id,
      trackingNumber: transaction.tracking_number,
      trackingUrl: transaction.tracking_url_provider,
      labelUrl: transaction.label_url,
      carrier: transaction.rate.carrier,
      service: transaction.rate.service,
      status: transaction.status,
    };
  }

  /**
   * Get tracking information for a shipment
   */
  async getTracking(
    carrier: string,
    trackingNumber: string,
  ): Promise<{
    status: string;
    statusDetails: string;
    eta: string | null;
    trackingHistory: Array<{
      status: string;
      statusDetails: string;
      location: {
        city: string;
        state: string;
        country: string;
      };
      occurredAt: string;
    }>;
  }> {
    const tracking = await this.request<{
      tracking_status: {
        status: string;
        status_details: string;
        status_date: string;
      };
      eta: string | null;
      tracking_history: Array<{
        status: string;
        status_details: string;
        location: {
          city: string;
          state: string;
          country: string;
        };
        status_date: string;
      }>;
    }>(`/tracks/${carrier}/${trackingNumber}`);

    return {
      status: tracking.tracking_status.status,
      statusDetails: tracking.tracking_status.status_details,
      eta: tracking.eta,
      trackingHistory: tracking.tracking_history.map((event) => ({
        status: event.status,
        statusDetails: event.status_details,
        location: event.location,
        occurredAt: event.status_date,
      })),
    };
  }

  /**
   * Register a tracking webhook to receive updates
   * Shippo will send webhooks when tracking status changes
   */
  async registerTrackingWebhook(
    carrier: string,
    trackingNumber: string,
  ): Promise<void> {
    await this.request("/tracks", {
      method: "POST",
      body: JSON.stringify({
        carrier,
        tracking_number: trackingNumber,
      }),
    });
  }

  /**
   * Helper: Map Shippo tracking status to internal status
   */
  mapTrackingStatus(
    shippoStatus: string,
  ):
    | "unknown"
    | "pre_transit"
    | "transit"
    | "delivered"
    | "returned"
    | "failure" {
    const mapping: Record<string, ReturnType<typeof this.mapTrackingStatus>> =
      {
        UNKNOWN: "unknown",
        PRE_TRANSIT: "pre_transit",
        TRANSIT: "transit",
        DELIVERED: "delivered",
        RETURNED: "returned",
        FAILURE: "failure",
      };
    return mapping[shippoStatus] ?? "unknown";
  }
}

// Export singleton instance
export const shippoService = new ShippoService();
