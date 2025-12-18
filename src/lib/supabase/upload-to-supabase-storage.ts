import { createClient } from "@supabase/supabase-js";
import { env } from "@/env";
import type { STORAGE_BUCKETS } from "../constants";

export async function uploadToSupabaseStorage({
  content,
  filePath,
  contentType,
  bucket,
}: {
  content: Buffer | Blob | Uint8Array | ArrayBuffer;
  filePath: string;
  contentType: string;
  bucket: (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];
}) {
  try {
    const supabaseAdmin = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: { autoRefreshToken: false, persistSession: false },
      },
    );

    const uploadResult = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, content, {
        contentType,
        upsert: true,
      });
    if (uploadResult.error) {
      throw new Error(`Failed to upload to supabase`);
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(bucket).getPublicUrl(uploadResult.data.path);

    // const { data: reducedSizeUrlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(uploadResult.data.path, {
    //   transform: {
    //     format: "origin",
    //     quality: 50,
    //     resize: "contain",
    //     width: 1200,
    //   },
    // });

    return {
      publicUrl,
      key: uploadResult.data.path,
      // reducedSizeUrlData: reducedSizeUrlData.publicUrl,
    };
  } catch (err) {
    if (err instanceof Error) {
      return { data: null, error: err };
    }

    return { data: null, error: new Error(JSON.stringify({ error: err })) };
  }
}
