import { CreationOptional, DataTypes } from 'sequelize';
import { Column, Model, Table } from 'sequelize-typescript';

@Table({
  modelName: 'user',
  freezeTableName: true,
  createdAt: 'created_at',
  indexes: [
    {
      name: 'users_email_key',
      unique: true,
      fields: [{ name: 'email' }],
    },
    {
      name: 'users_pkey',
      unique: true,
      fields: [{ name: 'id' }],
    },
  ],
})
export class User extends Model {
  declare id: CreationOptional<number>;

  @Column({
    type: DataTypes.TEXT,
    allowNull: false,
    unique: 'users_email_key',
  })
  email: string;

  @Column({
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'password_hash',
  })
  passwordHash: string;

  @Column({
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'full_name',
  })
  fullName: string;
}
