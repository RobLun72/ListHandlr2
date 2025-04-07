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
import { NamedListData } from "../../DTO/oneListData";
import Link from "next/link";
import {
  PlusCircleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import cn from "@/app/Helpers/cn";

export function OneListTable({
  list,
  pageParams,
  onAdd,
  onEdit,
  onDelete,
  onDone,
  onUp,
  onDown,
}: {
  list: NamedListData[];
  pageParams: { pagePath: string; params: URLSearchParams };
  onAdd: () => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onDone: (index: number) => void;
  onUp: (index: number) => void;
  onDown: (index: number) => void;
}) {
  const handleAdd = () => {
    // Handle add button click here
    // For example, navigate to a new page or show a modal
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
      columns={getColumns(pageParams, onEdit, onDelete, onDone, onUp, onDown)}
      data={list}
      addButtonText={
        <PlusCircleIcon className="h-8 text-appBlue cursor-pointer" />
      }
      filterColumnName="text"
      pageIndex={pageParam ? parseInt(pageParam) : 0}
      sortingState={sorting}
      pageParams={pageParams}
      onAdd={handleAdd}
      pageSize={10}
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
          className="text-muted-foreground italic text-sm"
        >
          {row.link}
        </Link>
      )}
    </div>
  );
}

function getColumns(
  pageParams: {
    pagePath: string;
    params: URLSearchParams;
  },
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
      cell: ({ row }) => {
        return (
          <div className="flex justify-between">
            <ChevronUpIcon
              className="h-6 cursor-pointer text-appBlue px-2"
              onClick={() => onUp(row.original.index)}
            />

            <ChevronDownIcon
              className="h-6 cursor-pointer text-appBlue px-2"
              onClick={() => onDown(row.original.index)}
            />
          </div>
        );
      },
    },
    {
      accessorKey: "text",
      header: "Text",
      cell: ({ row }) => {
        return textLayout(row.original, onDone);
      },
    },
    // {
    //   accessorKey: "link",
    //   header: "Link",
    //   cell: ({ row }) => {
    //     if (row.original.link === "") {
    //       return <span className="text-muted-foreground">No link</span>;
    //     } else {
    //       return (
    //         <Link href={row.original.link} target="_blank">
    //           Go to resource
    //         </Link>
    //       );
    //     }
    //   },
    // },
    {
      id: "actions",
      cell: ({ row }) => {
        return ContextMenu({ row, onEdit, onDelete, onDone });
      },
    },
  ];
}
