import { ImageResponse } from "next/og";
import { OgAppIconInner } from "@/lib/og-app-icon";

type RouteContext = { params: Promise<{ size: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { size: sizeParam } = await context.params;
  if (sizeParam !== "192" && sizeParam !== "512") {
    return new Response("Not Found", { status: 404 });
  }
  const px = sizeParam === "512" ? 512 : 192;
  return new ImageResponse(<OgAppIconInner box={px} />, { width: px, height: px });
}
