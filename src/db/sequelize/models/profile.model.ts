import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  Unique,
} from 'sequelize-typescript';
import { User } from 'src/db/sequelize/models/user.model';
import { CreationOptional } from 'sequelize';

@Table({
  modelName: 'profile',
  tableName: 'Profile',
  freezeTableName: true,
  timestamps: false,
  indexes: [
    {
      name: 'profiles_pkey',
      unique: true,
      fields: [{ name: 'id' }],
    },
    {
      name: 'profiles_user_id_key',
      unique: true,
      fields: [{ name: 'user_id' }],
    },
  ],
})
export class Profile extends Model {
  declare id: CreationOptional<number>;

  @ForeignKey(() => User)
  @Unique('profiles_user_id_key')
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'user_id',
  })
  userId: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  address: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  phone: string;
}
