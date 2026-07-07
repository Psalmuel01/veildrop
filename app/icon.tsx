import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 7,
          fontFamily: "sans-serif",
        }}
      >
        <span
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#EAF6F7",
            transform: "translateY(-1px)",
          }}
        >
          V
        </span>
        <span
          style={{
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: "#DB6FB0",
            marginLeft: 1,
            transform: "translateY(6px)",
          }}
        />
      </div>
    ),
    size,
  );
}
