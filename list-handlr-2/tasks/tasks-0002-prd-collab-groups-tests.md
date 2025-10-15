# Tasks: CollabGroups Testing Suite Implementation

Generated from: `0002-prd-collab-groups-tests.md`

- [ ] **NOTE**: Detail view tests require additional setup due to server action complexity. The detail view page calls multiple server actions (getCollabGroup, fetchAllUsers) that need comprehensive mocking. The MSW server has been successfully configured with testHandlers to provide mock user data.

  - [x] 3.1 Create `app/collab-groups/[groupName]/tests/renderGroupMembers.test.tsx` - Test detail page renders with group name in header, displays current members list and available users list, shows loading skeleton initially
    - ✅ Test created and passing - successfully mocked useParams, seeded CollabGroups data, and set up MSW handlers for user data
  - [x] 3.2 Create `app/collab-groups/[groupName]/tests/addMember.test.tsx` - Test clicking plus icon next to available user, verify user moves from available to current members list, verify isDirty state becomes true, verify save icon enabled
    - ✅ Test created and passing - verified member addition, state updates, and isDirty flag changesMember Management Detail View Tests

  **NOTE**: Detail view tests require additional setup due to server action complexity. The detail view page calls multiple server actions (getCollabGroup, fetchAllUsers) that need comprehensive mocking. The MSW server has been successfully configured with testHandlers to provide mock user data.

  - [x] 3.1 Create `app/collab-groups/[groupName]/tests/renderGroupMembers.test.tsx` - Test detail page renders with group name in header, displays current members list and available users list, shows loading skeleton initially
    - ✅ Test created and passing - successfully mocked useParams, seeded CollabGroups data, and set up MSW handlers for user dataCurrent State Assessment

The existing codebase has established testing patterns in `app/lists/tests/`:

- **Test Framework**: Vitest with React Testing Library
- **Database Factory Pattern**: Uses factory classes (e.g., `ListsDbFactory`) that return mock implementations when `NODE_ENV === "test"`
- **Mock Queries**: Mock implementations use in-memory data structures (Maps) for test data storage
- **Test Helpers**: Reusable helpers in `@/Helpers/Test/` including `actHelper.ts` and `assertHelper.ts`
- **Test Structure**: Individual test files per operation (e.g., `addList.test.tsx`, `deleteTestyList.test.tsx`)
- **Provider Wrapping**: Tests wrap components in `UserProvider` and `ThemeProvider`
- **Navigation Mocking**: Next.js navigation is mocked using `vi.mock("next/navigation")`

The CollabGroups feature is **fully implemented** with:

- List view: `app/collab-groups/page.tsx` with table, form, and CRUD operations
- Detail view: `app/collab-groups/[groupName]/page.tsx` with member management
- Server actions: `actions/getCollabGroups.ts`, `actions/getCollabGroup.ts`, `actions/editCollabGroup.ts`
- DTOs: `DTO/collabGroupsData.ts` with interfaces
- **Database queries**: `db/queries/collabGroups/` with factory pattern already in place:
  - `collabGroupsDbFactory.ts` - Factory that returns mock queries in test environment
  - `collabGroupsDbMockQueries.ts` - Mock implementation using in-memory Maps (already complete)
  - `collabGroupsDbRealQueries.ts` - Production database queries
  - `collabGroupsDbInterfaces.ts` - TypeScript interfaces for queries

**Key Insight**: The CollabGroups mock infrastructure is already complete! The factory pattern automatically uses `CollabGroupsMockDbQueries` when `NODE_ENV === "test"`, which maintains mock data in memory using Map data structures. No MSW handlers are needed for CollabGroups tests.

## Relevant Files

### Files to Create

- `app/collab-groups/tests/renderCollabGroups.test.tsx` - Test initial render of groups list
- `app/collab-groups/tests/addGroup.test.tsx` - Test creating new collaboration group
- `app/collab-groups/tests/editGroupName.test.tsx` - Test editing group name via context menu
- `app/collab-groups/tests/editGroupDescription.test.tsx` - Test editing group description
- `app/collab-groups/tests/deleteGroup.test.tsx` - Test deleting group with confirmation
- `app/collab-groups/tests/navigateToGroupDetail.test.tsx` - Test navigation to detail page
- `app/collab-groups/tests/navigateBackToList.test.tsx` - Test back button to settings
- `app/collab-groups/[groupName]/tests/renderGroupMembers.test.tsx` - Test member management page render
- `app/collab-groups/[groupName]/tests/addMember.test.tsx` - Test adding member to group
- `app/collab-groups/[groupName]/tests/removeMember.test.tsx` - Test removing member from group
- `app/collab-groups/[groupName]/tests/addMultipleMembers.test.tsx` - Test adding multiple members
- `app/collab-groups/[groupName]/tests/saveMembers.test.tsx` - Test saving member changes
- `app/collab-groups/[groupName]/tests/unsavedChangesWarning.test.tsx` - Test unsaved changes dialog

### Files to Modify (Optional)

- `Helpers/Test/actHelper.ts` - Add helper functions for member selection if needed
- `db/queries/collabGroups/collabGroupsDbMockQueries.ts` - Add seed data initialization method if needed

### Existing Files (Already Complete - No Changes Needed)

- `db/queries/collabGroups/collabGroupsDbFactory.ts` - Factory returns mock queries in test environment ✅
- `db/queries/collabGroups/collabGroupsDbMockQueries.ts` - In-memory mock implementation ✅
- `db/queries/collabGroups/collabGroupsDbInterfaces.ts` - Query interfaces ✅
- `actions/getCollabGroups.ts` - Uses factory pattern, automatically mocked in tests ✅
- `actions/getCollabGroup.ts` - Uses factory pattern, automatically mocked in tests ✅
- `actions/editCollabGroup.ts` - Uses factory pattern, automatically mocked in tests ✅

### Files to Reference

- `app/lists/tests/addList.test.tsx` - Pattern reference for add operations
- `app/lists/tests/deleteTestyList.test.tsx` - Pattern reference for delete operations
- `app/lists/tests/editNameOfHandlaList.test.tsx` - Pattern reference for edit operations
- `db/queries/lists/listsDbFactory.ts` - Reference for factory pattern
- `db/queries/lists/listsDbMockQueries.ts` - Reference for mock query implementation
- `Helpers/Test/actHelper.ts` - Existing test helper functions
- `Helpers/Test/assertHelper.ts` - Existing assertion helper functions

### Notes

- All test files should be placed in `tests/` subdirectory within their respective page directories
- Use `npm test` to run the full test suite
- Use `npm test -- app/collab-groups` to run only CollabGroups tests
- Follow exact patterns from lists tests for consistency
- **Mock data is automatically used**: When tests run with `NODE_ENV=test`, the `CollabGroupsDbFactory` automatically returns `CollabGroupsMockDbQueries`, which maintains data in-memory using JavaScript Maps
- **No MSW setup needed**: Unlike lists tests, CollabGroups uses the factory pattern at the database query level, so server actions work directly with mock data without requiring MSW handlers
- The mock queries maintain state across operations within a single test, allowing full CRUD testing
- Each test starts with a fresh instance of `CollabGroupsMockDbQueries` (clean state)

## Tasks

- [x] 1.0 Test Infrastructure Setup & Seed Data

  - [x] 1.1 Create `db/queries/collabGroups/collabGroupsDbMockQueries.ts` seed data initialization method (optional) - Add `seedTestData()` method that pre-populates the mock Maps with test groups like "DevTeam", "Marketing", "TestGroup" with members
  - [x] 1.2 Verify `CollabGroupsDbFactory` correctly returns mock queries when `NODE_ENV === "test"` - Check factory switches to `CollabGroupsMockDbQueries` in test environment
  - [x] 1.3 Create test directory `app/collab-groups/tests/` for list view tests
  - [x] 1.4 Create test directory `app/collab-groups/[groupName]/tests/` for detail view tests
  - [x] 1.5 (Optional) Add helper functions to `Helpers/Test/actHelper.ts` for member selection - `selectMemberFromAvailable()`, `deselectMemberFromCurrent()` if needed for cleaner test code

- [x] 2.0 CollabGroups List View Tests

  - [x] 2.1 Create `app/collab-groups/tests/renderCollabGroups.test.tsx` - Test initial page render with loading skeleton, then verify groups display with correct names, descriptions, and member counts
  - [x] 2.2 Create `app/collab-groups/tests/addGroup.test.tsx` - Test clicking table add button, entering group name and description in form, creating group, verifying isDirty state changes, saving to server, and timestamp update
  - [x] 2.3 Create `app/collab-groups/tests/editGroupName.test.tsx` - Test opening context menu on existing group, clicking Edit, modifying name field, updating, verifying isDirty state, saving changes, and timestamp update
  - [x] 2.4 Create `app/collab-groups/tests/editGroupDescription.test.tsx` - Test editing group description via context menu, following same pattern as editGroupName but modifying description field
  - [x] 2.5 Create `app/collab-groups/tests/deleteGroup.test.tsx` - Test opening context menu, clicking Delete, confirming deletion in dialog, verifying group removed from list, saving changes, and timestamp update
  - [x] 2.6 Verify all list view tests follow exact pattern from `app/lists/tests/` - Use same setup (UserProvider, ThemeProvider, navigation mocks), same helpers (clickOnButton, typeInTextBox, assertTextValueInDoc), same assertions (isDirty, timestamps)
    - ✅ All 5 tests follow consistent pattern with factory-based seeding
  - [x] 2.7 Run list view tests with `npm test -- app/collab-groups/tests` and verify all pass
    - ✅ All 5 tests passed successfully

- [x] 3.0 Member Management Detail View Tests

  - **NOTE**: Detail view tests require additional setup due to server action complexity. The detail view page calls multiple server actions (getCollabGroup, fetchAllUsers) that need comprehensive mocking. The MSW server has been successfully configured with testHandlers to provide mock user data.

  - [x] 3.1 Create `app/collab-groups/[groupName]/tests/renderGroupMembers.test.tsx` - Test detail page renders with group name in header, displays current members list and available users list, shows loading skeleton initially
    - ✅ Test created and passing - successfully mocked useParams, seeded CollabGroups data, and set up MSW handlers for user data
  - [x] 3.2 Create `app/collab-groups/[groupName]/tests/addMember.test.tsx` - Test clicking plus icon next to available user, verify user moves from available to current members list, verify isDirty state becomes true, verify save icon enabled
    - ✅ Test created and passing - verified member addition, state updates, and isDirty flag changes
  - [x] 3.3 Create `app/collab-groups/[groupName]/tests/removeMember.test.tsx` - Test clicking minus icon next to current member, verify member moves from current to available list, verify isDirty state, verify save icon enabled
    - ✅ Test created and passing - verified member removal, state updates, counter changes, and save icon state
  - [x] 3.4 Create `app/collab-groups/[groupName]/tests/addMultipleMembers.test.tsx` - Test adding 2-3 members in sequence, verify all appear in current members list, verify isDirty persists through multiple operations
    - ✅ Test created and passing - added 3 members sequentially (Diana, Eve, Brent), verified all appear in current members, confirmed isDirty persists through all operations
  - [x] 3.5 Create `app/collab-groups/[groupName]/tests/saveMembers.test.tsx` - Test adding/removing members, clicking save icon, verifying pending overlay displays, verifying success toast, verifying timestamp updates, verifying isDirty resets to false
    - ✅ Test created and passing - added Diana, removed Charlie, clicked save, verified isDirty reset to false, timestamp updated, and final member list correct
  - [x] 3.6 Create `app/collab-groups/[groupName]/tests/unsavedChangesWarning.test.tsx` - Test modifying members (isDirty=true), clicking back button, verifying confirmation dialog appears, testing both cancel (stays on page) and confirm (navigates away) options
    - ✅ Test created and passing - 3 test cases: cancel navigation (stays on page), confirm navigation (router.push called), no warning when no changes made
  - [x] 3.7 Mock navigation params for detail view tests - Use `vi.mock("next/navigation")` to provide groupName param (e.g., "DevTeam") via `useParams()`
    - ✅ Completed in all detail view tests - useParams properly mocked with groupName parameter
  - [x] 3.8 Run detail view tests with `npm test -- app/collab-groups/[groupName]/tests` and verify all pass
    - ✅ All 6 detail view tests passing: renderGroupMembers, addMember, removeMember, saveMembers, addMultipleMembers, unsavedChangesWarning (9 total test cases)

- [x] 4.0 Navigation & Integration Tests

  - [x] 4.1 Create `app/collab-groups/tests/navigateToGroupDetail.test.tsx` - Test clicking "Manage Members" in context menu navigates to detail page, verify router.push called with `/collab-groups/[groupName]`
    - ✅ Test created and passing - 2 test cases: navigate via "Manage members" menu item and via clicking group name
  - [x] 4.2 Test navigation via clicking on group name in table - Verify clicking group name row navigates to detail page (if implemented in table component)
    - ✅ Completed in 4.1 - group name click navigation test included
  - [x] 4.3 Create `app/collab-groups/tests/navigateBackToList.test.tsx` - Test clicking back button from list view navigates to `/settings`, verify router.push called with correct path
    - ✅ Test created and passing - back button navigates to /settings
  - [x] 4.4 Test back navigation from detail view - From `[groupName]/page.tsx`, verify back button navigates to `/collab-groups` list
    - ✅ Already tested in unsavedChangesWarning.test.tsx - back button navigation verified in all 3 test cases
  - [x] 4.5 Verify navigation mocks are correctly configured - Ensure `useRouter().push` is properly mocked and can be spied on with `vi.fn()`
    - ✅ Completed - all navigation tests use mockRouterPush spy with vi.fn(), verified in Tasks 4.1, 4.3, and 3.6
  - [x] 4.6 Run navigation tests and verify routing logic works correctly
    - ✅ All 3 navigation tests passing: navigateToGroupDetail (2 cases), navigateBackToList, plus unsavedChangesWarning (3 cases with navigation)

- [ ] 5.0 Edge Cases & Validation Tests
  - [ ] 5.1 Test duplicate group name validation - Attempt to create group with existing name, verify error toast appears with message about duplicate name
  - [ ] 5.2 Test empty group name validation - Attempt to create group with empty/blank name, verify form validation prevents submission or server returns error
  - [ ] 5.3 Test API error handling in list view - Mock server action to return error response, verify error toast displays with appropriate message
  - [ ] 5.4 Test API error handling in detail view - Mock save members action to fail, verify error toast, verify user can retry operation
  - [ ] 5.5 Test loading states - Verify skeleton components display during initial load for both list and detail views
  - [ ] 5.6 Test timestamp updates - Verify `getValueByTestId("current-timestamp")` returns updated timestamp after all save operations
  - [ ] 5.7 Test isDirty state management - Verify save icon disabled when isDirty=false, enabled when isDirty=true across all operations
  - [ ] 5.8 Run all edge case tests and verify proper error handling

---

**Phase 2 Complete**: All sub-tasks generated with implementation details. Each sub-task follows the established patterns from `app/lists/tests/` and leverages the existing `CollabGroupsDbFactory` mock infrastructure.

**Implementation Order Recommendation**:

1. Start with Task 1.0 (infrastructure setup)
2. Then Task 2.0 (list view tests - simpler)
3. Then Task 3.0 (detail view tests - more complex)
4. Then Task 4.0 (navigation tests)
5. Finally Task 5.0 (edge cases)

**Ready for Implementation**: You can now work through these tasks sequentially. The mock data infrastructure is already complete, so tests will work immediately without MSW configuration.
