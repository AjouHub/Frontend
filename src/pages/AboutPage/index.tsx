import React, { useMemo, useState } from "react";
import "./AboutPage.css";

/** 빌드/배포 시 주입되면 표시됨(없으면 기본값) */
// const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? "0.1.0";
// const GIT_SHA = (import.meta.env.VITE_GIT_SHA ?? "").slice(0, 7);
// const BUILD_TIME = import.meta.env.VITE_BUILD_TIME ?? "";

/** 외부 리소스 */
const ORG_URL = "https://github.com/AjouHub";
const FRONTEND_URL = "https://github.com/AjouHub/Frontend";
const BACKEND_URL  = "https://github.com/AjouHub/Backend";
const ANDROID_URL  = "https://github.com/AjouHub/Android";
const FIGMA_URL    = "https://www.figma.com/design/HQw9DPxbkUBsTJTL2EhDWY/AURA?node-id=0-1";
const ISSUE_URL    = "https://github.com/AjouHub/Frontend/issues/new/choose";
const CONTACT_EMAIL = "team@ajouhub.dev"; // 실제 메일로 바꿔주세요

/** 후원 프리셋(원) */
type Amount = 1000 | 3000 | 5000 | 10000;
const PRESETS: Amount[] = [1000, 3000, 5000, 10000];

export default function AboutPage() {
    /** 후원(ko-fi 스타일) 상태 */
    const [amount, setAmount] = useState<Amount | number>(3000);
    const [custom, setCustom] = useState("");
    const [nickname, setNickname] = useState("");
    const [message, setMessage] = useState("");
    const [anon, setAnon] = useState(false);
    const [loading, setLoading] = useState(false);

    const finalAmount = useMemo(() => {
        const n = Number(custom.replace(/[^\d]/g, ""));
        return custom ? Math.max(1000, Math.min(500000, n || 0)) : Number(amount);
    }, [amount, custom]);

    const startSupport = async () => {
        if (!finalAmount || finalAmount < 1000) {
            alert("최소 후원 금액은 1,000원입니다.");
            return;
        }
        setLoading(true);
        try {
            /** 백엔드의 KakaoPay ready 엔드포인트(직접 연동 A안) */
            const res = await fetch("/api/support/ready", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    amount: finalAmount,
                    nickname: anon ? "익명" : nickname?.trim(),
                    message: message?.trim(),
                    anonymous: anon,
                    returnUrl: window.location.origin + "/support/thanks",
                }),
            });
            if (!res.ok) throw new Error("ready failed");
            const { orderId, redirectUrl } = await res.json();
            sessionStorage.setItem("lastDonationOrderId", orderId);
            window.location.href = redirectUrl; // 카카오페이 앱/웹로 이동
        } catch (e) {
            alert("후원 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setLoading(false);
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
            {/* 상단 헤더 영역(앱 스타일과 톤 맞춤) */}
            <section className="about-hero card">
                <div className="about-brand">AURA</div>
                <p className="about-desc">
                    아주대학교 공지/알림을 더 빠르고 정확하게 전달하는 오픈 프로젝트
                </p>
            </section>

            <div className="about-grid">
                {/* 후원 카드 */}
                <section className="card support-card">
                    <h2 className="card-title">직접 후원</h2>
                    <p className="card-sub">커피 한 잔 값으로 AURA를 응원해 주세요 ☕️</p>

                    <div className="support-amounts">
                        {PRESETS.map(v => (
                            <button key={v}
                                    className={`chip ${!custom && amount === v ? "is-active" : ""}`}
                                    onClick={() => { setAmount(v); setCustom(""); }}>
                                ₩{v.toLocaleString()}
                            </button>
                        ))}
                        <div className="chip custom-chip">
                            <input
                                inputMode="numeric"
                                placeholder="직접 입력"
                                value={custom}
                                onChange={(e) => setCustom(e.target.value)}
                            />
                            <span>원</span>
                        </div>
                    </div>

                    <div className="support-fields">
                        <label className="row">
                            <span>닉네임</span>
                            <input
                                disabled={anon}
                                placeholder="표시용(선택)"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                            />
                        </label>
                        <label className="row">
                            <span>메시지</span>
                            <input
                                placeholder="응원 한마디(선택)"
                                maxLength={60}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </label>
                        <label className="check">
                            <input type="checkbox" checked={anon} onChange={() => setAnon(v => !v)} />
                            <span>익명으로 후원하기</span>
                        </label>
                    </div>

                    <div className="support-summary">
                        <span>후원 금액</span>
                        <strong>₩{finalAmount.toLocaleString()}</strong>
                    </div>

                    <button className="btn-primary wide" disabled={loading} onClick={startSupport}>
                        {loading ? "연결 중..." : "카카오페이로 후원하기"}
                    </button>

                    <p className="footnote">
                        후원금은 서버·도메인 등 프로젝트 운영에 사용되며 기부금 영수증은 발급되지 않습니다.
                    </p>
                </section>

                {/* 개발자/리소스 카드 */}
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

                {/* 데이터/정책 카드 */}
                <section className="card">
                    <h2 className="card-title">데이터 & 정책</h2>
                    <ul className="bullets">
                        <li>공식 학사/학과 페이지에서 공지를 수집합니다.</li>
                        <li>오류·지연 시 빠르게 공지하고 수정합니다.</li>
                        <li>필요 최소한의 정보만 사용하며 제3자에 판매하지 않습니다.</li>
                    </ul>
                </section>

                {/* 버전 정보 카드 */}
                <section className="card">
                    <h2 className="card-title">버전 정보</h2>
                    <div className="meta">
                        {/*<div><span>Version</span><strong>{APP_VERSION}</strong></div>*/}
                        {/*{GIT_SHA && <div><span>Commit</span><code>{GIT_SHA}</code></div>}*/}
                        {/*{BUILD_TIME && <div><span>Built</span><time>{BUILD_TIME}</time></div>}*/}
                    </div>
                </section>
            </div>
        </div>
    );
}
