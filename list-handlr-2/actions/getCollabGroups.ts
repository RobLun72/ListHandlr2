"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { CollabGroupData } from "@/DTO/collabGroupsData";
import { ApiData } from "@/DTO/apiData";
import { max } from "@/Helpers/sortAndFilter";
import { formatDate } from "@/Helpers/formatDate";
import { CollabGroupsDbFactory } from "@/db/queries/collabGroups/collabGroupsDbFactory";

export async function getCollabGroups(user: {
  user_id: string;
}): Promise<ApiData<CollabGroupData>> {
  const { isAuthenticated } = getKindeServerSession();
  const isUserAuthenticated = await isAuthenticated();

  if (!isUserAuthenticated && process.env.NEXT_PUBLIC_AUTH_ACTIVE === "true") {
    return Promise.reject(new Error("User is not authenticated."));
  }

  const db = CollabGroupsDbFactory.createDbQueries();
  const allGroups = await db.getAllGroupsForUser(user.user_id);

  const maxStamp =
    allGroups.length > 0
      ? formatDate(max(allGroups, "updated_at")!.updated_at!) || ""
      : "";

  const result: ApiData<CollabGroupData> = {
    timeStamp: maxStamp,
    rows: allGroups.map((group) => ({
      id: group.id,
      ownerUserId: group.owner_user_id,
      name: group.name,
      description: group.description,
      createdAt: group.created_at,
      updatedAt: group.updated_at,
    })),
  };

  return new Promise((resolve) => {
    resolve(result);
  });
}
