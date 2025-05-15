import { Inject } from '@nestjs/common';
import { BaseService } from 'src/utils/utils.service';
import { IUsersService } from 'src/users/users.types';
import { UsersSequelizeService } from 'src/users/users.sequelize.service';
import { UsersTypeOrmService } from 'src/users/users.typeorm.service';
import { InterfaceToType } from 'src/utils/utils.types';

export class UsersService extends BaseService<InterfaceToType<IUsersService>> {
  constructor(
    @Inject(UsersSequelizeService)
    usersSequelizeService: UsersSequelizeService,
    @Inject(UsersTypeOrmService)
    usersTypeOrmService: UsersTypeOrmService,
  ) {
    super(usersSequelizeService, usersTypeOrmService);
  }
}
