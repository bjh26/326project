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
        type: DataTypes.TEXT,
        allowNull: true
    }, 
    responsibilities: {
        type: DataTypes.TEXT, // Will store JSON string for array
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('responsibilities');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
            this.setDataValue('responsibilities', JSON.stringify(value));
        }
    },
    qualificationRequirement: {
        type: DataTypes.TEXT, // Will store JSON string for array
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('qualificationRequirement');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
            this.setDataValue('qualificationRequirement', JSON.stringify(value));
        }
    }, 
    compensation: {
        type: DataTypes.STRING,
        allowNull: true
    },
    postedDate: { // depends on how the input field is set up, might be STRING
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
    },
    hiringPeriodStart: {
        type: DataTypes.DATE,
        allowNull: true
    },
    hiringPeriodEnd: {
        type: DataTypes.DATE,
        allowNull: true
    },
    deadline: { // depends on how the input field is set up, might be STRING
        type: DataTypes.DATE,
        allowNull: true
    },
    applicationInstructions: {
        type: DataTypes.TEXT,
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

const formatPostForFrontend = (post) => {
    return {
        id: post.id,
        title: post.title,
        description: post.description,
        responsibilities: post.responsibilities,
        qualificationRequirement: post.qualificationRequirement,
        compensation: post.compensation,
        hiringPeriodStart: post.hiringPeriodStart,
        hiringPeriodEnd: post.hiringPeriodEnd,
        applicationInstructions: post.applicationInstructions,
        deadline: post.deadline,
        contactName: post.contactName,
        contactEmail: post.contactEmail,
        postedDate: post.postedDate
    };
};

// Function to seed the database with mock research posts
const seedResearchPosts = async () => {
    try {
        await sequelizePost.sync({ force: true });
        console.log('Research posts table created');

        // Mock data for research posts
        const mockPosts = [
            {
                id: 1,
                title: "Software Engineering Research Assistant",
                description: "We are seeking a motivated undergraduate student to assist in a cutting-edge software engineering research project.",
                responsibilities: [
                    "Assist in software engineering research and development.",
                    "Collaborate with team members to analyze project requirements.",
                    "Document research findings and progress."
                ],
                qualificationRequirement: [
                    "Undergraduate student in Computer Science or Software Engineering.",
                    "Basic knowledge of programming languages like JavaScript or Python.",
                    "Strong analytical and problem-solving skills."
                ],
                compensation: "$15/hour",
                hiringPeriodStart: new Date("2024-01-15"),
                hiringPeriodEnd: new Date("2024-05-30"),
                applicationInstructions: "Submit your resume and a brief cover letter to Prof. Emily Rodriguez.",
                deadline: new Date("2024-02-15"),
                contactName: "Emily Rodriguez",
                contactEmail: "emily.rodriguez@university.edu",
                postedDate: new Date("2023-11-01")
            },
            {
                id: 2,
                title: "Machine Learning Research Position",
                description: "Join our team to work on cutting-edge machine learning algorithms.",
                responsibilities: [
                    "Develop and optimize machine learning models.",
                    "Analyze datasets to extract meaningful insights.",
                    "Collaborate with researchers to publish findings."
                ],
                qualificationRequirement: [
                    "Undergraduate or graduate student in Computer Science, Data Science, or AI.",
                    "Experience with Python and machine learning libraries.",
                    "Strong mathematical foundation in statistics and linear algebra."
                ],
                compensation: "$18/hour",
                hiringPeriodStart: new Date("2024-02-01"),
                hiringPeriodEnd: new Date("2024-06-15"),
                applicationInstructions: "Send your application to Prof. Michael Chang via email.",
                deadline: new Date("2024-02-20"),
                contactName: "Michael Chang",
                contactEmail: "michael.chang@university.edu",
                postedDate: new Date("2023-10-25")
            },
            {
                id: 3,
                title: "AI Research Opportunity",
                description: "Help develop AI models for natural language processing.",
                responsibilities: [
                    "Design and implement NLP models.",
                    "Evaluate model performance and suggest improvements.",
                    "Prepare technical documentation and reports."
                ],
                qualificationRequirement: [
                    "Background in Artificial Intelligence or Computer Science.",
                    "Experience with NLP frameworks and tools.",
                    "Strong programming skills in Python."
                ],
                compensation: "$17/hour",
                hiringPeriodStart: new Date("2024-01-20"),
                hiringPeriodEnd: new Date("2024-05-20"),
                applicationInstructions: "Apply online through the university's research portal.",
                deadline: new Date("2024-02-10"),
                contactName: "Sarah Johnson",
                contactEmail: "sarah.johnson@university.edu",
                postedDate: new Date("2023-10-15")
            },
            {
                id: 4,
                title: "Software Development Research",
                description: "Work on innovative software development methodologies.",
                responsibilities: [
                    "Research and develop new software development techniques.",
                    "Collaborate with the team to test and validate methodologies.",
                    "Document and present research outcomes."
                ],
                qualificationRequirement: [
                    "Student in Software Engineering or Computer Engineering.",
                    "Experience with software development tools and practices.",
                    "Strong teamwork and communication skills."
                ],
                compensation: "$16/hour",
                hiringPeriodStart: new Date("2024-02-10"),
                hiringPeriodEnd: new Date("2024-06-01"),
                applicationInstructions: "Submit your application to Prof. David Wilson via email.",
                deadline: new Date("2024-02-25"),
                contactName: "David Wilson",
                contactEmail: "david.wilson@university.edu",
                postedDate: new Date("2023-09-30")
            },
            {
                id: 5,
                title: "Software Engineering Research Assistant",
                description: "Assist in cutting-edge software development research with a focus on AI-driven solutions.",
                responsibilities: [
                    "Conduct software engineering research and analysis.",
                    "Develop prototypes for experimental software applications.",
                    "Collaborate with research teams to document findings."
                ],
                qualificationRequirement: [
                    "Bachelor's degree in Computer Science or related field.",
                    "Experience with JavaScript, Python, or C++.",
                    "Understanding of AI/ML fundamentals."
                ],
                compensation: "Competitive hourly wage or stipend.",
                hiringPeriodStart: new Date("2025-05-01"),
                hiringPeriodEnd: new Date("2025-08-31"),
                applicationInstructions: "Submit a resume and cover letter via our application portal.",
                deadline: new Date("2025-04-30"),
                contactName: "Jane Doe",
                contactEmail: "jane.doe@researchlab.edu",
                postedDate: new Date("2023-08-15")
            }
        ];

        // Insert mock posts into the database
        await postModel.bulkCreate(mockPosts);
        console.log('Research posts seeded successfully');

    } catch (error) {
        console.error('Error seeding research posts:', error);
    }
};

export { sequelizePost, postModel, formatPostForFrontend, seedResearchPosts };