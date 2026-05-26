import { supabase } from "../../../lib/supabase"

async function uploadBlobToStorage (audioBlob: Blob) : Promise<string | null> {
    const ext = audioBlob.type.split('/')[1]
    const filename = `${crypto.randomUUID()}.${ext}`;
    const { data, error } = await supabase.storage.from("voice-notes").upload(filename, audioBlob);
    if ( error ) {
        console.error(error.message);
        return null;
        
    } else {
        return data.path;
    }
}

export async function POST(req: Request) {
    const formData = await req.formData();

    // destructure vars from formData
    const audio = formData.get('audio');
    const location = formData.get('location');
    const lat = parseFloat(formData.get('lat') as string);
    const lon = parseFloat(formData.get('lon') as string);

    if (!audio || !location || !lat || !lon) return Response.json({ error: 'Incomplete form data' }, { status: 400 })
    if (!(audio instanceof Blob)) return Response.json({ error: "No audio"},  {status: 400});

    const audio_url = await uploadBlobToStorage(audio);
    if (!audio_url) return Response.json({ error: "Audio not uploaded to storage"}, {status: 400});
    
    // insert voice note into the db
    const {data, error} = await supabase.
        from("voice_notes") 
        .insert({ location, lat, lon, audio_url})
        
        if (error) return Response.json({ error: error.message }, { status: 500 })
        return Response.json({ ok: true }, { status: 201 })
};