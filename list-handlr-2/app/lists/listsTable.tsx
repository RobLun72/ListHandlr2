import { ColumnDef, Row, SortingState } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { DataTable } from "../../components/ui/DataTable/DataTable";
import { TableSortingButton } from "../../components/ui/DataTable/TableSortingButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { ListData } from "../DTO/listsData";

export function ListsTable({
  lists,
  pageParams,
}: {
  lists: ListData[];
  pageParams: { pagePath: string; params: URLSearchParams };
}) {
  const handleAdd = () => {
    // Handle add button click here
    // For example, navigate to a new page or show a modal
  };

  const pageParam = pageParams.params.get("page");
  const sortingParam = pageParams.params.get("sortBy");
  const directionParam = pageParams.params.get("direction");
  const sorting: SortingState = sortingParam
    ? [{ id: sortingParam, desc: directionParam === "desc" }]
    : [];

  return (
    <DataTable
      columns={getColumns(pageParams)}
      data={lists}
      addButtonText="New List"
      filterColumnName="listName"
      pageIndex={pageParam ? parseInt(pageParam) : 0}
      sortingState={sorting}
      pageParams={pageParams}
      onAdd={handleAdd}
      pageSize={20}
    />
  );
}

function ContextMenu({ row }: { row: Row<ListData> }) {
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
          onClick={() =>
            // Handle edit action here
            console.log("Edit license", row.original.index)
          }
        >
          View list
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getColumns(pageParams: {
  pagePath: string;
  params: URLSearchParams;
}): ColumnDef<ListData>[] {
  return [
    {
      accessorKey: "index",
      header: ({ column }) => {
        return (
          <TableSortingButton
            text="Index"
            column={column}
            pageParams={pageParams}
          />
        );
      },
      cell: ({ row }) => {
        return row.original.index;
      },
    },
    {
      accessorKey: "listName",
      header: ({ column }) => {
        return (
          <TableSortingButton
            text="Name"
            column={column}
            pageParams={pageParams}
          />
        );
      },
      cell: ({ row }) => {
        return row.original.listName;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return ContextMenu({ row });
      },
    },
  ];
}
