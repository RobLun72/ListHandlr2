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
import { useRouter } from "next/navigation";

export function OneListTable({
  list,
  pageParams,
}: {
  list: NamedListData[];
  pageParams: { pagePath: string; params: URLSearchParams };
}) {
  const router = useRouter();

  const handleAdd = () => {
    // Handle add button click here
    // For example, navigate to a new page or show a modal
    router.push("/lists/-1");
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
      addButtonText="New Item"
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
        <DropdownMenuLabel>{row.original.text}</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() =>
            // Handle edit action here
            router.push("/lists/" + row.original.index)
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
      id: "actions",
      cell: ({ row }) => {
        return ContextMenu({ row });
      },
    },
  ];
}
