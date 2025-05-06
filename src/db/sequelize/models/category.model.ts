import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { CreationOptional } from 'sequelize';

@Table({
  modelName: 'category',
  tableName: 'Category',
  freezeTableName: true,
  timestamps: false,
  indexes: [
    {
      name: 'categories_pkey',
      unique: true,
      fields: [{ name: 'id' }],
    },
  ],
})
export class Category extends Model {
  declare id: CreationOptional<number>;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  name: string;
}
