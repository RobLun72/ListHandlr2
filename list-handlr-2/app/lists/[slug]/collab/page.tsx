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

export interface CollabPageState {
  load: boolean;
  pendingSave: boolean;
  message: string;
  isDirty: boolean;
  isEditing: boolean;
  showItemForm: boolean;
  users: User[];
  collabUsers: User[];
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
  });

  useEffect(() => {
    // Perform any side effects or data fetching here
    const fetchData = async () => {
      await stableInit();

      try {
        const lists: { success: boolean; users: User[]; error?: string } =
          await fetchAllUsers();

        const users = user
          ? lists.users.filter((u) => u.id !== user!.id)
          : lists.users;

        setPageState((prev) => ({
          ...prev,
          load: false,
          users: users,
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
  }, [user]);

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
      // postLists({
      //   saveType: "oneList",
      //   listName: params.slug!.toString(),
      //   item: { rows: pageState.lists, timeStamp: pageState.timestamp },
      // });
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
              list={pageState.collabUsers}
              heading="Collaborating users"
              pageSize={50}
              pageParams={pageParam}
              onSelect={handleDeSelect}
            />
          </div>
        </div>
      )}
      <div className="px-3">{user && <p>Current user: {user.email}</p>}</div>
    </div>
  );
}
