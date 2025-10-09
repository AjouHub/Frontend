// 결제 유틸

// 타입 간단 선언
type Price = { currency: string; value: number };
type ItemDetails = { itemId: string; title: string; description?: string; price: Price };
type DigitalGoodsService = {
    getDetails: (ids: string[]) => Promise<ItemDetails[]>;
    listPurchases: () => Promise<Array<{ itemId: string; purchaseToken: string; }>>;
    consume: (purchaseToken: string) => Promise<void>;
};

const STORE_ID = "https://play.google.com/billing"; // Play Billing 식별자

export async function getService(): Promise<DigitalGoodsService> {
    if (!("getDigitalGoodsService" in window)) {
        throw new Error("Digital Goods API 미지원(Play 설치 TWA 아님)");
    }
    // @ts-ignore - 브라우저 제공
    return await window.getDigitalGoodsService(STORE_ID);
}

export async function getSkuDetails(skus: string[]) {
    const svc = await getService();
    return await svc.getDetails(skus); // 가격은 서버에 등록된 값을 그대로 가져옵니다.
}

export async function purchaseConsumable(sku: string, ackEndpoint = "/api/play/ack") {
    // 1) 결제 시작 (Payment Request API)
    const methodData = [{ supportedMethods: STORE_ID, data: { sku } }];
    const details = { total: { label: "Total", amount: { currency: "USD", value: "0" } } }; // 값은 무시됨
    // @ts-ignore
    const request = new PaymentRequest(methodData, details);
    const response = await request.show();

    // 2) Play가 넘겨준 purchaseToken 추출 → 백엔드에서 **acknowledge**
    const { purchaseToken } = (response as any).details; // 크롬 문서 기준 필드명
    const ackRes = await fetch(ackEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku, purchaseToken })
    });
    if (!ackRes.ok) {
        await response.complete("fail");
        throw new Error("Acknowledge 실패");
    }

    // 3) 소모성 상품이면 **consume** 처리 → 다시 구매 가능
    const svc = await getService();
    await svc.consume(purchaseToken);

    await response.complete("success");
    return purchaseToken;
}
