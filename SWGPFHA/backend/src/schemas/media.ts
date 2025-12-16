import { z } from "zod";

/** Reusable enum for media type */
export const MediaType = z.enum(["photo", "video", "document"]);
export type MediaType = z.infer<typeof MediaType>;

/** Helpers */
const optionalTrimmed = z
  .string()
  .trim()
  .min(1)
  .optional()
  .nullable()
  .transform((v) => (v == null || v === "" ? undefined : v));

const Title = z.string().trim().min(2, "Title must be at least 2 characters long");

/** Accepts ISO string or Date; returns Date | undefined */
const EventDate = z
  .preprocess(
    (v) => (v == null || v === "" ? undefined : v),
    z.union([z.string().datetime({ message: "eventDate must be an ISO datetime string" }), z.date()])
  )
  .optional()
  .transform((v) => (typeof v === "string" ? new Date(v) : v));

/**
 * Schema for creating a new Media Item
 * Used in admin route (multipart/form-data: data field contains this JSON)
 */
export const createMediaItemBody = z.object({
  title: Title,
  description: optionalTrimmed,
  location: optionalTrimmed,
  eventDate: EventDate, // -> Date | undefined
  type: MediaType,      // "photo" | "video"
});

export type CreateMediaItemBody = z.infer<typeof createMediaItemBody>;

/**
 * Schema for updating an existing Media Item
 * - All fields optional; empty strings treated as undefined
 */
export const updateMediaItemBody = z.object({
  title: Title.optional(),
  description: optionalTrimmed,
  location: optionalTrimmed,
  eventDate: EventDate,
  type: MediaType.optional(),
});

export type UpdateMediaItemBody = z.infer<typeof updateMediaItemBody>;
