// src/services/pricingService.ts
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const DEFAULT_CURRENCY = process.env.DEFAULT_CURRENCY || 'USD';
const LOCATION_MULTIPLIERS: Record<string, number> = JSON.parse(process.env.LOCATION_MULTIPLIERS || '{}');
const BLACKLISTED_COUNTRIES: string[] = (process.env.BLACKLISTED_COUNTRIES || '').split(',').map(c => c.trim().toLowerCase()).filter(Boolean);

const EXCHANGE_RATE_API_KEY = process.env.EXCHANGE_RATE_API_KEY;
const BASE_CURRENCY_FOR_RATES = process.env.BASE_CURRENCY_FOR_RATES || 'USD';

// In-memory cache for exchange rates to avoid hitting API too often
interface ExchangeRatesCache {
    rates: Record<string, number>;
    lastFetched: number;
    baseCurrency: string;
}
let ratesCache: ExchangeRatesCache | null = null;
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // Cache for 6 hours

// Simple Country to Currency Code Mapping (expand as needed)
// For a more robust solution, consider a library or a more comprehensive mapping
const countryToCurrencyMap: Record<string, string> = {
    INDIA: 'INR',
    USA: 'USD',
    UK: 'GBP',
    GERMANY: 'EUR',
    FRANCE: 'EUR',
    JAPAN: 'JPY',
    CANADA: 'CAD',
    AUSTRALIA: 'AUD',
    // Add more countries and their primary currencies
};

async function getExchangeRates(): Promise<Record<string, number>> {
    if (!EXCHANGE_RATE_API_KEY) {
        console.warn('EXCHANGE_RATE_API_KEY not found. Currency conversion will use base USD price only.');
        return { [BASE_CURRENCY_FOR_RATES]: 1 };
    }

    if (ratesCache && (Date.now() - ratesCache.lastFetched < CACHE_DURATION_MS) && ratesCache.baseCurrency === BASE_CURRENCY_FOR_RATES) {
        return ratesCache.rates;
    }

    try {
        const response = await axios.get(`https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/latest/${BASE_CURRENCY_FOR_RATES}`);
        if (response.data && response.data.result === 'success') {
            ratesCache = {
                rates: response.data.conversion_rates,
                lastFetched: Date.now(),
                baseCurrency: BASE_CURRENCY_FOR_RATES,
            };
            console.log(`Fetched and cached exchange rates for base ${BASE_CURRENCY_FOR_RATES}.`);
            return ratesCache.rates;
        } else {
            throw new Error(response.data.error_type || 'Failed to fetch exchange rates');
        }
    } catch (error: any) {
        console.error('Error fetching exchange rates:', error.message);
        // If API fails, return existing cache if available and not too old, or default to USD
        if (ratesCache && (Date.now() - ratesCache.lastFetched < CACHE_DURATION_MS * 2)) { // Allow older cache on error
            return ratesCache.rates;
        }
        return { [BASE_CURRENCY_FOR_RATES]: 1 }; // Fallback
    }
}


export interface LocalizedPriceInfo {
    originalPriceUSD: number; // Renamed for clarity
    originalCurrency: string; // Should always be USD from DB
    localizedPrice?: number;
    localizedCurrency?: string;
    appliedMultiplier?: number;
    conversionRate?: number;
    message?: string;
    isBlacklisted?: boolean;
}

export const getLocalizedPrice = async (
    basePriceUSD: number,
    userLocationCountry: string // e.g., "India", "USA", "Germany" - Expecting country name
): Promise<LocalizedPriceInfo> => {
    const locationNormalized = userLocationCountry.toUpperCase();
    const locationCountryForBlacklist = userLocationCountry.split(',')[0].trim().toLowerCase();

    const baseResult: LocalizedPriceInfo = {
        originalPriceUSD: basePriceUSD,
        originalCurrency: DEFAULT_CURRENCY, // Course price is stored in USD
    };

    if (BLACKLISTED_COUNTRIES.includes(locationCountryForBlacklist)) {
        return {
            ...baseResult,
            message: `Access or purchase from ${userLocationCountry} is restricted.`,
            isBlacklisted: true,
        };
    }

    let finalPrice = basePriceUSD;
    let finalCurrency = DEFAULT_CURRENCY;
    let appliedMultiplier = 1;
    let conversionRateUsed: number | undefined;

    // 1. Apply location-specific multiplier if defined (on USD price)
    if (LOCATION_MULTIPLIERS[locationNormalized]) {
        appliedMultiplier = LOCATION_MULTIPLIERS[locationNormalized];
        finalPrice *= appliedMultiplier;
    }

    // 2. Determine target currency based on location
    const targetCurrencyCode = countryToCurrencyMap[locationNormalized] || DEFAULT_CURRENCY;

    // 3. Convert to target currency if different from USD
    if (targetCurrencyCode !== DEFAULT_CURRENCY) {
        const rates = await getExchangeRates();
        const rate = rates[targetCurrencyCode];

        if (rate) {
            finalPrice = finalPrice * rate; // Convert the (potentially multiplied) USD price
            finalCurrency = targetCurrencyCode;
            conversionRateUsed = rate;
        } else {
            // If specific currency not found in rates, keep it in USD (after multiplier)
            // Or you might want to log this as a missing currency
            console.warn(`Currency code ${targetCurrencyCode} for location ${userLocationCountry} not found in exchange rates. Price remains in USD (post-multiplier).`);
            finalCurrency = DEFAULT_CURRENCY; // Ensure it's USD
        }
    }


    // If no conversion or effective change, don't include localized fields
    if (finalPrice === basePriceUSD && finalCurrency === DEFAULT_CURRENCY && appliedMultiplier === 1) {
        return baseResult;
    }

    return {
        ...baseResult,
        localizedPrice: parseFloat(finalPrice.toFixed(2)),
        localizedCurrency: finalCurrency,
        ...(appliedMultiplier !== 1 && { appliedMultiplier }),
        ...(conversionRateUsed && { conversionRate: conversionRateUsed }),
    };
};

// Call getExchangeRates on app start to warm up the cache
getExchangeRates().catch(err => console.error("Initial fetch of exchange rates failed:", err));