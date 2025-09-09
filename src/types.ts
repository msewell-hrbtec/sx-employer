export type PagingInfo = {
    query: string;
    order: string;
    page: number;
    data?: any;
    message?: string;
    rowCount?: number;
    size: number;
};
export const ResourceTypes = {
    RESUME: "Resume",
    IMAGE: "Image",
    VIDEO: "Video",
    DOCUMENT: "Document",
    CERTIFICATE: "Certificate",
    OTHER: "Other",
}
export const CandidateStatus = {
    APPLIED: {label: "Applied", color: "bg-gray-100 text-gray-800"},
    NEW: {label: "New", color: "bg-green-100 text-green-800"},
    SCREENED: {label: "Screened", color: "bg-yellow-100 text-yellow-800"},
    INTERVIEWED: {label: "Interviewed", color: "bg-blue-100 text-blue-800"},
    HIRED: {label: "Hired", color: "bg-green-100 text-green-800"},
    REJECTED: {label: "Rejected", color: "bg-red-100 text-red-800"},
}
export const PublishStatus = {
    PUBLISHED: {label: "Published", color: "bg-green-100 text-green-800"},
    REVIEW: {label: "Review", color: "bg-yellow-100 text-yellow-800"},
    INCOMPLETE: {label: "Incomplete", color: "bg-red-100 text-red-800"},
    ARCHIVED: {label: "Archived", color: "bg-gray-100 text-gray-800"},
}
export const EmploymentType = {
    FULL_TIME: "Full-Time",
    PART_TIME: "Part-Time",
    CONTRACT: "Contract",
    TEMPORARY: "Temporary",
}

export const PayFrequency = {
    BI_WEEKLY: "Bi-Weekly",
    WEEKLY: "Weekly",
    MONTHLY: "Monthly",
    SEMI_MONTHLY: "Semi-monthly",
}

export const ExperienceLevel = {
    YEAR_1: "0-1 Year",
    YEAR_2: "1-2 Years",
    YEAR_3: "2-3 Years",
    YEAR_5: "3-5 Years",
    YEAR_7: "5-7 Years",
    YEAR_10: "7-10 Years",
    YEAR_10_PLUS: "Over 10 Years",
}
export const WorkEnvironment = {
    ON_SITE: "Field/On-site",
    REMOTE: "Remote",
    HYBRID: "Hybrid",
}
export const IncentiveCompensation = {
    NONE: "None",
    BONUS: "Bonus",
    COMMISSION: "Commission",
    PROFIT: "Profit Sharing",
    OTHER: "Other",
}
export const EducationLevel = {
    NONE: "None",
    HIGH_SCHOOL: "H.S. Diploma/Equivalent",
    ASSOCIATE: "Associates Degree",
    BACHELOR: "BA/BS/Undergraduate",
    MASTER: "Master's Degree",
    PHD: "PH.D.",
}
export const PayType = {
    HOURLY: "Hourly Wage",
    MONTHLY: "Monthly Salary",
    YEARLY: "Yearly Salary",
}
export const Travel = {
    TRAVEL_NONE: "None",
    TRAVEL_10: "0-10%",
    TRAVEL_25: "10-25%",
    TRAVEL_50: "25-50%",
    TRAVEL_75: "50-75%",
    TRAVEL_100: "75-100%",
}
export const CompetencyLevel = {
    NOVICE: "Novice",
    INTERMEDIATE: "Intermediate",
    PROFICIENT: "Proficient",
    ADVANCED: "Advanced",
    EXPERT: "Expert",
}
export const States = {
    ALABAMA: "AL",
    ALASKA: "AK",
    ARIZONA: "AZ",
    ARKANSAS: "AR",
    CALIFORNIA: "CA",
    COLORADO: "CO",
    CONNECTICUT: "CT",
    DELAWARE: "DE",
    DISTRICT_OF_COLUMBIA: "DC",
    FLORIDA: "FL",
    GEORGIA: "GA",
    HAWAII: "HI",
    IDAHO: "ID",
    ILLINOIS: "IL",
    INDIANA: "IN",
    IOWA: "IA",
    KANSAS: "KS",
    KENTUCKY: "KY",
    LOUISIANA: "LA",
    MAINE: "ME",
    MARYLAND: "MD",
    MASSACHUSETTS: "MA",
    MICHIGAN: "MI",
    MINNESOTA: "MN",
    MISSISSIPPI: "MS",
    MISSOURI: "MO",
    MONTANA: "MT",
    NEBRASKA: "NE",
    NEVADA: "NV",
    NEW_HAMPSHIRE: "NH",
    NEW_JERSEY: "NJ",
    NEW_MEXICO: "NM",
    NEW_YORK: "NY",
    NORTH_CAROLINA: "NC",
    NORTH_DAKOTA: "ND",
    OHIO: "OH",
    OKLAHOMA: "OK",
    OREGON: "OR",
    PENNSYLVANIA: "PA",
    PUERTO_RICO: "PR",
    RHODE_ISLAND: "RI",
    SOUTH_CAROLINA: "SC",
    SOUTH_DAKOTA: "SD",
    TENNESSEE: "TN",
    TEXAS: "TX",
    UTAH: "UT",
    VERMONT: "VT",
    VIRGINIA: "VA",
    WASHINGTON: "WA",
    WEST_VIRGINIA: "WV",
    WISCONSIN: "WI",
    WYOMING: "WY",
}
export type Employer = {
    id: string;
    name: string;
    desc: string;
    archived: boolean;
    jobTargetEnabled: boolean;
    thumbnail?: any;
    udf?: string;
    url?: string;
    opportunity?: string;
    cultural?: string;
    city?: string;
    state?: string;
    postalCode?: string;
}
export type Job = {
    id: string;
    title: string;
    city: string;
    state: string;
    postal: string;
    industry: string;
    category: string;
    description: string;
    publishStatus: string;
    autoRenew: boolean;
    skipAssessment: boolean;
    skipForm: boolean;
    performanceBonus: boolean;
    signingBonus?: number;
    ref?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    benefits?: string;
    incentiveCompensation?: string;
    payType?: string;
    payFrequency?: string;
    employmentType?: string;
    qualifications?: string;
    salaryLower?: number;
    salaryUpper? : number;
    responsibilities?: string;
    requiredSkills?: string;
    experience?: string;
    education?: string;
    publishDate?: Date;
    expireOn?: Date;
    workEnvironment?: string;
    travel?: string;
    minEducation?: string;
    experienceLevel?: string;
    udf?: string;
    salaryEstimate?: string;
    redirect?: string;
    cpc?: number;
    cpl?: number;
    cpa?: number;
    origination?: string;
    source?: string;
    employer?: Employer;
}