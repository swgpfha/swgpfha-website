import { Button } from "@/components/ui/button";

export default function Pagination({
  page,
  pageSize,
  total,
  onPrev,
  onNext,
  className = "px-4 py-3",
}: {
  page: number;
  pageSize: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  className?: string;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="text-sm text-muted-foreground">
        Page {page} of {pages} • {total} total
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={onPrev} disabled={page <= 1}>
          Prev
        </Button>
        <Button size="sm" variant="outline" onClick={onNext} disabled={page >= pages}>
          Next
        </Button>
      </div>
    </div>
  );
}
