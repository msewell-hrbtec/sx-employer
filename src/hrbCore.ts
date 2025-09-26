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
        superAdmin: false,
    },
    employer: {
        id: "",
        name: "",
        image: "",
        jobTargetEnabled: false,
        appPageTitle: "",
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
                this.setEmployer(obj.employer)
            }
        } catch (Err) {}
        // only if we have an employer
        if (state.employer.id) {
            this.getEmployerStats().then((response: any) => {
                empState.totalCandidates = response.payload.totalCandidates
                empState.totalAssessments = response.payload.totalAssessments
                empState.activeJobs = response.payload.activeJobs
                empState.newApplicationsWeek = response.payload.newApplicationsWeek
                empState.totalViewsMonth = response.payload.totalViewsMonth
            })
        }
    },
    employerStats() {
        return empState;
    },
    setUser(user: any) {
        if (!user) return;
        state.user.id = user.id || ""
        state.user.token = user.token || ""
        state.user.firstName = user.firstName || ""
        state.user.lastName = user.lastName || ""
        state.user.image = user.image || ""
        state.user.superAdmin = user.superAdmin || false
    },
    setEmployer(employer: any) {
        if (!employer) return;
        state.employer.id = employer.id || ""
        state.employer.name = employer.name || ""
        state.employer.image = employer.image || employer.image || ""
        state.employer.jobTargetEnabled = employer.jobTargetEnabled || false
        this.saveState()
    },
    getUser() {
        return state.user
    },
    getEmployer() {
        return state.employer
    },
    title() {
        const link = document.getElementById("title")
        if (link) {
            const head = document.head || document.getElementsByTagName('head')[0];
            head.removeChild(link)
            const newlink: any = document.createElement("title")
            newlink.innerHTML = state.employer.appPageTitle || state.employer.name
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
        localStorage.removeItem(this.APP_KEY)
        window.location.href = `/login`
    },
    setToast(toast: any) {
        globalToast = toast;
    },
    saveState(obj?: any) {
        if (obj) {
            this.setUser(obj)
            this.setEmployer(obj.employer)
        }
        localStorage.setItem(this.APP_KEY, JSON.stringify(state));
    },
    async sendChallenge(email: string) {
        return post(`public/challenge?email=${encodeURIComponent(email)}`, {})
    },
    async getAssessmentResult(arid: string) {
        return get(`sxe/assessment-result?arid=${encodeURIComponent(arid)}`)
    },
    async login(email: string, code: string, eid: string) {
        return post(`public/login?email=${encodeURIComponent(email)}&code=${code}&eid=${encodeURIComponent(eid)}`, {})
    },
    async getEmployers() {
        return get(`sxe/employers`)
    },
    async getProfile() {
        return get(`sxe/profile`)
    },
    async getEmployerProfile() {
        return get(`sxe/employer`)
    },
    async getJobById(id: string) {
        return get(`sxe/job-by-id?id=${encodeURIComponent(id)}`)
    },
    async register(employer: any) {
        const formData = new FormData()
        formData.append("image", employer.image)
        formData.append("payload", JSON.stringify(employer))
        return post(`public/register-employer`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })
    },
    async getTeam() {
        return get(`sxe/team`)
    },
    async addTeamMember(teamMember: any) {
        return post(`sxe/team`, teamMember)
    },
    async getPublishedJobsByEmployerId() {
        return get(`sxe/all-jobs-by-employer`)
    },
    async getJobsByEmployerIdAndStateAndStatusWithPaging(state: string, status: string, pagingInfo: PagingInfo) {
        return post(`sxe/jobs-by-employer?status=${status}&state=${state}`, pagingInfo)
    },
    async getCandidatesByJobId(jobId: string, pagingInfo: PagingInfo) {
        return post(`sxe/candidates-by-job?jid=${encodeURIComponent(jobId)}`, pagingInfo)
    },
    async updateTemplate(template: any) {
        return post(`sxe/templates`, template);
    },
    async getTemplatesByEmployerIdAndArchivedWithPaging(eid: string, archived: boolean, pagingInfo: PagingInfo) {
        return post(`sxe/templates-by-employer?eid=${encodeURIComponent(eid)}&archived=${archived}`, pagingInfo)
    },
    async getCandidatesByAssessmentId(assId: string, pagingInfo: PagingInfo) {
        return post(`sxe/candidates-by-assessment?aid=${encodeURIComponent(assId)}`, pagingInfo)
    },
    async removeTeamMembers(teamMembers: any) {
        return post(`sxe/remove-team-members`, teamMembers)
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
        this.setEmployer(emp)
        this.saveState()
        return post(`sxe/change-employer`, emp)
    },
    async sendCandidateEmail(email: string, subject: string, message: string) {
        return post(`sxe/send-candidate-email?email=${encodeURIComponent(email)}&subject=${encodeURIComponent(subject)}&message=${encodeURIComponent(message)}`, {})
    },
    async getJobTitles() {
        return get(`sxe/job-titles-by-employer`)
    },
    async getAssessmentQuestions(aid: string) {
        return get(`sxe/assessment-questions?aid=${encodeURIComponent(aid)}`)
    },
    async getCandidatesByEmployerIdAndCompetencyLevelAndJobWithPaging(competencyLevel: string, jobTitle: string, pagingInfo: PagingInfo) {
        return post(`sxe/candidates-by-employer?eid=${encodeURIComponent(state?.employer?.id)}&competencyLevel=${encodeURIComponent(competencyLevel)}&jobTitle=${encodeURIComponent(jobTitle)}`, pagingInfo)
    },
    async updateCandidateStatus(uid: string, jobId: string, status: string){
        return post(`sxe/update-candidate-status?uid=${encodeURIComponent(uid)}&jid=${encodeURIComponent(jobId)}&status=${encodeURIComponent(status)}`, {})
    },
    async getAssessmentById(aid: string) {
        return get(`sxe/assessment-by-id?aid=${encodeURIComponent(aid)}`)
    },
    async getAssessmentsOnJobsWithPaging(pagingInfo: PagingInfo) {
        return post(`sxe/assessments-with-jobs`, pagingInfo)
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