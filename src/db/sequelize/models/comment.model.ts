import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { CreationOptional } from 'sequelize';
import { User } from 'src/db/sequelize/models/user.model';
import { Product } from 'src/db/sequelize/models/product.model';
import { Comment as Self } from 'src/db/sequelize/models/comment.model';

@Table({
  modelName: 'comment',
  tableName: 'Comment',
  freezeTableName: true,
  timestamps: false,
  createdAt: 'created_at',
  indexes: [
    {
      name: 'comments_pkey',
      unique: true,
      fields: [{ name: 'id' }],
    },
  ],
})
export class Comment extends Model {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: CreationOptional<number>;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'user_id',
  })
  userId: number;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'product_id',
  })
  productId: number;

  @ForeignKey(() => Self)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'parent_id',
  })
  parentId: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  content: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'created_at',
  })
  declare createdAt: Date;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Product)
  product: Product;

  @BelongsTo(() => Self, { foreignKey: 'parentId' })
  parentComment: Self;
}
