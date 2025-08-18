import { useEffect, useMemo, useState,JSX } from 'react';
import { fetchUserInfo} from "../../services/fetchUserInfo";
import { fetchNotices }   from '../../services/fetchNotices';
import { Notice }         from '../../types/notice';
import { UserInfo }       from '../../types/user';
import { departmentNameMap} from "../../components/departmentMap";

/* ─── 1차 / 2차 카테고리 상수 ───────────────────────── */
const LEFT = [
  { key: 'general',    label: '일반' },
  { key: 'department', label: '학과' },
] as const;

const GENERAL_RIGHT = [
  { key: 'general',     label: '일반' },
  { key: 'scholarship', label: '장학' },
  { key: 'dormitory',   label: '생활관' },
] as const;
/* ──────────────────────────────────────────────────── */

export default function NoticePage(): JSX.Element {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [left, setLeft] = useState<'general' | 'department'>('general');
  const [type, setType] = useState<string>('general');

  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<number | string | null>(null);

  /* 사용자 + 초기 공지 */
  useEffect(() => {
    (async () => {
      try {
        const u = await fetchUserInfo();
        setUser(u);

        const initialType =
            left === 'general' ? 'general' : u.departments[0] ?? 'general';
        setType(initialType);


        const d = await fetchNotices({page: 0, size: 10, type: type});
        setNotices(d.content);

      } catch (e: any) {
        setError(e.message ?? '데이터 오류');
        setStatus(e.status ?? 'Unknown');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* type 변경 → 공지 재호출 */
  useEffect(() => {


    //if (!user) return;

    setLoading(true);
    fetchNotices({page: 0, size: 10, type})
        .then(d =>
        {setNotices(d.content);

        }
        )
        .catch(e => {
          setError(e.message ?? '공지 불러오기 실패');
          setStatus(e.status ?? 'Unknown');
        })
        .finally(() => setLoading(false));
  }, [type, user]);

  /* 오른쪽 옵션 계산 */
  const rightOptions = useMemo(() => {
    if (left === 'general') return GENERAL_RIGHT;
    return (user?.departments.slice(1) ?? []).map(c => {

      return{
      key: c,
      label: departmentNameMap[c] ?? c,
    }});
  }, [left, user]);


  /* ───────── 렌더링 ───────── */
  if (loading) return <p className="p-6">로딩 중…</p>;
  if (error) return (
      <p className="p-6 text-red-600">
        {error}<br/>상태 코드: {status}
      </p>
  );

  return (
      <div className="flex flex-col lg:flex-row gap-6 p-6">
        {/* ───────── ① 왼쪽 1차 카테고리 ───────── */}
        <div className="w-full lg:w-40 shrink-0 rounded-xl border bg-white shadow">
          {LEFT.map(o => (
              <button
                  key={o.key}
                  className={
                    `w-full px-4 py-2 text-left transition 
             ${o.key === left
                        ? 'bg-indigo-600 text-white'
                        : 'hover:bg-indigo-50 active:bg-indigo-100'}`
                  }
                  onClick={() => {
                    setLeft(o.key);
                    const next = o.key === 'general'
                        ? 'general'
                        : user?.departments?.[0] ?? 'general';
                    setType(next);
                  }}
              >
                {o.label}
              </button>
          ))}
        </div>

        {/* ───────── ② 오른쪽 2차 카테고리 ───────── */}
        <div className="w-full lg:w-56 shrink-0 rounded-xl border bg-white shadow">
          <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300">
            {rightOptions.map(o => (
                <button

                    key={o.key}
                    className={
                      `w-full px-4 py-2 text-left transition 
               ${o.key === type
                          ? 'bg-indigo-500/90 text-white'
                          : 'hover:bg-indigo-50 active:bg-indigo-100'}`
                    }
                    onClick={() =>
                    {
                        setType(o.key)
                    }}
                >
                  {o.label}
                </button>
            ))}



            {rightOptions.length === 0 && (
                <p className="px-4 py-2 text-sm text-zinc-500">
                  선택할 학과가 없습니다.
                </p>
            )}
          </div>
        </div>

        {/* ───────── ③ 공지 목록 ───────── */}
        <div className="flex-1">
          <h2 className="text-2xl font-semibold mb-4">공지사항</h2>

          {notices.length === 0 ? (
              <p className="text-zinc-500">공지사항이 없습니다.</p>
          ) : (
              <ul className="space-y-4">
                {notices.map(n => (
                    <li key={n.id} className="leading-relaxed">
                      <a
                          href={n.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                      >
                        <strong className="text-indigo-600">[{n.category}]</strong>{' '}
                        {n.title}
                      </a>
                      <br/>
                      <small className="text-zinc-500">
                        {n.date} · {n.department}
                      </small>
                    </li>
                ))}
              </ul>
          )}
        </div>
      </div>
  );
}
