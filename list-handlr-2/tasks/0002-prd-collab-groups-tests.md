# PRD: CollabGroups Testing Suite

## 1. Introduction/Overview

This document defines the requirements for creating a comprehensive testing suite for the CollabGroups feature. The CollabGroups feature allows users to create, manage, and organize collaboration groups with member management capabilities. This testing suite will ensure all CRUD operations, member management functionality, navigation flows, and edge cases are thoroughly tested to maintain code quality and catch regressions.

The tests will follow the existing pattern established in `app/lists/tests/`, using Vitest, React Testing Library, MSW (Mock Service Worker) for API mocking, and the project's established test helpers.

**Problem Solved:** Currently, the CollabGroups feature has no automated tests, making it vulnerable to regressions and difficult to refactor with confidence. This testing suite will provide comprehensive coverage of all user interactions and critical flows.

**Goal:** Create a robust, maintainable testing suite that covers all CollabGroups functionality, following established patterns from the lists feature tests.

## 2. Goals

1. Achieve comprehensive test coverage for all CollabGroups CRUD operations (Create, Read, Update, Delete)
2. Test member management functionality (Add members, Remove members, Save changes)
3. Verify navigation flows between list and detail views work correctly
4. Test all edge cases including validation errors, API errors, and unsaved changes scenarios
5. Ensure tests follow the same patterns as `app/lists/tests/` for consistency
6. Create reusable MSW mock handlers for CollabGroups API endpoints
7. Maintain 100% passing test rate with clear, descriptive test names
8. Enable confident refactoring and feature additions with regression protection

## 3. User Stories

**As a developer**, I want comprehensive tests for the CollabGroups list view so that I can confidently modify the CRUD operations without breaking existing functionality.

**As a developer**, I want tests for the member management detail view so that I can verify add/remove member operations work correctly across different scenarios.

**As a developer**, I want tests for navigation flows so that I can ensure users can seamlessly move between list and detail views.

**As a QA engineer**, I want tests that cover edge cases and validation errors so that I can verify the application handles error conditions gracefully.

**As a team member**, I want tests that follow existing patterns so that I can easily understand and maintain them without learning new testing approaches.

## 4. Functional Requirements

### List View Tests (app/collab-groups/page.tsx)

**FR-1:** Test must render the initial page with existing groups loaded from MSW mock data  
**FR-2:** Test must verify creating a new collaboration group with name and description  
**FR-3:** Test must verify editing an existing group's name through the context menu  
**FR-4:** Test must verify editing an existing group's description through the context menu  
**FR-5:** Test must verify deleting a group through context menu with confirmation dialog  
**FR-6:** Test must verify the "save" icon becomes enabled after modifications (isDirty state)  
**FR-7:** Test must verify saving changes updates the timestamp  
**FR-8:** Test must verify navigation to group detail page via "Manage Members" context menu option  
**FR-9:** Test must verify navigation to group detail page via clicking on group name  
**FR-10:** Test must verify back button navigation to settings page

### Detail View Tests (app/collab-groups/[groupName]/page.tsx)

**FR-11:** Test must render the member management page with current group members  
**FR-12:** Test must verify adding a member from available users list  
**FR-13:** Test must verify removing a member from current members list  
**FR-14:** Test must verify adding multiple members in sequence  
**FR-15:** Test must verify removing multiple members in sequence  
**FR-16:** Test must verify the "save" icon becomes enabled after member changes (isDirty state)  
**FR-17:** Test must verify saving member changes persists to server  
**FR-18:** Test must verify back button navigation to collab-groups list  
**FR-19:** Test must verify unsaved changes warning when navigating away with isDirty=true  
**FR-20:** Test must verify unsaved changes can be confirmed or cancelled

### Validation & Edge Cases

**FR-21:** Test must verify duplicate group name validation shows error message  
**FR-22:** Test must verify empty group name validation prevents creation  
**FR-23:** Test must verify API error responses are handled gracefully with toast notifications  
**FR-24:** Test must verify loading states display skeleton components correctly  
**FR-25:** Test must verify timestamp updates after successful save operations

### MSW Mock Handlers

**FR-26:** Create MSW handlers for `getCollabGroups` endpoint returning mock group data  
**FR-27:** Create MSW handlers for `getCollabGroup` endpoint returning single group with members  
**FR-28:** Create MSW handlers for `editCollabGroup` endpoint supporting create/update/delete operations  
**FR-29:** Create MSW handlers for `fetchAllUsers` endpoint returning available users  
**FR-30:** Create error scenario handlers for testing validation and API failures

## 5. Non-Goals (Out of Scope)

- **NG-1:** Performance testing or load testing of CollabGroups pages
- **NG-2:** End-to-end testing with real database connections
- **NG-3:** Testing authentication flows (assume user is authenticated)
- **NG-4:** Visual regression testing or screenshot comparisons
- **NG-5:** Testing the underlying database queries (unit tests cover that)
- **NG-6:** Cross-browser compatibility testing
- **NG-7:** Accessibility testing (should be separate initiative)
- **NG-8:** Testing theme switching functionality (covered by theme tests)

## 6. Design Considerations

### Test File Organization

Following the lists pattern, create individual test files:

```
app/collab-groups/tests/
  ├── addGroup.test.tsx
  ├── editGroupName.test.tsx
  ├── editGroupDescription.test.tsx
  ├── deleteGroup.test.tsx
  ├── navigateToGroupDetail.test.tsx
  ├── navigateBackToList.test.tsx
  └── renderCollabGroups.test.tsx

app/collab-groups/[groupName]/tests/
  ├── addMember.test.tsx
  ├── removeMember.test.tsx
  ├── addMultipleMembers.test.tsx
  ├── saveMembers.test.tsx
  ├── unsavedChangesWarning.test.tsx
  └── renderGroupMembers.test.tsx
```

### Test Structure Pattern

Each test file should follow this pattern (from lists tests):

```tsx
import { afterEach, beforeEach, test, vi } from "vitest";
import { render } from "@testing-library/react";
import { serverWithHandlers, setupServerWithHandlers } from "@/MSW/server";
import { testHandlers } from "@/MSW/handlers";
import Page from "../page";
import userEvent from "@testing-library/user-event";
import { UserProvider } from "@/contexts/UserContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Mock next/navigation
vi.mock("next/navigation", async () => {
  const mod = await vi.importActual<typeof import("next/navigation")>(
    "next/navigation"
  );
  return {
    ...mod,
    useSearchParams: () => new URLSearchParams("") as ReadonlyURLSearchParams,
    usePathname: () => "/collab-groups",
    useRouter: () => ({
      push: vi.fn(),
    }),
  };
});

beforeEach(async () => {
  setupServerWithHandlers([...testHandlers]);
  await serverWithHandlers.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  serverWithHandlers.close();
});

test("Test description", async () => {
  const user = userEvent.setup();

  await render(
    <UserProvider>
      <ThemeProvider>
        <Page />
      </ThemeProvider>
    </UserProvider>
  );

  // Test implementation...
});
```

### Mock Data Structure

Mock groups should mirror lists test data pattern:

```typescript
// Mock collaboration groups
const mockCollabGroups = [
  {
    id: 1,
    ownerUserId: "test-user-123",
    name: "DevTeam",
    description: "Development team collaboration",
    memberCount: 3,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: 2,
    ownerUserId: "test-user-123",
    name: "Marketing",
    description: "Marketing department group",
    memberCount: 2,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: 3,
    ownerUserId: "test-user-123",
    name: "TestGroup",
    description: null,
    memberCount: 1,
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
  },
];

// Mock members for a group
const mockDevTeamMembers = [
  { user_id: "user-1", email: "alice@example.com" },
  { user_id: "user-2", email: "bob@example.com" },
  { user_id: "user-3", email: "charlie@example.com" },
];

// Mock available users
const mockAvailableUsers = [
  { id: "user-4", email: "diana@example.com", username: "diana" },
  { id: "user-5", email: "eve@example.com", username: "eve" },
  { id: "user-6", email: "frank@example.com", username: "frank" },
];
```

## 7. Technical Considerations

### Dependencies

- **Vitest**: Test runner (already in project)
- **React Testing Library**: Component testing utilities (already in project)
- **MSW (Mock Service Worker)**: API mocking (already in project)
- **@testing-library/user-event**: User interaction simulation (already in project)

### Reuse Existing Test Helpers

Tests should leverage existing helpers from `@/Helpers/Test/`:

- `actHelper.ts`: `waitForRender()`, `clickOnButton()`, `clickOnElementWithTestId()`, `typeInTextBox()`, `blurInput()`, `clickOnMenuItem()`
- `assertHelper.ts`: `assertTextValueInDoc()`, `assertMissingTextValue()`, `assertElementHasClassname()`, `assertButtonIsEnabled()`
- `testSetup.ts`: Setup configurations and mocks

### New Helper Functions Needed

Create a few new helpers specific to member management UI:

```typescript
// In actHelper.ts or new collabGroupsTestHelper.ts
export const selectMemberFromAvailable = async (user, memberEmail: string) => {
  // Click on plus icon next to member in available list
};

export const deselectMemberFromCurrent = async (user, memberEmail: string) => {
  // Click on minus icon next to member in current list
};

export const assertMemberInList = async (
  listTestId: string,
  memberEmail: string
) => {
  // Verify member appears in specified list
};
```

### MSW Handler Structure

Create new handlers in `MSW/Handlers/` following existing pattern:

```typescript
// MSW/Handlers/collabGroupsHandlers.ts
import { http, HttpResponse } from "msw";
import {
  mockCollabGroups,
  mockDevTeamMembers,
} from "../MockedData/collabGroupsData";

export const collabGroupsHandlers = [
  // GET /api/collab-groups
  http.get("/api/collab-groups", ({ request }) => {
    return HttpResponse.json({
      rows: mockCollabGroups,
      timeStamp: new Date().toISOString(),
    });
  }),

  // GET /api/collab-groups/:groupName
  http.get("/api/collab-groups/:groupName", ({ params }) => {
    const group = mockCollabGroups.find((g) => g.name === params.groupName);
    return HttpResponse.json({
      rows: [{ ...group, members: mockDevTeamMembers }],
      timeStamp: new Date().toISOString(),
    });
  }),

  // POST /api/collab-groups
  http.post("/api/collab-groups", async ({ request }) => {
    const body = await request.json();
    // Handle create/update/delete based on body.saveType
    return HttpResponse.json({
      message: "",
      data: { rows: [], timeStamp: new Date().toISOString() },
    });
  }),
];
```

### Test Data Consistency

- Use the same mock user context across all tests (`test-user-123`)
- Ensure mock groups have realistic data (names, descriptions, member counts)
- Mock timestamps should be consistently formatted
- Available users should not overlap with current members in initial state

## 8. Success Metrics

1. **Test Coverage**: All critical user flows covered (CRUD operations + member management + navigation)
2. **Pattern Consistency**: Tests follow exact same structure as `app/lists/tests/`
3. **Passing Rate**: 100% of tests passing in CI/CD pipeline
4. **Regression Detection**: Tests catch breaking changes when modifying collab-groups code
5. **Maintainability**: New developers can understand and modify tests easily
6. **Execution Time**: Full test suite completes in under 60 seconds
7. **Code Coverage**: Achieve high coverage of collab-groups pages (target: 80%+)

## 9. Open Questions

1. **Q1:** Should we test the interaction between collab-groups and the settings page navigation?

   - **Proposed Answer:** Yes, but keep it minimal - just verify the back button routes correctly

2. **Q2:** How should we handle testing the useUnsavedChangesWarning hook?

   - **Proposed Answer:** Test the visible behavior (confirmation dialog appears), not the hook implementation directly

3. **Q3:** Should we create performance benchmarks for test execution time?

   - **Proposed Answer:** Not initially - focus on functionality first, optimize later if needed

4. **Q4:** Do we need to test the MSW mock handlers themselves?

   - **Proposed Answer:** No, trust that MSW works correctly - focus on testing the React components

5. **Q5:** Should we test error recovery scenarios (e.g., retry after failed save)?
   - **Proposed Answer:** Yes, verify toast error messages appear and user can retry operations

---

## Implementation Notes for Junior Developers

### Getting Started

1. **Study the Reference Tests**: Before writing new tests, thoroughly read and understand:

   - `app/lists/tests/addList.test.tsx`
   - `app/lists/tests/deleteTestyList.test.tsx`
   - `app/lists/tests/editNameOfHandlaList.test.tsx`

2. **Test Writing Order**: Implement tests in this order:

   - Start with simple render tests (`renderCollabGroups.test.tsx`)
   - Then CRUD operations (add, edit, delete)
   - Then navigation tests
   - Finally, complex scenarios (unsaved changes, validation errors)

3. **MSW Setup**: Create MSW handlers first before writing tests that depend on API calls

4. **Run Tests Frequently**: Use `npm test` to run tests as you write them to catch issues early

5. **Use Test Helpers**: Don't reinvent the wheel - leverage existing helpers from `@/Helpers/Test/`

### Common Patterns

- **Waiting for Async Operations**: Always use `await waitForRender()` after actions that trigger state updates
- **Timestamps**: Use `getValueByTestId("current-timestamp")` to verify save operations
- **Context Menus**: Use `clickOnButtonWithIndex()` then `clickOnMenuItem()` pattern
- **Form Interactions**: Use `typeInTextBox()`, `blurInput()`, then `clickOnButton()` pattern
- **Assertions**: Use descriptive assertion helpers rather than raw `expect()` when possible

### Debugging Tips

- If a test fails, add `screen.debug()` to see the current DOM state
- Use `await waitForRender(1000)` with longer timeout if operations are slow
- Check MSW handler logs to verify API calls are being intercepted
- Verify mock data matches the expected structure in DTOs

---

**Document Status**: Ready for Review  
**Created**: October 13, 2025  
**Last Updated**: October 13, 2025  
**Version**: 1.0
