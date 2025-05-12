import {
  Table,
  Column,
  Model,
  HasOne,
  HasMany,
  DataType,
} from 'sequelize-typescript';
import { Profile } from './profile.model';
import { Order } from './order.model';
import { Comment } from './comment.model';
import { CreationOptional } from 'sequelize';

@Table({ modelName: 'user', tableName: 'User' })
export class User extends Model {
  declare id: CreationOptional<number>;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    unique: 'users_email_key',
  })
  declare email: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: 'password_hash',
  })
  declare passwordHash: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: 'full_name',
  })
  declare fullName: string;

  @HasOne(() => Profile)
  declare profile: Profile;

  @HasMany(() => Order)
  declare orders: Order[];

  @HasMany(() => Comment)
  declare comments: Comment[];
}
