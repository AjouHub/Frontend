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

    // 현재 등록된 키워드를 쉼표로 구분하여 보여줍니다.
    const keywordText = keywords.length > 0
        ? keywords.map(k => k.phrase).join(', ')
        : '등록된 키워드가 없습니다.';

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
                <div>로딩 중...</div>
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
