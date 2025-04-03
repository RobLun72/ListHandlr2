"use client";
import { usePathname, useSearchParams, useParams } from "next/navigation";
import { ApiData } from "../../DTO/apiData";
import { FixFirstPostIndex } from "../../Helpers/fixFirstIndex";
import { OneListTable } from "./oneListTable";
import { Fragment, useEffect, useState } from "react";
import { NamedListData } from "@/app/DTO/oneListData";
import { OneListSkeleton } from "./oneListSkeleton";
import { OverlayWithCenteredInput } from "@/components/ui/overlayCenteredInput";
import { Button } from "@/components/ui/button";

export default function Page() {
  const params = useParams();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const pageParam = { pagePath: pathname, params: searchParams };
  const [showAddItem, setShowAddItem] = useState<boolean>(false);
  const [lists, setLists] = useState<ApiData<NamedListData>>({
    rows: [],
    timeStamp: "",
  });

  const envVariable = process.env.NEXT_PUBLIC_BACK_END_URL;
  const baseQuery = "?type=List&name=" + params.slug;

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetch(`https://${envVariable}${baseQuery}`, {
        cache: "force-cache",
      });
      const lists: ApiData<NamedListData> = await data.json();
      // Fix the first index if it is empty
      FixFirstPostIndex(lists);
      setLists(lists);
    };
    fetchData();
  }, [baseQuery, envVariable]);

  const handleAdd = () => {
    setShowAddItem(true);
  };

  return (
    <Fragment>
      {lists.rows.length === 0 && (
        <div>
          <div className="pt-5 px-3 pb-2 text-xl">
            {decodeURI(params.slug!.toString())}
          </div>
          <div className="py-2 px-3 mb-4">
            <OneListSkeleton />
          </div>
        </div>
      )}
      {lists.rows.length > 0 && (
        <div>
          <div className="pt-5 px-3 pb-2 text-xl">
            {decodeURI(params.slug!.toString())}
          </div>
          <div className="py-2 px-3 mb-4">
            <OneListTable
              list={lists.rows}
              pageParams={pageParam}
              onAdd={handleAdd}
            />
          </div>
        </div>
      )}
      {showAddItem && (
        <OverlayWithCenteredInput>
          <div className="text-center text-lg font-semibold mb-4">
            Add new item Text in the center
            <Button onClick={() => setShowAddItem(false)} variant="outline">
              close
            </Button>
          </div>
        </OverlayWithCenteredInput>
      )}
    </Fragment>
  );
}
