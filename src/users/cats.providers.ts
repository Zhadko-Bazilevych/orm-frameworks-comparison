import { User } from 'src/db/sequelize/models/user.model';

export const UsersProviders = [{ provide: 'CATS_REPOSITORY', useValue: User }];
