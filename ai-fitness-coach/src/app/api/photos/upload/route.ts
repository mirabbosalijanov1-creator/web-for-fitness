import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getServiceRoleClient } from "@/lib/supabase/service";
import { generatePerceptualHash, isSimilarHash } from "@/lib/photos/similarity";

const BUCKET = "progress-photos";

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient(cookies());
  const service = getServiceRoleClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const hash = await generatePerceptualHash(buffer);

  const { data: lastPhoto } = await supabase
    .from("photo_metadata")
    .select("id, hash, storage_path")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let warning: string | null = null;
  if (lastPhoto?.hash && isSimilarHash(hash, lastPhoto.hash, 5)) {
    warning =
      "Please upload a new photo. This one appears too similar to your most recent submission.";
  }

  const fileId = nanoid();
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${user.id}/${fileId}.${extension}`;

  const { error: uploadError } = await service.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type || "image/jpeg",
    cacheControl: "3600",
    upsert: false,
  });

  if (uploadError && uploadError.message !== "The resource already exists") {
    console.error(uploadError);
    return NextResponse.json({ error: "Failed to store photo" }, { status: 500 });
  }

  const { data: signed, error: signedError } = await service.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 5);

  if (signedError) {
    console.error(signedError);
    return NextResponse.json({ error: "Failed to create signed URL" }, { status: 500 });
  }

  const { error: metaError } = await supabase.from("photo_metadata").insert({
    user_id: user.id,
    storage_path: path,
    hash,
  });

  if (metaError) {
    console.error(metaError);
  }

  return NextResponse.json({
    path,
    signedUrl: signed?.signedUrl,
    warning,
  });
}
