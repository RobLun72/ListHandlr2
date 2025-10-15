# PRD: CollabGroups

## 1. Introduction / Overview

CollabGroups enable an authenticated user to create and manage reusable sets of collaborators (users) under a named group. The primary goal is to let a user predefine collaboration groups for later reuse with lists or future features. In this initial release the feature focuses purely on group CRUD and member management; applying groups to lists is explicitly deferred.

## 2. Goals

1. Allow a user to create, rename, and delete collaboration groups they own.
2. Allow a user to add and remove members (other users) to/from a group using an interaction pattern consistent with existing list collaboration UI.
3. Provide optimistic UI updates with toast notifications for success/failure.
4. Enforce uniqueness of group names per owner.
5. Record timestamps (created and last updated) for audit/ordering/future display.
6. Provide validation and error feedback for common issues (duplicate name, empty name, etc.).

## 3. User Stories

- As an authenticated user, I want to create a collaboration group so I can quickly reuse the same members later.
- As an authenticated user, I want to add or remove users in a group so I can keep the group up to date.
- As an authenticated user, I want to see all my existing collaboration groups in a list so I can pick one to edit.
- As an authenticated user, I want immediate (optimistic) feedback when I add/remove members so interactions feel responsive.
- As an authenticated user, I want duplicate group name attempts to be clearly rejected so I avoid confusion.
- As an authenticated user, I want toast notifications confirming saves so I know my changes persisted.

## 4. Functional Requirements

1. The system must provide a route `GET /collab-groups` that lists the current user's groups (name, member count, last updated timestamp).
2. The system must allow creating a new group with: name (required, non-empty, unique per owner), optional description (nullable), initial empty members.
3. The system must allow renaming an existing group (validations re-run, uniqueness enforced per owner).
4. The system must allow deleting a group (soft or hard delete: implement as hard delete in DB for now).
5. The system must provide a detail page at `/collab-groups/[groupName]` (slug by group name) for editing membership.
6. The system must fetch all available users (excluding current user) and display two lists: available users and current group members.
7. The system must allow adding a user to the group (moves from available → members list) with optimistic UI.
8. The system must allow removing a user from the group (moves from members → available list) with optimistic UI.
9. The system must display disabled/inactive save button state when there are no unsaved changes.
10. The system must persist member changes only on explicit Save action (no auto-save) and reset dirty state after success.
11. The system must show toast success notification on successful save of group changes.
12. The system must show toast error notification for failed saves (with basic error message returned from API/action).
13. The system must show validation error when creating or renaming a group to an already used name for that owner.
14. The system must store created_at and updated_at timestamps in the groups table; updated_at refreshes on any change (rename or membership change).
15. The system must record added members inside a `collab_group_members` table (one row per member per group).
16. The system must ensure a user cannot add themselves as a member if business logic forbids (EXCLUDE current user from available list as in existing collaboration UX).
17. The system must expose server actions: `getCollabGroups`, `getCollabGroup`, `editCollabGroup` (or `saveCollabGroupMembers`) modeled after existing list/named list action patterns.
18. The system must return a timestamp (last updated) with detail fetches to allow future concurrency control (reserving possibility for optimistic concurrency).
19. The system must implement optimistic UI for member add/remove prior to save, with revert on failure.
20. The system must guard all server actions with authentication check (similar to existing list actions) when `NEXT_PUBLIC_AUTH_ACTIVE === "true"`.

## 5. Non-Goals (Out of Scope)

- Applying a CollabGroup directly to a list (deferred).
- Sharing or making groups visible to other users beyond the owner.
- Exporting or importing groups.
- Search, filtering, or sorting advanced UI in groups list (basic listing only for MVP).
- Cloning groups or bulk add from another group (future consideration).
- Group member ordering persistence beyond simple display order (drag & drop may visually reorder locally, but no persisted order requirement beyond membership itself).

## 6. Design Considerations

- Reuse existing visual patterns from `/lists/[slug]/collab` and list detail pages for consistency (header with Save / Back icons, toast style, theme usage via `useTheme`).
- Two-column (or stacked on mobile) selection pattern: Available Users vs Group Members.
- Use existing skeleton/loading components for consistency if possible (create a `CollabGroupsSkeleton` if needed mirroring style of existing skeletons).
- Follow Tailwind theme colors (appBlue/appGreen) for active icons; disabled state uses neutral-300.

## 7. Technical Considerations

- New tables (Drizzle): `collab_groups` and `collab_group_members`.
- Unique composite index: (owner_user_id, name) to enforce per-owner uniqueness.
- Foreign key constraints: members table references groups.id; no cascade required beyond ON DELETE CASCADE for simplicity (so deleting a group removes members automatically).
- Server actions implemented similar to `getNamedList` / `editNamedList` but simplified (no item index logic, just membership set replacement).
- Concurrency: store an updated_at timestamp; in MVP we do NOT enforce timestamp match—can add later for conflict detection.
- DTO layer: Add `collabGroupsData.ts` for list-level (rows of groups) and `collabGroupData.ts` for single group membership, or a combined file depending on codebase patterns.
- Optimistic UI: keep local dirty state; only rollback on save failure (re-fetch server state or keep a pre-edit snapshot to restore).

## 8. Data Model

### Table: collab_groups

| Column        | Type      | Constraints                                  |
| ------------- | --------- | -------------------------------------------- |
| id            | integer   | PK, identity                                 |
| owner_user_id | text      | nullable? (No - require owner)               |
| name          | varchar   | not null, unique per owner (composite index) |
| description   | varchar   | nullable                                     |
| created_at    | timestamp | default now()                                |
| updated_at    | timestamp | default now(), updated on change             |

Composite unique index: (owner_user_id, name)

### Table: collab_group_members

| Column         | Type      | Constraints                          |
| -------------- | --------- | ------------------------------------ |
| id             | integer   | PK, identity                         |
| group_id       | integer   | FK -> collab_groups.id (cascade del) |
| member_user_id | text      | not null                             |
| added_at       | timestamp | default now()                        |

Unique composite index: (group_id, member_user_id)

## 9. API / Actions (Draft Contracts)

### getCollabGroups()

Returns: `{ timeStamp: string; rows: { id:number; name:string; description?:string; memberCount:number; updatedAt:string }[] }`

### getCollabGroup(groupName: string)

Returns: `{ timeStamp:string; group: { id:number; name:string; description?:string; members: { id?:number; user_id:string; email?:string }[] } }`

### editCollabGroup(payload)

Payload example:

```
{
  groupName: string; // slug (decoded)
  description?: string;
  members: { user_id: string }[];
  timeStamp: string; // last known updatedAt (future conflict detection)
  renameTo?: string; // optional new name
}
```

Response on success:

```
{ message: "", data: { timeStamp: string; group: { ...same shape... } } }
```

On duplicate name: `message: "Duplicate group name"` + latest data.

## 10. Validation Rules

- Group name: required, trimmed, length 1..255, must not already exist for owner.
- Description: max length 500 (soft—truncate or reject).
- Members: zero or more allowed; removing last member is valid.
- Rename: treat name uniqueness same as create.

## 11. Success Metrics

- (A) User can create first group in < 60 seconds: instrument by measuring time from first visit to /collab-groups to first successful create action (future analytics hook placeholder).
- (B) Error rate for save operations < 2%: log failures of editCollabGroup relative to attempts.

## 12. Edge Cases Covered

- Duplicate group name (prevent and notify).
- Empty group (allowed) vs group with members.
- Deleting a group that is not yet referenced elsewhere (no additional constraint since applying to lists is deferred).

## 13. Open Questions

- Should we surface description field in MVP UI (entered on create / edit) or store-only for now?
- Do we want soft delete for audit instead of hard delete? (Current decision: hard delete.)
- Will group ordering (sorting by updated_at vs name) need explicit user choice later?

## 14. Implementation Phases (Suggested)

1. Schema & migrations.
2. DTO + server actions.
3. Routes & UI (list + detail + basic membership editing).
4. Optimistic updates + toasts.
5. Validation & error surfaces.
6. (Future) Apply groups to lists.

## 15. Acceptance Criteria Summary

- Can create, view, edit (rename + membership), and delete groups you own.
- Duplicate name rejected with readable toast notification.
- Empty group allowed and displayed with 0 members count.
- Save button disabled when no unsaved changes.
- Optimistic add/remove UI with rollback on save failure.
- All actions behind auth check when auth active.
- Timestamps stored and updated.

---

Generated from clarified responses (2025-10-13).
