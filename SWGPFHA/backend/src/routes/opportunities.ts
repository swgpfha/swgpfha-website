import { Router } from "express";
import { prisma } from "../prisma.js";

const router = Router();

/** helper: decode skills JSON text -> string[] */
const parseSkills = (v: unknown): string[] => {
  if (Array.isArray(v)) return (v as string[]).filter(Boolean);
  if (typeof v === "string") {
    try {
      const j = JSON.parse(v);
      return Array.isArray(j) ? j.filter(Boolean) : [];
    } catch {
      return [];
    }
  }
  return [];
};

/** GET /api/opportunities?status=Active|Closed (default Active) */
router.get("/", async (req, res) => {
  const statusQ = (req.query.status as string) ?? "Active";
  const st = (statusQ === "Closed" ? "Closed" : "Active") as "Active" | "Closed";

  const rows = await prisma.opportunity.findMany({
    where: { status: st as any },
    orderBy: [{ createdAt: "desc" }],
  });

  const TT_REV = {
    FullTime: "Full-Time",
    PartTime: "Part-Time",
    Flexible: "Flexible",
    Remote: "Remote",
  } as const;

  type OppRow = Awaited<ReturnType<typeof prisma.opportunity.findMany>>[number];

  const data = rows.map((r: OppRow) => ({
    ...r,
    timeType: TT_REV[(r as any).timeType as keyof typeof TT_REV],
    skills: parseSkills((r as any).skills), // <-- decode for UI
  }));

  res.json(data);
});

/** GET /api/opportunities/:id */
router.get("/:id", async (req, res) => {
  const { id } = req.params as { id: string };
  const row = await prisma.opportunity.findUnique({ where: { id } });
  if (!row) return res.status(404).json({ error: "Not found" });

  const TT_REV = {
    FullTime: "Full-Time",
    PartTime: "Part-Time",
    Flexible: "Flexible",
    Remote: "Remote",
  } as const;

  res.json({
    ...row,
    timeType: TT_REV[(row as any).timeType as keyof typeof TT_REV],
    skills: parseSkills((row as any).skills), // <-- decode for UI
  });
});

export default router;
