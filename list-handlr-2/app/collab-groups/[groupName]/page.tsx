"use client";
import { useParams, useRouter } from "next/navigation";
import { Fragment, Suspense, useEffect, useState } from "react";
import { CollabGroupDetailData } from "@/DTO/collabGroupsData";
import { User } from "@/DTO/userData";
import { GroupMembersTable } from "./groupMembersTable";
import { GroupMembersSkeleton } from "./groupMembersSkeleton";
import { toast } from "sonner";
import { stableInit } from "@/Helpers/stableInit";
import { formatDateFromString } from "@/Helpers/formatDate";
import { getCollabGroup } from "@/actions/getCollabGroup";
import { editCollabGroup } from "@/actions/editCollabGroup";
import { fetchAllUsers } from "@/actions/getUsers";
import { useUnsavedChangesWarning } from "@/Helpers/useUnsavedChangesWarning";
import { useCurrentUser } from "@/contexts/UserContext";
import { useTheme } from "@/contexts/ThemeContext";
import { OverlayWithCenteredInput } from "@/components/ui/overlayCenteredInput";
import { LoadingSpinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  ArrowLeftStartOnRectangleIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { ConfirmDialog } from "@/components/ui/Dialog/ConfirmDialog";

export interface GroupDetailPageState {
  load: boolean;
  pendingSave: boolean;
  isDirty: boolean;
  availableUsers: User[];
  groupMembers: User[];
  group: CollabGroupDetailData | null;
  timestamp: string;
  showUnsavedWarning: boolean;
}

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const user = useCurrentUser();
  const { theme } = useTheme();

  const [pageState, setPageState] = useState<GroupDetailPageState>({
    load: false,
    pendingSave: false,
    isDirty: false,
    availableUsers: [],
    groupMembers: [],
    group: null,
    timestamp: "",
    showUnsavedWarning: false,
  });

  useUnsavedChangesWarning({
    isDirty: pageState.isDirty,
    message: "You have unsaved changes. Are you sure you want to leave?",
  });

  useEffect(() => {
    const fetchData = async () => {
      await stableInit();
      if (user) {
        try {
          const groupName = decodeURIComponent(params.groupName as string);
          // Fetch group details
          const groupData = await getCollabGroup(groupName, {
            user_id: user.id,
          });

          const group = groupData.rows[0];

          // Fetch all users
          const usersResult = await fetchAllUsers();
          if (!usersResult.success) {
            toast.error("Failed to load users: " + usersResult.error);
          }

          const allUsers = usersResult.users || [];

          // Filter out current user and get current members
          const currentMemberIds = group.members.map((m) => m.memberUserId);
          const membersUsers = allUsers.filter((u: User) =>
            currentMemberIds.includes(u.id!)
          );
          const availableUsersFiltered = allUsers.filter(
            (u: User) => !currentMemberIds.includes(u.id!) && u.id !== user.id
          );

          setPageState((prev) => ({
            ...prev,
            load: false,
            group,
            groupMembers: membersUsers,
            availableUsers: availableUsersFiltered,
            timestamp: groupData.timeStamp,
          }));
        } catch (error) {
          setPageState((prev) => ({
            ...prev,
            load: false,
          }));
          toast.error("Error loading: " + error);
        }
      }
    };

    setPageState((prev) => ({ ...prev, load: true }));
    fetchData();
  }, [params.groupName, user]);

  const handleSelect = (userToAdd: User) => {
    setPageState((prev) => ({
      ...prev,
      availableUsers: prev.availableUsers.filter((u) => u.id !== userToAdd.id),
      groupMembers: [...prev.groupMembers, userToAdd],
      isDirty: true,
    }));
  };

  const handleDeselect = (userToRemove: User) => {
    setPageState((prev) => ({
      ...prev,
      groupMembers: prev.groupMembers.filter((u) => u.id !== userToRemove.id),
      availableUsers: [...prev.availableUsers, userToRemove],
      isDirty: true,
    }));
  };

  const handleSave = async () => {
    if (!pageState.isDirty || !pageState.group) return;

    setPageState((prev) => ({ ...prev, pendingSave: true }));

    try {
      const result = await editCollabGroup(
        {
          saveType: "update",
          groupId: pageState.group!.id,
          name: pageState.group!.name,
          description: pageState.group!.description || undefined,
          item: {
            rows: [
              {
                ...pageState.group!,
                members: pageState.groupMembers.map((u) => ({
                  id: 0,
                  groupId: pageState.group!.id,
                  memberUserId: u.id!,
                  addedAt: new Date(),
                })),
              },
            ],
            timeStamp: pageState.timestamp,
          },
        },
        user!.id
      );

      if (result && result.data && result.message === "") {
        // Refresh group data
        const groupName = decodeURIComponent(params.groupName as string);
        const groupData = await getCollabGroup(groupName, {
          user_id: user!.id,
        });

        if (groupData.rows.length > 0) {
          const group = groupData.rows[0];
          const currentMemberIds = group.members.map((m) => m.memberUserId);

          // Fetch all users again
          const usersResult = await fetchAllUsers();
          const allUsers = usersResult.users || [];

          const membersUsers = allUsers.filter((u: User) =>
            currentMemberIds.includes(u.id!)
          );
          const availableUsersFiltered = allUsers.filter(
            (u: User) => !currentMemberIds.includes(u.id!) && u.id !== user!.id
          );

          setPageState((prev) => ({
            ...prev,
            pendingSave: false,
            isDirty: false,
            group,
            groupMembers: membersUsers,
            availableUsers: availableUsersFiltered,
            timestamp: groupData.timeStamp,
          }));
          toast.success("Members updated successfully!");
        }
      } else {
        setPageState((prev) => ({ ...prev, pendingSave: false }));
        toast.error("Error saving: " + result.message);
      }
    } catch (error) {
      setPageState((prev) => ({ ...prev, pendingSave: false }));
      toast.error("Error saving: " + error);
    }
  };

  const handleBack = () => {
    if (pageState.isDirty) {
      setPageState((prev) => ({ ...prev, showUnsavedWarning: true }));
    } else {
      router.push("/collab-groups");
    }
  };

  const confirmLeave = () => {
    setPageState((prev) => ({ ...prev, showUnsavedWarning: false }));
    router.push("/collab-groups");
  };

  return (
    <Fragment>
      {!pageState.group && (
        <div>
          <div className="pt-8 px-3 pb-2 text-xl">Loading...</div>
          <div className="py-2 px-3 mb-4">
            <GroupMembersSkeleton />
          </div>
        </div>
      )}
      {pageState.group && (
        <div>
          <div className="flex flex-row justify-between items-center">
            <div className="pt-8 px-3 pb-2 md:text-xl text-lg">
              {decodeURIComponent(params.groupName as string)} - Members
            </div>
            <div className="pt-8 px-1.5 pb-2 flex flex-row items-center">
              <div
                className="flex items-center mr-2"
                onClick={handleSave}
                data-testid="save-members"
              >
                <ClipboardDocumentCheckIcon
                  className={cn(
                    `h-8 cursor-pointer`,
                    theme === "appBlue" ? "text-appBlue" : "text-appGreen",
                    !pageState.isDirty && "text-neutral-300 cursor-not-allowed"
                  )}
                  data-testid="save-members-icon"
                />
              </div>
              <div
                className="flex items-center"
                onClick={handleBack}
                data-testid="back-button"
              >
                <ArrowLeftStartOnRectangleIcon
                  className={cn(
                    `h-8 cursor-pointer`,
                    theme === "appBlue" ? "text-appBlue" : "text-appGreen"
                  )}
                />
              </div>
            </div>
          </div>
          <div className="py-2 px-3">
            <Suspense>
              <GroupMembersTable
                availableUsers={pageState.availableUsers}
                groupMembers={pageState.groupMembers}
                onSelect={handleSelect}
                onDeselect={handleDeselect}
              />
            </Suspense>
          </div>
          <div
            data-testid="current-timestamp"
            className="pr-4 text-sm italic float-end"
          >
            {`Last updated: ${formatDateFromString(pageState.timestamp)}`}
          </div>
        </div>
      )}
      {pageState.pendingSave && (
        <OverlayWithCenteredInput className="md:h-1/12 h-2/12 p-2 md:w-4/12 w-10/12 flex items-center">
          <div className="flex flex-col items-center justify-center w-full">
            <LoadingSpinner
              className={cn(
                `h-12 w-12 animate-spin`,
                theme === "appBlue" ? "text-appBlue" : "text-appGreen"
              )}
            />
            <div className="text-center text-lg font-semibold mb-4">
              Saving members for {pageState.group?.name}...
            </div>
          </div>
        </OverlayWithCenteredInput>
      )}
      <ConfirmDialog
        title={"Unsaved Changes"}
        description={
          "You have unsaved changes. Are you sure you want to leave without saving?"
        }
        isOpen={pageState.showUnsavedWarning}
        onCancel={() =>
          setPageState((prev) => ({ ...prev, showUnsavedWarning: false }))
        }
        onOk={confirmLeave}
      />
    </Fragment>
  );
}
