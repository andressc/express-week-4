export type PaginationType<T> = {
	pagesCount: number;
	page: number;
	pageSize: number;
	totalCount: number;
	items: T;
};

export type PaginationTypeQuery = {
	pageNumber: string;
	pageSize: string;
	totalCount: string | number;
	sortBy: string | null;
	sortDirection: string | null;
	id?: string | null;
	searchNameTerm?: string;
	searchLoginTerm?: string;
	searchEmailTerm?: string;
};

export type PaginationTypeQueryRequest = {
	pageNumber: string;
	pageSize: string;
	totalCount: string;
	sortBy: string;
	sortDirection: string;
	id?: string;
	searchNameTerm?: string;
	searchLoginTerm?: string;
	searchEmailTerm?: string;
};

export type PaginationCalc = {
	pagesCount: number;
	pageNumber: number;
	pageSize: number;
	skip: number;
	totalCount: number;
	sortBy: {};
};
