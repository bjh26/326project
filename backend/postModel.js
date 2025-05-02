import { Sequelize, DataTypes } from "sequelize";

// can also use sequelize object defined in the userModel file

// initializes a new Sequelize instance with SQLite
const sequelizePost = new Sequelize({
    dialect: "sqlite",
    storage: "Post.sqlite"
});

// Post Model
const postModel = sequelizePost.define("Posts", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    }, 
    description: {
        type: DataTypes.STRING,
        allowNull: true
    }, 
    responsibilities: {
        type: DataTypes.STRING,
        allowNull: true
    }, 
    qualifications: {
        type: DataTypes.STRING, // or array if can filter based on qualifications
        allowNull: true
    }, 
    compensation: {
        type: DataTypes.STRING,
        allowNull: true
    },
    postedDate: { // depends on how the input field is set up, might be STRING
        type: DataTypes.STRING,
        allowNull: true
    },
    hiringPeriod: {
        type: DataTypes.DATE, // depends on how the input field is set up, might be STRING
        allowNull: true
    },
    deadline: { // depends on how the input field is set up, might be STRING
        type: DataTypes.DATE,
        allowNull: true
    },
    applicationInstructions: {
        type: DataTypes.STRING,
        allowNull: true
    }, 
    contactName: {
        type: DataTypes.STRING,
        allowNull: false
    }, 
    contactEmail: {
        type: DataTypes.STRING,
        allowNull: false
    },

});

export { sequelizePost, postModel }