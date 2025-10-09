// 브라우저(Chrome/Android TWA 등)에서 Google Play Billing을 사용하는
// Digital Goods API 클라이언트 구현 (서버 없이 구매/소비 처리)

type Price = { value: string; currency: string };
export type SkuDetail = { itemId: string; title: string; price: Price };
export type Purchase = { itemId: string; purchaseToken: string; acknowledged?: boolean; consumed?: boolean };

declare global {
    interface Window {
        getDigitalGoodsService?: (provider: string) => Promise<any>;
    }
}

// 내부: DigitalGoodsService 핸들 얻기
async function getService() {
    if (!window.getDigitalGoodsService) {
        throw new Error("Digital Goods API가 지원되지 않습니다 (Play 스토어 설치 앱/환경 필요).");
    }
    // Google Play Billing 식별자
    return window.getDigitalGoodsService!("https://play.google.com/billing");
}

// 사용 가능 여부(간단 체크)
export async function isPlayBillingAvailable(): Promise<boolean> {
    try {
        await getService();
        return true;
    } catch {
        return false;
    }
}

// 상품 상세 조회
export async function getSkuDetails(skus: string[]): Promise<SkuDetail[]> {
    const dgs = await getService();
    // 일부 구현체는 배열 인자로 getDetails(skus: string[]) 지원
    // 지원 안 하는 경우를 대비해 map+concat로 처리
    if (typeof dgs.getDetails === "function") {
        const details: SkuDetail[] = await dgs.getDetails(skus);
        return details.map(normalizeDetail);
    }

    // 폴리: 개별 호출
    const out: SkuDetail[] = [];
    for (const sku of skus) {
        const [detail] = await dgs.getDetails([sku]);
        if (detail) out.push(normalizeDetail(detail));
    }
    return out;
}

// 소비(= acknowledge 포함) 가능한 '소모성' 아이템 결제
export async function purchaseConsumable(sku: string) {
    // 1) 결제 시트 띄우기 (Payment Request with Play Billing)
    const methodData: PaymentMethodData[] = [
        {
            supportedMethods: "https://play.google.com/billing",
            // Play 쪽이 가격/세부 처리를 들고 가므로 data는 sku만 넘겨도 동작
            data: { sku },
        } as any,
    ];
    const details: PaymentDetailsInit = {
        // 금액은 Play 결제창에서 표시되므로 placeholder만 둬도 됩니다.
        total: { label: "AURA Donation", amount: { currency: "KRW", value: "0" } },
    };

    const req = new PaymentRequest(methodData, details);
    const resp = await req.show();        // 사용자가 결제 승인
    await resp.complete("success");

    // 2) 구매 목록 확인 후 방금 산 sku를 찾기
    const dgs = await getService();
    const purchases: Purchase[] = await safeListPurchases(dgs);

    // consumed/acknowledged 아닌 최신 구매를 찾음
    const target = purchases.find(p => p.itemId === sku && !p.consumed);
    if (!target) {
        // 일부 환경에선 구매 직후 목록 반영이 지연될 수 있어 재시도 루프 권장
        throw new Error("구매 내역을 확인하지 못했습니다. 잠시 후 다시 시도해주세요.");
    }

    // 3) 소비(consume) → 소비는 Play Billing에서 acknowledge를 내포
    if (typeof dgs.consume === "function") {
        await dgs.consume(target.purchaseToken);
    } else if (typeof dgs.consume === "undefined" && typeof dgs.acknowledge === "function") {
        // 혹시 구현체가 acknowledge만 제공한다면
        await dgs.acknowledge(target.purchaseToken);
    } else {
        throw new Error("이 환경에서는 소비/승인이 지원되지 않습니다.");
    }
}

// 유틸: listPurchases가 없거나 사양이 다른 경우 대비
async function safeListPurchases(dgs: any): Promise<Purchase[]> {
    if (typeof dgs.listPurchases === "function") {
        return (await dgs.listPurchases()) as Purchase[];
    }
    // 구형/변형 대응(필요 시 수정)
    if (typeof dgs.list === "function") {
        return (await dgs.list()) as Purchase[];
    }
    return [];
}

function normalizeDetail(d: any): SkuDetail {
    // 구현체마다 키가 다를 수 있어 정규화
    const price: Price =
        d.price && typeof d.price === "object"
            ? d.price
            : { value: String(d.price?.value ?? d.price?.amount ?? "0"), currency: d.price?.currency ?? "KRW" };
    return {
        itemId: d.itemId ?? d.sku ?? d.id,
        title: d.title ?? d.name ?? "",
        price,
    };
}
