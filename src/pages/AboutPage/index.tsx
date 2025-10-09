import React, { useEffect, useState } from "react";
import "./AboutPage.css";
import { getSkuDetails, purchaseConsumable } from "../../lib/playBilling";

const SKUS = ["donation_1000", "donation_3000", "donation_5000"];

// 외부 리소스
const ORG_URL = "https://github.com/AjouHub";
const FRONTEND_URL = "https://github.com/AjouHub/Frontend";
const BACKEND_URL  = "https://github.com/AjouHub/Backend";
const ANDROID_URL  = "https://github.com/AjouHub/Android";
const FIGMA_URL    = "https://www.figma.com/design/HQw9DPxbkUBsTJTL2EhDWY/AURA?node-id=0-1";
const ISSUE_URL    = "https://github.com/AjouHub/Frontend/issues/new/choose";
const CONTACT_EMAIL = "team@ajouhub.dev";

export default function AboutPage() {
    const [items, setItems] = useState<{ id: string; title: string; price: string }[]>([]);
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const details = await getSkuDetails(SKUS);
                setItems(
                    details.map(d => ({
                        id: d.itemId,
                        title: d.title,
                        price: new Intl.NumberFormat(navigator.language, {
                            style: "currency",
                            currency: d.price.currency
                        }).format(d.price.value)
                    }))
                );
                setMsg("");
            } catch (e: any) {
                // TWA가 아니거나 Digital Goods 미지원 환경
                setMsg(e?.message || "이 환경에서는 인앱 결제가 지원되지 않습니다.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const donate = async (sku: string) => {
        try {
            setMsg("구매 창을 여는 중…");
            await purchaseConsumable(sku, "/api/play/ack"); // 서버리스/백엔드 ack 엔드포인트
            setMsg("후원해주셔서 감사합니다! 🎉");
        } catch (e: any) {
            setMsg(`실패: ${e?.message ?? "구매가 취소되었거나 오류가 발생했습니다."}`);
        }
    };

    const copyEmail = async () => {
        try {
            await navigator.clipboard.writeText(CONTACT_EMAIL);
            alert("이메일 주소가 복사되었습니다.");
        } catch {
            prompt("아래 이메일을 복사하세요", CONTACT_EMAIL);
        }
    };

    return (
        <div className="about-root">
            {/* 헤더 */}
            <section className="about-hero card">
                <div className="about-brand">AURA</div>
                <p className="about-desc">
                    아주대학교 공지/알림을 더 빠르고 정확하게 전달하는 오픈 프로젝트
                </p>
            </section>

            <div className="about-grid">
                {/* 후원(인앱 결제) */}
                <section className="card support-card">
                    <h2 className="card-title">직접 후원</h2>
                    <p className="card-sub">서버비를 위한 자발적 후원입니다. 추가 기능/콘텐츠 제공 없음.</p>

                    {loading && (
                        <div className="skeleton-wrap">
                            <div className="skeleton-btn" />
                            <div className="skeleton-btn" />
                            <div className="skeleton-btn" />
                        </div>
                    )}

                    {!loading && items.length > 0 && (
                        <div className="support-buttons">
                            {items.map(it => (
                                <button
                                    key={it.id}
                                    className="btn-primary wide"
                                    onClick={() => donate(it.id)}
                                >
                                    {it.title} — {it.price} 후원하기
                                </button>
                            ))}
                        </div>
                    )}

                    {!loading && items.length === 0 && (
                        <p className="muted small">
                            {msg || "인앱 결제 정보가 확인되지 않았습니다. AURA 앱에서 다시 시도해주세요."}
                        </p>
                    )}

                    {msg && items.length > 0 && <p className="muted small">{msg}</p>}

                    <p className="footnote">
                        결제·환불은 Google Play 기준을 따릅니다. 문의: {CONTACT_EMAIL}
                    </p>
                </section>

                {/* 개발자/리소스 */}
                <section className="card">
                    <h2 className="card-title">개발자 & 리소스</h2>
                    <ul className="links">
                        <li><a href={ORG_URL} target="_blank" rel="noreferrer">GitHub Org</a></li>
                        <li><a href={FRONTEND_URL} target="_blank" rel="noreferrer">Frontend</a></li>
                        <li><a href={BACKEND_URL} target="_blank" rel="noreferrer">Backend</a></li>
                        <li><a href={ANDROID_URL} target="_blank" rel="noreferrer">Android</a></li>
                        <li><a href={FIGMA_URL} target="_blank" rel="noreferrer">Figma</a></li>
                    </ul>
                    <div className="contact">
                        문의: <button className="link-like" onClick={copyEmail}>{CONTACT_EMAIL}</button>
                    </div>
                    <a className="btn-secondary" href={ISSUE_URL} target="_blank" rel="noreferrer">
                        버그 신고하기
                    </a>
                </section>

                {/* 데이터/정책 */}
                <section className="card">
                    <h2 className="card-title">데이터 & 정책</h2>
                    <ul className="bullets">
                        <li>공식 학사/학과 페이지에서 공지를 수집합니다.</li>
                        <li>오류·지연 시 빠르게 공지하고 수정합니다.</li>
                        <li>필요 최소한의 정보만 사용하며 제3자에 판매하지 않습니다.</li>
                    </ul>
                </section>

                {/* 버전 정보 (원하면 주입해서 사용) */}
                <section className="card">
                    <h2 className="card-title">버전 정보</h2>
                    <div className="meta">
                        {/* <div><span>Version</span><strong>{APP_VERSION}</strong></div>
            {GIT_SHA && <div><span>Commit</span><code>{GIT_SHA}</code></div>}
            {BUILD_TIME && <div><span>Built</span><time>{BUILD_TIME}</time></div>} */}
                        <div className="muted small">배포 정보는 빌드 시 주입됩니다.</div>
                    </div>
                </section>
            </div>
        </div>
    );
}
