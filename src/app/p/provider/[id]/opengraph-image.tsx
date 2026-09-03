import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("business_name, category, location")
    .eq("id", params.id)
    .single();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #24402F 0%, #1B3328 50%, #0F1D15 100%)",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#D9A441",
            marginBottom: 28,
          }}
        >
          echonflow
        </div>
        <div style={{ fontSize: 64, color: "#EFEBDD", fontWeight: 600, maxWidth: 1000 }}>
          {listing?.business_name ?? "Echonflow"}
        </div>
        {listing && (
          <div style={{ fontSize: 30, color: "rgba(239,235,221,0.75)", marginTop: 24 }}>
            {listing.category} · {listing.location}
          </div>
        )}
      </div>
    ),
    size
  );
}
