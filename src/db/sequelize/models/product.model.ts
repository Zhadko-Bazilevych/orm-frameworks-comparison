import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  HasMany,
  BelongsTo,
} from 'sequelize-typescript';
import { CreationOptional } from 'sequelize';
import { Category } from 'src/db/sequelize/models/category.model';
import { Comment } from 'src/db/sequelize/models/comment.model';
import { OrderItem } from 'src/db/sequelize/models/order-item.model';

@Table({
  modelName: 'product',
  tableName: 'Product',
  freezeTableName: true,
  timestamps: false,
  indexes: [
    {
      name: 'products_pkey',
      unique: true,
      fields: [{ name: 'id' }],
    },
  ],
})
export class Product extends Model {
  declare id: CreationOptional<number>;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string;

  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
  })
  declare price: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
    },
  })
  declare stock: number;

  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'category_id',
  })
  declare categoryId: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'last_updated',
    defaultValue: DataType.NOW,
  })
  declare lastUpdated: Date;

  @HasMany(() => OrderItem)
  declare orders: OrderItem[];

  @HasMany(() => Comment)
  declare comments: Comment[];

  @BelongsTo(() => Category)
  declare category: Category;
}
