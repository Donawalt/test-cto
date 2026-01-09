import type { PaginationParams, PaginatedResponse } from '@myapp/types';

export function paginate<T>(
  items: T[],
  params: PaginationParams
): PaginatedResponse<T> {
  const { page, limit } = params;
  const offset = (page - 1) * limit;
  const paginatedItems = items.slice(offset, offset + limit);
  const total = items.length;
  const totalPages = Math.ceil(total / limit);

  return {
    data: paginatedItems,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

export type WhereClause = Record<string, unknown>;
export type OrderByClause = Record<string, 'asc' | 'desc'>;

export function buildWhereClause(filters: Record<string, unknown>): WhereClause {
  const where: WhereClause = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      where[key] = value;
    }
  });

  return where;
}

export function buildOrderBy(sort?: string, order: 'asc' | 'desc' = 'asc'): OrderByClause | undefined {
  if (!sort) return undefined;

  return {
    [sort]: order,
  };
}

export function buildSelectFields(fields?: string[]): Record<string, boolean> | undefined {
  if (!fields || fields.length === 0) return undefined;

  return fields.reduce((acc, field) => {
    acc[field] = true;
    return acc;
  }, {} as Record<string, boolean>);
}

export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

export function normalizeSearchTerm(term: string): string {
  return term
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, '');
}

export function buildSearchConditions(
  searchTerm: string,
  searchableFields: string[]
): Record<string, unknown>[] {
  const normalizedTerm = normalizeSearchTerm(searchTerm);
  
  return searchableFields.map((field) => ({
    [field]: {
      contains: normalizedTerm,
      mode: 'insensitive',
    },
  }));
}

export interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  searchFields?: string[];
  filters?: Record<string, unknown>;
}

export function buildQueryOptions(options: QueryOptions) {
  const page = options.page || 1;
  const limit = options.limit || 20;
  const offset = calculateOffset(page, limit);

  return {
    skip: offset,
    take: limit,
    orderBy: buildOrderBy(options.sort, options.order),
    where: {
      ...buildWhereClause(options.filters || {}),
      ...(options.search && options.searchFields
        ? { OR: buildSearchConditions(options.search, options.searchFields) }
        : {}),
    },
  };
}
