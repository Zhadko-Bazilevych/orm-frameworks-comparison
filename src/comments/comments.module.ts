import { Module } from '@nestjs/common';
import { CommentsService } from 'src/comments/comments.service';
import { CommentsController } from 'src/comments/comments.controller';
import { Comment as SequelizeCommentModel } from 'src/db/sequelize/models/comment.model';
import { Comment as TypeOrmCommentModel } from 'src/db/typeorm/models/comment.model';
import { CommentsSequelizeService } from 'src/comments/comments.sequelize.service';
import { DataSource } from 'typeorm';
import { CommentsTypeOrmService } from 'src/comments/comments.typeorm.service';

@Module({
  controllers: [CommentsController],
  providers: [
    CommentsService,
    CommentsSequelizeService,
    CommentsTypeOrmService,

    {
      provide: 'COMMENT_REPOSITORY_TYPEORM',
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(TypeOrmCommentModel),
      inject: [DataSource],
    },

    {
      provide: 'COMMENT_MODEL_SEQUELIZE',
      useValue: SequelizeCommentModel,
    },
  ],
})
export class CommentsModule {}
