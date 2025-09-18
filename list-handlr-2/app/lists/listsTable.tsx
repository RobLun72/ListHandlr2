"use client";
import { usePathname, useSearchParams } from "next/navigation";

import { ColumnDef, Row, SortingState } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { DataTable } from "../../components/ui/DataTable/DataTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { ListData } from "../../DTO/listsData";
import { useRouter } from "next/navigation";
import {
  PlusCircleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

import { useResponsive } from "@/Helpers/useResponsive";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export function ListsTable({
  lists,
  isListsDataDirty,
  onAdd,
  onEdit,
  onDelete,
  onUp,
  onDown,
  onRowDrop,
}: {
  lists: ListData[];
  isListsDataDirty: boolean;
  onAdd: () => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onUp: (index: number) => void;
  onDown: (index: number) => void;
  onRowDrop: (fromIndex: number, toIndex: number) => void;
}) {
  const { isMobile } = useResponsive();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const pageParams = { pagePath: pathname, params: searchParams };
  const { theme } = useTheme();

  const handleAdd = () => {
    onAdd();
  };

  const pageParam = pageParams.params.get("page");
  const sortingParam = pageParams.params.get("sortBy");
  const directionParam = pageParams.params.get("direction");
  const sorting: SortingState = sortingParam
    ? [{ id: sortingParam, desc: directionParam === "desc" }]
    : [];

  return (
    <DataTable
      columns={GetColumns(
        theme,
        isMobile,
        onEdit,
        onDelete,
        onUp,
        onDown,
        isListsDataDirty
      )}
      data={lists}
      addButtonText={
        <PlusCircleIcon
          className={cn(
            `h-8 cursor-pointer`,
            theme === "appBlue" ? "text-appBlue" : "text-appGreen"
          )}
        />
      }
      filterColumnName="listName"
      pageIndex={pageParam ? parseInt(pageParam) : 0}
      sortingState={sorting}
      pageParams={pageParams}
      onAdd={handleAdd}
      dragDropEnabled={true}
      onRowDrop={onRowDrop}
    />
  );
}

function ContextMenu({
  row,
  onEdit,
  onDelete,
  isListsDataDirty,
}: {
  row: Row<ListData>;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  isListsDataDirty: boolean;
}) {
  const router = useRouter();

  const handleViewItems = (row: ListData) => {
    if (isListsDataDirty) {
      alert("You have unsaved changes, save first.");
    } else {
      router.push("/lists/" + row.listName);
    }
  };

  const handleCollab = (row: ListData) => {
    if (isListsDataDirty) {
      alert("You have unsaved changes, save first.");
    } else {
      router.push("/lists/" + row.listName + "/collab");
    }
  };

  const handleFormat = (row: ListData) => {
    if (isListsDataDirty) {
      alert("You have unsaved changes, save first.");
    } else {
      router.push("/lists/" + row.listName + "/format");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-12 w-12 bg-transparent p-0 float-end focus:outline-none group">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-6 mx-auto text-steel text-center w-6 group-focus:text-primary " />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuLabel>{row.original.listName}</DropdownMenuLabel>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => onEdit(row.original.index)}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => onDelete(row.original.index)}
        >
          Delete
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleViewItems(row.original)}>
          View list items
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleCollab(row.original)}>
          Setup collaborations
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleFormat(row.original)}>
          Format items as text
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function GetColumns(
  theme: string,
  isMobile: boolean,
  onEdit: (index: number) => void,
  onDelete: (index: number) => void,
  onUp: (index: number) => void,
  onDown: (index: number) => void,
  isListsDataDirty: boolean
): ColumnDef<ListData>[] {
  const router = useRouter();

  const textLayout = (row: ListData) => {
    return (
      <div
        className="cursor-pointer hover:underline"
        onClick={() =>
          isListsDataDirty
            ? alert("You have unsaved changes, save first.")
            : router.push("/lists/" + row.listName)
        }
      >
        {row.listName}
      </div>
    );
  };
  return [
    {
      accessorKey: "index",
      header: "Index",
      size: 70,
      maxSize: 70,
      cell: ({ row }) => {
        return (
          <div className="flex">
            <Squares2X2Icon
              className={cn(
                `h-5 cursor-grab pr-1 pt-1`,
                theme === "appBlue" ? "text-appBlue" : "text-appGreen"
              )}
              data-testid={"drag-button-" + row.original.index}
            />

            <ChevronUpIcon
              className={cn(
                `h-6 cursor-pointer pr-1`,
                theme === "appBlue" ? "text-appBlue" : "text-appGreen"
              )}
              onClick={() => onUp(row.original.index)}
              data-testid={"up-button-" + row.original.index}
            />

            <ChevronDownIcon
              className={cn(
                `h-6 cursor-pointer`,
                theme === "appBlue" ? "text-appBlue" : "text-appGreen"
              )}
              onClick={() => onDown(row.original.index)}
              data-testid={"down-button-" + row.original.index}
            />
          </div>
        );
      },
    },
    {
      accessorKey: "listName",
      header: "Name",
      size: isMobile ? 180 : 400,
      cell: ({ row }) => {
        return textLayout(row.original);
      },
    },
    {
      id: "actions",
      size: 50,
      maxSize: 50,
      cell: ({ row }) => {
        return ContextMenu({ row, onEdit, onDelete, isListsDataDirty });
      },
    },
  ];
}
