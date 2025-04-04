"use client";

import { Table as TableCore } from "@tanstack/table-core";
import { flexRender } from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

interface TableViewProps<TData> {
  table: TableCore<TData>;
  activeRowIndex?: number;
  noRowsText?: string;
  onColumnClick?: (index: number) => void;
  onRowClick?: (index: number) => void;
}

export function TableView<TData>({
  table,
  activeRowIndex,
  noRowsText,
  onColumnClick,
  onRowClick,
}: TableViewProps<TData>) {
  return (
    <Table className="lg:text-sm text-xs">
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead
                  key={header.id}
                  onClick={() => onColumnClick && onColumnClick(header.index)}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
              onClick={() => onRowClick && onRowClick(row.index)}
              className={
                activeRowIndex === row.index ? "bg-neutral-100" : "bg-appWhite"
              } // Highlight active row
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={table.getAllColumns().length}
              className="h-24 text-center"
            >
              {noRowsText ?? "No results."}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
