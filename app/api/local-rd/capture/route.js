import http from "http";
import https from "https";
import { NextResponse } from "next/server";

function rdCaptureNode(url, pidOptions) {
  return new Promise((resolve, reject) => {
    let parsed;
    try {
      parsed = new URL(url);
    } catch (error) {
      reject(error);
      return;
    }

    const transport = parsed.protocol === "https:" ? https : http;
    const body = String(pidOptions || "");
    const request = transport.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
        path: `${parsed.pathname}${parsed.search}`,
        method: "CAPTURE",
        headers: {
          "Content-Type": "application/xml",
          "Content-Length": Buffer.byteLength(body),
        },
        timeout: 30_000,
      },
      (response) => {
        let data = "";
        response.on("data", (chunk) => {
          data += chunk;
        });
        response.on("end", () => {
          resolve({
            url,
            status: response.statusCode || 0,
            body: data,
          });
        });
      }
    );

    request.on("timeout", () => {
      request.destroy(new Error("RD capture timed out"));
    });

    request.on("error", reject);
    request.write(body);
    request.end();
  });
}

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const captureUrls = Array.isArray(payload?.captureUrls)
    ? payload.captureUrls.filter((url) => typeof url === "string" && url.trim())
    : [];
  const pidOptions = String(payload?.pidOptions || "");

  if (!captureUrls.length || !pidOptions.trim()) {
    return NextResponse.json(
      { error: "captureUrls and pidOptions are required" },
      { status: 400 }
    );
  }

  let lastError = "Local RD capture failed.";

  for (const url of captureUrls) {
    try {
      const result = await rdCaptureNode(url, pidOptions);
      const body = String(result.body || "").trim();

      if (result.status === 405) {
        lastError = `Capture rejected on ${url} (405 Method Not Allowed).`;
        continue;
      }

      if (body && /<\s*PidData\b/i.test(body)) {
        return NextResponse.json({
          success: true,
          url,
          body,
        });
      }

      lastError = body || `Capture failed on ${url} (HTTP ${result.status}).`;
    } catch (error) {
      lastError =
        error instanceof Error ? error.message : "Local RD capture request failed.";
    }
  }

  return NextResponse.json({ error: lastError }, { status: 502 });
}
