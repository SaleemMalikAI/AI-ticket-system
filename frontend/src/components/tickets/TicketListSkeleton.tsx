import { Skeleton } from "@/components/ui/Skeleton";
import { LIST_SKELETON_COUNT } from "@/constants/ui";

export function TicketListSkeleton() {
  return (
    <ul className="grid gap-3" aria-label="Loading tickets">
      {Array.from({ length: LIST_SKELETON_COUNT }, (_, i) => (
        <li key={i} className="card space-y-3">
          <div className="flex justify-between gap-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-5 w-2/3" />
            </div>
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <div className="flex justify-between pt-1">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        </li>
      ))}
    </ul>
  );
}
