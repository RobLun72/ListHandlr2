"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ApiData } from "@/DTO/apiData";
import { CollabGroupDetailData } from "@/DTO/collabGroupsData";
import { formatDate } from "@/Helpers/formatDate";
import { CollabGroupsDbFactory } from "@/db/queries/collabGroups/collabGroupsDbFactory";

export async function getCollabGroup(
  groupName: string,
  user: { user_id: string }
): Promise<ApiData<CollabGroupDetailData>> {
  const { isAuthenticated } = getKindeServerSession();
  const isUserAuthenticated = await isAuthenticated();

  if (!isUserAuthenticated && process.env.NEXT_PUBLIC_AUTH_ACTIVE === "true") {
    return Promise.reject(new Error("User is not authenticated."));
  }

  // URL decode the groupName parameter
  const decodedGroupName = decodeURIComponent(groupName);

  const db = CollabGroupsDbFactory.createDbQueries();
  const groupDetail = await db.getGroupByName(user.user_id, decodedGroupName);

  if (!groupDetail) {
    return Promise.reject(new Error(`Group "${decodedGroupName}" not found.`));
  }

  const result: ApiData<CollabGroupDetailData> = {
    timeStamp: formatDate(groupDetail.updated_at) || "",
    rows: [
      {
        id: groupDetail.id,
        ownerUserId: groupDetail.owner_user_id,
        name: groupDetail.name,
        description: groupDetail.description,
        createdAt: groupDetail.created_at,
        updatedAt: groupDetail.updated_at,
        members: groupDetail.members.map((member) => ({
          id: member.id,
          groupId: member.group_id,
          memberUserId: member.member_user_id,
          addedAt: member.added_at,
        })),
      },
    ],
  };

  return new Promise((resolve) => {
    resolve(result);
  });
}
