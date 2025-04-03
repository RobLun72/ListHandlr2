"use client";
import { usePathname, useSearchParams, useParams } from "next/navigation";
import { ApiData } from "../../DTO/apiData";
import { FixFirstPostIndex } from "../../Helpers/fixFirstIndex";
import { OneListTable } from "./oneListTable";
import { useEffect, useState } from "react";
import { NamedListData } from "@/app/DTO/oneListData";

export default function Page() {
  const params = useParams();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const pageParam = { pagePath: pathname, params: searchParams };

  const [lists, setLists] = useState<ApiData<NamedListData>>({
    rows: [],
    timeStamp: "",
  });

  const envVariable = process.env.NEXT_PUBLIC_BACK_END_URL;
  const baseQuery = "?type=List&name=" + params.slug;

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetch(`https://${envVariable}${baseQuery}`);
      const lists: ApiData<NamedListData> = await data.json();
      // Fix the first index if it is empty
      FixFirstPostIndex(lists);
      setLists(lists);
    };
    fetchData();
  }, [baseQuery, envVariable]);

  return (
    <div>
      <div className="p-3">List: {decodeURI(params.slug!.toString())}</div>
      <div className="p-3 mb-4 w-4/6">
        <OneListTable list={lists.rows} pageParams={pageParam} />
      </div>
    </div>
  );
}
