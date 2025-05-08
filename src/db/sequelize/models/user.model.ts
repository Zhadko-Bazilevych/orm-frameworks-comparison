import {
  Table,
  Column,
  Model,
  HasOne,
  HasMany,
  DataType,
} from 'sequelize-typescript';
import { Profile } from './profile.model'; // path to the Profile model
import { Order } from './order.model'; // path to the Order model
import { Comment } from './comment.model'; // path to the Comment model
import { CreationOptional } from 'sequelize';

@Table({ modelName: 'user', tableName: 'User' })
export class User extends Model {
  declare id: CreationOptional<number>;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    unique: 'users_email_key',
  })
  email: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: 'password_hash',
  })
  passwordHash: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: 'full_name',
  })
  fullName: string;

  @HasOne(() => Profile)
  profile: Profile;

  @HasMany(() => Order)
  orders: Order[];

  @HasMany(() => Comment)
  comments: Comment[];
}
