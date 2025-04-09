"use client";
import { usePathname, useSearchParams, useParams } from "next/navigation";
import { ApiData, ApiResponse } from "../../../DTO/apiData";
import { FixFirstPostIndex } from "../../../Helpers/fixFirstIndex";
import { OneListTable } from "./oneListTable";
import { Fragment, useEffect, useState } from "react";
import { NamedListData, OneListPostData } from "@/DTO/oneListData";
import { OneListSkeleton } from "./oneListSkeleton";
import { OverlayWithCenteredInput } from "@/components/ui/overlayCenteredInput";
import { insertFirst, moveDown, moveUp } from "@/Helpers/collectionHelper";
import { sortAscending } from "@/Helpers/sortAndFilter";
import { formatDate } from "@/Helpers/formatDate";
import { OneListForm } from "./oneListForm";
import {
  ArrowLeftStartOnRectangleIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { LoadingSpinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface OneListPageState {
  load: boolean;
  pendingSave: boolean;
  message: string;
  isDirty: boolean;
  isEditing: boolean;
  showItemForm: boolean;
  lists: NamedListData[];
  item: NamedListData | undefined;
  timestamp: string;
}

export default function Page() {
  const params = useParams();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const pageParam = { pagePath: pathname, params: searchParams };

  const [pageState, setPageState] = useState<OneListPageState>({
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
  const baseQuery = "?type=List&name=" + params.slug;

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetch(`https://${envVariable}${baseQuery}`);
      try {
        const lists: ApiData<NamedListData> = await data.json();

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
  }, [baseQuery, envVariable]);

  const postLists = (dataToPost: OneListPostData) => {
    async function doPost(dataToPost: OneListPostData) {
      const data = await fetch(`https://${envVariable}`, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(dataToPost),
      });
      const result: ApiResponse<ApiData<NamedListData>> = await data.json();

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
        toast.success("List saved successfully!");
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
    setPageState((prev) => ({
      ...prev,
      lists: newLists,
      isDirty: true,
    }));
  };

  const handleNewValues = (item: NamedListData) => {
    const newLists = [...pageState.lists];
    if (item.index >= 0) {
      newLists[item.index] = item;
    } else {
      insertFirst(newLists, item);
    }
    setPageState((prev) => ({
      ...prev,
      lists: newLists,
      showItemForm: false,
      item: undefined,
      isDirty: true,
    }));
  };

  const handleDone = (index: number) => {
    const newLists = [...pageState.lists];
    newLists[index].done = !newLists[index].done;
    setPageState((prev) => ({
      ...prev,
      lists: newLists,
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

  const handleSave = async () => {
    if (pageState.isDirty) {
      postLists({
        saveType: "oneList",
        listName: params.slug!.toString(),
        item: { rows: pageState.lists, timeStamp: pageState.timestamp },
      });
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <Fragment>
      {pageState.lists.length === 0 && (
        <div>
          <div className="pt-8 px-3 pb-2 text-xl">
            {decodeURI(params.slug!.toString())}
          </div>
          <div className="py-2 px-3 mb-4">
            <OneListSkeleton />
          </div>
        </div>
      )}
      {pageState.lists.length > 0 && (
        <div>
          <div className="flex flex-row justify-between items-center">
            <div className="pt-8 px-3 pb-2 md:text-xl text-lg">
              {`${decodeURI(params.slug!.toString())}`}
            </div>
            <div className="pt-8 px-3 pb-2 flex flex-row items-center">
              <div className="flex items-center mr-3" onClick={handleSave}>
                <ClipboardDocumentCheckIcon
                  className={cn(
                    "h-8 text-appBlue cursor-pointer",
                    !pageState.isDirty && "text-neutral-300 cursor-not-allowed"
                  )}
                />
              </div>
              <div className="flex items-center mr-0.5" onClick={handleBack}>
                <ArrowLeftStartOnRectangleIcon className="h-8 text-appBlue cursor-pointer" />
              </div>
            </div>
          </div>
          <div className="py-2 px-3">
            <OneListTable
              list={pageState.lists}
              pageParams={pageParam}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDone={handleDone}
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
            <OneListForm
              mode={pageState.item ? "Edit" : "Add"}
              item={
                pageState.item
                  ? pageState.item
                  : { index: -1, text: "", link: "", done: false }
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
              Saving the {decodeURI(params.slug!.toString())} list...
            </div>
          </div>
        </OverlayWithCenteredInput>
      )}
    </Fragment>
  );
}
