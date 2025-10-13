"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ApiResponse, ApiData } from "@/DTO/apiData";
import {
  CollabGroupDetailData,
  CollabGroupsPostData,
  CollabGroupMembersPostData,
} from "@/DTO/collabGroupsData";
import { formatDate } from "@/Helpers/formatDate";
import { CollabGroupsDbFactory } from "@/db/queries/collabGroups/collabGroupsDbFactory";
import { ICollabGroupsDbQueries } from "@/db/queries/collabGroups/collabGroupsDbInterfaces";

async function formatGroupResponse(
  userId: string,
  groupName: string,
  db: ICollabGroupsDbQueries
): Promise<ApiResponse<ApiData<CollabGroupDetailData>>> {
  const groupDetail = await db.getGroupByName(userId, groupName);

  if (!groupDetail) {
    throw new Error(`Group "${groupName}" not found.`);
  }

  const timestamp = formatDate(groupDetail.updated_at) || "";

  return {
    message: "",
    data: {
      timeStamp: timestamp,
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
    },
  };
}

async function createGroup(
  name: string,
  description: string | null,
  userId: string,
  db: ICollabGroupsDbQueries
): Promise<ApiResponse<ApiData<CollabGroupDetailData>>> {
  // Validate group name is not empty
  if (!name || name.trim() === "") {
    return {
      message: "Group name cannot be empty",
      data: { timeStamp: "", rows: [] },
    };
  }

  // Check for duplicate name
  const existing = await db.getGroupByName(userId, name);
  if (existing) {
    return {
      message: `A group named "${name}" already exists`,
      data: { timeStamp: "", rows: [] },
    };
  }

  await db.addGroupToDb(name, description || null, userId);
  return formatGroupResponse(userId, name, db);
}

async function updateGroup(
  groupId: number,
  currentName: string,
  newName: string,
  description: string | null,
  userId: string,
  db: ICollabGroupsDbQueries
): Promise<ApiResponse<ApiData<CollabGroupDetailData>>> {
  // Validate new name is not empty
  if (!newName || newName.trim() === "") {
    return {
      message: "Group name cannot be empty",
      data: { timeStamp: "", rows: [] },
    };
  }

  // If renaming, check for duplicate name
  if (newName !== currentName) {
    const existing = await db.getGroupByName(userId, newName);
    if (existing) {
      return {
        message: `A group named "${newName}" already exists`,
        data: { timeStamp: "", rows: [] },
      };
    }
  }

  await db.updateGroupToDb(groupId, newName, description || null);
  return formatGroupResponse(userId, newName, db);
}

async function deleteGroup(
  groupId: number,
  db: ICollabGroupsDbQueries
): Promise<ApiResponse<ApiData<CollabGroupDetailData>>> {
  await db.deleteGroupToDb(groupId);
  return {
    message: "Group deleted successfully",
    data: { timeStamp: "", rows: [] },
  };
}

async function updateGroupMembers(
  groupId: number,
  currentMembers: string[],
  newMembers: string[],
  userId: string,
  groupName: string,
  db: ICollabGroupsDbQueries
): Promise<void> {
  // Find members to remove
  const toRemove = currentMembers.filter((m) => !newMembers.includes(m));
  for (const memberUserId of toRemove) {
    await db.removeMemberFromGroup(groupId, memberUserId);
  }

  // Find members to add
  const toAdd = newMembers.filter((m) => !currentMembers.includes(m));
  for (const memberUserId of toAdd) {
    try {
      await db.addMemberToGroup(groupId, memberUserId);
    } catch (error) {
      // Handle duplicate member constraint violation
      console.error(`Failed to add member ${memberUserId}:`, error);
    }
  }
}

export async function editCollabGroup(
  dataToPost: CollabGroupsPostData,
  userId: string
): Promise<ApiResponse<ApiData<CollabGroupDetailData>>> {
  const { isAuthenticated } = getKindeServerSession();
  const isUserAuthenticated = await isAuthenticated();

  if (!isUserAuthenticated && process.env.NEXT_PUBLIC_AUTH_ACTIVE === "true") {
    return Promise.reject(new Error("User is not authenticated."));
  }

  const db = CollabGroupsDbFactory.createDbQueries();

  try {
    switch (dataToPost.saveType) {
      case "create": {
        return await createGroup(
          dataToPost.name || "",
          dataToPost.description || null,
          userId,
          db
        );
      }

      case "update": {
        if (!dataToPost.groupId) {
          return {
            message: "Group ID is required for update",
            data: { timeStamp: "", rows: [] },
          };
        }

        // Get current group data
        const currentGroup = await db.getGroupByName(
          userId,
          dataToPost.item.rows[0]?.name || ""
        );

        if (!currentGroup) {
          return {
            message: "Group not found",
            data: { timeStamp: "", rows: [] },
          };
        }

        // Update group metadata (name, description)
        const result = await updateGroup(
          dataToPost.groupId,
          currentGroup.name,
          dataToPost.name || currentGroup.name,
          dataToPost.description !== undefined
            ? dataToPost.description
            : currentGroup.description,
          userId,
          db
        );

        // Update members if provided in the request
        if (dataToPost.item.rows[0]?.members) {
          const currentMemberIds = currentGroup.members.map(
            (m) => m.member_user_id
          );
          const newMemberIds = dataToPost.item.rows[0].members.map(
            (m) => m.memberUserId
          );

          await updateGroupMembers(
            dataToPost.groupId,
            currentMemberIds,
            newMemberIds,
            userId,
            dataToPost.name || currentGroup.name,
            db
          );

          // Refresh the response with updated members
          return formatGroupResponse(
            userId,
            dataToPost.name || currentGroup.name,
            db
          );
        }

        return result;
      }

      case "delete": {
        if (!dataToPost.groupId) {
          return {
            message: "Group ID is required for delete",
            data: { timeStamp: "", rows: [] },
          };
        }

        return await deleteGroup(dataToPost.groupId, db);
      }

      default:
        return {
          message: `Invalid save type: ${dataToPost.saveType}`,
          data: { timeStamp: "", rows: [] },
        };
    }
  } catch (error) {
    // Handle database constraint violations
    if (error instanceof Error) {
      if (error.message.includes("unique constraint")) {
        return {
          message: "A group with this name already exists",
          data: { timeStamp: "", rows: [] },
        };
      }
      return {
        message: error.message,
        data: { timeStamp: "", rows: [] },
      };
    }

    return {
      message: "An unexpected error occurred",
      data: { timeStamp: "", rows: [] },
    };
  }
}

export async function editCollabGroupMembers(
  dataToPost: CollabGroupMembersPostData,
  userId: string
): Promise<ApiResponse<ApiData<CollabGroupDetailData>>> {
  const { isAuthenticated } = getKindeServerSession();
  const isUserAuthenticated = await isAuthenticated();

  if (!isUserAuthenticated && process.env.NEXT_PUBLIC_AUTH_ACTIVE === "true") {
    return Promise.reject(new Error("User is not authenticated."));
  }

  const db = CollabGroupsDbFactory.createDbQueries();

  try {
    // Get the group to verify ownership and get group name
    const groups = await db.getAllGroupsForUser(userId);
    const group = groups.find((g) => g.id === dataToPost.groupId);

    if (!group) {
      return {
        message: "Group not found or you do not have permission",
        data: { timeStamp: "", rows: [] },
      };
    }

    switch (dataToPost.saveType) {
      case "add":
        await db.addMemberToGroup(dataToPost.groupId, dataToPost.memberUserId);
        break;

      case "remove":
        await db.removeMemberFromGroup(
          dataToPost.groupId,
          dataToPost.memberUserId
        );
        break;

      default:
        return {
          message: `Invalid save type: ${dataToPost.saveType}`,
          data: { timeStamp: "", rows: [] },
        };
    }

    return formatGroupResponse(userId, group.name, db);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("unique constraint")) {
        return {
          message: "This user is already a member of the group",
          data: { timeStamp: "", rows: [] },
        };
      }
      return {
        message: error.message,
        data: { timeStamp: "", rows: [] },
      };
    }

    return {
      message: "An unexpected error occurred",
      data: { timeStamp: "", rows: [] },
    };
  }
}
