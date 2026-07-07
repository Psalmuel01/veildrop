import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#03191E",
          fontFamily: "sans-serif",
        }}
      >
        <span
          style={{
            fontSize: 110,
            fontWeight: 700,
            color: "#EAF6F7",
            transform: "translateY(-4px)",
          }}
        >
          V
        </span>
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "#DB6FB0",
            marginLeft: 4,
            transform: "translateY(34px)",
          }}
        />
      </div>
    ),
    size,
  );
}
