import { PaginationTypeQuery } from '../types/paginationType';

export const paginationCalc = (data: PaginationTypeQuery) => {
	const { PageNumber, PageSize, totalCount } = data;

	let pageNumber = +PageNumber;
	let pageSize = +PageSize;

	if (!pageNumber) pageNumber = 1;
	if (!pageSize) pageSize = 10;

	const skip = (pageNumber - 1) * pageSize;
	const pagesCount = Math.ceil(totalCount / pageSize);

	return { pagesCount, page: pageNumber, pageSize: pageSize, skip };
};
