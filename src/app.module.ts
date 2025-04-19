import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './db/sequelize/models/user.model';
import { UsersModule } from './users/users.module';
import { AModule } from './a/a.module';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'admin',
      database: 'test5_nest',
      models: [User],
      autoLoadModels: true,
    }),
    UsersModule,
    AModule,
  ],
})
export class AppModule {}
