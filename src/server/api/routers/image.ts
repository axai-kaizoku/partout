import z from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { uploadToSupabaseStorage } from "@/lib/supabase/upload-to-supabase-storage";
import { partImages } from "@/server/db/schema";

export const imageRouter = createTRPCRouter({
  uploadPartImageToBucket: privateProcedure.input(z.object({})).mutation(async ({ ctx }) => {
    console.log(`[validate-image] Processing image blob`);
    const imageBlob = new Blob([await imageRes.arrayBuffer()], {
      type: "image/png",
    });
    const base64ImageData = Buffer.from(await imageBlob.arrayBuffer()).toString("base64");
    console.log(`[validate-image] Image processing completed in ${Date.now() - startTime}ms`);

    const res = await uploadToSupabaseStorage({
      bucket: "part-images",
      filePath: `part_img_${user.id}/img_${new Date().getTime()}.png`,
      contentType: "image/png",
      content: imageBlob,
    });

    const upload = await ctx.db.insert(partImages).values({
      partId: input.partId,
      url: res.url,
    });

    return upload;
  }),
});
