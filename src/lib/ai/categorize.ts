/**
 * AI Expense Categorization Module
 *
 * This module provides a modular `categorizeExpense` function.
 * Currently uses mock keyword-based logic.
 * To swap in a real LLM (e.g. Google Gemini), replace the implementation
 * of `categorizeExpense` without changing its signature or usage in the app.
 */

export type ExpenseCategory =
  | "Food & Dining"
  | "Transport"
  | "Shopping"
  | "Entertainment"
  | "Health & Medical"
  | "Housing & Bills"
  | "Education"
  | "Travel"
  | "Subscriptions"
  | "Salary & Income"
  | "Other";

const CATEGORY_KEYWORDS: Record<ExpenseCategory, string[]> = {
  "Food & Dining": [
    "food", "restaurant", "pizza", "burger", "cafe", "coffee", "lunch",
    "dinner", "breakfast", "grocery", "groceries", "meal", "eat", "swiggy",
    "zomato", "uber eats", "doordash", "snack", "bakery", "sushi", "takeout",
    "takeaway", "noodles", "biryani", "sandwich", "juice", "tea",
  ],
  Transport: [
    "uber", "ola", "taxi", "cab", "metro", "bus", "train", "fuel",
    "petrol", "diesel", "auto", "rickshaw", "rapido", "lyft", "parking",
    "toll", "commute", "transport", "fare", "ticket", "travel card",
  ],
  Shopping: [
    "amazon", "flipkart", "myntra", "clothes", "shirt", "shoes", "shopping",
    "mall", "store", "purchase", "buy", "dress", "jeans", "jacket", "bag",
    "watch", "accessories", "electronics", "gadget", "appliance",
  ],
  Entertainment: [
    "movie", "netflix", "spotify", "hotstar", "prime", "cinema", "concert",
    "show", "game", "gaming", "playstation", "xbox", "steam", "ticket",
    "amusement", "park", "event", "party", "bar", "club", "lounge",
  ],
  "Health & Medical": [
    "doctor", "hospital", "medicine", "pharmacy", "chemist", "medical",
    "clinic", "gym", "fitness", "yoga", "wellness", "health", "insurance",
    "test", "checkup", "lab", "dentist", "optical", "spectacles",
  ],
  "Housing & Bills": [
    "rent", "electricity", "water", "gas", "wifi", "internet", "broadband",
    "maintenance", "repair", "plumber", "electrician", "housing", "utility",
    "bill", "phone", "mobile", "recharge", "emi", "loan",
  ],
  Education: [
    "school", "college", "university", "course", "book", "books", "tuition",
    "fee", "fees", "udemy", "coursera", "education", "learning", "class",
    "workshop", "training", "certification", "exam", "stationery",
  ],
  Travel: [
    "flight", "hotel", "airbnb", "resort", "holiday", "vacation", "trip",
    "tour", "visa", "passport", "luggage", "suitcase", "airport", "boarding",
    "makemytrip", "goibibo", "yatra", "booking",
  ],
  Subscriptions: [
    "subscription", "premium", "plan", "monthly", "annual", "renewal",
    "adobe", "microsoft", "google one", "icloud", "dropbox", "canva",
    "notion", "slack", "zoom",
  ],
  "Salary & Income": [
    "salary", "income", "bonus", "freelance", "payment received", "dividend",
    "interest", "refund", "cashback", "reward",
  ],
  Other: [],
};

/**
 * Categorizes an expense description using mock keyword matching.
 *
 * @param description - The expense description entered by the user
 * @returns The matched category string
 *
 * @future To integrate Google Gemini or another LLM, replace this function body
 * with an API call. The signature and return type remain the same.
 */
export async function categorizeExpense(
  description: string
): Promise<ExpenseCategory> {
  const normalized = description.toLowerCase().trim();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === "Other") continue;
    if (keywords.some((kw) => normalized.includes(kw))) {
      return category as ExpenseCategory;
    }
  }

  return "Other";
}

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  "Food & Dining": "#f97316",
  Transport: "#3b82f6",
  Shopping: "#a855f7",
  Entertainment: "#ec4899",
  "Health & Medical": "#22c55e",
  "Housing & Bills": "#eab308",
  Education: "#06b6d4",
  Travel: "#14b8a6",
  Subscriptions: "#8b5cf6",
  "Salary & Income": "#10b981",
  Other: "#6b7280",
};

export const ALL_CATEGORIES: ExpenseCategory[] = Object.keys(
  CATEGORY_KEYWORDS
) as ExpenseCategory[];
