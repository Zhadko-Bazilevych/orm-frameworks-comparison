import { Module } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { UsersController } from './users.controller';
import { User as SequelizeUserModel } from 'src/db/sequelize/models/user.model';
import { User as TypeOrmUserModel } from 'src/db/typeorm/models/user.model';
import { UsersSequelizeService } from 'src/users/users.sequelize.service';
import { UsersTypeOrmService } from 'src/users/users.typeorm.service';
import { DataSource } from 'typeorm';
import { UsersPrismaService } from 'src/users/users.prisma.service';
import { PrismaService } from 'src/db/prisma/prisma.service';
// import { Sequelize } from 'sequelize-typescript';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersSequelizeService,
    UsersTypeOrmService,
    PrismaService,
    UsersPrismaService,

    {
      provide: 'USER_REPOSITORY_TYPEORM',
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(TypeOrmUserModel),
      inject: [DataSource],
    },

    {
      provide: 'USER_MODEL_SEQUELIZE',
      useValue: SequelizeUserModel,
    },
  ],
})
export class UsersModule {}
