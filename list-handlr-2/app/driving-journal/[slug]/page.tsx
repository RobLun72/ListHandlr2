"use client";
import { useParams, useRouter } from "next/navigation";
import { ApiData, ApiResponse } from "../../../DTO/apiData";
import { DrivingJournalTable } from "./drivingJournalTable";
import { Fragment, Suspense, useEffect, useState } from "react";
import { NamedDateListData } from "@/DTO/oneDateListData";
import { DrivingJournalItemData } from "@/DTO/drivingJournalItemData";
import { DrivingJournalSkeleton } from "./drivingJournalSkeleton";
import { OverlayWithCenteredInput } from "@/components/ui/overlayCenteredInput";
import { filterGetAllExcept } from "@/Helpers/sortAndFilter";
import { DrivingJournalForm } from "./drivingJournalForm";
import {
  ArrowLeftStartOnRectangleIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { LoadingSpinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { stableInit } from "@/Helpers/stableInit";
import { formatDateFromString } from "@/Helpers/formatDate";
import { editDrivingJournalList } from "@/actions/editDrivingJournalList";
import { getDrivingJournalList } from "@/actions/getDrivingJournalList";
import { useUnsavedChangesWarning } from "@/Helpers/useUnsavedChangesWarning";
import { useTheme } from "@/contexts/ThemeContext";

export interface DrivingJournalPageState {
  load: boolean;
  pendingSave: boolean;
  message: string;
  isDirty: boolean;
  isEditing: boolean;
  showItemForm: boolean;
  items: NamedDateListData<DrivingJournalItemData>[];
  item: NamedDateListData<DrivingJournalItemData> | undefined;
  timestamp: string;
}

export default function Page() {
  const params = useParams();
  const { theme } = useTheme();
  const router = useRouter();

  const [pageState, setPageState] = useState<DrivingJournalPageState>({
    load: false,
    pendingSave: false,
    message: "",
    isDirty: false,
    isEditing: true,
    showItemForm: false,
    items: [],
    item: undefined,
    timestamp: "",
  });
  console.log("Page state: ", pageState);
  useUnsavedChangesWarning({
    isDirty: pageState.isDirty,
    message: "You have unsaved changes. Are you sure you want to leave?",
  });

  useEffect(() => {
    const fetchData = async () => {
      await stableInit();

      try {
        const data: ApiData<NamedDateListData<DrivingJournalItemData>> =
          await getDrivingJournalList({
            listName: params.slug!.toString(),
          });

        setPageState((prev) => ({
          ...prev,
          load: false,
          items: data.rows,
          timestamp: data.timeStamp,
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
  }, [params.slug]);

  const postDrivingJournalList = (
    dataToPost: ApiData<NamedDateListData<DrivingJournalItemData>>,
  ) => {
    async function doPost(
      dataToPost: ApiData<NamedDateListData<DrivingJournalItemData>>,
    ) {
      const result: ApiResponse<
        ApiData<NamedDateListData<DrivingJournalItemData>>
      > = await editDrivingJournalList({
        saveType: "drivingJournal",
        listName: params.slug!.toString(),
        item: dataToPost,
      });

      if (result && result.data && result.message === "") {
        setPageState((prev) => ({
          ...prev,
          load: false,
          items: result.data!.rows,
          timestamp: result.data!.timeStamp,
          pendingSave: false,
          isDirty: false,
        }));
        toast.success("Entries saved successfully!");
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
    const newItem: NamedDateListData<DrivingJournalItemData> = {
      id: 0,
      index: pageState.items.length,
      date: new Date(),
      itemData: {
        startOdometer: "",
        endOdometer: "",
        distance: 0,
      },
      isDeleted: false,
    };

    setPageState((prev) => ({
      ...prev,
      item: newItem,
      showItemForm: true,
    }));
  };

  const handleEdit = (index: number) => {
    const item = pageState.items[index];
    setPageState((prev) => ({
      ...prev,
      item: item,
      showItemForm: true,
    }));
  };

  const handleDelete = (index: number) => {
    const newItems = [...pageState.items];
    if (newItems[index].id === 0) {
      newItems.splice(index, 1);
      newItems.forEach((item, i) => {
        item.index = i;
      });
    } else {
      newItems[index].isDeleted = true;
    }
    setPageState((prev) => ({
      ...prev,
      items: newItems,
      isDirty: true,
    }));
  };

  const handleNewValues = (item: NamedDateListData<DrivingJournalItemData>) => {
    const newItems = [...pageState.items];
    if (item.id === 0) {
      // new item — append and assign index
      const newIndex = newItems.filter((i) => !i.isDeleted).length;
      newItems.push({ ...item, index: newIndex });
    } else {
      // existing item — replace by index
      newItems[item.index] = item;
    }
    setPageState((prev) => ({
      ...prev,
      items: newItems,
      showItemForm: false,
      item: undefined,
      isDirty: true,
    }));
  };

  const handleSave = async () => {
    if (pageState.isDirty) {
      postDrivingJournalList({
        timeStamp: pageState.timestamp,
        rows: pageState.items,
      });
    }
  };

  const getAllNonDeletedItems = () => {
    return filterGetAllExcept(
      pageState.items,
      "isDeleted",
      true,
    ) as NamedDateListData<DrivingJournalItemData>[];
  };

  return (
    <Fragment>
      {pageState.showItemForm && pageState.item && (
        <OverlayWithCenteredInput className="max-w-sm">
          {pageState.pendingSave && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg z-50">
              <LoadingSpinner />
            </div>
          )}
          <DrivingJournalForm
            mode={pageState.item.id === 0 ? "Add" : "Edit"}
            item={pageState.item}
            onDone={handleNewValues}
            onClose={() =>
              setPageState((prev) => ({
                ...prev,
                showItemForm: false,
                item: undefined,
              }))
            }
          />
        </OverlayWithCenteredInput>
      )}

      {pageState.load && (
        <div>
          <div className="pt-8 px-3 pb-2 text-xl">
            {decodeURIComponent(params.slug!.toString())}
          </div>
          <div className="py-2 px-3 mb-4">
            <DrivingJournalSkeleton />
          </div>
        </div>
      )}

      {!pageState.load && pageState.items && (
        <div>
          <div className="flex flex-row justify-between items-center">
            <div className="pt-8 px-3 pb-2 md:text-xl text-lg">
              {decodeURIComponent(params.slug!.toString())}
            </div>
            <div className="pt-8 px-1.5 pb-2 flex flex-row items-center gap-4">
              <div
                className="flex items-center"
                onClick={() => router.push("/lists")}
                title="Go back"
              >
                <ArrowLeftStartOnRectangleIcon
                  className={cn(
                    "h-8 cursor-pointer",
                    theme === "appBlue" ? "text-appBlue" : "text-appGreen",
                  )}
                />
              </div>
              <div
                className="flex items-center"
                onClick={handleSave}
                data-testid="save-list"
              >
                <ClipboardDocumentCheckIcon
                  className={cn(
                    `h-8 cursor-pointer`,
                    theme === "appBlue" ? "text-appBlue" : "text-appGreen",
                    !pageState.isDirty && "text-neutral-300 cursor-not-allowed",
                  )}
                  data-testid="save-list-icon"
                />
              </div>
            </div>
          </div>
          <div className="py-2 px-3">
            <Suspense>
              <DrivingJournalTable
                items={getAllNonDeletedItems()}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </Suspense>
          </div>
          <div
            data-testid="current-timestamp"
            className="pr-4 text-sm italic float-end"
          >
            {formatDateFromString(pageState.timestamp)}
          </div>
        </div>
      )}
    </Fragment>
  );
}
