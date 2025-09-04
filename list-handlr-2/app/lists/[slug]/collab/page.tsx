"use client";

import { fetchAllUsers } from "@/actions/getUsers";
import { stableInit } from "@/Helpers/stableInit";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { CollabSkeleton } from "./collabSkeleton";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { User } from "@/DTO/userData";
import { CollabTable } from "./collabTable";
import cn from "@/Helpers/cn";
import {
  ClipboardDocumentCheckIcon,
  ArrowLeftStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useCurrentUser } from "@/contexts/UserContext";
import { getNamedListCollab } from "@/actions/getNamedListCollab";
import { CollabData, CollabPostData } from "@/DTO/collabData";
import { ApiData, ApiResponse } from "@/DTO/apiData";
import { editNamedListCollab } from "@/actions/editNamedListCollab";

export interface CollabPageState {
  load: boolean;
  pendingSave: boolean;
  message: string;
  isDirty: boolean;
  isEditing: boolean;
  showItemForm: boolean;
  users: User[];
  collabUsers: User[];
  timestamp: string;
}

export default function Page() {
  const params = useParams();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const pageParam = { pagePath: pathname, params: searchParams };
  const router = useRouter();

  const user = useCurrentUser();

  const [pageState, setPageState] = useState<CollabPageState>({
    load: false,
    pendingSave: false,
    message: "",
    isDirty: false,
    isEditing: false,
    showItemForm: false,
    users: [],
    collabUsers: [],
    timestamp: "",
  });

  useEffect(() => {
    // Perform any side effects or data fetching here
    const fetchData = async () => {
      await stableInit();

      try {
        const lists: { success: boolean; users: User[]; error?: string } =
          await fetchAllUsers();

        const collabs = await getNamedListCollab({
          listName: params.slug!.toString(),
        });
        let collabUsers: User[] = [];
        if (collabs.rows && collabs.rows.length > 0) {
          collabUsers = lists.users.filter((u) =>
            collabs.rows.some((c) => c.user_id === u.id)
          );
        }
        const users = user
          ? lists.users.filter((u) => u.id !== user!.id)
          : lists.users;
        const filteredUsers = users.filter(
          (u) => !collabUsers.some((c) => c.id === u.id)
        );

        setPageState((prev) => ({
          ...prev,
          load: false,
          users: filteredUsers,
          collabUsers: collabUsers,
          timestamp: collabs.timeStamp,
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
  }, [params.slug, user]);

  const postLists = (dataToPost: CollabPostData) => {
    async function doPost(dataToPost: CollabPostData) {
      const result: ApiResponse<ApiData<CollabData>> =
        await editNamedListCollab(dataToPost);

      if (result && result.data && result.message === "") {
        setPageState((prev) => ({
          ...prev,
          load: false,
          timestamp: result.data.timeStamp,
          pendingSave: false,
          isDirty: false,
        }));
        toast.success("Collaboration saved successfully!");
      } else {
        setPageState({
          ...pageState,
          pendingSave: false,
        });
        toast.error("Error saving: " + result.message);
      }
    }
    if (pageState.timestamp !== "") {
      setPageState((prev) => ({
        ...prev,
        pendingSave: true,
      }));

      doPost(dataToPost);
    }
  };

  const handleSelect = (user: User) => {
    setPageState((prev) => ({
      ...prev,
      users: prev.users.filter((u) => u.id !== user.id),
      collabUsers: [...prev.collabUsers, user],
      isDirty: true,
    }));
  };

  const handleDeSelect = (user: User) => {
    setPageState((prev) => ({
      ...prev,
      users: [...prev.users, user],
      collabUsers: prev.collabUsers.filter((u) => u.id !== user.id),
      isDirty: prev.collabUsers.length === 1 ? false : true,
    }));
  };

  const handleBack = () => {
    if (pageState.isDirty) {
      const action = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (action) {
        router.replace("/lists");
      }
    } else {
      router.replace("/lists");
    }
  };

  const handleSave = async () => {
    if (pageState.isDirty) {
      const user_ids =
        pageState.collabUsers.length > 0
          ? pageState.collabUsers.map((user) => user.id!)
          : [];

      postLists({
        listName: params.slug!.toString(),
        item: { rows: user_ids, timeStamp: pageState.timestamp },
      });
    }
  };

  return (
    <div>
      {pageState.load && (
        <div>
          <div className="pt-8 px-3 pb-2 text-xl">
            Collaborations for {decodeURI(params.slug!.toString())}
          </div>
          <div className="py-2 px-3 mb-4">
            <CollabSkeleton />
          </div>
        </div>
      )}
      {!pageState.load && (
        <div>
          <div className="flex flex-row justify-between items-center">
            <div className="pt-8 px-3 pb-2 md:text-xl text-lg">
              Collaborations for {`${decodeURI(params.slug!.toString())}`}
            </div>
            <div className="pt-8 px-3 pb-2 flex flex-row items-center">
              <div
                className="flex items-center mr-3"
                onClick={handleSave}
                data-testid="save-list"
              >
                <ClipboardDocumentCheckIcon
                  className={cn(
                    "h-8 text-appBlue cursor-pointer",
                    !pageState.isDirty && "text-neutral-300 cursor-not-allowed"
                  )}
                  data-testid="save-list-icon"
                />
              </div>
              <div className="flex items-center mr-0.5" onClick={handleBack}>
                <ArrowLeftStartOnRectangleIcon className="h-8 text-appBlue cursor-pointer" />
              </div>
            </div>
          </div>
          <div className="py-2 px-3">
            <Suspense>
              <CollabTable
                list={pageState.users}
                heading="All users"
                pageSize={15}
                pageParams={pageParam}
                onSelect={handleSelect}
              />
            </Suspense>
          </div>
          <div className="py-2 px-3">
            <CollabTable
              showHeaderAndFooter={false}
              list={pageState.collabUsers}
              heading="Collaborating users"
              pageSize={50}
              pageParams={pageParam}
              onSelect={handleDeSelect}
            />
          </div>
        </div>
      )}
      <div className="px-3">
        {user && (
          <p>
            Current user: {user.email} - {user.id}
          </p>
        )}
      </div>
    </div>
  );
}
