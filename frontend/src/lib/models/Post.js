export class Post {
    constructor(id, title, description, responsibilities, qualificationRequirement, compensation, hiringPeriodStart, hiringPeriodEnd, applicationInstructions, deadline, contactName, contactEmail, postedDate) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.responsibilities = responsibilities;
        this.qualificationRequirement = qualificationRequirement;
        this.compensation = compensation;
        this.hiringPeriodStart = hiringPeriodStart;
        this.hiringPeriodEnd = hiringPeriodEnd;
        this.applicationInstructions = applicationInstructions;
        this.deadline = deadline;
        this.contactName = contactName;
        this.contactEmail = contactEmail;
        this.postedDate = postedDate;
    }
}