import { Skeleton } from "../../../../components/ui/skeleton";

export const FormatSkeleton = () => {
  return (
    <div className="w-full h-full">
      <Skeleton className="h-10 w-2/12 float-left mb-4" />
      <Skeleton className="h-10 w-1/12 float-right mb-4" />
      <div className="w-full h-full border border-clay rounded-sm p-5 grid grid-rows-7 grid-cols-6 gap-6">
        <Skeleton className="h-10 w-full [grid-row:1] col-span-6" />
        <Skeleton className="h-10 w-full [grid-row:2] col-span-6" />
        <Skeleton className="h-10 w-full [grid-row:3] col-span-6" />

        <Skeleton className="h-full w-full inline-block [grid-row:7] [grid-column:1]" />
        <Skeleton className="h-full w-full inline-block [grid-row:7] [grid-column:2]" />
        <Skeleton className="ml-auto h-full w-full [grid-row:7] [grid-column:6]" />
      </div>
    </div>
  );
};
