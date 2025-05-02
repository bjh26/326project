import { Sequelize, DataTypes } from "sequelize";

// initializes a new Sequelize instance with SQLite
const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "database.sqlite"
});

// User model
const userModel = sequelize.define("Users", { 
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
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
        allowNull: false
    },
    department: {
        type: DataTypes.STRING,
        allowNull: true
    },
    bio: {
        type: DataTypes.STRING,
        allowNull: true
    },
    img: { 
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
        type: DataTypes.STRING,
        allowNull: true
    }
});

export { sequelize, userModel };