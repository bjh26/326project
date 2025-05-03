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
    qualification_requirement: {
        type: DataTypes.TEXT, // Will store JSON string for array
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('qualification_requirement');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
            this.setDataValue('qualification_requirement', JSON.stringify(value));
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
    hiring_period_start: {
        type: DataTypes.DATE,
        allowNull: true
    },
    hiring_period_end: {
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
        qualification_requirement: post.qualification_requirement,
        compensation: post.compensation,
        hiring_period: {
            start: post.hiring_period_start,
            end: post.hiring_period_end
        },
        application_instructions: post.application_instructions,
        deadline: post.deadline,
        contact_name: post.contact_name,
        contact_email: post.contact_email,
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
                title: "Software Engineering Research Assistant",
                description: "We are seeking a motivated undergraduate student to assist in a cutting-edge software engineering research project.",
                responsibilities: [
                    "Assist in software engineering research and development.",
                    "Collaborate with team members to analyze project requirements.",
                    "Document research findings and progress."
                ],
                qualification_requirement: [
                    "Undergraduate student in Computer Science or Software Engineering.",
                    "Basic knowledge of programming languages like JavaScript or Python.",
                    "Strong analytical and problem-solving skills."
                ],
                compensation: "$15/hour",
                hiring_period_start: new Date("2024-01-15"),
                hiring_period_end: new Date("2024-05-30"),
                application_instructions: "Submit your resume and a brief cover letter to Prof. Emily Rodriguez.",
                deadline: new Date("2024-02-15"),
                contact_name: "Emily Rodriguez",
                contact_email: "emily.rodriguez@university.edu",
                postedDate: new Date("2023-11-01")
            },
            {
                title: "Machine Learning Research Position",
                description: "Join our team to work on cutting-edge machine learning algorithms.",
                responsibilities: [
                    "Develop and optimize machine learning models.",
                    "Analyze datasets to extract meaningful insights.",
                    "Collaborate with researchers to publish findings."
                ],
                qualification_requirement: [
                    "Undergraduate or graduate student in Computer Science, Data Science, or AI.",
                    "Experience with Python and machine learning libraries.",
                    "Strong mathematical foundation in statistics and linear algebra."
                ],
                compensation: "$18/hour",
                hiring_period_start: new Date("2024-02-01"),
                hiring_period_end: new Date("2024-06-15"),
                application_instructions: "Send your application to Prof. Michael Chang via email.",
                deadline: new Date("2024-02-20"),
                contact_name: "Michael Chang",
                contact_email: "michael.chang@university.edu",
                postedDate: new Date("2023-10-25")
            },
            {
                title: "AI Research Opportunity",
                description: "Help develop AI models for natural language processing.",
                responsibilities: [
                    "Design and implement NLP models.",
                    "Evaluate model performance and suggest improvements.",
                    "Prepare technical documentation and reports."
                ],
                qualification_requirement: [
                    "Background in Artificial Intelligence or Computer Science.",
                    "Experience with NLP frameworks and tools.",
                    "Strong programming skills in Python."
                ],
                compensation: "$17/hour",
                hiring_period_start: new Date("2024-01-20"),
                hiring_period_end: new Date("2024-05-20"),
                application_instructions: "Apply online through the university's research portal.",
                deadline: new Date("2024-02-10"),
                contact_name: "Sarah Johnson",
                contact_email: "sarah.johnson@university.edu",
                postedDate: new Date("2023-10-15")
            },
            {
                title: "Software Development Research",
                description: "Work on innovative software development methodologies.",
                responsibilities: [
                    "Research and develop new software development techniques.",
                    "Collaborate with the team to test and validate methodologies.",
                    "Document and present research outcomes."
                ],
                qualification_requirement: [
                    "Student in Software Engineering or Computer Engineering.",
                    "Experience with software development tools and practices.",
                    "Strong teamwork and communication skills."
                ],
                compensation: "$16/hour",
                hiring_period_start: new Date("2024-02-10"),
                hiring_period_end: new Date("2024-06-01"),
                application_instructions: "Submit your application to Prof. David Wilson via email.",
                deadline: new Date("2024-02-25"),
                contact_name: "David Wilson",
                contact_email: "david.wilson@university.edu",
                postedDate: new Date("2023-09-30")
            },
            {
                title: "Software Engineering Research Assistant",
                description: "Assist in cutting-edge software development research with a focus on AI-driven solutions.",
                responsibilities: [
                    "Conduct software engineering research and analysis.",
                    "Develop prototypes for experimental software applications.",
                    "Collaborate with research teams to document findings."
                ],
                qualification_requirement: [
                    "Bachelor's degree in Computer Science or related field.",
                    "Experience with JavaScript, Python, or C++.",
                    "Understanding of AI/ML fundamentals."
                ],
                compensation: "Competitive hourly wage or stipend.",
                hiring_period_start: new Date("2025-05-01"),
                hiring_period_end: new Date("2025-08-31"),
                application_instructions: "Submit a resume and cover letter via our application portal.",
                deadline: new Date("2025-04-30"),
                contact_name: "Jane Doe",
                contact_email: "jane.doe@researchlab.edu",
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