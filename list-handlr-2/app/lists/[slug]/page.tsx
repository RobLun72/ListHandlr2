"use client";
import { usePathname, useSearchParams, useParams } from "next/navigation";
import { ApiData } from "../../DTO/apiData";
import { FixFirstPostIndex } from "../../Helpers/fixFirstIndex";
import { OneListTable } from "./oneListTable";
import { Fragment, useEffect, useState } from "react";
import { NamedListData } from "@/app/DTO/oneListData";
import { OneListSkeleton } from "./oneListSkeleton";
import { OverlayWithCenteredInput } from "@/components/ui/overlayCenteredInput";
import { moveDown, moveUp } from "@/app/Helpers/collectionHelper";
import { sortAscending } from "@/app/Helpers/sortAndFilter";
import { formatDate } from "@/app/Helpers/formatDate";
import Head from "next/head";
import { OneListForm } from "./oneListForm";

export default function Page() {
  const params = useParams();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const pageParam = { pagePath: pathname, params: searchParams };
  const [showItemForm, setShowItemForm] = useState<boolean>(false);
  const [lists, setLists] = useState<NamedListData[]>([]);
  const [item, setItem] = useState<NamedListData>();
  const [timestamp, setTimestamp] = useState<string>("");

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
      setTimestamp(lists.timeStamp);
      setLists(lists.rows);
    };
    fetchData();
  }, [baseQuery, envVariable]);

  const handleAdd = () => {
    setShowItemForm(true);
  };

  const handleEdit = (index: number) => {
    const item = lists[index];
    setItem(item);
    setShowItemForm(true);
  };

  const handleDelete = (index: number) => {
    const newLists = [...lists];
    newLists.splice(index, 1);
    setLists(newLists);
  };

  const handleNewValues = (item: NamedListData) => {
    const newLists = [...lists];
    if (item.index >= 0) {
      newLists[item.index] = item;
    } else {
      item.index = lists.length;
      newLists.push(item);
    }
    setLists(newLists);
    setShowItemForm(false);
    setItem(undefined);
  };

  const handleDone = (index: number) => {
    const newLists = [...lists];
    newLists[index].done = !newLists[index].done;
    setLists(newLists);
  };
  const handleUp = (index: number) => {
    moveUp(lists, index - 1, index);
    sortAscending(lists, "index");
    setLists(new Array<NamedListData>(...lists));
  };
  const handleDown = (index: number) => {
    moveDown(lists, index + 1, index);
    sortAscending(lists, "index");
    setLists(new Array<NamedListData>(...lists));
  };

  return (
    <Fragment>
      <Head>
        <title>List</title>
        <meta name="description" content="One named list" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {lists.length === 0 && (
        <div>
          <div className="pt-8 px-3 pb-2 text-xl">
            {decodeURI(params.slug!.toString())}
          </div>
          <div className="py-2 px-3 mb-4">
            <OneListSkeleton />
          </div>
        </div>
      )}
      {lists.length > 0 && (
        <div>
          <div className="pt-8 px-3 pb-2 text-xl">
            {`${decodeURI(params.slug!.toString())}  - last saved: ${formatDate(
              timestamp
            )}`}
          </div>
          <div className="py-2 px-3 mb-4">
            <OneListTable
              list={lists}
              pageParams={pageParam}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDone={handleDone}
              onUp={handleUp}
              onDown={handleDown}
            />
          </div>
        </div>
      )}
      {showItemForm && (
        <OverlayWithCenteredInput>
          <div className="text-center text-lg font-semibold mb-4">
            <OneListForm
              mode={item ? "Edit" : "Add"}
              item={
                item ? item : { index: -1, text: "", link: "", done: false }
              }
              onDone={handleNewValues}
              onClose={() => setShowItemForm(false)}
            />
          </div>
        </OverlayWithCenteredInput>
      )}
    </Fragment>
  );
}
