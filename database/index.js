import Sequelize from 'sequelize';

export default class DataBase {
  static sequelize;
  static init() {
    const DB_URL = 'postgres://aksana_tolstoguzova:@localhost:5432/products';
    this.sequelize = new Sequelize(DB_URL,
      {
        define: {
          timestamps: false
        }
      });
    this.sequelize
      .authenticate()
      .then(() => {
        console.log('Connection has been established successfully.');
      })
      .catch(err => {
        console.error('Unable to connect to the database:', err);
      });
  }
  
  static createUserTable() {
    this.userTable = this.sequelize.define('Users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
      },
      pass: {
        type: Sequelize.STRING
      }
    });
    
    this.userTable.sync({ force: true }).then(() => {
      console.log('Users table is created');
      this.userTable.create({
        email: 'test@mail.ru',
        pass: '123'
      });
      this.userTable.create({
        email: 'test2@mail.ru',
        pass: '456'
      });
    });
  }
  
  /*
  product [{
    id,
    name,
  }]
   */
  static createProductTable(products) {
    this.productTable = this.sequelize.define('Products', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
        
      },
      name: {
        type: Sequelize.STRING
      }
    });
    
    this.productTable.sync({ force: true }).then(() => {
      console.log('Products table is created');
      if (products) {
        products.forEach( product => {
          this.productTable.create(product);
        });
      }
    });
  }
  static async getUsers() {
    const users = await this.userTable.findAll();
    return users.map(user => user.dataValues);
  }
  static async getProducts() {
    const products = await this.productTable.findAll();
    return products.map(user => user.dataValues);
  }
  
  static async getProductById(id) {
    this.products.findAll({
      where: {
        id
      }
    });
  }
  static async createProduct(product) {
    console.log(product);
    return await this.productTable.create(product);
  }
}
