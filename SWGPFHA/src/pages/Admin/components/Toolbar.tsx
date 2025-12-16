import type { ReactNode } from "react";

export default function Toolbar({ left, right }: { left?: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 border-b bg-background/50 rounded-t-xl">
      <div className="flex items-center gap-2 flex-wrap">{left}</div>
      <div className="flex items-center gap-2 flex-wrap">{right}</div>
    </div>
  );
}
