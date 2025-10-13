import { Skeleton } from "../../../components/ui/skeleton";

export const GroupMembersSkeleton = () => {
  return (
    <div className="w-full h-full">
      <Skeleton className="h-10 w-3/12 mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="w-full border border-clay rounded-sm p-5">
          <Skeleton className="h-8 w-full mb-4" />
          <Skeleton className="h-10 w-full mb-2" />
          <Skeleton className="h-10 w-full mb-2" />
          <Skeleton className="h-10 w-full mb-2" />
        </div>
        <div className="w-full border border-clay rounded-sm p-5">
          <Skeleton className="h-8 w-full mb-4" />
          <Skeleton className="h-10 w-full mb-2" />
          <Skeleton className="h-10 w-full mb-2" />
          <Skeleton className="h-10 w-full mb-2" />
        </div>
      </div>
    </div>
  );
};
