import { ColumnDef, Row, SortingState } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { DataTable } from "../../../../components/ui/DataTable/DataTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { User } from "../../../../DTO/userData";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import cn from "@/Helpers/cn";
import { useResponsive } from "@/Helpers/useResponsive";

export function CollabTable({
  list,
  pageParams,
  heading,
  pageSize,
  onSelect,
}: {
  list: User[];
  pageParams: { pagePath: string; params: URLSearchParams };
  heading: string;
  pageSize?: 5 | 7 | 15 | 25 | 50;
  onSelect: (user: User) => void;
}) {
  const { isMobile } = useResponsive();

  const pageParam = pageParams.params.get("page");
  const sortingParam = pageParams.params.get("sortBy");
  const directionParam = pageParams.params.get("direction");
  const sorting: SortingState = sortingParam
    ? [{ id: sortingParam, desc: directionParam === "desc" }]
    : [{ id: "email", desc: false }];

  return (
    <DataTable
      pageSize={pageSize}
      columns={getColumns(isMobile, heading, onSelect)}
      data={list}
      addButtonText={
        <PlusCircleIcon className="h-8 text-appBlue cursor-pointer" />
      }
      filterColumnName="email"
      pageIndex={pageParam ? parseInt(pageParam) : 0}
      sortingState={sorting}
      pageParams={pageParams}
      dragDropEnabled={false}
    />
  );
}

function ContextMenu({
  row,
  onSelect,
}: {
  row: Row<User>;
  onSelect: (user: User) => void;
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
        <DropdownMenuLabel>{row.original.email}</DropdownMenuLabel>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => onSelect(row.original)}
        >
          Edit
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function textLayout(row: User, onSelect: (user: User) => void) {
  return (
    <div className="flex flex-col">
      <span
        onClick={() => onSelect(row)}
        className={cn("text-appBlue cursor-pointer")}
      >
        {row.email}
      </span>
    </div>
  );
}

function getColumns(
  isMobile: boolean,
  heading: string,
  onSelect: (user: User) => void
): ColumnDef<User>[] {
  return [
    {
      accessorKey: "email",
      header: heading,
      size: isMobile ? 180 : 400,
      cell: ({ row }) => {
        return textLayout(row.original, onSelect);
      },
    },
    {
      id: "actions",
      size: 50,
      maxSize: 50,
      cell: ({ row }) => {
        return ContextMenu({ row, onSelect });
      },
    },
  ];
}
