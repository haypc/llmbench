export type PaginationArgs = { page?: number; pageSize?: number; cursor?: string }

export function paginationToSkipTake(args: PaginationArgs) {
  const page = Math.max(1, args.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, args.pageSize ?? 20))
  return { skip: (page - 1) * pageSize, take: pageSize, page, pageSize }
}

export function buildPaginatedResponse<T>({ data, total, page, pageSize }: { data: T[]; total: number; page: number; pageSize: number }) {
  return { data, total, page, pageSize, hasMore: page * pageSize < total, totalPages: Math.ceil(total / pageSize) }
}
