import { Router, type RequestHandler } from "express";
import { prisma } from "../prisma.js";
import { z } from "zod";
import { env } from "../env.js";

const router = Router();

/** Guard: read + trim header; fail fast if server key missing */
const requireAdmin: RequestHandler = (req, res, next) => {
  const key = (req.header("x-admin-key") ?? "").trim();
  const expected = (env.ADMIN_API_KEY ?? "").trim();

  // Optional one-time debug:
  // console.log("[admin-auth]", { headerPresent: !!key, expectedPresent: !!expected, matches: key === expected });

  if (!expected) return res.status(401).json({ error: "Unauthorized" });
  if (key !== expected) return res.status(401).json({ error: "Unauthorized" });
  next();
};

/** UI label -> Prisma enum string */
const TT_FWD = {
  "Full-Time": "FullTime",
  "Part-Time": "PartTime",
  Flexible: "Flexible",
  Remote: "Remote",
} as const;

/** Zod: the Admin UI sends human labels + string[] skills */
const OppBody = z.object({
  title: z.string().trim().min(2),
  timeType: z.enum(["Full-Time", "Part-Time", "Flexible", "Remote"]),
  location: z.string().trim().optional(),
  description: z.string().trim().min(2),
  skills: z.array(z.string().trim()).default([]),
  status: z.enum(["Active", "Closed"]).default("Active"),
});
type OppBody = z.infer<typeof OppBody>;

/** Store skills as JSON text in a String column */
const toDbSkills = (arr?: string[]) =>
  JSON.stringify((arr ?? []).filter(Boolean));

/** POST /api/admin/opportunities */
router.post("/", requireAdmin, async (req, res) => {
  try {
    const body = OppBody.parse(req.body);
    const row = await prisma.opportunity.create({
      data: {
        title: body.title,
        timeType: TT_FWD[body.timeType],
        location: body.location ?? null,
        description: body.description,
        skills: toDbSkills(body.skills), // <-- serialize
        status: body.status,
      },
    });
    res.status(201).json(row);
  } catch (err: any) {
    if (err?.issues) return res.status(400).json({ error: "Invalid data", details: err.issues });
    console.error(err);
    res.status(500).json({ error: "Create failed" });
  }
});

/** PUT /api/admin/opportunities/:id */
router.put("/:id", requireAdmin, async (req, res) => {
  const { id } = req.params as { id: string };
  try {
    const parsed = OppBody.partial().parse(req.body);
    const data: any = {};
    if (parsed.title != null) data.title = parsed.title;
    if (parsed.timeType != null) data.timeType = TT_FWD[parsed.timeType];
    if (parsed.location !== undefined) data.location = parsed.location ?? null;
    if (parsed.description != null) data.description = parsed.description;
    if (parsed.skills != null) data.skills = toDbSkills(parsed.skills); // <-- serialize on update
    if (parsed.status != null) data.status = parsed.status;

    const row = await prisma.opportunity.update({ where: { id }, data });
    res.json(row);
  } catch (err: any) {
    if (err?.code === "P2025") return res.status(404).json({ error: "Not found" });
    if (err?.issues) return res.status(400).json({ error: "Invalid data", details: err.issues });
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
});

/** DELETE /api/admin/opportunities/:id */
router.delete("/:id", requireAdmin, async (req, res) => {
  const { id } = req.params as { id: string };
  try {
    await prisma.opportunity.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err: any) {
    if (err?.code === "P2025") return res.status(404).json({ error: "Not found" });
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

export default router;
