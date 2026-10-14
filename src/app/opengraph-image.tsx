import { ImageResponse } from "next/og";
import { ogFonts } from "@/lib/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "AutoNova — Autos usados seleccionados en Uruguay";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          color: "white",
          fontFamily: "Sora",
          backgroundColor: "#07080B",
          backgroundImage: "radial-gradient(circle at 85% 0%, rgba(255,138,31,0.45), rgba(7,8,11,0) 55%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 84, height: 84, borderRadius: 22, backgroundImage: "linear-gradient(135deg,#FFB066,#E87300)", display: "flex", alignItems: "center", justifyContent: "center", color: "#07080B", fontSize: 52, fontWeight: 800 }}>
            N
          </div>
          <div style={{ display: "flex", fontSize: 60, fontWeight: 800 }}>
            Auto<span style={{ color: "#FF8A1F" }}>Nova</span>
          </div>
        </div>
        <div style={{ fontSize: 76, fontWeight: 800, marginTop: 48, lineHeight: 1.05, letterSpacing: -2 }}>Tu próximo auto, sin vueltas.</div>
        <div style={{ fontSize: 30, color: "#A2A8B4", marginTop: 24 }}>Usados revisados · Financiación · Tomamos tu usado</div>
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
