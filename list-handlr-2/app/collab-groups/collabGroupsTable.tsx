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
import { CollabGroupData } from "../../DTO/collabGroupsData";
import { useRouter } from "next/navigation";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { useResponsive } from "@/Helpers/useResponsive";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export function CollabGroupsTable({
  groups,
  isGroupsDataDirty,
  onAdd,
  onEdit,
  onDelete,
}: {
  groups: CollabGroupData[];
  isGroupsDataDirty: boolean;
  onAdd: () => void;
  onEdit: (group: CollabGroupData) => void;
  onDelete: (group: CollabGroupData) => void;
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
      columns={GetColumns(theme, isMobile, onEdit, onDelete, isGroupsDataDirty)}
      data={groups}
      addButtonText={
        <PlusCircleIcon
          className={cn(
            `h-8 cursor-pointer`,
            theme === "appBlue" ? "text-appBlue" : "text-appGreen"
          )}
        />
      }
      filterColumnName="name"
      pageIndex={pageParam ? parseInt(pageParam) : 0}
      pageSize={15}
      sortingState={sorting}
      pageParams={pageParams}
      onAdd={handleAdd}
      dragDropEnabled={false}
    />
  );
}

function ContextMenu({
  row,
  onEdit,
  onDelete,
  isGroupsDataDirty,
}: {
  row: Row<CollabGroupData>;
  onEdit: (group: CollabGroupData) => void;
  onDelete: (group: CollabGroupData) => void;
  isGroupsDataDirty: boolean;
}) {
  const router = useRouter();

  const handleViewMembers = (group: CollabGroupData) => {
    if (isGroupsDataDirty) {
      alert("You have unsaved changes, save first.");
    } else {
      router.push("/collab-groups/" + encodeURIComponent(group.name));
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
        <DropdownMenuLabel>{row.original.name}</DropdownMenuLabel>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => onEdit(row.original)}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => onDelete(row.original)}
        >
          Delete
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleViewMembers(row.original)}>
          Manage members
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function GetColumns(
  theme: string,
  isMobile: boolean,
  onEdit: (group: CollabGroupData) => void,
  onDelete: (group: CollabGroupData) => void,
  isGroupsDataDirty: boolean
): ColumnDef<CollabGroupData>[] {
  const router = useRouter();

  const textLayout = (group: CollabGroupData) => {
    return (
      <div
        className="cursor-pointer hover:underline"
        onClick={() =>
          isGroupsDataDirty
            ? alert("You have unsaved changes, save first.")
            : router.push("/collab-groups/" + encodeURIComponent(group.name))
        }
      >
        {group.name}
      </div>
    );
  };

  return [
    {
      accessorKey: "name",
      header: "Group Name",
      size: isMobile ? 100 : 220,
      cell: ({ row }) => {
        return textLayout(row.original);
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      size: isMobile ? 100 : 220,
      cell: ({ row }) => {
        return (
          <div className="text-neutral-600">
            {row.original.description || "—"}
          </div>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      header: "Last Updated",
      size: isMobile ? 90 : 150,
      cell: ({ row }) => {
        return (
          <div className="text-neutral-600 text-sm">
            {new Date(row.original.updatedAt).toLocaleDateString()}
          </div>
        );
      },
    },
    {
      id: "actions",
      size: 50,
      maxSize: 50,
      cell: ({ row }) => {
        return ContextMenu({ row, onEdit, onDelete, isGroupsDataDirty });
      },
    },
  ];
}
