"use server";

import { headers } from "next/headers";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

function generateJwt() {
  // Replace the example values below (remove the brackets).
  // Store secrets securely based on your team's best practices.
  // See: https://help.tableau.com/current/online/en-us/connected_apps_direct.htm

  const secret = "[secretvalue]";
  const secretId = "[connectedAppSecretId]";
  const clientId = "[connectedAppClientId]";
  const userId = "[tableau username]";
  const tokenExpiryInMinutes = 1; // Max of 10 minutes.

  // Remove 'tableau:views:embed_authoring' scope if Authoring is not needed.
  // Remove 'tableau:insights:embed' scope if Pulse is not needed.
  const scopes = [
    "tableau:views:embed",
    "tableau:views:embed_authoring",
    "tableau:insights:embed",
  ];

  const userAttributes = {
    //  User attributes are optional.
    //  Add entries to this dictionary if desired.
    //  "[User Attribute Name]": "[User Attribute Value]",
  };

  const header = {
    alg: "HS256",
    typ: "JWT",
    kid: secretId,
    iss: clientId,
  };

  const data = {
    jti: uuidv4(),
    aud: "tableau",
    sub: userId,
    scp: scopes,
    exp: Math.floor(Date.now() / 1000) + tokenExpiryInMinutes * 60,
    ...userAttributes,
  };

  const token = jwt.sign(data, secret, { header });
  return token;
}

export async function runServerAction(message: string): Promise<{
  message: string;
}> {
  const { isAuthenticated } = getKindeServerSession();
  const isUserAuthenticated = await isAuthenticated();

  if (!isUserAuthenticated && process.env.NEXT_PUBLIC_AUTH_ACTIVE === "true") {
    return Promise.reject(new Error("User is not authenticated."));
  }

  const headerList = await headers();
  const pathname = headerList.get("x-current-path");
  console.log(
    "serverAction called with message:",
    message,
    "pathname:",
    pathname
  );

  const jwtToken = generateJwt();
  console.log("Generated JWT:", jwtToken);

  return new Promise((resolve) => {
    setTimeout(() => {
      const result: string = `serverAction resolved with message: ${message} and token: '${jwtToken}' from: ${pathname}`;

      resolve({
        message: result,
      });
    }, 500);
  });
}
