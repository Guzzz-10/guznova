import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { saveImage, UploadError } from "@/lib/storage";

// Sube UNA foto (el panel envía varias en paralelo y muestra el progreso de cada una).
export async function POST(req: Request) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Tu sesión expiró. Volvé a ingresar." }, { status: 401 });
  }
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No se recibió ninguna foto." }, { status: 400 });
    }
    const url = await saveImage(file);
    return NextResponse.json({ url });
  } catch (e) {
    const message = e instanceof UploadError ? e.message : "No se pudo subir la foto. Probá de nuevo.";
    if (!(e instanceof UploadError)) console.error(e);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
