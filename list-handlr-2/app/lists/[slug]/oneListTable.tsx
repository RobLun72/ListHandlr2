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

export function OneListTable({
  list,
  pageParams,
  onAdd,
  onDone,
  onUp,
  onDown,
}: {
  list: NamedListData[];
  pageParams: { pagePath: string; params: URLSearchParams };
  onAdd: () => void;
  onDone: (index: number) => void;
  onUp: (index: number) => void;
  onDown: (index: number) => void;
}) {
  const handleAdd = () => {
    // Handle add button click here
    // For example, navigate to a new page or show a modal
    onAdd();
  };
  const handleUp = (index: number) => {
    onUp(index);
  };
  const handleDown = (index: number) => {
    onDown(index);
  };

  const pageParam = pageParams.params.get("page");
  const sortingParam = pageParams.params.get("sortBy");
  const directionParam = pageParams.params.get("direction");
  const sorting: SortingState = sortingParam
    ? [{ id: sortingParam, desc: directionParam === "desc" }]
    : [{ id: "index", desc: false }];

  return (
    <DataTable
      columns={getColumns(pageParams, onDone, handleUp, handleDown)}
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
  onDone,
}: {
  row: Row<NamedListData>;
  onDone: (index: number) => void;
}) {
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
        <DropdownMenuItem onClick={() => onDone(row.original.index)}>
          Toggle Done
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getColumns(
  pageParams: {
    pagePath: string;
    params: URLSearchParams;
  },
  onDone: (index: number) => void,
  handleUp: (index: number) => void,
  handleDown: (index: number) => void
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
              onClick={() => handleUp(row.original.index)}
            />

            <ChevronDownIcon
              className="h-6 cursor-pointer text-appBlue px-2"
              onClick={() => handleDown(row.original.index)}
            />
          </div>
        );
      },
    },
    {
      accessorKey: "text",
      header: "Text",
      cell: ({ row }) => {
        if (row.original.done) {
          return (
            <span className="line-through text-appBlue">
              {row.original.text}
            </span>
          );
        } else {
          return <span className=" text-appBlue">{row.original.text}</span>;
        }
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
        return ContextMenu({ row, onDone });
      },
    },
  ];
}
