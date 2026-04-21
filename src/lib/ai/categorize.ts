/**
 * AI Expense Categorization Module
 *
 * This module provides a modular `categorizeExpense` function.
 * Currently uses mock keyword-based logic.
 * To swap in a real LLM (e.g. Google Gemini), replace the implementation
 * of `categorizeExpense` without changing its signature or usage in the app.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

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

let genAIInstance: GoogleGenerativeAI | null = null;

function getGenAI() {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key || key === "your_gemini_api_key_here") return null;
  if (!genAIInstance) {
    genAIInstance = new GoogleGenerativeAI(key);
  }
  return genAIInstance;
}

/**
 * Categorizes an expense description using Google Gemini AI,
 * with a fallback to keyword-based matching.
 */
export async function categorizeExpense(
  description: string
): Promise<ExpenseCategory> {
  const genAI = getGenAI();

  // 1. Try Gemini AI if API key is present
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const categories = Object.keys(CATEGORY_KEYWORDS).join(", ");
      const prompt = `Categorize the following expense description into exactly one of these categories: [${categories}]. 
      Description: "${description}"
      Return only the category name, nothing else. If you are unsure, return "Other".`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      if (Object.keys(CATEGORY_KEYWORDS).includes(text)) {
        return text as ExpenseCategory;
      }
    } catch (error: any) {
      console.error("Gemini Categorization Failed, falling back to keywords:", error);
    }

  }


  // 2. Fallback to Keyword matching
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
