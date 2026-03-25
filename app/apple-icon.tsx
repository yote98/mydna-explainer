import { ImageResponse } from "next/og";
import { OgAppIconInner } from "@/lib/og-app-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<OgAppIconInner box={180} />, { ...size });
}
