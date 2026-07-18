import http from "http";
import https from "https";
import { NextResponse } from "next/server";

function formatProxyError(error, url) {
  const message =
    error instanceof Error ? error.message : String(error || "Local RD capture failed.");

  if (/ECONNREFUSED/i.test(message)) {
    return [
      `Cannot reach RD Service at ${url || "127.0.0.1:11100"}.`,
      "Morpho/Mantra RD Service must run on the retailer's PC (same machine as the browser), not on the application server.",
      "Start Morpho RD L1 / Mantra L1 AVDM (ports 11100–11105).",
      "If the portal is HTTPS, open https://127.0.0.1:11100 in Chrome once and accept the certificate, then retry.",
    ].join(" ");
  }

  return message;
}

function rdCaptureNode(url, pidOptions, method = "CAPTURE") {
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
        method,
        headers: {
          "Content-Type": "text/xml; charset=UTF-8",
          "Content-Length": Buffer.byteLength(body),
        },
        timeout: 30_000,
        // Morpho/Mantra local HTTPS uses a self-signed RD certificate
        rejectUnauthorized: false,
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
            method,
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
    for (const method of ["CAPTURE", "POST"]) {
      try {
        const result = await rdCaptureNode(url, pidOptions, method);
        const body = String(result.body || "").trim();

        if (result.status === 405) {
          lastError = `Capture rejected on ${url} (${method} → 405 Method Not Allowed).`;
          continue;
        }

        if (body && /<\s*PidData\b/i.test(body)) {
          return NextResponse.json({
            success: true,
            url,
            body,
            method,
          });
        }

        lastError =
          body || `Capture failed on ${url} (${method}, HTTP ${result.status}).`;
      } catch (error) {
        lastError = formatProxyError(error, url);
      }
    }
  }

  return NextResponse.json({ error: lastError }, { status: 502 });
}
