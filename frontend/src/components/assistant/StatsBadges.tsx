import { CategoryBadge, PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { DEFAULT_GROUP_BY } from "@/constants/assistant";
import type { GroupBy } from "@/types/assistant";
import type { Category, Priority, Status } from "@/types/ticket";

function GroupBadge({ groupBy, value }: { groupBy: GroupBy; value: string }) {
  if (groupBy === "status") return <StatusBadge value={value as Status} />;
  if (groupBy === "priority") return <PriorityBadge value={value as Priority} />;
  return <CategoryBadge value={value as Category} />;
}

/** One row per group: badge, proportional bar and count. */
export function StatsBadges({ stats, groupBy }: { stats: Record<string, number>; groupBy: GroupBy | null }) {
  const group = groupBy ?? DEFAULT_GROUP_BY;
  const max = Math.max(...Object.values(stats), 1);

  return (
    <ul className="space-y-2" aria-label={`Tickets by ${group}`}>
      {Object.entries(stats).map(([value, count]) => (
        <li key={value} className="grid grid-cols-[9.5rem_1fr_auto] items-center gap-3">
          <span>
            <GroupBadge groupBy={group} value={value} />
          </span>
          <span className="h-2 overflow-hidden rounded-full bg-surface-muted" aria-hidden>
            <span
              className="block h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </span>
          <span className="text-sm font-semibold tabular-nums">{count}</span>
        </li>
      ))}
    </ul>
  );
}
