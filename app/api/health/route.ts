
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("http://localhost:5678/healthz", {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          status: "disconnected",
          message: `n8n health check returned HTTP ${response.status}.`,
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      status: "connected",
      message: "n8n server is healthy.",
    });
  } catch {
    return NextResponse.json(
      {
        status: "disconnected",
        message: "Unable to reach the n8n server.",
      },
      { status: 503 },
    );
  }
}
