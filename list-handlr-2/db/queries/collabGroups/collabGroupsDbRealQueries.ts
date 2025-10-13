import { db } from "@/db/index";
import { eq, and, sql } from "drizzle-orm";
import { collabGroupsTable, collabGroupMembersTable } from "@/db/schema";
import type {
  CollabGroupRecord,
  CollabGroupDetailRecord,
  CollabGroupMemberRecord,
  ICollabGroupsDbQueries,
} from "./collabGroupsDbInterfaces";

export class CollabGroupsRealDbQueries implements ICollabGroupsDbQueries {
  async getAllGroupsForUser(userId: string): Promise<CollabGroupRecord[]> {
    const groups = await db
      .select({
        id: collabGroupsTable.id,
        owner_user_id: collabGroupsTable.owner_user_id,
        name: collabGroupsTable.name,
        description: collabGroupsTable.description,
        created_at: collabGroupsTable.created_at,
        updated_at: collabGroupsTable.updated_at,
        memberCount: sql<number>`cast(count(${collabGroupMembersTable.id}) as int)`,
      })
      .from(collabGroupsTable)
      .leftJoin(
        collabGroupMembersTable,
        eq(collabGroupsTable.id, collabGroupMembersTable.group_id)
      )
      .where(eq(collabGroupsTable.owner_user_id, userId))
      .groupBy(
        collabGroupsTable.id,
        collabGroupsTable.owner_user_id,
        collabGroupsTable.name,
        collabGroupsTable.description,
        collabGroupsTable.created_at,
        collabGroupsTable.updated_at
      )
      .orderBy(collabGroupsTable.updated_at);

    return groups;
  }

  async getGroupByName(
    userId: string,
    groupName: string
  ): Promise<CollabGroupDetailRecord | null> {
    const groups = await db
      .select()
      .from(collabGroupsTable)
      .where(
        and(
          eq(collabGroupsTable.owner_user_id, userId),
          eq(collabGroupsTable.name, groupName)
        )
      );

    if (groups.length === 0) {
      return null;
    }

    const group = groups[0];
    const members = await this.getMembersForGroup(group.id);

    return {
      ...group,
      members,
    };
  }

  async addGroupToDb(
    name: string,
    description: string | null,
    userId: string
  ): Promise<number> {
    const result = await db
      .insert(collabGroupsTable)
      .values({
        owner_user_id: userId,
        name,
        description,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning({ id: collabGroupsTable.id });

    return result[0].id;
  }

  async updateGroupToDb(
    groupId: number,
    name: string,
    description: string | null
  ): Promise<void> {
    await db
      .update(collabGroupsTable)
      .set({
        name,
        description,
        updated_at: new Date(),
      })
      .where(eq(collabGroupsTable.id, groupId));
  }

  async deleteGroupToDb(groupId: number): Promise<void> {
    // Members will be cascade deleted due to FK constraint
    await db.delete(collabGroupsTable).where(eq(collabGroupsTable.id, groupId));
  }

  async addMemberToGroup(groupId: number, memberUserId: string): Promise<void> {
    await db.insert(collabGroupMembersTable).values({
      group_id: groupId,
      member_user_id: memberUserId,
      added_at: new Date(),
    });
  }

  async removeMemberFromGroup(
    groupId: number,
    memberUserId: string
  ): Promise<void> {
    await db
      .delete(collabGroupMembersTable)
      .where(
        and(
          eq(collabGroupMembersTable.group_id, groupId),
          eq(collabGroupMembersTable.member_user_id, memberUserId)
        )
      );
  }

  async getMembersForGroup(groupId: number): Promise<CollabGroupMemberRecord[]> {
    const members = await db
      .select()
      .from(collabGroupMembersTable)
      .where(eq(collabGroupMembersTable.group_id, groupId));

    return members;
  }
}
