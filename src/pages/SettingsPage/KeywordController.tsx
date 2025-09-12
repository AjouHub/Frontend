import React, { useEffect, useState } from 'react';
import { addKeyword, listKeywords, removeKeyword } from '../../services/settings.service';
import type { Keyword } from '../../types/keywords';

export default function KeywordController() {
    const [keywords, setKeywords] = useState<Keyword[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const list = await listKeywords();      // Promise<Keyword[]>
            setKeywords(list ?? []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const onAdd = async () => {
        const phrase = input.trim();
        if (!phrase) return;

        setLoading(true);
        try {
            const response = await addKeyword(phrase);
            setKeywords(prev =>
                prev.some(k => k.id === response.id) ? prev : [...prev, response]
            ); // ← 배열에 합치기 (SetStateAction<Keyword[]> OK)
            setInput('');
            await load();
        } finally {
            setLoading(false);
        }
    };

    const onRemove = async (id: number) => {
        setLoading(true);
        try {
            await removeKeyword(id);   // DELETE /keywords/{id}
            await load();
        } finally {
            setLoading(false);
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
