// api/play/ack.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { google } from "googleapis";

const PACKAGE_NAME = process.env.PACKAGE_NAME!;   // e.g. "com.ajouhub.aura"
const GCP_SA_JSON = process.env.GCP_SA_JSON!;     // 서비스계정 JSON 문자열

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "POST") return res.status(405).end();
    const { sku, purchaseToken } = req.body || {};
    if (!sku || !purchaseToken) return res.status(400).json({ error: "BAD_REQUEST" });

    // 1) GoogleAuth 생성 (이걸 그대로 auth로 사용)
    const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(GCP_SA_JSON),
        scopes: ["https://www.googleapis.com/auth/androidpublisher"],
    });

    // 2) androidpublisher 클라이언트 생성 시 auth에 GoogleAuth를 전달
    const api = google.androidpublisher({ version: "v3", auth });

    try {
        // (선택) 검증: await api.purchases.products.get({ packageName: PACKAGE_NAME, productId: sku, token: purchaseToken });

        // 3) acknowledge
        await api.purchases.products.acknowledge({
            packageName: PACKAGE_NAME,
            productId: sku,
            token: purchaseToken,
            requestBody: { developerPayload: "aura_donation" },
        });

        return res.status(200).json({ ok: true });
    } catch (e: any) {
        return res.status(500).json({ error: "ACK_FAILED", detail: e?.message });
    }
}
