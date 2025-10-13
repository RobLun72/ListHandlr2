export interface ICollabGroupsDbQueries {
  getAllGroupsForUser(userId: string): Promise<CollabGroupRecord[]>;
  getGroupByName(userId: string, groupName: string): Promise<CollabGroupDetailRecord | null>;
  addGroupToDb(name: string, description: string | null, userId: string): Promise<number>;
  updateGroupToDb(groupId: number, name: string, description: string | null): Promise<void>;
  deleteGroupToDb(groupId: number): Promise<void>;
  addMemberToGroup(groupId: number, memberUserId: string): Promise<void>;
  removeMemberFromGroup(groupId: number, memberUserId: string): Promise<void>;
  getMembersForGroup(groupId: number): Promise<CollabGroupMemberRecord[]>;
}

export interface CollabGroupRecord {
  id: number;
  owner_user_id: string;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
  memberCount: number;
}

export interface CollabGroupDetailRecord {
  id: number;
  owner_user_id: string;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
  members: CollabGroupMemberRecord[];
}

export interface CollabGroupMemberRecord {
  id: number;
  group_id: number;
  member_user_id: string;
  added_at: Date;
}
