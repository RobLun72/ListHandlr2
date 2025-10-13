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

  /**
   * Seeds the mock database with test data for testing purposes.
   * Creates three test groups with members for a given user.
   * @param userId - The user ID to associate with the test groups
   */
  seedTestData(userId: string = "test-user-123"): void {
    // Clear existing data
    this.mockGroups.clear();
    this.mockMembers.clear();
    this.nextGroupId = 1;
    this.nextMemberId = 1;

    const baseDate = new Date("2024-01-01");

    // Create DevTeam group with 3 members
    const devTeamId = this.nextGroupId++;
    this.mockGroups.set(devTeamId, {
      id: devTeamId,
      owner_user_id: userId,
      name: "DevTeam",
      description: "Development team collaboration",
      created_at: baseDate,
      updated_at: new Date("2024-01-15"),
      memberCount: 3,
    });
    this.mockMembers.set(devTeamId, [
      {
        id: this.nextMemberId++,
        group_id: devTeamId,
        member_user_id: "user-1",
        added_at: baseDate,
      },
      {
        id: this.nextMemberId++,
        group_id: devTeamId,
        member_user_id: "user-2",
        added_at: baseDate,
      },
      {
        id: this.nextMemberId++,
        group_id: devTeamId,
        member_user_id: "user-3",
        added_at: baseDate,
      },
    ]);

    // Create Marketing group with 2 members
    const marketingId = this.nextGroupId++;
    this.mockGroups.set(marketingId, {
      id: marketingId,
      owner_user_id: userId,
      name: "Marketing",
      description: "Marketing department group",
      created_at: new Date("2024-01-10"),
      updated_at: new Date("2024-01-20"),
      memberCount: 2,
    });
    this.mockMembers.set(marketingId, [
      {
        id: this.nextMemberId++,
        group_id: marketingId,
        member_user_id: "user-4",
        added_at: new Date("2024-01-10"),
      },
      {
        id: this.nextMemberId++,
        group_id: marketingId,
        member_user_id: "user-5",
        added_at: new Date("2024-01-10"),
      },
    ]);

    // Create TestGroup with 1 member and no description
    const testGroupId = this.nextGroupId++;
    this.mockGroups.set(testGroupId, {
      id: testGroupId,
      owner_user_id: userId,
      name: "TestGroup",
      description: null,
      created_at: new Date("2024-02-01"),
      updated_at: new Date("2024-02-01"),
      memberCount: 1,
    });
    this.mockMembers.set(testGroupId, [
      {
        id: this.nextMemberId++,
        group_id: testGroupId,
        member_user_id: "user-6",
        added_at: new Date("2024-02-01"),
      },
    ]);
  }

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

  async getMembersForGroup(
    groupId: number
  ): Promise<CollabGroupMemberRecord[]> {
    return this.mockMembers.get(groupId) || [];
  }
}
