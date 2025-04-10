"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { ApiData, ApiResponse } from "../../DTO/apiData";
import { AllListsPostData, ListData } from "../../DTO/listsData";
import { FixFirstPostIndex } from "../../Helpers/fixFirstIndex";
import { ListsTable } from "./listsTable";
import { Fragment, useEffect, useState } from "react";
import { ListsSkeleton } from "./listsSkeleton";
import { insertFirst, moveDown, moveUp } from "@/Helpers/collectionHelper";
import { sortAscending } from "@/Helpers/sortAndFilter";
import { formatDate } from "@/Helpers/formatDate";
import { toast } from "sonner";
import { OverlayWithCenteredInput } from "@/components/ui/overlayCenteredInput";
import { LoadingSpinner } from "@/components/ui/spinner";
import { ListsForm } from "./listsForm";

export interface ListsPageState {
  load: boolean;
  pendingSave: boolean;
  message: string;
  isDirty: boolean;
  isEditing: boolean;
  showItemForm: boolean;
  lists: ListData[];
  item: ListData | undefined;
  timestamp: string;
}

export default function Page() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const pageParam = { pagePath: pathname, params: searchParams };

  const [pageState, setPageState] = useState<ListsPageState>({
    load: false,
    pendingSave: false,
    message: "",
    isDirty: false,
    isEditing: true,
    showItemForm: false,
    lists: [],
    item: undefined,
    timestamp: "",
  });

  const envVariable = process.env.NEXT_PUBLIC_BACK_END_URL;
  const baseQuery = "?type=Lists";

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetch(`https://${envVariable}${baseQuery}`);
      // Fix the first index if it is empty
      try {
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
      const data = await fetch(`https://${envVariable}`, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(dataToPost),
      });
      const result: ApiResponse<ApiData<ListData>> = await data.json();

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
    if (pageState.lists.length > 0) {
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
          </div>
          <div className="py-2 px-3">
            <ListsTable
              lists={pageState.lists}
              pageParams={pageParam}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onUp={handleUp}
              onDown={handleDown}
            />
          </div>
          <div className="pr-4 text-sm italic float-end">
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
    </Fragment>
  );
}
