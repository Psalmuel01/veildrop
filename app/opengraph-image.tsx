import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "#03191E",
          backgroundImage:
            "radial-gradient(circle at 12% 20%, rgba(219,111,176,0.16), transparent 45%), radial-gradient(circle at 90% 80%, rgba(219,111,176,0.1), transparent 40%)",
          padding: "0 96px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: 36 }}>
          <span style={{ fontSize: 40, fontWeight: 700, color: "#EAF6F7" }}>VeilDrop</span>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#DB6FB0",
              marginLeft: 4,
              marginTop: 22,
            }}
          />
        </div>
        <div style={{ display: "flex", fontSize: 62, fontWeight: 700, color: "#EAF6F7", lineHeight: 1.1, maxWidth: 920 }}>
          Every unlock is public. Yours doesn&apos;t have to be.
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#6B939A", marginTop: 28 }}>
          Confidential token distribution — amounts encrypted end to end.
        </div>
      </div>
    ),
    size,
  );
}
