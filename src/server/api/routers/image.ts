import z from "zod";
import { STORAGE_BUCKETS } from "@/lib/constants";
import { uploadToSupabaseStorage } from "@/lib/supabase/upload-to-supabase-storage";
import { db } from "@/server/db";
import { partImages } from "@/server/db/schema";
import { createTRPCRouter, privateProcedure } from "../trpc";

export const imageRouter = createTRPCRouter({
  // Upload image for temporary preview (before part creation)
  uploadTempImage: privateProcedure
    .input(
      z.object({
        imageData: z.string(), // base64 encoded image
        fileName: z.string(),
        contentType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const startTime = Date.now();
      console.log(`[upload-temp-image] Processing image: ${input.fileName}`);

      // Convert base64 to buffer
      const base64Data = input.imageData.replace(/^data:image\/\w+;base64,/, "");
      const imageBuffer = Buffer.from(base64Data, "base64");

      const res = await uploadToSupabaseStorage({
        bucket: STORAGE_BUCKETS.part_images,
        filePath: `temp/user_${ctx.user.id}/img_${Date.now()}_${input.fileName}`,
        contentType: input.contentType,
        content: imageBuffer,
      });

      console.log(`[upload-temp-image] Upload completed in ${Date.now() - startTime}ms`);

      if (res.error) {
        throw new Error(`Failed to upload image: ${res.error.message}`);
      }

      return {
        url: res.publicUrl,
        // reducedUrl: res.reducedSizeUrlData,
        key: res.key,
      };
    }),

  // Create part image record in database (called when part is created)
  createPartImage: privateProcedure
    .input(
      z.object({
        partId: z.string(),
        url: z.string(),
        altText: z.string().optional(),
        sortOrder: z.number(),
        isPrimary: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db.insert(partImages).values({
        partId: input.partId,
        url: input.url,
        altText: input.altText,
        sortOrder: input.sortOrder,
        isPrimary: input.isPrimary,
      });

      return result;
    }),
});
