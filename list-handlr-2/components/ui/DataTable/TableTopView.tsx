import { Table as TableCore } from "@tanstack/table-core";
import { Input } from "../input";
import { ReactNode } from "react";

interface TableTopViewProps<TData> {
  table: TableCore<TData>;
  addButtonText: ReactNode;
  filterColumnName?: string;
  onAdd?: () => void;
}

export function TableTopView<TData>({
  table,
  addButtonText,
  filterColumnName,
  onAdd,
}: TableTopViewProps<TData>) {
  return (
    <div className="flex py-4 justify-between ">
      {filterColumnName && (
        <Input
          placeholder={
            filterColumnName
              ? "Filter " + filterColumnName + "..."
              : "Filter by..."
          }
          value={
            (table.getColumn(filterColumnName)?.getFilterValue() as string) ??
            ""
          }
          onChange={(event) =>
            table
              .getColumn(filterColumnName)
              ?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      )}
      <div
        className="ml-auto flex items-center"
        onClick={onAdd}
        data-testid="table-add-button"
      >
        {addButtonText}
      </div>
    </div>
  );
}
