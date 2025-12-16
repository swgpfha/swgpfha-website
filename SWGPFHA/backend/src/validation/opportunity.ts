import { z } from "zod";

export const OpportunityTimeType = z.enum(["Full-Time", "Part-Time", "Flexible", "Remote"]);
export const OpportunityStatus = z.enum(["Active", "Closed"]);

const optionalTrimmed = z
  .string()
  .trim()
  .min(1)
  .optional()
  .nullable()
  .transform((v) => (v == null || v === "" ? undefined : v));

/** Create */
export const createOpportunityBody = z.object({
  title: z.string().trim().min(2),
  timeType: OpportunityTimeType,
  location: optionalTrimmed, // -> string | undefined
  description: z.string().trim().min(10),
  // accept "a, b, c" or ["a","b","c"]
  skills: z
    .union([
      z.array(z.string().trim().min(1)),
      z.string().trim().transform((s) => (s ? s.split(",").map((x) => x.trim()).filter(Boolean) : [])),
    ])
    .default([]),
  status: OpportunityStatus.default("Active"),
});

export type CreateOpportunityBody = z.infer<typeof createOpportunityBody>;

/** Update (all optional) */
export const updateOpportunityBody = createOpportunityBody.partial();
