/**
 * VIN Decoder Service using NHTSA vPIC API
 *
 * NHTSA (National Highway Traffic Safety Administration) provides a free
 * Vehicle Product Information Catalog (vPIC) API for VIN decoding.
 *
 * API Documentation: https://vpic.nhtsa.dot.gov/api/
 */

import { validateVin, getModelYearFromVin } from './vin-validator';

export interface VinDecodeResult {
  vin: string;
  make: string | null;
  model: string | null;
  modelYear: number | null;
  trim: string | null;
  engine: string | null;
  vehicleType: string | null;
  bodyClass: string | null;
  errorCode?: string;
  errorText?: string;
}

interface NhtsaVariable {
  Variable: string;
  Value: string | null;
  ValueId: string | null;
  VariableId: number;
}

interface NhtsaDecodeResponse {
  Count: number;
  Message: string;
  SearchCriteria: string;
  Results: NhtsaVariable[];
}

/**
 * Decodes a VIN using the NHTSA vPIC API
 */
export async function decodeVin(vin: string): Promise<VinDecodeResult> {
  // Validate VIN format first
  const validation = validateVin(vin);
  if (!validation.valid) {
    return {
      vin,
      make: null,
      model: null,
      modelYear: null,
      trim: null,
      engine: null,
      vehicleType: null,
      bodyClass: null,
      errorCode: 'INVALID_VIN',
      errorText: validation.error,
    };
  }

  try {
    // Call NHTSA vPIC API
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`NHTSA API request failed: ${response.statusText}`);
    }

    const data = await response.json() as NhtsaDecodeResponse;

    // Extract relevant fields from the response
    const getValue = (variableName: string): string | null => {
      const variable = data.Results.find(v => v.Variable === variableName);
      return variable?.Value ?? null;
    };

    const make = getValue('Make');
    const model = getValue('Model');
    const modelYearStr = getValue('Model Year');
    const modelYear = modelYearStr ? Number.parseInt(modelYearStr, 10) : getModelYearFromVin(vin);
    const trim = getValue('Trim') ?? getValue('Series');

    // Get engine information
    const engineCylinders = getValue('Engine Number of Cylinders');
    const engineDisplacement = getValue('Displacement (L)');
    const fuelType = getValue('Fuel Type - Primary');

    // Construct engine string (e.g., "2.5L 4-Cylinder", "3.0L V6")
    let engine: string | null = null;
    if (engineDisplacement && engineCylinders) {
      const cylinderConfig = engineCylinders === '6' ? 'V6' :
                            engineCylinders === '8' ? 'V8' :
                            engineCylinders === '4' ? '4-Cylinder' :
                            `${engineCylinders}-Cylinder`;
      engine = `${engineDisplacement}L ${cylinderConfig}`;
    } else if (engineDisplacement) {
      engine = `${engineDisplacement}L`;
    }

    const vehicleType = getValue('Vehicle Type');
    const bodyClass = getValue('Body Class');

    // Check for error codes from NHTSA
    const errorCode = getValue('Error Code');
    const errorText = getValue('Error Text');

    // If NHTSA returns specific errors, include them
    if (errorCode && errorCode !== '0') {
      return {
        vin,
        make,
        model,
        modelYear,
        trim,
        engine,
        vehicleType,
        bodyClass,
        errorCode,
        errorText: errorText ?? 'Unknown error from VIN decoder',
      };
    }

    return {
      vin,
      make,
      model,
      modelYear,
      trim,
      engine,
      vehicleType,
      bodyClass,
    };
  } catch (error) {
    console.error('VIN decode error:', error);
    return {
      vin,
      make: null,
      model: null,
      modelYear: null,
      trim: null,
      engine: null,
      vehicleType: null,
      bodyClass: null,
      errorCode: 'DECODE_ERROR',
      errorText: error instanceof Error ? error.message : 'Failed to decode VIN',
    };
  }
}

/**
 * Get compatible models for a VIN
 * This function decodes the VIN and returns the model information
 * that can be used to populate the compatibility table
 */
export async function getCompatibleModelsFromVin(vin: string): Promise<{
  success: boolean;
  data?: {
    make: string;
    model: string;
    year: number;
    engine?: string;
    trim?: string;
  };
  error?: string;
}> {
  const decoded = await decodeVin(vin);

  if (decoded.errorCode) {
    return {
      success: false,
      error: decoded.errorText ?? 'Failed to decode VIN',
    };
  }

  if (!decoded.make || !decoded.model || !decoded.modelYear) {
    return {
      success: false,
      error: 'Could not extract make, model, or year from VIN',
    };
  }

  return {
    success: true,
    data: {
      make: decoded.make,
      model: decoded.model,
      year: decoded.modelYear,
      engine: decoded.engine ?? undefined,
      trim: decoded.trim ?? undefined,
    },
  };
}
