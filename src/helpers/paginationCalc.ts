import { PaginationCalc, PaginationTypeQuery } from '../types/paginationType';

export const paginationCalc = (query: PaginationTypeQuery): PaginationCalc => {
	const sortDirection = query.sortDirection === 'asc' ? 1 : -1;

	const sortBy = query.sortBy ? { [query.sortBy]: sortDirection } : { createdAt: sortDirection };

	query.searchNameTerm;
	query.searchLoginTerm;
	query.searchEmailTerm;

	let pageNumber = +query.pageNumber;
	let pageSize = +query.pageSize;
	let totalCount = +query.totalCount;

	if (!pageNumber) {
		pageNumber = 1;
	}

	if (!pageSize) {
		pageSize = 10;
	}

	const skip = (pageNumber - 1) * pageSize;
	const pagesCount = Math.ceil(totalCount / pageSize);

	return { pagesCount, pageNumber, pageSize, skip, sortBy, totalCount };
};
