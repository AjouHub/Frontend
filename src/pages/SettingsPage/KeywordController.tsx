import React, { useEffect, useState } from 'react';
import { addKeyword, listKeywords, removeKeyword } from '../../services/settings.service';
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

    return (
        <div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                    placeholder="키워드 입력"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') onAdd();
                    }}
                    disabled={loading}
                    style={{ minWidth: 320, padding: 6 }}
                />
                <button onClick={onAdd} disabled={loading || !input.trim()}>
                    추가
                </button>
            </div>

            <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 14, color: '#666', marginBottom: 6 }}>내 키워드</div>
                {keywords.length === 0 ? (
                    <div style={{ color: '#888' }}>등록된 키워드가 없습니다.</div>
                ) : (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {keywords.map((k) => (
                            <span
                                key={k.id}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '6px 10px',
                                    borderRadius: 16,
                                    border: '1px solid #ddd',
                                    background: '#fafafa',
                                }}
                            >
                {k.phrase}
                                <button
                                    onClick={() => onRemove(k.id)}
                                    disabled={loading}
                                    style={{ marginLeft: 4 }}
                                >
                  ×
                </button>
              </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
