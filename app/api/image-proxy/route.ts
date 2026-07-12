import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Proxies an external image through our server so html-to-image can render it
// into a canvas without triggering a cross-origin taint error.
// Usage: /api/image-proxy?url=<encoded-image-url>
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json({ error: "url param required" }, { status: 400 });
  }

  // Only allow proxying from Pollinations to prevent open-proxy abuse
  let parsed: URL;
  try {
    parsed = new URL(imageUrl);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (!parsed.hostname.endsWith("pollinations.ai")) {
    return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
  }

  try {
    const upstream = await fetch(imageUrl, {
      headers: { "User-Agent": "ConceptKit/1.0" },
      // 45s — flux images can be slow on first request
      signal: AbortSignal.timeout(45_000)
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream error ${upstream.status}` },
        { status: 502 }
      );
    }

    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
    const buffer = await upstream.arrayBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        // Cache for 24h — the seed + prompt combo is deterministic
        "Cache-Control": "public, max-age=86400, immutable",
        // Allow the canvas to read this response cross-origin
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (err) {
    console.error("Image proxy error:", err);
    return NextResponse.json({ error: "Proxy fetch failed" }, { status: 502 });
  }
}
