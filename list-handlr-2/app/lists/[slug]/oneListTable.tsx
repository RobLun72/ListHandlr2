import { ColumnDef, Row, SortingState } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { DataTable } from "../../../components/ui/DataTable/DataTable";
import { TableSortingButton } from "../../../components/ui/DataTable/TableSortingButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { NamedListData } from "../../DTO/oneListData";
import Link from "next/link";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
export function OneListTable({
  list,
  pageParams,
  onAdd,
}: {
  list: NamedListData[];
  pageParams: { pagePath: string; params: URLSearchParams };
  onAdd: () => void;
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
    : [];

  return (
    <DataTable
      columns={getColumns(pageParams)}
      data={list}
      addButtonText={<PlusCircleIcon className="h-5" />}
      filterColumnName="text"
      pageIndex={pageParam ? parseInt(pageParam) : 0}
      sortingState={sorting}
      pageParams={pageParams}
      onAdd={handleAdd}
      pageSize={10}
    />
  );
}

function ContextMenu({ row }: { row: Row<NamedListData> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-12 w-12 bg-transparent p-0 float-end focus:outline-none group">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-6 mx-auto text-steel text-center w-6 group-focus:text-primary " />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuLabel>{row.original.text}</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() =>
            // Handle edit action here
            console.log("Edit", row.original.text)
          }
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            // Handle delete action here
            console.log("Delete", row.original.text)
          }
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getColumns(pageParams: {
  pagePath: string;
  params: URLSearchParams;
}): ColumnDef<NamedListData>[] {
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
      accessorKey: "text",
      header: ({ column }) => {
        return (
          <TableSortingButton
            text="Text"
            column={column}
            pageParams={pageParams}
          />
        );
      },
      cell: ({ row }) => {
        return row.original.text;
      },
    },
    {
      accessorKey: "link",
      header: "Link",
      cell: ({ row }) => {
        if (row.original.link === "") {
          return <span className="text-muted-foreground">No link</span>;
        } else {
          return (
            <Link href={row.original.link} target="_blank">
              Go to resource
            </Link>
          );
        }
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
