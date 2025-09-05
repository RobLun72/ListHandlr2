"use client";

import { stableInit } from "@/Helpers/stableInit";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FormatSkeleton } from "./formatSkeleton";
import { useParams, useRouter } from "next/navigation";
import cn from "@/Helpers/cn";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { ApiData } from "@/DTO/apiData";
import { NamedListData } from "@/DTO/oneListData";
import { getNamedList } from "@/actions/getNamedList";

export interface FormatPageState {
  load: boolean;
  pendingSave: boolean;
  message: string;
  lists: NamedListData[];
  timestamp: string;
}

export default function Page() {
  const params = useParams();

  const router = useRouter();

  const [pageState, setPageState] = useState<FormatPageState>({
    load: false,
    pendingSave: false,
    message: "",
    lists: [],
    timestamp: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      await stableInit();

      try {
        const lists: ApiData<NamedListData> = await getNamedList({
          listName: params.slug!.toString(),
        });

        setPageState((prev) => ({
          ...prev,
          load: false,
          lists: lists.rows,
          timestamp: lists.timeStamp,
        }));
      } catch (error) {
        setPageState((prev) => ({
          ...prev,
          load: false,
        }));
        toast.error("Error loading: " + error);
      }
    };
    setPageState((prev) => ({ ...prev, load: true }));
    fetchData();
  }, [params.slug]);

  const handleBack = () => {
    router.replace("/lists");
  };

  return (
    <div>
      {pageState.load && (
        <div>
          <div className="pt-8 px-3 pb-2 text-xl">
            Items for {decodeURI(params.slug!.toString())}
          </div>
          <div className="py-2 px-3 mb-4">
            <FormatSkeleton />
          </div>
        </div>
      )}
      {!pageState.load && (
        <div>
          <div className="flex flex-row justify-between items-center">
            <div className="pt-8 px-3 pb-2 md:text-xl text-lg">
              Items for {`${decodeURI(params.slug!.toString())}`}
            </div>
            <div className="pt-8 px-1.5 pb-2 flex flex-row items-center">
              <div className="flex items-center mr-0.5" onClick={handleBack}>
                <ArrowLeftStartOnRectangleIcon className="h-8 text-appBlue cursor-pointer" />
              </div>
            </div>
          </div>
          <div className="py-2 px-3 mx-3 border border-clay rounded-sm max-w-3xl ">
            {pageState.lists.length === 0 && (
              <div className={cn("italic text-gray-500")}>No items found.</div>
            )}
            {pageState.lists.length > 0 &&
              pageState.lists.map((list) => (
                <div key={list.id} className="mb-4">
                  <div className="mb-2">{list.text}</div>
                  {list.link && (
                    <div className="mb-2">
                      <div className="text-muted-foreground italic text-sm break-all">
                        {list.link}
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
