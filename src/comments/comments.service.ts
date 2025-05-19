import { Inject } from '@nestjs/common';
import { BaseService } from 'src/utils/utils.service';
import { ICommentsService } from 'src/comments/comments.types';
import { CommentsSequelizeService } from 'src/comments/comments.sequelize.service';
import { InterfaceToType } from 'src/utils/utils.types';
import { CommentsTypeOrmService } from 'src/comments/comments.typeorm.service';
import { CommentsPrismaService } from 'src/comments/comments.prisma.service';

export class CommentsService extends BaseService<
  InterfaceToType<ICommentsService>
> {
  constructor(
    @Inject(CommentsSequelizeService)
    commentsSequelizeService: CommentsSequelizeService,
    @Inject(CommentsTypeOrmService)
    commentsTypeOrmService: CommentsTypeOrmService,
    @Inject(CommentsPrismaService)
    commentsPrismaService: CommentsPrismaService,
  ) {
    super(
      commentsSequelizeService,
      commentsTypeOrmService,
      commentsPrismaService,
    );
  }
}
