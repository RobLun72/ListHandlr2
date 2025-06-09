"use client";
import type { Table } from "@tanstack/react-table";
//import { useNavigate } from "react-router-dom";
import cn from "../../../Helpers/cn";
import { Button } from "../../ui/button";
import { useRouter } from "next/navigation";

export function TableFooter<TData>({
  table,
  className,
  pageParams,
}: {
  table: Table<TData>;
  className?: string;
  pageParams?: { pagePath: string; params: URLSearchParams };
}) {
  const router = useRouter();

  const getQueryString = (newPage: string) => {
    const qParams = pageParams;
    if (!qParams) {
      return ``;
    }
    let newParamString = "?";
    qParams.params.forEach((value, key) => {
      if (key !== "page") {
        newParamString += `${key}=${value}&`;
      } else {
        newParamString += `page=${newPage}&`;
      }
    });
    if (!newParamString.includes("page")) {
      newParamString += `page=${newPage}&`;
    }
    return newParamString;
  };

  const getRowsMetaData = () => {
    const rows = table.getRowCount();
    const { pageIndex, pageSize } = table.getState().pagination;
    const rowsMetaData = {
      from: pageIndex * pageSize + 1,
      to:
        pageIndex * pageSize + pageSize > rows
          ? rows
          : pageIndex * pageSize + pageSize,
      total: rows,
    };
    return (
      <div className="mr-3 text-steel">
        {`${rowsMetaData.from} to ${rowsMetaData.to} of ${rowsMetaData.total}`}
      </div>
    );
  };

  return (
    <div
      className={cn("flex items-center justify-end space-x-2 py-4", className)}
    >
      {getRowsMetaData()}
      <Button
        variant="secondary"
        onClick={() => {
          const newParamString = getQueryString(
            (table.getState().pagination.pageIndex - 1).toString()
          );
          if (pageParams) {
            router.push(`${pageParams?.pagePath}${newParamString}`);
          }
          table.previousPage();
        }}
        disabled={!table.getCanPreviousPage()}
      >
        Previous
      </Button>
      <Button
        variant="secondary"
        onClick={() => {
          const newParamString = getQueryString(
            (table.getState().pagination.pageIndex + 1).toString()
          );
          if (pageParams) {
            router.push(`${pageParams?.pagePath}${newParamString}`);
          }

          table.nextPage();
        }}
        disabled={!table.getCanNextPage()}
      >
        Next
      </Button>
    </div>
  );
}
