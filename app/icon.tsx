import { ImageResponse } from "next/og";
import { OgAppIconInner } from "@/lib/og-app-icon";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<OgAppIconInner box={32} />, { ...size });
}
