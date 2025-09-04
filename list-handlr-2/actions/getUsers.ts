"use server";

import { getAllUsersDirectAPI } from "@/lib/kindeApi";

export async function fetchAllUsers() {
  try {
    // Try the direct API approach first as it's more reliable
    const result = await getAllUsersDirectAPI();
    return { success: true, users: result.users || [], error: "" };
  } catch (error) {
    console.error("Error fetching users:", error);
    // Return more detailed error information
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      users: [],
      error: `Failed to fetch users: ${errorMessage}`,
    };
  }
}
