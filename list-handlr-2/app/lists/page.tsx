"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { ApiData } from "../../DTO/apiData";
import { ListData } from "../../DTO/listsData";
import { FixFirstPostIndex } from "../../Helpers/fixFirstIndex";
import { ListsTable } from "./listsTable";
import { Fragment, useEffect, useState } from "react";
import { ListsSkeleton } from "./listsSkeleton";

export default function Page() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const pageParam = { pagePath: pathname, params: searchParams };

  const [lists, setLists] = useState<ApiData<ListData>>({
    rows: [],
    timeStamp: "",
  });

  const envVariable = process.env.NEXT_PUBLIC_BACK_END_URL;
  const baseQuery = "?type=Lists";

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetch(`https://${envVariable}${baseQuery}`, {
        cache: "force-cache",
      });
      const lists: ApiData<ListData> = await data.json();
      // Fix the first index if it is empty
      FixFirstPostIndex(lists);
      setLists(lists);
    };
    fetchData();
  }, [envVariable]);

  return (
    <Fragment>
      {lists.rows.length === 0 && (
        <div>
          <div className="pt-8 px-3 pb-2 text-xl">All lists</div>
          <div className="py-2 px-3 mb-4">
            <ListsSkeleton />
          </div>
        </div>
      )}
      {lists.rows.length > 0 && (
        <div>
          <div className="pt-8 px-3 pb-2 text-xl">All Lists</div>
          <div className="py-2 px-3 mb-4">
            <ListsTable lists={lists.rows} pageParams={pageParam} />
          </div>
        </div>
      )}
    </Fragment>
  );
}
