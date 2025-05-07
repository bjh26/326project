import { Sequelize, DataTypes } from "sequelize";

// initializes a new Sequelize instance with SQLite
const sequelizeUser = new Sequelize({
    dialect: "sqlite",
    storage: "User.sqlite"
});

// User model
const userModel = sequelizeUser.define("Users", { 
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    department: {
        type: DataTypes.STRING,
        allowNull: true
    },
    bio: {
        type: DataTypes.STRING,
        allowNull: true
    },
    pfp: { 
      type: DataTypes.STRING,
      allowNull: true
    },
    mime: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resume: {
        type: DataTypes.STRING,
        allowNull: true
    },
    displayEmail: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    researchItems: {
        type: DataTypes.JSON,
        allowNull: true
    }
});

export { sequelizeUser, userModel };