import { Inject } from '@nestjs/common';
import { BaseService } from 'src/utils/utils.service';
import { IUsersService } from 'src/users/users.types';
import { UsersSequelizeService } from 'src/users/users.sequelize.service';
import { UsersTypeOrmService } from 'src/users/users.typeorm.service';
import { InterfaceToType } from 'src/utils/utils.types';
import { UsersPrismaService } from 'src/users/users.prisma.service';

export class UsersService extends BaseService<InterfaceToType<IUsersService>> {
  constructor(
    @Inject(UsersSequelizeService)
    usersSequelizeService: UsersSequelizeService,
    @Inject(UsersTypeOrmService)
    usersTypeOrmService: UsersTypeOrmService,
    @Inject(UsersPrismaService)
    usersPrismaService: UsersPrismaService,
  ) {
    super(usersSequelizeService, usersTypeOrmService, usersPrismaService);
  }
}
