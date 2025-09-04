import { Users, init } from "@kinde/management-api-js";

// Initialize the Kinde Management API
export function initKindeApi() {
  if (
    !process.env.KINDE_M2M_CLIENT_ID ||
    !process.env.KINDE_M2M_CLIENT_SECRET ||
    !process.env.KINDE_DOMAIN
  ) {
    throw new Error(
      "Missing Kinde Management API environment variables: KINDE_M2M_CLIENT_ID, KINDE_M2M_CLIENT_SECRET, KINDE_DOMAIN"
    );
  }

  return init({
    kindeDomain: process.env.KINDE_DOMAIN,
    clientId: process.env.KINDE_M2M_CLIENT_ID,
    clientSecret: process.env.KINDE_M2M_CLIENT_SECRET,
  });
}

// Get access token for Management API
export async function getKindeAccessToken() {
  const response = await fetch(`${process.env.KINDE_DOMAIN}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.KINDE_M2M_CLIENT_ID!,
      client_secret: process.env.KINDE_M2M_CLIENT_SECRET!,
      audience: `${process.env.KINDE_DOMAIN}/api`,
      scope: "read:users read:user_properties", // Explicitly request scopes
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to get access token: ${response.status} ${errorText}`
    );
  }

  const data = await response.json();
  return data.access_token;
}

// Get all users using the Management API SDK
export async function getAllUsers(pageSize = 100, nextToken?: string) {
  try {
    // Initialize the API
    initKindeApi();

    // Use the Users API to get users
    const response = await Users.getUsers({
      pageSize,
      nextToken,
    });

    return {
      users: response.users || [],
      nextToken: response.next_token,
      hasMore: !!response.next_token,
    };
  } catch (error) {
    console.error("Error fetching users from Kinde:", error);
    throw new Error("Failed to fetch users");
  }
}

// Alternative: Direct API call method
export async function getAllUsersDirectAPI() {
  try {
    const accessToken = await getKindeAccessToken();

    const response = await fetch(`${process.env.KINDE_DOMAIN}/api/v1/users`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
}
