"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import { Fragment, ReactNode, useEffect, useState } from "react";
import { TableFooter } from "./TableFooter";
import { TableTopView } from "./TableTopView";
import { TableView } from "./TableDataView";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  addButtonText: ReactNode;
  filterColumnName?: string;
  /**
   * Number of rows per page.
   *
   * @default 5
   */
  pageSize?: number;
  pageIndex?: number;
  sortingState?: SortingState;
  pageParams?: { pagePath: string; params: URLSearchParams };
  onAdd?: () => void;
  onColumnClick?: (index: number) => void;
  onRowClick?: (index: number) => void;
  activeRowIndex?: number;
  noRowsText?: string;
  borderClasses?: string;
}

const rowModels = {
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
};

export function DataTable<TData, TValue>({
  columns,
  data,
  addButtonText,
  filterColumnName = "name",
  pageSize = 5,
  pageIndex = 0,
  sortingState = [],
  pageParams,
  onAdd,
  onColumnClick,
  onRowClick,
  activeRowIndex,
  noRowsText = "No results.",
  borderClasses = "rounded-sm border",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>(sortingState);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: rowModels.getCoreRowModel,
    getPaginationRowModel: rowModels.getPaginationRowModel,
    onSortingChange: setSorting,
    getSortedRowModel: rowModels.getSortedRowModel,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: rowModels.getFilteredRowModel,
    state: {
      sorting,
      columnFilters,
      pagination: {
        pageSize,
        pageIndex: pageIndex,
      },
    },
    defaultColumn: {
      size: 50, //starting column size
    },
  });

  useEffect(() => table.setPageSize(pageSize), [pageSize, table]);

  return (
    <Fragment>
      <TableTopView
        table={table}
        filterColumnName={filterColumnName}
        addButtonText={addButtonText}
        onAdd={onAdd}
      />
      <div className={borderClasses}>
        <TableView
          table={table}
          activeRowIndex={activeRowIndex}
          onColumnClick={onColumnClick}
          onRowClick={onRowClick}
          noRowsText={noRowsText}
        />
      </div>
      <TableFooter table={table} pageParams={pageParams!} />
    </Fragment>
  );
}
