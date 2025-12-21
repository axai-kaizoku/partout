/**
 * VIN (Vehicle Identification Number) Validation and Decoding Utilities
 *
 * VIN format: 17 characters
 * - Characters 1-3: World Manufacturer Identifier (WMI)
 * - Characters 4-8: Vehicle Descriptor Section (VDS)
 * - Character 9: Check digit
 * - Character 10: Model year
 * - Character 11: Plant code
 * - Characters 12-17: Sequential number
 */

const VIN_LENGTH = 17;
const VIN_TRANSLITERATION: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
  J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
  '0': 0, '1': 1, '2': 2, '3': 3, '4': 4,
  '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
};

const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

/**
 * Validates VIN format (17 characters, alphanumeric, no I, O, Q)
 */
export function isValidVinFormat(vin: string): boolean {
  if (!vin || vin.length !== VIN_LENGTH) {
    return false;
  }

  // VINs cannot contain I, O, or Q to avoid confusion with 1, 0, and other characters
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
  return vinRegex.test(vin);
}

/**
 * Validates VIN checksum (9th character)
 */
export function isValidVinChecksum(vin: string): boolean {
  if (!isValidVinFormat(vin)) {
    return false;
  }

  const upperVin = vin.toUpperCase();
  let sum = 0;

  for (let i = 0; i < VIN_LENGTH; i++) {
    const char = upperVin[i];
    if (!char) continue;

    const value = VIN_TRANSLITERATION[char];
    if (value === undefined) {
      return false;
    }

    const weight = WEIGHTS[i];
    if (weight === undefined) continue;

    sum += value * weight;
  }

  const checkDigit = sum % 11;
  const expectedCheckChar = checkDigit === 10 ? 'X' : checkDigit.toString();
  const actualCheckChar = upperVin[8];

  return actualCheckChar === expectedCheckChar;
}

/**
 * Complete VIN validation (format + checksum)
 */
export function validateVin(vin: string): {
  valid: boolean;
  error?: string
} {
  if (!vin) {
    return { valid: false, error: 'VIN is required' };
  }

  if (!isValidVinFormat(vin)) {
    return {
      valid: false,
      error: 'Invalid VIN format. VIN must be 17 characters and cannot contain I, O, or Q'
    };
  }

  if (!isValidVinChecksum(vin)) {
    return {
      valid: false,
      error: 'Invalid VIN checksum. Please verify the VIN number'
    };
  }

  return { valid: true };
}

/**
 * Extract model year from VIN (10th character)
 */
export function getModelYearFromVin(vin: string): number | null {
  if (!isValidVinFormat(vin)) {
    return null;
  }

  const yearChar = vin[9]?.toUpperCase();
  if (!yearChar) return null;

  // Year encoding for 10th character
  const yearMap: Record<string, number> = {
    // 1980-2000
    'A': 1980, 'B': 1981, 'C': 1982, 'D': 1983, 'E': 1984,
    'F': 1985, 'G': 1986, 'H': 1987, 'J': 1988, 'K': 1989,
    'L': 1990, 'M': 1991, 'N': 1992, 'P': 1993, 'R': 1994,
    'S': 1995, 'T': 1996, 'V': 1997, 'W': 1998, 'X': 1999,
    'Y': 2000,
    // 2001-2009
    '1': 2001, '2': 2002, '3': 2003, '4': 2004, '5': 2005,
    '6': 2006, '7': 2007, '8': 2008, '9': 2009,
    // 2010-2030 (repeating cycle)
  };

  // Handle numeric years (2001-2009, 2031-2039)
  if (/\d/.test(yearChar)) {
    const num = Number.parseInt(yearChar, 10);
    // Assume recent years for now
    return 2000 + num;
  }

  return yearMap[yearChar] ?? null;
}

/**
 * Extract WMI (World Manufacturer Identifier) from VIN
 */
export function getWmiFromVin(vin: string): string | null {
  if (!isValidVinFormat(vin)) {
    return null;
  }
  return vin.substring(0, 3).toUpperCase();
}
