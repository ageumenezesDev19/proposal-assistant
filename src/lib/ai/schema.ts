import { z } from "zod";

/**
 * Mirrors the Analysis/Draft shapes in demo-data.ts, so a real AI response and
 * a seeded demo response are interchangeable to every component downstream.
 *
 * The optional fields use `.nullish().transform(...)` rather than plain
 * `.optional()`: Groq/Gemini both write `"flag": null` for an omitted field
 * instead of leaving the key out, and a bare `.optional()` rejects `null`.
 * The transform folds null back to undefined so the inferred type still
 * matches demo-data's `field?: T` (undefined-only) shape exactly.
 */
function nullishToUndefined<T extends z.ZodTypeAny>(schema: T) {
  return schema.nullish().transform((value) => value ?? undefined);
}

export const analysisSchema = z.object({
  requirements: z.array(z.string()).min(1).max(8),
  budget: z.object({
    range: z.string(),
    timeline: z.string(),
  }),
  flag: nullishToUndefined(
    z.object({
      title: z.string(),
      body: z.string(),
    }),
  ),
  bestCase: nullishToUndefined(
    z.object({
      title: z.string(),
      match: z.number().min(0).max(100),
    }),
  ),
});

export const draftSchema = z.object({
  greeting: z.string(),
  paragraphs: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
        noteId: nullishToUndefined(z.string()),
      }),
    )
    .min(2)
    .max(6),
});

export const analysisResultSchema = z.object({
  analysis: analysisSchema,
  draft: draftSchema,
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;
