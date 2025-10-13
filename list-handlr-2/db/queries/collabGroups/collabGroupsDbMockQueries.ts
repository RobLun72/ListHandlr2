import type {
  ICollabGroupsDbQueries,
  CollabGroupRecord,
  CollabGroupDetailRecord,
  CollabGroupMemberRecord,
} from "./collabGroupsDbInterfaces";

export class CollabGroupsMockDbQueries implements ICollabGroupsDbQueries {
  private mockGroups: Map<number, CollabGroupRecord> = new Map();
  private mockMembers: Map<number, CollabGroupMemberRecord[]> = new Map();
  private nextGroupId = 1;
  private nextMemberId = 1;

  async getAllGroupsForUser(userId: string): Promise<CollabGroupRecord[]> {
    return Array.from(this.mockGroups.values()).filter(
      (group) => group.owner_user_id === userId
    );
  }

  async getGroupByName(
    userId: string,
    groupName: string
  ): Promise<CollabGroupDetailRecord | null> {
    const group = Array.from(this.mockGroups.values()).find(
      (g) => g.owner_user_id === userId && g.name === groupName
    );

    if (!group) {
      return null;
    }

    const members = this.mockMembers.get(group.id) || [];

    return {
      id: group.id,
      owner_user_id: group.owner_user_id,
      name: group.name,
      description: group.description,
      created_at: group.created_at,
      updated_at: group.updated_at,
      members,
    };
  }

  async addGroupToDb(
    name: string,
    description: string | null,
    userId: string
  ): Promise<number> {
    const id = this.nextGroupId++;
    const now = new Date();

    const group: CollabGroupRecord = {
      id,
      owner_user_id: userId,
      name,
      description,
      created_at: now,
      updated_at: now,
      memberCount: 0,
    };

    this.mockGroups.set(id, group);
    this.mockMembers.set(id, []);

    return id;
  }

  async updateGroupToDb(
    groupId: number,
    name: string,
    description: string | null
  ): Promise<void> {
    const group = this.mockGroups.get(groupId);
    if (group) {
      group.name = name;
      group.description = description;
      group.updated_at = new Date();
    }
  }

  async deleteGroupToDb(groupId: number): Promise<void> {
    this.mockGroups.delete(groupId);
    this.mockMembers.delete(groupId);
  }

  async addMemberToGroup(groupId: number, memberUserId: string): Promise<void> {
    const members = this.mockMembers.get(groupId) || [];
    const member: CollabGroupMemberRecord = {
      id: this.nextMemberId++,
      group_id: groupId,
      member_user_id: memberUserId,
      added_at: new Date(),
    };

    members.push(member);
    this.mockMembers.set(groupId, members);

    const group = this.mockGroups.get(groupId);
    if (group) {
      group.memberCount = members.length;
      group.updated_at = new Date();
    }
  }

  async removeMemberFromGroup(
    groupId: number,
    memberUserId: string
  ): Promise<void> {
    const members = this.mockMembers.get(groupId) || [];
    const filtered = members.filter((m) => m.member_user_id !== memberUserId);
    this.mockMembers.set(groupId, filtered);

    const group = this.mockGroups.get(groupId);
    if (group) {
      group.memberCount = filtered.length;
      group.updated_at = new Date();
    }
  }

  async getMembersForGroup(groupId: number): Promise<CollabGroupMemberRecord[]> {
    return this.mockMembers.get(groupId) || [];
  }
}
