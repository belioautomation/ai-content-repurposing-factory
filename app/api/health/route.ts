import { NextResponse } from "next/server";

export async function GET() {
  const n8nUrl = process.env.N8N_WEBHOOK_URL;

  if (!n8nUrl) {
    return NextResponse.json(
      {
        status: "disconnected",
        message: "N8N_WEBHOOK_URL is not configured.",
      },
      { status: 503 },
    );
  }

  try {
    const webhookUrl = new URL(n8nUrl);
    const healthUrl = `${webhookUrl.origin}/healthz`;

    const response = await fetch(healthUrl, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
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
        message: "Unable to reach the configured n8n server.",
      },
      { status: 503 },
    );
  }
}