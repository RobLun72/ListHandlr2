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

export function ListsTable({
  lists,
  pageParams,
  onAdd,
  onEdit,
  onDelete,
  onUp,
  onDown,
  onRowDrop,
}: {
  lists: ListData[];
  pageParams: { pagePath: string; params: URLSearchParams };
  onAdd: () => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onUp: (index: number) => void;
  onDown: (index: number) => void;
  onRowDrop: (fromIndex: number, toIndex: number) => void;
}) {
  const { isMobile } = useResponsive();

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
      columns={getColumns(isMobile, onEdit, onDelete, onUp, onDown)}
      data={lists}
      addButtonText={
        <PlusCircleIcon className="h-8 text-appBlue cursor-pointer" />
      }
      filterColumnName="listName"
      pageIndex={pageParam ? parseInt(pageParam) : 0}
      sortingState={sorting}
      pageParams={pageParams}
      onAdd={handleAdd}
      pageSize={isMobile ? 7 : 13}
      dragDropEnabled={true}
      onRowDrop={onRowDrop}
    />
  );
}

function ContextMenu({
  row,
  onEdit,
  onDelete,
}: {
  row: Row<ListData>;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}) {
  const router = useRouter();
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
        <DropdownMenuItem
          onClick={() => router.push("/lists/" + row.original.listName)}
        >
          View list items
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getColumns(
  isMobile: boolean,
  onEdit: (index: number) => void,
  onDelete: (index: number) => void,
  onUp: (index: number) => void,
  onDown: (index: number) => void
): ColumnDef<ListData>[] {
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
              className="h-5 cursor-grab text-appBlue pr-1 pt-1"
              data-testid={"drag-button-" + row.original.index}
            />

            <ChevronUpIcon
              className="h-6 cursor-pointer text-appBlue pr-1"
              onClick={() => onUp(row.original.index)}
              data-testid={"up-button-" + row.original.index}
            />

            <ChevronDownIcon
              className="h-6 cursor-pointer text-appBlue"
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
      size: isMobile ? 200 : 400,
      cell: ({ row }) => {
        return row.original.listName;
      },
    },
    {
      id: "actions",
      size: 50,
      maxSize: 50,
      cell: ({ row }) => {
        return ContextMenu({ row, onEdit, onDelete });
      },
    },
  ];
}
