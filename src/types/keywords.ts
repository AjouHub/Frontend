type KeywordScope = 'GLOBAL' | 'USER';
export type Keyword = {
    id: number;
    phrase: string;
    scope: KeywordScope;
    ownerId: number | null;
    globalRefId: number | null;
    createdAt: string; // '2025-08-31T00:33:02.322'
};