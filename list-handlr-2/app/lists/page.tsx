"use client";
import { ApiData, ApiResponse } from "../../DTO/apiData";
import { AllListsPostData, ListData } from "../../DTO/listsData";
import { FixFirstPostIndex } from "../../Helpers/fixFirstIndex";
import { ListsTable } from "./listsTable";
import { Fragment, Suspense, useEffect, useState } from "react";
import { ListsSkeleton } from "./listsSkeleton";
import { insertFirst, moveDown, moveUp } from "@/Helpers/collectionHelper";
import { sortAscending } from "@/Helpers/sortAndFilter";
import { formatDate } from "@/Helpers/formatDate";
import { toast } from "sonner";
import { OverlayWithCenteredInput } from "@/components/ui/overlayCenteredInput";
import { LoadingSpinner } from "@/components/ui/spinner";
import { ListsForm } from "./listsForm";
import { cn } from "@/lib/utils";
import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";
import { stableInit } from "@/Helpers/stableInit";
import { ConfirmDialog } from "@/components/ui/Dialog/ConfirmDialog";
import { editLists } from "@/actions/editLists";

export interface ListsPageState {
  load: boolean;
  pendingSave: boolean;
  message: string;
  isDirty: boolean;
  isEditing: boolean;
  showItemForm: boolean;
  showDeleteConfirm: boolean;
  deleteIndex: number;
  lists: ListData[];
  item: ListData | undefined;
  timestamp: string;
}

export default function Page() {
  const [pageState, setPageState] = useState<ListsPageState>({
    load: false,
    pendingSave: false,
    message: "",
    isDirty: false,
    isEditing: true,
    showItemForm: false,
    showDeleteConfirm: false,
    deleteIndex: -1,
    lists: [],
    item: undefined,
    timestamp: "",
  });

  const envVariable = process.env.NEXT_PUBLIC_BACK_END_URL;
  const baseQuery = "?type=Lists";

  useEffect(() => {
    const fetchData = async () => {
      await stableInit();

      try {
        const data = await fetch(`${envVariable}${baseQuery}`);
        const lists: ApiData<ListData> = await data.json();
        // Fix the first index if it is empty
        FixFirstPostIndex(lists);
        setPageState((prev) => ({
          ...prev,
          load: false,
          lists: lists.rows,
          timestamp: lists.timeStamp,
        }));
      } catch (error) {
        setPageState((prev) => ({
          ...prev,
          load: false,
        }));
        toast.error("Error loading: " + error);
      }
    };

    setPageState((prev) => ({ ...prev, load: true }));
    fetchData();
  }, [envVariable]);

  const postLists = (dataToPost: AllListsPostData) => {
    async function doPost(dataToPost: AllListsPostData) {
      const result: ApiResponse<ApiData<ListData>> = await editLists(
        dataToPost
      );

      if (result && result.data && result.message === "") {
        FixFirstPostIndex(result.data);
        setPageState((prev) => ({
          ...prev,
          load: false,
          lists: result.data.rows,
          timestamp: result.data.timeStamp,
          pendingSave: false,
          isDirty: false,
        }));
        toast.success("Lists saved successfully!");
      } else {
        setPageState({
          ...pageState,
          pendingSave: false,
        });
        toast.error("Error saving: " + result.message);
      }
    }
    if (pageState.timestamp !== "") {
      setPageState((prev) => ({
        ...prev,
        pendingSave: true,
      }));

      doPost(dataToPost);
    }
  };

  const handleAdd = () => {
    setPageState((prev) => ({
      ...prev,
      showItemForm: true,
    }));
  };

  const handleEdit = (index: number) => {
    const item = pageState.lists[index];
    setPageState((prev) => ({
      ...prev,
      item: item,
      showItemForm: true,
    }));
  };

  const showDeleteConfirm = (index: number) => {
    setPageState((prev) => ({
      ...prev,
      showDeleteConfirm: true,
      deleteIndex: index,
    }));
  };

  const setDeleteFlag = (flag: boolean) => {
    setPageState((prev) => ({
      ...prev,
      showDeleteConfirm: flag,
    }));
  };

  const handleDelete = (index: number) => {
    const newLists = [...pageState.lists];
    newLists.splice(index, 1);

    postLists({
      saveType: "deleteList",
      listName: pageState.lists[index].listName,
      item: { rows: newLists, timeStamp: pageState.timestamp },
    });

    setPageState((prev) => ({
      ...prev,
      lists: newLists,
      isDirty: true,
      deleteIndex: -1,
    }));
  };

  const handleNewValues = (item: ListData) => {
    const newLists = [...pageState.lists];
    newLists[item.index] = item;

    if (item.index >= 0) {
      postLists({
        saveType: "editList",
        listName: pageState.lists[item.index].listName,
        newListName: item.listName,
        item: { rows: newLists, timeStamp: pageState.timestamp },
      });
    } else {
      insertFirst(newLists, item);
      postLists({
        saveType: "addList",
        newListName: item.listName,
        item: { rows: newLists, timeStamp: pageState.timestamp },
      });
    }
    setPageState((prev) => ({
      ...prev,
      lists: newLists,
      showItemForm: false,
      item: undefined,
      isDirty: true,
    }));
  };

  const handleUp = (index: number) => {
    const newLists = [...pageState.lists];
    moveUp(newLists, index - 1, index);
    sortAscending(newLists, "index");
    setPageState((prev) => ({
      ...prev,
      lists: newLists,
      isDirty: true,
    }));
  };
  const handleDown = (index: number) => {
    const newLists = [...pageState.lists];
    moveDown(newLists, index + 1, index);
    sortAscending(newLists, "index");
    setPageState((prev) => ({
      ...prev,
      lists: newLists,
      isDirty: true,
    }));
  };
  const handleDrop = (fromIndex: number, toIndex: number) => {
    const newLists = [...pageState.lists];
    if (fromIndex < toIndex) {
      moveDown(newLists, toIndex, fromIndex);
    } else {
      moveUp(newLists, toIndex, fromIndex);
    }
    sortAscending(newLists, "index");
    setPageState((prev) => ({
      ...prev,
      lists: newLists,
      isDirty: true,
    }));
  };

  const handleSave = async () => {
    if (pageState.isDirty) {
      postLists({
        saveType: "allLists",
        item: { rows: pageState.lists, timeStamp: pageState.timestamp },
      });
    }
  };

  return (
    <Fragment>
      {pageState.lists.length === 0 && (
        <div>
          <div className="pt-8 px-3 pb-2 text-xl">All lists</div>
          <div className="py-2 px-3 mb-4">
            <ListsSkeleton />
          </div>
        </div>
      )}
      {pageState.lists.length > 0 && (
        <div>
          <div className="flex flex-row justify-between items-center">
            <div className="pt-8 px-3 pb-2 md:text-xl text-lg">All lists</div>
            <div className="pt-8 px-3 pb-2 flex flex-row items-center">
              <div
                className="flex items-center mr-0.5"
                onClick={handleSave}
                data-testid="save-list"
              >
                <ClipboardDocumentCheckIcon
                  className={cn(
                    "h-8 text-appBlue cursor-pointer",
                    !pageState.isDirty && "text-neutral-300 cursor-not-allowed"
                  )}
                  data-testid="save-list-icon"
                />
              </div>
            </div>
          </div>
          <div className="py-2 px-3">
            <Suspense>
              <ListsTable
                lists={pageState.lists}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={showDeleteConfirm}
                onUp={handleUp}
                onDown={handleDown}
                onRowDrop={handleDrop}
              />
            </Suspense>
          </div>
          <div
            data-testid="current-timestamp"
            className="pr-4 text-sm italic float-end"
          >
            {`Last saved: ${formatDate(pageState.timestamp)}`}
          </div>
        </div>
      )}
      {pageState.showItemForm && (
        <OverlayWithCenteredInput>
          <div className="w-full mx-4 text-center text-lg font-semibold mb-4">
            <ListsForm
              mode={pageState.item ? "Edit" : "Add"}
              item={
                pageState.item ? pageState.item : { index: -1, listName: "" }
              }
              onDone={handleNewValues}
              onClose={() => {
                setPageState((prev) => ({
                  ...prev,
                  showItemForm: false,
                  list: undefined,
                }));
              }}
            />
          </div>
        </OverlayWithCenteredInput>
      )}
      {pageState.pendingSave && (
        <OverlayWithCenteredInput className="md:h-1/12 h-2/12 p-2 md:w-4/12 w-10/12 flex items-center">
          <div className="flex flex-col items-center justify-center w-full">
            <LoadingSpinner className="h-12 w-12 text-appBlue animate-spin" />
            <div className="text-center text-lg font-semibold mb-4">
              Saving the {pageState.item?.listName} list...
            </div>
          </div>
        </OverlayWithCenteredInput>
      )}
      <ConfirmDialog
        title={"Delete list"}
        description={"Are you sure you want to delete this list?"}
        isOpen={pageState.showDeleteConfirm}
        onCancel={() => setDeleteFlag(false)}
        onOk={() => {
          setDeleteFlag(false);
          handleDelete(pageState.deleteIndex);
        }}
      />
    </Fragment>
  );
}
