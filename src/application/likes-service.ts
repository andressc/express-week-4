import { ObjectId } from 'mongodb';
import { inject, injectable } from 'inversify';
import { LikesRepository } from '../repositories/likes-repository';
import { UsersType } from '../types/usersType';
import { ItemLike, LikeTypeDb } from '../types/LikeType';
import { CommentsTypeDb } from '../types/commentsType';
import { NotFoundError } from '../errors/notFoundError';
import {
	COMMENT_NOT_FOUND,
	ERROR_DB,
	POST_NOT_FOUND,
	USER_NOT_FOUND,
} from '../errors/errorsMessages';
import { CommentsRepository } from '../repositories/comments-repository';
import { PostsTypeDb } from '../types/postsType';
import { PostsRepository } from '../repositories/posts-repository';
import { idCreator } from '../helpers/idCreator';

@injectable()
export class LikesService {
	constructor(
		@inject(LikesRepository) protected likesRepository: LikesRepository,
		@inject(CommentsRepository) protected commentsRepository: CommentsRepository,
		@inject(PostsRepository) protected postsRepository: PostsRepository,
	) {}

	async leaveLike(
		type: string,
		authUser: UsersType | null,
		likeStatus: string,
		itemId: ObjectId,
	): Promise<void> {
		if (!authUser) throw new NotFoundError(USER_NOT_FOUND);

		switch (type) {
			case ItemLike.comment:
				const comment: CommentsTypeDb | null = await this.commentsRepository.findCommentById(
					itemId,
				);
				if (!comment) throw new NotFoundError(COMMENT_NOT_FOUND);
				break;

			case ItemLike.post:
				const post: PostsTypeDb | null = await this.postsRepository.findPostById(itemId);
				if (!post) throw new NotFoundError(POST_NOT_FOUND);
				break;
			default:
				break;
		}

		const like: LikeTypeDb | null = await this.likesRepository.findUserLike(
			authUser.id,
			itemId,
			type,
		);

		if (like) await this.likesRepository.updateLike(like._id, likeStatus);

		if (!like) {
			const newLike = {
				_id: idCreator(),
				type,
				login: authUser.accountData.login,
				userId: authUser.id,
				itemId,
				likeStatus,
				addedAt: new Date().toISOString(),
			};

			const createdId: ObjectId | null = await this.likesRepository.createLike(newLike);
			if (!createdId) throw new Error(ERROR_DB);
		}
	}
}
