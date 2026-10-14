import { ImageResponse } from "next/og";
import { getCarBySlug } from "@/lib/cars";
import { formatKm, formatNumber } from "@/lib/format";
import { FUEL_LABEL, STATUS_LABEL, TRANSMISSION_LABEL, label } from "@/lib/constants";
import { imageForOg, ogFonts } from "@/lib/og";

// Imagen que se ve al compartir un auto por WhatsApp, Facebook, etc.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Auto publicado en AutoNova";

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const car = await getCarBySlug((await params).slug);
  const [photo, fonts] = await Promise.all([imageForOg(car?.images[0]?.url), ogFonts()]);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", backgroundColor: "#07080B", color: "white", fontFamily: "Sora" }}>
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" width={820} height={630} style={{ position: "absolute", top: 0, left: 380, width: 820, height: 630, objectFit: "cover" }} />
        )}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            backgroundImage: "linear-gradient(90deg, #07080B 0%, #07080B 33%, rgba(7,8,11,0.6) 50%, rgba(7,8,11,0) 68%)",
          }}
        />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 56, width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, backgroundImage: "linear-gradient(135deg,#FFB066,#E87300)", display: "flex", alignItems: "center", justifyContent: "center", color: "#07080B", fontSize: 32, fontWeight: 800 }}>
              N
            </div>
            <div style={{ display: "flex", fontSize: 32, fontWeight: 800 }}>
              Auto<span style={{ color: "#FF8A1F" }}>Nova</span>
            </div>
          </div>

          {car ? (
            <div style={{ display: "flex", flexDirection: "column", maxWidth: 560 }}>
              {car.status !== "DISPONIBLE" && (
                <div style={{ display: "flex", alignSelf: "flex-start", padding: "6px 16px", borderRadius: 999, backgroundColor: car.status === "VENDIDO" ? "#e11d48" : "#f59e0b", color: "#07080B", fontSize: 22, fontWeight: 700, marginBottom: 16 }}>
                  {label(STATUS_LABEL, car.status)}
                </div>
              )}
              <div style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1.5 }}>{`${car.brand} ${car.model}`}</div>
              <div style={{ fontSize: 28, color: "#A2A8B4", marginTop: 10 }}>{`${car.version} · ${car.year}`}</div>
              <div style={{ display: "flex", gap: 12, marginTop: 20, fontSize: 22, color: "#E6E8EC" }}>
                <span>{formatKm(car.km)}</span>
                <span style={{ color: "#FF8A1F" }}>•</span>
                <span>{label(FUEL_LABEL, car.fuel)}</span>
                <span style={{ color: "#FF8A1F" }}>•</span>
                <span>{label(TRANSMISSION_LABEL, car.transmission)}</span>
              </div>
              <div style={{ display: "flex", alignSelf: "flex-start", marginTop: 30, padding: "12px 26px", borderRadius: 18, backgroundColor: "#FF8A1F", color: "#07080B", fontSize: 46, fontWeight: 800 }}>
                {`USD ${formatNumber(car.price)}`}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 60, fontWeight: 800 }}>Autos usados seleccionados</div>
          )}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
