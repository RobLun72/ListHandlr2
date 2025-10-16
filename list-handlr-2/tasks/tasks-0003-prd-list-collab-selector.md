# Tasks: ListCollabSelector Feature Implementation

Based on the PRD analysis and current codebase assessment, this task list guides implementation of the ListCollabSelector feature that adds a dropdown to quickly add collaboration group members to list collaborators.

## Relevant Files

- `app/lists/[slug]/collab/page.tsx` - Main collaboration page that needs the dropdown selector (MODIFIED: Added collabGroups state and data fetching)
- `actions/getCollabGroups.ts` - Existing action to fetch user's collaboration groups
- `actions/getCollabGroup.ts` - Existing action to fetch group details with members (if needed)
- `DTO/collabGroupsData.ts` - Existing interfaces for CollabGroupData and CollabGroupDetailData
- `DTO/userData.ts` - Existing User interface for user data
- `contexts/UserContext.tsx` - Existing user context (already used)
- `contexts/ThemeContext.tsx` - Existing theme context (already used)
- `app/lists/[slug]/collab/collabTable.tsx` - Existing table component (no changes needed)
- `Helpers/cn.ts` - Existing utility for conditional classnames
- `components/ui/select.tsx` - Potential UI component for styled select (may need creation). See `list-handlr-2\components\ui\DataTable\TableTopView.tsx` for usage reference.

### Notes

- The feature leverages existing collaboration groups infrastructure completely
- No new server actions or database queries are required
- Integration focuses on extending existing page state and adding UI component
- Uses existing patterns for loading states, error handling, and state management

## Tasks

- [x] 1.0 Extend CollabPageState Interface and Data Fetching

  - [x] 1.1 Add `collabGroups: CollabGroupData[]` property to the existing `CollabPageState` interface in `page.tsx`
  - [x] 1.2 Import `getCollabGroups` action and `CollabGroupData` interface at the top of `page.tsx`
  - [x] 1.3 Update the existing `fetchData` function within `useEffect` to also fetch collaboration groups using `getCollabGroups({ user_id: user!.id })`
  - [x] 1.4 Add error handling for collaboration groups fetch within the existing try/catch block
  - [x] 1.5 Update `setPageState` call to include the fetched `collabGroups` in the state update
  - [x] 1.6 Ensure collaboration groups are only fetched when `user` is available (same pattern as existing code)

- [x] 2.0 Create Collaboration Group Selector Component

  - [x] 2.1 Check if `components/ui/select.tsx` exists and examine its API, or reference `TableTopView.tsx` for select patterns
  - [x] 2.2 Create inline JSX for the selector using existing component patterns (similar to save/back button area)
  - [x] 2.3 Style the selector with Tailwind CSS using theme-aware colors (appBlue/appGreen pattern from existing elements)
  - [x] 2.4 Add responsive design classes following existing mobile/desktop patterns in the page
  - [x] 2.5 Implement proper accessibility attributes (aria-label, role) for the dropdown
  - [x] 2.6 Add loading and disabled states that integrate with existing `pageState.load` pattern

- [x] 3.0 Implement Group Selection Logic and Member Addition

  - [x] 3.1 Create `handleGroupSelection` function that receives the selected group ID as parameter
  - [x] 3.2 Implement logic to find the selected group from `pageState.collabGroups` by ID
  - [x] 3.3 Extract member user IDs from the selected group's member data (note: `CollabGroupData` may not include members, verify interface)
  - [x] 3.4 If members are not included in `CollabGroupData`, add logic to fetch group details using `getCollabGroup` action
  - [x] 3.5 Cross-reference member user IDs with `pageState.users` array to get full `User` objects for members not already collaborating
  - [x] 3.6 Call existing `handleSelect` function for each eligible user to add them to collaborators (reusing existing logic)
  - [x] 3.7 Reset the selector value to empty/placeholder state after processing
  - [x] 3.8 Handle edge case where group has no members or all members are already collaborating (no-op)

- [ ] 4.0 Integrate Selector into Collaboration Page Layout

  - [ ] 4.1 Position the selector above the "Collaborating users" table within the existing layout structure
  - [ ] 4.2 Add appropriate spacing using existing Tailwind classes (`py-2 px-3` pattern used throughout)
  - [ ] 4.3 Include descriptive label text such as "Add group members:" following existing text styling patterns
  - [ ] 4.4 Ensure selector is only rendered when not in loading state (`!pageState.load` condition)
  - [ ] 4.5 When no collaboration groups are available add a item to the selector and select it. The item has the text `no collab groups defined`. Also disable the selector.
