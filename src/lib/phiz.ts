// =============================================================================
// Phiz Open Platform API Client
// =============================================================================
// Integrates with Phiz for QR code login and user identity sync.
// See: Open Platform Integration Guide (access-guide)
// Set PHIZ_QRCODE_API_URL in .env when you have the production API URL.
// =============================================================================

const PHIZ_QRCODE_API =
  process.env.PHIZ_QRCODE_API_URL ??
  "https://s.apifox.cn/cb4d6a3e-04ce-4b5a-ae0c-20f7f124b902";

const PHIZ_APP_ID = process.env.PHIZ_APP_ID ?? "";
const PHIZ_APP_SECRET = process.env.PHIZ_APP_SECRET ?? "";

export interface PhizQRCodeResponse {
  code: number;
  message: string;
  data?: {
    qrcode_url: string;
    expire_time: number;
  };
}

/** Generate login QR code from Phiz API */
export async function generateLoginQRCode(
  callbackUrl: string
): Promise<{ success: boolean; qrcode_url?: string; expire_time?: number; error?: string }> {
  try {
    const body: Record<string, string> = {
      callback_url: callbackUrl,
    };

    // Include credentials if available
    if (PHIZ_APP_ID) body.app_id = PHIZ_APP_ID;
    if (PHIZ_APP_SECRET) body.app_secret = PHIZ_APP_SECRET;

    console.log("[Phiz] Calling QR code API:", PHIZ_QRCODE_API);
    console.log("[Phiz] callback_url:", callbackUrl);
    console.log("[Phiz] app_id:", PHIZ_APP_ID || "(not set)");

    const response = await fetch(PHIZ_QRCODE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    console.log("[Phiz] Response status:", response.status);

    const rawText = await response.text();
    console.log("[Phiz] Response body (raw):", rawText);

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return {
        success: false,
        error: `API Phiz retornou Content-Type inesperado: ${contentType}. Body: ${rawText.slice(0, 200)}`,
      };
    }

    let data: PhizQRCodeResponse;
    try {
      data = JSON.parse(rawText) as PhizQRCodeResponse;
    } catch {
      return {
        success: false,
        error: `Falha ao parsear resposta da API Phiz: ${rawText.slice(0, 200)}`,
      };
    }

    console.log("[Phiz] Parsed response:", JSON.stringify(data));

    if (data.code !== 0 || !data.data?.qrcode_url) {
      return {
        success: false,
        error: `code=${data.code} message=${data.message}`,
      };
    }

    return {
      success: true,
      qrcode_url: data.data.qrcode_url,
      expire_time: data.data.expire_time,
    };
  } catch (error) {
    console.error("[Phiz] QR code generation error:", error);
    return {
      success: false,
      error: `Erro ao chamar API Phiz: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}