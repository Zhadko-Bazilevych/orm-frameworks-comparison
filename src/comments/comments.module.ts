import { Module } from '@nestjs/common';
import { CommentsService } from 'src/comments/comments.service';
import { CommentsController } from 'src/comments/comments.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Comment } from 'src/db/sequelize/models/comment.model';
import { CommentsSequelizeService } from 'src/comments/comments.sequelize.service';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService, CommentsSequelizeService],
  imports: [SequelizeModule.forFeature([Comment])],
})
export class CommentsModule {}
