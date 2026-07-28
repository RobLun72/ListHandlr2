import { Skeleton } from "@/components/ui/skeleton";

export function DrivingJournalSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
