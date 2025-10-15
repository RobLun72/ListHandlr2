"use client";
import { ApiData, ApiResponse } from "../../DTO/apiData";
import {
  CollabGroupsPostData,
  CollabGroupData,
  CollabGroupDetailData,
} from "../../DTO/collabGroupsData";
import { CollabGroupsTable } from "./collabGroupsTable";
import { Fragment, Suspense, useEffect, useState } from "react";
import { CollabGroupsSkeleton } from "./collabGroupsSkeleton";
import { formatDateFromString } from "@/Helpers/formatDate";
import { toast } from "sonner";
import { OverlayWithCenteredInput } from "@/components/ui/overlayCenteredInput";
import { LoadingSpinner } from "@/components/ui/spinner";
import { CollabGroupsForm } from "./collabGroupsForm";
import { cn } from "@/lib/utils";
import { stableInit } from "@/Helpers/stableInit";
import { ConfirmDialog } from "@/components/ui/Dialog/ConfirmDialog";
import { editCollabGroup } from "@/actions/editCollabGroup";
import { getCollabGroups } from "@/actions/getCollabGroups";
import { useUnsavedChangesWarning } from "@/Helpers/useUnsavedChangesWarning";
import { useCurrentUser } from "@/contexts/UserContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "next/navigation";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";

export interface CollabGroupsPageState {
  load: boolean;
  pendingSave: boolean;
  message: string;
  isDirty: boolean;
  showItemForm: boolean;
  showDeleteConfirm: boolean;
  groups: CollabGroupData[];
  item: CollabGroupData | undefined;
  timestamp: string;
}

export default function Page() {
  const router = useRouter();
  const user = useCurrentUser();
  const { theme } = useTheme();

  const [pageState, setPageState] = useState<CollabGroupsPageState>({
    load: false,
    pendingSave: false,
    message: "",
    isDirty: false,
    showItemForm: false,
    showDeleteConfirm: false,
    groups: [],
    item: undefined,
    timestamp: "",
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
          const groups: ApiData<CollabGroupData> = await getCollabGroups({
            user_id: user!.id,
          });

          setPageState((prev) => ({
            ...prev,
            load: false,
            groups: groups.rows,
            timestamp: groups.timeStamp,
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
  }, [user]);

  const postGroup = async (
    dataToPost: CollabGroupsPostData,
    successMessage: string
  ) => {
    setPageState((prev) => ({
      ...prev,
      pendingSave: true,
    }));

    try {
      const result: ApiResponse<ApiData<CollabGroupDetailData>> =
        await editCollabGroup(dataToPost, user!.id);

      if (result && result.data && result.message === "") {
        // Refresh the list
        const groups: ApiData<CollabGroupData> = await getCollabGroups({
          user_id: user!.id,
        });

        setPageState((prev) => ({
          ...prev,
          load: false,
          groups: groups.rows,
          timestamp: groups.timeStamp,
          pendingSave: false,
          isDirty: false,
        }));
        toast.success(successMessage);
      } else {
        setPageState((prev) => ({
          ...prev,
          pendingSave: false,
        }));
        toast.error("Error saving: " + result.message);
      }
    } catch (error) {
      setPageState((prev) => ({
        ...prev,
        pendingSave: false,
      }));
      toast.error("Error saving: " + error);
    }
  };

  const handleAdd = () => {
    setPageState((prev) => ({
      ...prev,
      item: {
        id: 0,
        ownerUserId: user!.id,
        name: "",
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      showItemForm: true,
    }));
  };

  const handleEdit = (group: CollabGroupData) => {
    setPageState((prev) => ({
      ...prev,
      item: group,
      showItemForm: true,
    }));
  };

  const showDeleteConfirm = (group: CollabGroupData) => {
    setPageState((prev) => ({
      ...prev,
      showDeleteConfirm: true,
      item: group,
    }));
  };

  const setDeleteFlag = (flag: boolean) => {
    setPageState((prev) => ({
      ...prev,
      showDeleteConfirm: flag,
    }));
  };

  const handleDelete = async () => {
    if (!pageState.item) return;

    await postGroup(
      {
        saveType: "delete",
        groupId: pageState.item.id,
        item: { rows: [], timeStamp: pageState.timestamp },
      },
      "Group deleted successfully!"
    );

    setPageState((prev) => ({
      ...prev,
      item: undefined,
    }));
  };

  const handleNewValues = async (item: CollabGroupData) => {
    if (item.id === 0) {
      // Create new group
      await postGroup(
        {
          saveType: "create",
          name: item.name,
          description: item.description || undefined,
          item: { rows: [], timeStamp: pageState.timestamp },
        },
        "Group created successfully!"
      );
    } else {
      // Update existing group
      await postGroup(
        {
          saveType: "update",
          groupId: item.id,
          name: item.name,
          description: item.description || undefined,
          item: {
            rows: [
              {
                ...item,
                members: [],
              },
            ],
            timeStamp: pageState.timestamp,
          },
        },
        "Group updated successfully!"
      );
    }

    setPageState((prev) => ({
      ...prev,
      showItemForm: false,
      item: undefined,
    }));
  };

  const handleBack = () => {
    router.push("/settings");
  };

  return (
    <Fragment>
      {pageState.load && (
        <div>
          <div className="pt-8 px-3 pb-2 text-xl">Collaboration Groups</div>
          <div className="py-2 px-3 mb-4">
            <CollabGroupsSkeleton />
          </div>
        </div>
      )}
      {!pageState.load && (
        <div>
          <div className="flex flex-row justify-between items-center">
            <div className="pt-8 px-3 pb-2 md:text-xl text-lg">
              Collaboration Groups
            </div>
            <div className="pt-8 px-1.5 pb-2 flex flex-row items-center">
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
              <CollabGroupsTable
                groups={pageState.groups}
                isGroupsDataDirty={pageState.isDirty}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={showDeleteConfirm}
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
      {pageState.showItemForm && pageState.item && (
        <OverlayWithCenteredInput>
          <div className="w-full mx-4 text-center text-lg font-semibold mb-4">
            <CollabGroupsForm
              mode={pageState.item.id === 0 ? "Add" : "Edit"}
              item={pageState.item}
              onDone={handleNewValues}
              onClose={() => {
                setPageState((prev) => ({
                  ...prev,
                  showItemForm: false,
                  item: undefined,
                }));
              }}
            />
          </div>
        </OverlayWithCenteredInput>
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
              Saving the {pageState.item?.name} group...
            </div>
          </div>
        </OverlayWithCenteredInput>
      )}
      <ConfirmDialog
        title={"Delete group"}
        description={
          "Are you sure you want to delete this group? All members will be removed."
        }
        isOpen={pageState.showDeleteConfirm}
        onCancel={() => setDeleteFlag(false)}
        onOk={() => {
          setDeleteFlag(false);
          handleDelete();
        }}
      />
    </Fragment>
  );
}
