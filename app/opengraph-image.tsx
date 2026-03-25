import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "MyDNA Explainer — genetic literacy and report translation";

export default function OpenGraphImage() {
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
          padding: 72,
          background: "linear-gradient(125deg, #0f172a 0%, #1e1b4b 45%, #115e59 100%)",
          color: "white",
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            maxWidth: 900,
          }}
        >
          MyDNA Explainer
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 400,
            marginTop: 24,
            opacity: 0.9,
            maxWidth: 820,
            lineHeight: 1.35,
          }}
        >
          Plain-language genetic report help, risk literacy, and next steps — educational only.
        </div>
      </div>
    ),
    { ...size },
  );
}
