import { PostsType } from '../types/postsType';

export const postBodyFilter = (data: PostsType) => {
	const { title, shortDescription, content, blogId } = data;

	return {
		title,
		shortDescription,
		content,
		blogId,
	};
};
