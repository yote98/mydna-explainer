/**
 * Shared markup for next/og ImageResponse icons (PWA + favicon).
 * Uses inline styles only (subset supported by ImageResponse).
 */
export function OgAppIconInner({ box }: { box: number }) {
  const titleSize = Math.max(10, Math.round(box * (box <= 48 ? 0.45 : 0.2)));
  const subtitleSize = Math.max(8, Math.round(titleSize * 0.32));
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #4338ca 0%, #0f766e 100%)",
        color: "white",
      }}
    >
      <div style={{ fontSize: titleSize, fontWeight: 700, letterSpacing: "-0.04em" }}>
        {box <= 48 ? "M" : "MyDNA"}
      </div>
      {box > 48 ? (
        <div
          style={{
            fontSize: subtitleSize,
            opacity: 0.92,
            marginTop: Math.round(box * 0.03),
            fontWeight: 500,
          }}
        >
          Explainer
        </div>
      ) : null}
    </div>
  );
}
