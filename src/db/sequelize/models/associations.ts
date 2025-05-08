import { User } from 'src/db/sequelize/models/user.model';
import { Profile } from 'src/db/sequelize/models/profile.model';
import { Category } from 'src/db/sequelize/models/category.model';
import { Product } from 'src/db/sequelize/models/product.model';
import { Order } from 'src/db/sequelize/models/order.model';
import { OrderItem } from 'src/db/sequelize/models/order-item.model';
import { Comment } from 'src/db/sequelize/models/comment.model';

export function setupAssociations() {
  User.hasOne(Profile, { foreignKey: 'userId' });
  Profile.belongsTo(User, { foreignKey: 'userId' });

  User.hasMany(Order, { foreignKey: 'userId' });
  Order.belongsTo(User, { foreignKey: 'userId' });

  User.hasMany(Comment, { foreignKey: 'userId' });
  Comment.belongsTo(User, { foreignKey: 'userId' });

  Category.hasMany(Product, { foreignKey: 'categoryId' });
  Product.belongsTo(Category, { foreignKey: 'categoryId' });

  Product.hasMany(OrderItem, { foreignKey: 'productId' });
  OrderItem.belongsTo(Product, { foreignKey: 'productId' });

  Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
  OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

  Product.hasMany(Comment, { foreignKey: 'productId' });
  Comment.belongsTo(Product, { foreignKey: 'productId' });

  Comment.hasMany(Comment, { foreignKey: 'parentId', as: 'replies' });
  Comment.belongsTo(Comment, { foreignKey: 'parentId', as: 'parent' });
}
