"use server";

import { categorizeExpense } from "@/lib/ai/categorize";

export async function getAICategory(description: string) {
  if (!description || description.trim().length < 3) {
    return null;
  }

  try {
    const category = await categorizeExpense(description);
    return category;
  } catch (error) {
    console.error("AI Categorization Error:", error);
    return "Others";
  }
}
