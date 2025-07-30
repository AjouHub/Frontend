import { JSX, useEffect, useState } from 'react';
import { fetchNotices} from "../../services/feachNotices";
import { Notice} from "../../types/notice";

function NoticePage(): JSX.Element {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [error, setError] = useState<string>('');
    const [statusCode, setStatusCode] = useState<number | string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchNotices({ page: 0, size: 5 })
            .then(data => {
                setNotices(data.content);
                setLoading(false);
            })
            .catch((err: unknown) => {
                setLoading(false);
                if (
                    typeof err === 'object' &&
                    err !== null &&
                    'status' in err
                ) {
                    const response = err as any;
                    setStatusCode(response.status);
                    setError(response.message || '공지사항을 불러오지 못했습니다.');
                } else {
                    setStatusCode('Unknown');
                    setError('알 수 없는 에러 발생');
                }
            });
    }, []);

    if (loading) {
        return <p style={{ padding: '20px' }}>로딩 중...</p>;
    }

    if (error) {
        return (
            <p style={{ color: 'red' }}>
                {error} <br />
                상태 코드: {statusCode}
            </p>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <h2>공지사항</h2>
            <ul>
                {notices.map(notice => (
                    <li key={notice.id} style={{ marginBottom: '1rem' }}>
                        <a href={notice.link} target='_blank' rel='noopener noreferrer'>
                            <strong>[{notice.category}]</strong> {notice.title}
                        </a>
                        <br />
                        <small>{notice.date} - {notice.department}</small>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default NoticePage;