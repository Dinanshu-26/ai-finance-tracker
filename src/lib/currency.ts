export interface ExchangeRates {
  [currency: string]: number;
}

/**
 * Fetches latest exchange rates from Frankfurter API.
 * Base is usually the user's preferred currency.
 */
export async function getExchangeRates(base: string = "USD"): Promise<ExchangeRates> {
  try {
    const response = await fetch(`https://api.frankfurter.app/latest?base=${base}`);
    if (!response.ok) throw new Error("Failed to fetch rates");
    const data = await response.json();
    return {
      [base]: 1,
      ...data.rates,
    };
  } catch (error) {
    console.error("Currency API Error:", error);
    // Fallback static rates if API is down
    const FALLBACK_RATES: Record<string, Record<string, number>> = {
      USD: { INR: 83.3, EUR: 0.92, GBP: 0.79 },
      INR: { USD: 0.012, EUR: 0.011, GBP: 0.0095 },
      EUR: { USD: 1.08, INR: 90.5, GBP: 0.86 },
      GBP: { USD: 1.26, INR: 105.2, EUR: 1.16 },
    };
    return { [base]: 1, ...(FALLBACK_RATES[base] || FALLBACK_RATES.USD) };
  }
}

/**
 * Converts an amount from one currency to another using provided rates.
 * Rates must be relative to the Target currency (e.g. rates[SourceCurrency] = RateFromTargetToSource)
 * Actually, Frankfurter returns rates relative to BASE.
 * So if base is USD, and we want to convert EUR to USD: amount / rates['EUR']
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  ratesRelativeToTarget: ExchangeRates
): number {
  if (fromCurrency === toCurrency) return amount;
  
  // Frankfurter: 1 toCurrency = X fromCurrency
  // So amount in toCurrency = amount / ratesRelativeToTarget[fromCurrency]
  const rate = ratesRelativeToTarget[fromCurrency];
  if (!rate) return amount; // Fallback to 1:1 if rate missing
  
  return amount / rate;
}

export const SUPPORTED_CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
];
