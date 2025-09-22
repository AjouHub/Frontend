import React, { useState } from 'react';
import type { Keyword } from '../../types/keywords';

// 부모로부터 받을 props 타입을 정의합니다.
interface KeywordControllerProps {
    keywords: Keyword[];
    loading: boolean;
    onAddKeyword: (phrase: string) => Promise<void>;
    onRemoveKeyword: (id: number) => Promise<void>;
}


export default function KeywordController({ keywords, loading, onAddKeyword, onRemoveKeyword }: KeywordControllerProps) {
    const [input, setInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onAdd = async () => {
        const phrase = input.trim();
        if (!phrase) return;

        setIsSubmitting(true);
        try {
            await onAddKeyword(phrase);
            setInput('');
        } catch (e: any) {
            if (e?.response?.status === 409) return;  // 409는 onAddKeyword에서 alert 띄웠으니 조용히 종료
        } finally {
            setIsSubmitting(false);
        }
    };

    const onRemove = async (id: number) => {
        setIsSubmitting(true);
        try {
            await onRemoveKeyword(id);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isLoading = loading || isSubmitting;

    return (
        <div className="keyword-input-container">
            <div className="input-group">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="키워드를 입력하세요"
                    disabled={isLoading}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') onAdd();
                    }}
                />
                <button onClick={onAdd} disabled={isLoading || !input.trim()}>
                    추가
                </button>
            </div>

            <div className="item-list-title">내 키워드</div>
            {loading && keywords.length === 0 ? (
                <div className="np-loading-overlay">
                    <div className="np-spinner" aria-label="로딩 중" />
                </div>
            ) : (
                <div className="item-chip-list">
                    {keywords.map((k) => (
                        <div key={k.id} className="item-chip">
                            <span>{k.phrase}</span>
                            <button onClick={() => onRemove(k.id)} disabled={isLoading}>×</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
