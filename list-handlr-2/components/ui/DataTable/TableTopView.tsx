import { Table as TableCore } from "@tanstack/table-core";
import { Input } from "../input";
import { Button } from "../button";
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
          placeholder="Filter names..."
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
      <Button className="ml-auto bg-primary" onClick={onAdd}>
        {addButtonText}
      </Button>
    </div>
  );
}
