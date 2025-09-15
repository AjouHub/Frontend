export type NoticeType =
    | 'general'
    | 'scholarship'
    | 'dormitory'

export interface NotificationPrefs {
    allTypes: boolean;          // 전체 수신 여부
    selectedTypes: NoticeType[]; // allTypes=false일 때 사용
    useKeywordsOnly: boolean;   // 키워드 일치 시에만 수신
}