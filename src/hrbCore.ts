import axios from 'axios'
import {reactive} from "vue"
import {type Job, type PagingInfo} from "@/types.ts"

const BASE_API_URL = import.meta.env.VITE_BASE_URL

const state = reactive({
    user: {
        id: "",
        token: "",
        email: "",
        firstName: "",
        lastName: "",
        image: "",
    },
    domain: {
        id: "",
        name: "",
        key: "",
        image: "",
        favicon: "",
        appPageTitle: "",
        url: "",
        desc: "",
    },
    employer: {
        id: "",
        name: "",
        image: "",
        jobTargetEnabled: false,
    },
})

const empState = reactive({
    totalCandidates: 0,
    totalAssessments: 0,
    activeJobs: 0,
    newApplicationsWeek: 0,
    totalViewsMonth: 0,
})

axios.interceptors.request.use((config) => {
    if (state.user && state.user.token) {
        config.headers["Authorization"] = `Bearer ${state.user.token}`
    }
    config.headers["AdminContext"] = false
    return config
})

let globalToast: any = null;

export default {
    APP_KEY: 'sx-employer',
    init() {
        let obj: any = {};
        try {
            obj = JSON.parse(localStorage.getItem(this.APP_KEY) || "{}")
            if (obj && obj.user) {
                this.setUser(obj.user)
            }
            if (obj && obj.employer) {
                state.employer.id = obj.employer.id
                state.employer.name = obj.employer.name
                state.employer.image = obj.employer.image
                state.employer.jobTargetEnabled = obj.employer.jobTargetEnabled
            }
            if (obj && obj.domain) {
                this.setDomain(obj.domain)
            }
        } catch (Err) {}
        let subdomain = window.location.pathname.split("/")[1];
        let hostname = window.location.hostname.split(".")[0];
        if (hostname === "localhost") {
            subdomain = "bekynd";
        }
        this.getDomainByRoute(subdomain).then((response) => {
            if (response) {
                this.setDomain(response);
                this.favicon();
                this.title();
            }
        });
        this.getEmployerStats().then((response: any) => {
            empState.totalCandidates = response.payload.totalCandidates;
            empState.totalAssessments = response.payload.totalAssessments;
            empState.activeJobs = response.payload.activeJobs;
            empState.newApplicationsWeek = response.payload.newApplicationsWeek;
            empState.totalViewsMonth = response.payload.totalViewsMonth;
        })
    },
    favicon() {
        const link = document.getElementById("favicon")
        if (link && state.domain.favicon) {
            const head = document.head || document.getElementsByTagName('head')[0];
            head.removeChild(link)
            const newlink = document.createElement("link")
            newlink.rel = "icon"
            newlink.type = "image/x-icon"
            newlink.id = "favicon"
            newlink.href = state.domain.favicon
            head.appendChild(newlink)
        }
    },
    employerStats() {
        return empState;
    },
    setDomain(domain: any) {
        if (!domain) return;
        state.domain.id = domain.id || "";
        state.domain.name = domain.name || "";
        state.domain.key = domain.key || "";
        state.domain.image = domain.image || "";
        state.domain.favicon = domain.favicon || "";
        state.domain.appPageTitle = domain.appPageTitle || "";
        state.domain.url = domain.url || "";
        state.domain.desc = domain.desc || "";
    },
    getDomain() {
        return state.domain;
    },
    setUser(user: any) {
        if (!user) return;
        state.user.id = user.id || "";
        state.user.token = user.token || "";
        state.user.firstName = user.firstName || "";
        state.user.lastName = user.lastName || "";
        state.user.image = user.image || "";
    },
    getUser() {
        return state.user;
    },
    getEmployer() {
        return state.employer;
    },
    title() {
        const link = document.getElementById("title")
        if (link) {
            const head = document.head || document.getElementsByTagName('head')[0];
            head.removeChild(link)
            const newlink: any = document.createElement("title")
            newlink.innerHTML = state.domain.appPageTitle || state.domain.name
            newlink.id = "title"
            head.appendChild(newlink)
        }
    },
    putMessage(message: string, isError: boolean) {
        if (globalToast) {
            globalToast.add({severity: (isError ? 'error' : 'secondary'), summary: (isError ? 'Error' : 'Info'), detail: message, life: 5000});
        } else {
            console.error('Toast not available:', message);
        }
    },
    logout() {
        state.user.token = "";
        this.saveState()
        window.location.href = "/login"
    },
    setToast(toast: any) {
        globalToast = toast;
    },
    saveState(obj?: any) {
        if (obj) {
            state.user.id = obj.id;
            state.user.token = obj.token;
            state.user.email = obj.email;
            state.user.firstName = obj.firstName;
            state.user.lastName = obj.lastName;
            state.user.image = obj.image;
            state.domain.id = obj.domain.id;
            state.domain.name = obj.domain.name;
            state.domain.key = obj.domain.key;
            state.domain.image = obj.domain.image;
            state.domain.favicon = obj.domain.favicon;
            state.domain.appPageTitle = obj.domain.appPageTitle;
            state.domain.url = obj.domain.url;
            state.domain.desc = obj.domain.desc;
            state.employer.id = obj.employer.id;
            state.employer.name = obj.employer.name;
            state.employer.image = obj.employer.image;
            state.employer.jobTargetEnabled = obj.employer.jobTargetEnabled;
        }
        localStorage.setItem(this.APP_KEY, JSON.stringify(state));
    },
    async sendChallenge(email: string) {
        return post(`public/challenge?did=${encodeURIComponent(state.domain.id)}&email=${encodeURIComponent(email)}`, {})
    },
    async login(email: string, code: string, eid: string) {
        return post(`public/login?did=${encodeURIComponent(state.domain.id)}&email=${encodeURIComponent(email)}&code=${code}&eid=${encodeURIComponent(eid)}`, {})
    },
    async getDomainByRoute(route: string) {
        return get(`public/domain-by-route?route=${route}`);
    },
    async getEmployers() {
        return get(`sxe/employers`);
    },
    async getProfile() {
        return get(`sxe/profile`);
    },
    async getEmployerProfile() {
        return get(`sxe/employer`);
    },
    async getJobById(id: string) {
        return get(`sxe/job-by-id?id=${encodeURIComponent(id)}`);
    },
    async getTeam() {
        return get(`sxe/team`);
    },
    async addTeamMember(teamMember: any) {
        return post(`sxe/team`, teamMember);
    },
    async getJobsByEmployerIdAndStatusWithPaging(status: string, pagingInfo: PagingInfo) {
        return post(`sxe/jobs-by-employer?status=${status}`, pagingInfo);
    },
    async getJobCandidatesByJobId(jobId: string) {
        return get(`sxe/job-candidates?jid=${encodeURIComponent(jobId)}`);
    },
    async removeTeamMembers(teamMembers: any) {
        return post(`sxe/remove-team-members`, teamMembers);
    },
    async jobTarget(id: string) {
        return post(`sxe/job-target?jobId=${id}`, {})
    },
    async getJobCategories() {
        return get(`sxe/job-categories`)
    },
    async getJobIndustries() {
        return get(`sxe/job-industries`)
    },
    async getUserResources() {
        return get(`sxe/user-resources?uid=${encodeURIComponent(state.user.id)}`)
    },
    async generateAI(job: Job) {
        return post(`sxe/generate-ai`, job)
    },
    async getRecommendedJobsByCandidateId() {
        return get(`sxe/recommended-jobs`);
    },
    async getJobsByCandidateIdAndArchivedWithPaging(archived: boolean, pagingInfo: PagingInfo) {
        return post(`sxe/jobs-by-candidate?archived=${archived}`, pagingInfo);
    },
    async changeEmployer(emp: any) {
        state.employer.id = emp.id
        state.employer.name = emp.name
        state.employer.image = emp.image
        this.saveState()
        return post(`sxe/change-employer`, emp)
    },
    async sendCandidateEmail(email: string, subject: string, message: string) {
        return post(`sxe/send-candidate-email?email=${encodeURIComponent(email)}&subject=${encodeURIComponent(subject)}&message=${encodeURIComponent(message)}`, {})
    },
    async getJobTitles() {
        return get(`sxe/job-titles-by-employer`)
    },
    async getCandidatesByEmployerIdAndCompetencyLevelAndJobWithPaging(competencyLevel: string, jobTitle: string, pagingInfo: PagingInfo) {
        return post(`sxe/candidates-by-employer?eid=${encodeURIComponent(state?.employer?.id)}&competencyLevel=${encodeURIComponent(competencyLevel)}&jobTitle=${encodeURIComponent(jobTitle)}`, pagingInfo);
    },
    async updateCandidateStatus(uid: string, jobId: string, status: string){
        return post(`sxe/update-candidate-status?uid=${encodeURIComponent(uid)}&jid=${encodeURIComponent(jobId)}&status=${encodeURIComponent(status)}`, {})
    },
    async archiveUserResources(resources: any) {
        return post(`sxe/archive-user-resources`, resources)
    },
    async getEmployerStats() {
        return get(`sxe/employer-stats`)
    },
    async updateEmployer(employer: any) {
        const formData = new FormData()
        formData.append("thumbnail", employer.thumbnail)
        formData.append("payload", JSON.stringify(employer))
        return post("sxe/employer", formData, { headers: { "Content-Type": "multipart/form-data" } })
    },
    async updateProfile(profile: any) {
        const formData = new FormData()
        formData.append("image", profile.image)
        formData.append("resume", profile.resume)
        formData.append("payload", JSON.stringify(profile))
        return post(`sxe/profile`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })
    },
    async updateResource(payload: any) {
        const formData = new FormData()
        formData.append("resource", payload.resource)
        formData.append("payload", JSON.stringify(payload))
        return post("sxe/user-resources", formData, { headers: { "Content-Type": "multipart/form-data" } })
    },
    async updateJobField(jobId: string, field: string, value: any, add?: boolean) {
        return post(`sxe/update-job-field?jid=${encodeURIComponent(jobId)}&field=${encodeURIComponent(field)}&value=${encodeURIComponent(value)}&add=${add}`, {})
    }
}

async function get(url: string) {
    try {
        return await axios.get(BASE_API_URL + url).then((response) => {
            return response.data
        });
    } catch (err) {
        console.error(err)
    }
}

async function post(url: string, payload: object, config?: object) {
    try {
        return await axios.post(BASE_API_URL + url, payload, config).then((response) => {
            return response.data
        });
    } catch (err) {
        console.error(err)
    }
}