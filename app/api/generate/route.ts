
import { NextResponse } from "next/server";

const ALLOWED_PLATFORMS = [
  "linkedin",
  "instagram",
  "x",
  "blog",
  "newsletter",
] as const;

const ALLOWED_TONES = [
  "professional",
  "casual",
  "educational",
  "persuasive",
  "friendly",
] as const;

const ALLOWED_LANGUAGES = [
  "English",
  "Filipino",
  "Cebuano",
  "Spanish",
] as const;

const MAX_BODY_BYTES = 100_000;

function errorResponse(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

export async function POST(request: Request) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const authHeader = process.env.N8N_WEBHOOK_AUTH_HEADER;
  const authSecret = process.env.N8N_WEBHOOK_SECRET;

  if (!webhookUrl || !authHeader || !authSecret) {
    return errorResponse("n8n connection is not configured.", 500);
  }

  // Only allow a configured authentication header name.
  if (!/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(authHeader)) {
    return errorResponse("Invalid n8n authentication configuration.", 500);
  }

  // Check the declared size before reading the body.
  const contentLength = request.headers.get("content-length");

  if (
    contentLength &&
    (!/^\d+$/.test(contentLength) ||
      Number(contentLength) > MAX_BODY_BYTES)
  ) {
    return errorResponse("Request body is too large or invalid.", 413);
  }

  let body: Record<string, unknown>;

  try {
    const rawBody = await request.text();

    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return errorResponse("Request body is too large.", 413);
    }

    const parsed: unknown = JSON.parse(rawBody);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return errorResponse("Request body must be a JSON object.", 400);
    }

    body = parsed as Record<string, unknown>;
  } catch {
    return errorResponse("Invalid JSON request body.", 400);
  }

  if (
    typeof body.sourceText !== "string" ||
    body.sourceText.trim().length < 50 ||
    body.sourceText.length > 20_000
  ) {
    return errorResponse(
      "Content must be between 50 and 20,000 characters.",
      400
    );
  }

  if (
    !Array.isArray(body.platforms) ||
    body.platforms.length === 0 ||
    body.platforms.length > ALLOWED_PLATFORMS.length ||
    !body.platforms.every(
      (platform: unknown) =>
        typeof platform === "string" &&
        (ALLOWED_PLATFORMS as readonly string[]).includes(platform)
    ) ||
    new Set(body.platforms).size !== body.platforms.length
  ) {
    return errorResponse(
      "Select one or more valid, unique platforms.",
      400
    );
  }

  if (
    typeof body.tone !== "string" ||
    !(ALLOWED_TONES as readonly string[]).includes(body.tone.toLowerCase())
  ) {
    return errorResponse("Select a valid tone.", 400);
  }

  const language = body.language ?? "English";

  if (
    typeof language !== "string" ||
    !(ALLOWED_LANGUAGES as readonly string[]).includes(language)
  ) {
    return errorResponse("Select a valid output language.", 400);
  }

  const targetAudience = body.targetAudience ?? "";

  if (
    typeof targetAudience !== "string" ||
    targetAudience.length > 300
  ) {
    return errorResponse(
      "Target audience must be 300 characters or fewer.",
      400
    );
  }

  let webhook: URL;

  try {
    webhook = new URL(webhookUrl);
  } catch {
    return errorResponse("Invalid n8n webhook configuration.", 500);
  }

  if (
    webhook.protocol !== "https:" &&
    webhook.hostname !== "localhost" &&
    webhook.hostname !== "127.0.0.1"
  ) {
    return errorResponse("The n8n webhook must use HTTPS.", 500);
  }

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [authHeader]: authSecret,
      },
      body: JSON.stringify({
        sourceText: body.sourceText,
        platforms: body.platforms,
        tone: body.tone.toLowerCase(),
        targetAudience,
        language,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(120_000),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error("n8n returned HTTP status:", response.status);

      return errorResponse(
        "The n8n workflow returned an error. Check the workflow execution.",
        502
      );
    }

    let result: unknown;

    try {
      result = JSON.parse(responseText);
    } catch {
      console.error("n8n returned a non-JSON response.");

      return errorResponse(
        "n8n returned an unexpected response. Check the Respond to Webhook node.",
        502
      );
    }

    if (
      !result ||
      typeof result !== "object" ||
      Array.isArray(result)
    ) {
      return errorResponse("n8n returned an unexpected response.", 502);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "Content generation request failed:",
      error instanceof Error ? error.name : "UnknownError"
    );

    return errorResponse(
      error instanceof Error && error.name === "TimeoutError"
        ? "The workflow took too long. Check n8n before retrying."
        : "Could not reach n8n. Check the webhook URL and server logs.",
      502
    );
  }
}
