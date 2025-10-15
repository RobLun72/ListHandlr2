# Tasks: CollabGroups Feature Implementation

Generate### Task 2.0: DTO Layer & TypeScript Interfaces

- [x] 2.1: Create `DTO/collabGroupsData.ts` with `CollabGroupData` interface (id, ownerUserId, name, description, createdAt, updatedAt) from: `0001-prd-collab-groups.md`

## Current State Assessment

The existing codebase follows these patterns:

- **Database**: Drizzle ORM with migration files in `db/migrations/`, schema in `db/schema.ts`
- **Server Actions**: Located in `actions/` directory, using Kinde auth checks, returning typed `ApiData<T>` / `ApiResponse<T>` structures
- **DTOs**: TypeScript interfaces in `DTO/` directory (e.g., `collabData.ts`, `listsData.ts`)
- **UI Patterns**: Next.js App Router with pages in `app/[feature]/`, using client components with optimistic state management
- **Existing Collab UI**: `app/lists/[slug]/collab/` demonstrates dual-list selection pattern with available/selected users
- **Styling**: Tailwind CSS with theme context (`useTheme`), toast notifications via `sonner`
- **Components**: Reusable skeleton loaders, overlays, tables with CRUD actions

## Relevant Files

- `db/schema.ts` - Add `collabGroupsTable` and `collabGroupMembersTable` schema definitions with relations
- `db/migrations/0002_*.sql` - Migration file for creating the two new tables and indexes
- `DTO/collabGroupsData.ts` - TypeScript interfaces for CollabGroup list and detail views
- `actions/getCollabGroups.ts` - Server action to fetch all groups for current user
- `actions/getCollabGroup.ts` - Server action to fetch single group with members by name
- `actions/editCollabGroup.ts` - Server action to handle create/rename/delete/membership changes
- `app/collab-groups/page.tsx` - List view of all collaboration groups (client component)
- `app/collab-groups/layout.tsx` - Layout wrapper for collab-groups routes
- `app/collab-groups/collabGroupsTable.tsx` - Table component displaying groups with actions
- `app/collab-groups/collabGroupsForm.tsx` - Form overlay for add/rename group
- `app/collab-groups/collabGroupsSkeleton.tsx` - Loading skeleton for list view
- `app/collab-groups/[groupName]/page.tsx` - Detail view for editing group membership
- `app/collab-groups/[groupName]/layout.tsx` - Layout for group detail route
- `app/collab-groups/[groupName]/groupMembersTable.tsx` - Dual-list component for member selection
- `app/collab-groups/[groupName]/groupMembersSkeleton.tsx` - Loading skeleton for detail view

### Notes

- Follow existing naming conventions: use PascalCase for React components, camelCase for actions
- Place test files alongside implementation files (e.g., `getCollabGroups.test.ts`)
- Use Vitest for testing (existing pattern in workspace)
- Leverage existing utilities: `cn` helper, `formatDate`, `stableInit`, toast from `sonner`

## Tasks

- [x] 1.0 Database Schema & Migration Setup

  - [x] 1.1 Update `db/schema.ts` to add `collabGroupsTable` with columns: id (PK identity), owner_user_id (text, not null), name (varchar 255, not null), description (varchar 500, nullable), created_at (timestamp, default now), updated_at (timestamp, default now)
  - [x] 1.2 Update `db/schema.ts` to add `collabGroupMembersTable` with columns: id (PK identity), group_id (int, FK to collabGroupsTable.id with ON DELETE CASCADE), member_user_id (text, not null), added_at (timestamp, default now)
  - [x] 1.3 Define Drizzle relations: `collabGroupsRelations` (one-to-many with members) and `collabGroupMembersRelations` (many-to-one with groups)
  - [x] 1.4 Create migration file `db/migrations/0002_[generated_name].sql` with CREATE TABLE statements for both tables
  - [x] 1.5 Add unique composite index on `(owner_user_id, name)` in collabGroupsTable migration
  - [x] 1.6 Add unique composite index on `(group_id, member_user_id)` in collabGroupMembersTable migration
  - [x] 1.7 Run `npm run db:generate` (or equivalent Drizzle command) to validate schema and generate migration metadata
  - [x] 1.8 Test migration by running `npm run db:migrate` against local/dev database

- [x] 2.0 DTO Layer & TypeScript Interfaces

  - [x] 2.1 Create `DTO/collabGroupsData.ts` file with interface `CollabGroupData` containing: id (number), name (string), description (string | null), memberCount (number), updatedAt (string)
  - [x] 2.2 Add interface `CollabGroupDetailData` to same file with: id (number), name (string), description (string | null), members (array of `{ user_id: string; email?: string }`)
  - [x] 2.3 Add interface `CollabGroupsPostData` for create/edit operations with: groupName (string), description (string | undefined), members (array of `{ user_id: string }`), timeStamp (string), renameTo (string | undefined)
  - [x] 2.4 Export all interfaces and ensure they align with existing `ApiData<T>` and `ApiResponse<T>` patterns from `DTO/apiData.ts`

- [x] 3.0 Server Actions for CRUD Operations

  - [x] 3.1 Create `actions/getCollabGroups.ts` - fetch all groups owned by current user with member counts, return `ApiData<CollabGroupData>`, include auth check using `getKindeServerSession`
  - [x] 3.2 Implement query joining collabGroupsTable and aggregating count from collabGroupMembersTable, sort by updated_at DESC
  - [x] 3.3 Create `actions/getCollabGroup.ts` - fetch single group by name (URL decoded) with full member list, return `ApiData<CollabGroupDetailData>`, include auth check
  - [x] 3.4 Implement query with WHERE clause on owner_user_id and name, join with members table, fetch user emails via existing user fetch mechanism if available
  - [x] 3.5 Create `actions/editCollabGroup.ts` - handle create, rename, membership changes, and delete operations based on payload structure
  - [x] 3.6 In `editCollabGroup.ts`: validate group name uniqueness per owner (return error message if duplicate), handle empty name validation (reject with error)
  - [x] 3.7 In `editCollabGroup.ts`: implement membership diff logic - compare incoming members array with existing, delete removed members, insert new members
  - [x] 3.8 In `editCollabGroup.ts`: update `updated_at` timestamp on any change (rename or membership modification)
  - [x] 3.9 In `editCollabGroup.ts`: handle rename by updating name column, re-check uniqueness constraint
  - [x] 3.10 Add delete operation support (if payload includes `deleteGroup: true` flag) - hard delete group record (cascade will remove members)
  - [x] 3.11 Format responses using `formatDate` helper for timestamps, return `ApiResponse<ApiData<CollabGroupDetailData>>` structure
  - [x] 3.12 Add error handling for database constraint violations (unique index) and return user-friendly error messages

- [x] 4.0 UI Routes & Components (List View)

  - [x] 4.1 Create `app/collab-groups/` directory
  - [x] 4.2 Create `app/collab-groups/layout.tsx` with metadata (title: "Collaboration Groups")
  - [x] 4.3 Create `app/collab-groups/collabGroupsSkeleton.tsx` with skeleton UI matching lists pattern
  - [x] 4.4 Create `app/collab-groups/collabGroupsForm.tsx` with form fields: groupName (required), description (optional)
  - [x] 4.5 Add form validation using react-hook-form (similar to listsForm.tsx)
  - [x] 4.6 Create `app/collab-groups/collabGroupsTable.tsx` with columns: name (clickable), description, updated_at, actions (context menu)
  - [x] 4.7 Implement context menu with Edit, Delete, Manage Members options
  - [x] 4.8 Use DataTable component from `components/ui/DataTable/DataTable` (pass filterColumnName="name")
  - [x] 4.9 Create `app/collab-groups/page.tsx` as main list view component
  - [x] 4.10 Implement page state management with useState: groups array, timestamp, isDirty, showItemForm, pendingSave
  - [x] 4.11 Add useEffect to fetch groups on mount using `getCollabGroups` action
  - [x] 4.12 Implement handleAdd, handleEdit, handleDelete handlers calling `editCollabGroup` action
  - [x] 4.13 Add optimistic UI updates and toast notifications for success/error
  - [x] 4.14 Add ConfirmDialog for delete confirmation and OverlayWithCenteredInput for forms

- [x] 5.0 UI Routes & Components (Detail/Edit View)

  - [x] 5.1 Create `app/collab-groups/[groupName]/layout.tsx` - layout wrapper for group detail route
  - [x] 5.2 Create `app/collab-groups/[groupName]/page.tsx` - detail page for editing group membership (client component)
  - [x] 5.3 In detail `page.tsx`: set up state for: load, pendingSave, isDirty, availableUsers (User[]), groupMembers (User[]), group (CollabGroupDetailData), timestamp
  - [x] 5.4 In detail `page.tsx`: implement `useEffect` to fetch group details (`getCollabGroup`) and all users (`fetchAllUsers` from existing action), filter current user from available list
  - [x] 5.5 In detail `page.tsx`: implement `handleSelect` (move user from available to members, set isDirty true) with optimistic update
  - [x] 5.6 In detail `page.tsx`: implement `handleDeselect` (move user from members to available, set isDirty true) with optimistic update
  - [x] 5.7 In detail `page.tsx`: implement `handleSave` calling `editCollabGroup` with updated members array, show pending overlay with spinner during save
  - [x] 5.8 In detail `page.tsx`: implement `handleBack` with unsaved changes warning (confirm dialog if isDirty), navigate to `/collab-groups`
  - [x] 5.9 In detail `page.tsx`: add header with group name (URL decoded), Save icon (disabled when not dirty), Back icon - matching list detail page pattern
  - [x] 5.10 Create `app/collab-groups/[groupName]/groupMembersTable.tsx` - dual-list component showing available users (top/left) and current members (bottom/right)
  - [x] 5.11 In `groupMembersTable.tsx`: display user email/name with action icons (plus for available users, minus for current members)
  - [x] 5.12 In `groupMembersTable.tsx`: add click handlers calling parent's onSelect/onDeselect callbacks, use theme colors for icons
  - [x] 5.13 Create `app/collab-groups/[groupName]/groupMembersSkeleton.tsx` - loading skeleton for dual-list layout
  - [x] 5.14 In detail `page.tsx`: add pending save overlay (reuse OverlayWithCenteredInput + LoadingSpinner pattern from lists)
  - [x] 5.15 In detail `page.tsx`: handle save success (update timestamp, reset isDirty, show toast), handle save failure (revert optimistic changes or refetch, show error toast)
  - [x] 5.16 Add `useUnsavedChangesWarning` hook to detail page for browser navigation warnings when isDirty is true

- [ ] 4.0 UI Routes & Components (List View)

  - [ ] 4.1 Create `app/collab-groups/layout.tsx` - basic layout wrapper (can be minimal or reuse pattern from lists layout)
  - [ ] 4.2 Create `app/collab-groups/page.tsx` - main list page component (client component with "use client")
  - [ ] 4.3 In `page.tsx`: set up state management with `useState` for: load (boolean), groups (array), showForm (boolean), editingGroup (CollabGroupData | undefined), isDirty (boolean)
  - [ ] 4.4 In `page.tsx`: implement `useEffect` to call `getCollabGroups` action on mount using `stableInit` pattern
  - [ ] 4.5 In `page.tsx`: add handlers for `handleAdd` (show form overlay with empty group), `handleEdit` (show form with existing group for rename), `handleDelete` (confirm and call editCollabGroup with delete flag)
  - [ ] 4.6 In `page.tsx`: integrate `useTheme` hook for theme-aware styling, add toast notifications using `sonner` for success/error feedback
  - [ ] 4.7 Create `app/collab-groups/collabGroupsTable.tsx` - table component displaying groups with columns: name, description, member count, updated date, actions (edit/delete icons)
  - [ ] 4.8 In `collabGroupsTable.tsx`: make rows clickable to navigate to `/collab-groups/[groupName]` detail page using Next.js router
  - [ ] 4.9 In `collabGroupsTable.tsx`: add action icons (PencilIcon for rename, TrashIcon for delete) with theme-aware colors and click handlers
  - [ ] 4.10 Create `app/collab-groups/collabGroupsForm.tsx` - overlay form component for add/rename with inputs for name and description
  - [ ] 4.11 In `collabGroupsForm.tsx`: implement validation (required name, max length checks), show inline error messages, disable submit on invalid input
  - [ ] 4.12 In `collabGroupsForm.tsx`: handle form submission calling `editCollabGroup` action, close overlay on success, show toast on error
  - [ ] 4.13 Create `app/collab-groups/collabGroupsSkeleton.tsx` - loading skeleton matching table structure for consistent loading state
  - [ ] 4.14 Add "Add New Group" button in page header with plus icon, theme-colored, triggering `handleAdd`

- [ ] 5.0 UI Routes & Components (Detail/Edit View)
  - [ ] 5.1 Create `app/collab-groups/[groupName]/layout.tsx` - layout wrapper for group detail route
  - [ ] 5.2 Create `app/collab-groups/[groupName]/page.tsx` - detail page for editing group membership (client component)
  - [ ] 5.3 In detail `page.tsx`: set up state for: load, pendingSave, isDirty, availableUsers (User[]), groupMembers (User[]), group (CollabGroupDetailData), timestamp
  - [ ] 5.4 In detail `page.tsx`: implement `useEffect` to fetch group details (`getCollabGroup`) and all users (`fetchAllUsers` from existing action), filter current user from available list
  - [ ] 5.5 In detail `page.tsx`: implement `handleSelect` (move user from available to members, set isDirty true) with optimistic update
  - [ ] 5.6 In detail `page.tsx`: implement `handleDeselect` (move user from members to available, set isDirty true) with optimistic update
  - [ ] 5.7 In detail `page.tsx`: implement `handleSave` calling `editCollabGroup` with updated members array, show pending overlay with spinner during save
  - [ ] 5.8 In detail `page.tsx`: implement `handleBack` with unsaved changes warning (confirm dialog if isDirty), navigate to `/collab-groups`
  - [ ] 5.9 In detail `page.tsx`: add header with group name (URL decoded), Save icon (disabled when not dirty), Back icon - matching list detail page pattern
  - [ ] 5.10 Create `app/collab-groups/[groupName]/groupMembersTable.tsx` - dual-list component showing available users (top/left) and current members (bottom/right)
  - [ ] 5.11 In `groupMembersTable.tsx`: display user email/name with action icons (plus for available users, minus for current members)
  - [ ] 5.12 In `groupMembersTable.tsx`: add click handlers calling parent's onSelect/onDeselect callbacks, use theme colors for icons
  - [ ] 5.13 Create `app/collab-groups/[groupName]/groupMembersSkeleton.tsx` - loading skeleton for dual-list layout
  - [ ] 5.14 In detail `page.tsx`: add pending save overlay (reuse OverlayWithCenteredInput + LoadingSpinner pattern from lists)
  - [ ] 5.15 In detail `page.tsx`: handle save success (update timestamp, reset isDirty, show toast), handle save failure (revert optimistic changes or refetch, show error toast)
  - [ ] 5.16 Add `useUnsavedChangesWarning` hook to detail page for browser navigation warnings when isDirty is true

---

**Phase 2 Complete**: All sub-tasks generated with implementation details aligned to existing codebase patterns.

**Ready for Implementation**: You can now work through these tasks sequentially or assign to developers. Each sub-task includes specific technical guidance referencing existing patterns.
