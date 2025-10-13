import { ApiData } from "./apiData";

export interface CollabGroupData {
  id: number;
  ownerUserId: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollabGroupDetailData extends CollabGroupData {
  members: CollabGroupMemberData[];
}

export interface CollabGroupMemberData {
  id: number;
  groupId: number;
  memberUserId: string;
  addedAt: Date;
}

export interface CollabGroupsPostData {
  saveType: "create" | "update" | "delete";
  groupId?: number;
  name?: string;
  description?: string;
  item: ApiData<CollabGroupData>;
}

export interface CollabGroupMembersPostData {
  saveType: "add" | "remove";
  groupId: number;
  memberUserId: string;
  item: ApiData<CollabGroupMemberData>;
}
