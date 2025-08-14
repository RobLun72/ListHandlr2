import { ColumnDef, Row, SortingState } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { DataTable } from "../../../components/ui/DataTable/DataTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { NamedListData } from "../../../DTO/oneListData";
import Link from "next/link";
import {
  PlusCircleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import cn from "@/Helpers/cn";
import { useResponsive } from "@/Helpers/useResponsive";

export function OneListTable({
  list,
  pageParams,
  onAdd,
  onEdit,
  onDelete,
  onDone,
  onUp,
  onDown,
  onRowDrop,
}: {
  list: NamedListData[];
  pageParams: { pagePath: string; params: URLSearchParams };
  onAdd: () => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onDone: (index: number) => void;
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
    : [{ id: "index", desc: false }];

  return (
    <DataTable
      columns={getColumns(isMobile, onEdit, onDelete, onDone, onUp, onDown)}
      data={list}
      addButtonText={
        <PlusCircleIcon className="h-8 text-appBlue cursor-pointer" />
      }
      filterColumnName="text"
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
  onDone,
}: {
  row: Row<NamedListData>;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onDone: (index: number) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer" asChild>
        <button className="h-12 w-12 bg-transparent p-0 float-end focus:outline-none group">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-6 mx-auto text-steel text-center w-6 group-focus:text-primary " />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuLabel>{row.original.text}</DropdownMenuLabel>
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
          className="cursor-pointer"
          onClick={() => onDone(row.original.index)}
        >
          Toggle Done
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function textLayout(row: NamedListData, onDone: (index: number) => void) {
  return (
    <div className="flex flex-col">
      <span
        onClick={() => onDone(row.index)}
        className={cn(
          "text-appBlue cursor-pointer",
          row.done ? "line-through" : ""
        )}
      >
        {row.text}
      </span>
      {row.link && (
        <Link
          href={row.link}
          target="_blank"
          className="text-muted-foreground italic text-sm break-all"
        >
          {row.link}
        </Link>
      )}
    </div>
  );
}

function getColumns(
  isMobile: boolean,
  onEdit: (index: number) => void,
  onDelete: (index: number) => void,
  onDone: (index: number) => void,
  onUp: (index: number) => void,
  onDown: (index: number) => void
): ColumnDef<NamedListData>[] {
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
      accessorKey: "text",
      header: "Text",
      size: isMobile ? 180 : 400,
      cell: ({ row }) => {
        return textLayout(row.original, onDone);
      },
    },
    {
      id: "actions",
      size: 50,
      maxSize: 50,
      cell: ({ row }) => {
        return ContextMenu({ row, onEdit, onDelete, onDone });
      },
    },
  ];
}
