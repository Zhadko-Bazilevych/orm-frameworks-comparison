import { Inject } from '@nestjs/common';
import { BaseService } from 'src/utils/utils.service';
import { IUsersService } from 'src/users/users.types';
import { UsersSequelizeService } from 'src/users/users.sequelize.service';
import { InterfaceToType } from 'src/utils/utils.types';

export class UsersService extends BaseService<InterfaceToType<IUsersService>> {
  constructor(
    @Inject(UsersSequelizeService)
    usersSequelizeService: UsersSequelizeService,
    // @Inject(UserTypeOrmService)
    // userTypeOrmService: UserTypeOrmService,
  ) {
    super(usersSequelizeService);
  }
}
