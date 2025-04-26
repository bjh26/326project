export class Post {
    constructor(id, title, description, responsibilities, qualification_requirement, compensation, hiring_period, application_instructions, deadline, contact_name, contact_email, postedDate) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.responsibilities = responsibilities;
        this.qualification_requirement = qualification_requirement;
        this.compensation = compensation;
        this.hiring_period = hiring_period;
        this.application_instructions = application_instructions;
        this.deadline = deadline;
        this.contact_name = contact_name;
        this.contact_email = contact_email;
        this.postedDate = postedDate;
    }
}