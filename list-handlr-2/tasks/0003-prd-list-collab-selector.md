# 0003-prd-list-collab-selector

## Introduction/Overview

The ListCollabSelector feature enhances the existing list collaboration functionality by adding a dropdown selector that allows users to quickly add all members from their collaboration groups to a specific list's collaborators. This feature eliminates the need to manually select individual users when wanting to add an entire collaboration group to a list, significantly improving the user experience for bulk collaboration management.

The feature integrates seamlessly with the existing collaboration page (`app/lists/[slug]/collab/page.tsx`) and leverages the existing collaboration groups infrastructure.

## Goals

1. **Streamline Bulk User Addition**: Enable users to add all members from a collaboration group to a list's collaborators in a single action
2. **Improve User Efficiency**: Reduce the time and clicks required to set up list collaborations for predefined groups
3. **Maintain Data Consistency**: Ensure no duplicate collaborators are added and preserve existing collaboration state
4. **Seamless Integration**: Add the feature without disrupting the existing collaboration workflow

## User Stories

1. **As a list owner**, I want to select a collaboration group from a dropdown so that I can quickly add all its members to my list's collaborators without selecting each user individually.

2. **As a project manager**, I want to see all my available collaboration groups in the selector so that I can choose the appropriate team to collaborate on a specific list.

3. **As a list owner**, I want the system to automatically filter out users who are already collaborating so that I don't accidentally create duplicate collaborations.

4. **As a user**, I want to see immediate feedback when collaboration group members are added so that I know the action was successful and can save my changes.

## Functional Requirements

1. **Collaboration Group Dropdown**: The system must display a dropdown/select control positioned above the "Collaborating users" table that contains all collaboration groups owned by the current user.

2. **Group Loading**: The system must fetch and display all collaboration groups owned by the current user using the existing `getCollabGroups` action.

3. **Member Addition Logic**: When a collaboration group is selected, the system must automatically add all group members who are not already in the "Collaborating users" list to the collaborators.

4. **State Management**: The selection must immediately update the page state by moving users from the "All users" table to the "Collaborating users" table and mark the page as "dirty" (requiring save).

5. **Duplicate Prevention**: The system must prevent adding users who are already collaborating on the list.

6. **Selector Reset**: After each group selection, the dropdown must reset to its default state (no selection) to allow multiple group selections.

7. **Empty State Handling**: The system must gracefully handle cases where a selected collaboration group has no members by taking no action.

8. **Integration with Existing Save Flow**: The added collaborators must integrate with the existing save mechanism using the `handleSave` function and `editNamedListCollab` action.

## Non-Goals (Out of Scope)

1. **Member Preview/Confirmation**: The feature will not show a preview or confirmation dialog before adding group members - selection will immediately add all eligible members.

2. **Individual Member Selection**: Users cannot deselect individual members from a group during the selection process - it's an all-or-nothing addition.

3. **Visual Feedback**: No toast notifications, highlights, or animations for newly added members - the existing table update provides sufficient feedback.

4. **Group Filtering**: The dropdown will show all user-owned groups regardless of whether their members are already collaborating.

## Design Considerations

### UI Placement

- The dropdown selector will be positioned above the "Collaborating users" table in the existing layout
- Use consistent styling with the existing theme context (appBlue/appGreen)
- Follow the existing component patterns used in the collaboration pages

### State Integration

- Add `collabGroups: CollabGroupData[]` to the existing `CollabPageState` interface
- Integrate with existing `useEffect` to fetch collaboration groups alongside users
- Leverage existing `handleSelect` logic for adding users to collaborators

### Component Structure

- Create a new `<select>` element with appropriate Tailwind CSS styling
- Use existing loading states and error handling patterns
- Maintain consistency with existing form controls in the application

## Technical Considerations

### Dependencies

- Leverage existing `getCollabGroups` action from `@/actions/getCollabGroups`
- Use existing `CollabGroupData` interface from `@/DTO/collabGroupsData`
- Integrate with current `useCurrentUser` and `useTheme` contexts
- Utilize existing `handleSelect` function for user movement logic

### State Management

- Extend `CollabPageState` interface to include collaboration groups
- Update the main `useEffect` to fetch both users and collaboration groups
- Maintain existing patterns for loading, error handling, and state updates

### Performance

- Fetch collaboration groups once during component mount alongside existing user data
- No additional API calls required during group selection (members are already loaded in `CollabGroupData`)

## Success Metrics

1. **User Efficiency**: Reduce average time to add multiple collaborators by enabling bulk addition through group selection
2. **Feature Adoption**: Track usage of the collaboration group selector vs. individual user selection
3. **Error Rate**: Maintain zero errors related to duplicate collaborator additions
4. **User Satisfaction**: No increase in support tickets related to collaboration management

## Open Questions

1. **Error Handling**: Should there be specific error handling if the collaboration groups fail to load, or rely on existing error patterns?
2. **Loading State**: Should the selector be disabled/show a loading state while collaboration groups are being fetched?
3. **Accessibility**: What ARIA labels and keyboard navigation should be implemented for the dropdown?
4. **Mobile Responsiveness**: Any specific considerations for the dropdown on mobile devices?

---

**Feature Name**: ListCollabSelector  
**Target File**: `app/lists/[slug]/collab/page.tsx`  
**Estimated Complexity**: Low-Medium  
**Dependencies**: Existing collaboration groups infrastructure
