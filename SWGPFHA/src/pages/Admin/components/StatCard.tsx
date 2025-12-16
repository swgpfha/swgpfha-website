import { Card, CardContent } from "@/components/ui/card";
import type { ReactNode } from "react";

export default function StatCard({
  label,
  value,
  hint,
  icon,
  accentClass = "border-muted/30 bg-muted/10",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  accentClass?: string;
}) {
  return (
    <Card className={`${accentClass}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="mt-1 text-2xl font-bold">{value}</div>
            {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
          </div>
          {icon ? <div className="shrink-0">{icon}</div> : null}
        </div>
      </CardContent>
    </Card>
  );
}
