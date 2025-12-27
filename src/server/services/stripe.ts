import Stripe from "stripe";
import { env } from "@/env";

// Initialize Stripe with API key
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
  typescript: true,
});

interface CreatePaymentIntentParams {
  amount: number; // in dollars (will be converted to cents)
  currency: string;
  customerId?: string;
  orderId: string;
  metadata?: Record<string, string>;
}

interface CreateCustomerParams {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}

interface CreateConnectedAccountParams {
  email: string;
  country: string;
}

interface CreateAccountLinkParams {
  accountId: string;
  refreshUrl: string;
  returnUrl: string;
}

interface CreateTransferParams {
  amount: number; // in dollars
  destination: string; // Stripe connected account ID
  metadata?: Record<string, string>;
}

interface CreateRefundParams {
  chargeId: string;
  amount?: number; // in dollars, optional (full refund if not provided)
  reason?: "duplicate" | "fraudulent" | "requested_by_customer";
}

export class StripeService {
  /**
   * Create a Payment Intent for checkout
   * This allows the buyer to enter card details and complete payment
   */
  async createPaymentIntent(
    params: CreatePaymentIntentParams,
  ): Promise<Stripe.PaymentIntent> {
    return stripe.paymentIntents.create({
      amount: Math.round(params.amount * 100), // Convert to cents
      currency: params.currency.toLowerCase(),
      customer: params.customerId,
      metadata: {
        orderId: params.orderId,
        ...params.metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
      // Capture payment immediately (vs. authorize and capture later)
      capture_method: "automatic",
    });
  }

  /**
   * Retrieve a Payment Intent by ID
   */
  async getPaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    return stripe.paymentIntents.retrieve(paymentIntentId);
  }

  /**
   * Manually confirm a Payment Intent (if needed)
   * Usually handled by Stripe Elements on the frontend
   */
  async confirmPaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    return stripe.paymentIntents.confirm(paymentIntentId);
  }

  /**
   * Cancel a Payment Intent (before it's succeeded)
   */
  async cancelPaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    return stripe.paymentIntents.cancel(paymentIntentId);
  }

  /**
   * Create a refund for a charge
   */
  async createRefund(params: CreateRefundParams): Promise<Stripe.Refund> {
    return stripe.refunds.create({
      charge: params.chargeId,
      amount: params.amount ? Math.round(params.amount * 100) : undefined,
      reason: params.reason,
    });
  }

  /**
   * Create a Stripe customer
   * Useful for saving payment methods and tracking purchase history
   */
  async createCustomer(
    params: CreateCustomerParams,
  ): Promise<Stripe.Customer> {
    return stripe.customers.create({
      email: params.email,
      name: params.name,
      metadata: params.metadata,
    });
  }

  /**
   * Retrieve customer by ID
   */
  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    return stripe.customers.retrieve(customerId) as Promise<Stripe.Customer>;
  }

  /**
   * Update customer information
   */
  async updateCustomer(
    customerId: string,
    params: Partial<CreateCustomerParams>,
  ): Promise<Stripe.Customer> {
    return stripe.customers.update(customerId, params);
  }

  /**
   * Stripe Connect: Create a connected account for a seller
   * This allows sellers to receive payouts
   */
  async createConnectedAccount(
    params: CreateConnectedAccountParams,
  ): Promise<Stripe.Account> {
    return stripe.accounts.create({
      type: "express", // Simplified onboarding
      email: params.email,
      country: params.country,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
  }

  /**
   * Create an Account Link for seller onboarding
   * The seller will be redirected to Stripe to complete onboarding
   */
  async createAccountLink(
    params: CreateAccountLinkParams,
  ): Promise<Stripe.AccountLink> {
    return stripe.accountLinks.create({
      account: params.accountId,
      refresh_url: params.refreshUrl,
      return_url: params.returnUrl,
      type: "account_onboarding",
    });
  }

  /**
   * Retrieve connected account details
   */
  async getConnectedAccount(accountId: string): Promise<Stripe.Account> {
    return stripe.accounts.retrieve(accountId);
  }

  /**
   * Check if a connected account can receive payouts
   */
  async isPayoutsEnabled(accountId: string): Promise<boolean> {
    const account = await this.getConnectedAccount(accountId);
    return (
      account.charges_enabled === true && account.payouts_enabled === true
    );
  }

  /**
   * Transfer funds to a seller's connected account
   * Used for seller payouts after order completion
   */
  async createTransfer(params: CreateTransferParams): Promise<Stripe.Transfer> {
    return stripe.transfers.create({
      amount: Math.round(params.amount * 100), // Convert to cents
      currency: "usd",
      destination: params.destination,
      metadata: params.metadata,
    });
  }

  /**
   * Retrieve transfer details
   */
  async getTransfer(transferId: string): Promise<Stripe.Transfer> {
    return stripe.transfers.retrieve(transferId);
  }

  /**
   * Reverse a transfer (if needed for refunds)
   */
  async reverseTransfer(
    transferId: string,
    amount?: number,
  ): Promise<Stripe.TransferReversal> {
    return stripe.transfers.createReversal(transferId, {
      amount: amount ? Math.round(amount * 100) : undefined,
    });
  }

  /**
   * Verify webhook signature to ensure webhook is from Stripe
   * CRITICAL for security - always verify webhooks
   */
  verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
  ): Stripe.Event {
    try {
      return stripe.webhooks.constructEvent(
        payload,
        signature,
        env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      throw new Error(
        `Webhook signature verification failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Helper: Convert amount from cents to dollars
   */
  centsToDollars(cents: number): number {
    return cents / 100;
  }

  /**
   * Helper: Convert amount from dollars to cents
   */
  dollarsToCents(dollars: number): number {
    return Math.round(dollars * 100);
  }

  /**
   * Helper: Calculate platform fee based on percentage
   */
  calculatePlatformFee(amount: number, feePercentage: number): number {
    return Math.round((amount * feePercentage) / 100);
  }
}

// Export singleton instance
export const stripeService = new StripeService();
