export interface CursorPageMeta { nextCursor: string | null; hasMore: boolean; total?: number }
export interface CursorPage<T> { data: T[]; meta: CursorPageMeta }
