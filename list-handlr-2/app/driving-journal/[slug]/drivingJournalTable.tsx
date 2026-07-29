import { ColumnDef, Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { NamedDateListData } from "@/DTO/oneDateListData";
import { DrivingJournalItemData } from "@/DTO/drivingJournalItemData";
import { DataTable } from "@/components/ui/DataTable/DataTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import {
  formatDateFromString,
  formatDateFromStringWithoutTime,
} from "@/Helpers/formatDate";
import { useResponsive } from "@/Helpers/useResponsive";

export interface DrivingJournalTableProps {
  items: NamedDateListData<DrivingJournalItemData>[];
  onAdd?: () => void;
  onEdit?: (index: number) => void;
  onDelete?: (index: number) => void;
}

function ContextMenu({
  row,
  onEdit,
  onDelete,
}: {
  row: Row<NamedDateListData<DrivingJournalItemData>>;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-12 w-12 bg-transparent p-0 float-end focus:outline-none group">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-6 mx-auto text-steel text-center w-6 group-focus:text-primary" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuLabel>
          {formatDateFromString(String(row.original.date))}
        </DropdownMenuLabel>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getColumns(
  theme: string,
  isMobile: boolean,
  onEdit: (index: number) => void,
  onDelete: (index: number) => void,
): ColumnDef<NamedDateListData<DrivingJournalItemData>>[] {
  return [
    {
      accessorKey: "date",
      header: "Date",
      size: 50,
      cell: ({ row }) =>
        formatDateFromStringWithoutTime(String(row.original.date)),
    },
    {
      id: "startOdometer",
      header: "Start",
      size: 50,
      cell: ({ row }) => row.original.itemData.startOdometer,
    },
    {
      id: "endOdometer",
      header: "End",
      size: 50,
      cell: ({ row }) => row.original.itemData.endOdometer,
    },
    {
      id: "distance",
      header: "Dist.",
      size: 30,
      cell: ({ row }) => row.original.itemData.distance,
    },
    {
      id: "notes",
      header: "Notes",
      size: isMobile ? 50 : 100,
      cell: ({ row }) => row.original.itemData.notes ?? "-",
    },
    {
      id: "actions",
      size: 50,
      maxSize: 50,
      cell: ({ row }) => ContextMenu({ row, onEdit, onDelete }),
    },
  ];
}

export function DrivingJournalTable({
  items,
  onAdd,
  onEdit,
  onDelete,
}: DrivingJournalTableProps) {
  const { theme } = useTheme();
  const { isMobile } = useResponsive();

  return (
    <DataTable
      columns={getColumns(
        theme,
        isMobile,
        onEdit ?? (() => {}),
        onDelete ?? (() => {}),
      )}
      data={items}
      addButtonText={
        <PlusCircleIcon
          className={cn(
            "h-8 cursor-pointer",
            theme === "appBlue" ? "text-appBlue" : "text-appGreen",
          )}
        />
      }
      filterColumnName="date"
      noRowsText="No entries yet. Add your first driving journal entry."
      onAdd={onAdd}
    />
  );
}
