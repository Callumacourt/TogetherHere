import { supabase } from "../../../lib/supabase"

async function uploadFileToStorage(file: Blob): Promise<string | null> {
  const mime = file.type || "";
  const ext =
    mime.split("/").at(1)?.split(";").at(0)?.toLowerCase() || "webm";

  const filename = `${crypto.randomUUID()}.${ext}`;

  const { data, error } = await supabase.storage
    .from("voice-notes")
    .upload(filename, file);

  if (error) {
    console.error(error);
    return null;
  }

  return data.path;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audio = formData.get('audio');
    const imgFile = formData.get('imgFile');
    const lat = parseFloat(formData.get('lat') as string);
    const lng = parseFloat(formData.get('lng') as string);

    if (!(imgFile instanceof File)) return Response.json({ error: "No image" }, { status: 400 });
    if (!(audio instanceof Blob)) return Response.json({ error: "No audio" }, { status: 400 });
    if (Number.isNaN(lat) || Number.isNaN(lng)) return Response.json({ error: 'Incomplete form data' }, { status: 400 });

    const audio_url = await uploadFileToStorage(audio);
    const imagePath = await uploadFileToStorage(imgFile);

    if (!audio_url || !imagePath) return Response.json({ error: "Failed to upload media" }, { status: 400 });

    const { data, error } = await supabase
      .from("voice_notes")
      .insert({ lat, lng, photo_url: imagePath, audio_url });
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true }, { status: 201 });

  } catch (e: any) {
    console.error("Unhandled error:", e.message);
    return Response.json({ error: e.message }, { status: 500 });
  }
}