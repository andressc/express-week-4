export type PaginationType<T> = {
	pagesCount: number;
	page: number;
	pageSize: number;
	totalCount: number;
	items: T;
};

export type PaginationTypeQuery = {
	pageNumber: number;
	pageSize: number;
	totalCount: number;
	sortBy: string | null;
	sortDirection: string | null;
	id?: number | null;
	searchNameTerm?: string | null;
	searchLoginTerm?: string | null;
	searchEmailTerm?: string | null;
};

export type PaginationCalc = {
	pagesCount: number;
	pageNumber: number;
	pageSize: number;
	skip: number;
	totalCount: number;
	sortBy: {};
};
