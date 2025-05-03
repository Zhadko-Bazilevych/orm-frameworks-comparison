import { Module } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { UsersController } from './users.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/db/sequelize/models/user.model';
import { UsersSequelizeService } from 'src/users/users.sequelize.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersSequelizeService],
  imports: [SequelizeModule.forFeature([User])],
})
export class UsersModule {}
