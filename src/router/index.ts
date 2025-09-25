import Login from "@/views/Login.vue"
import {createRouter, createWebHistory} from "vue-router"
import hrbCore from "@/hrbCore.ts"
import MainLayout from "@/layout/MainLayout.vue"
import Dashboard from "@/views/Dashboard.vue"
import RegisterEmployer from "@/views/RegisterEmployer.vue"
import InviteEmployer from "@/views/InviteEmployer.vue"
import Candidates from "@/views/Candidates.vue"
import Assessment from "@/views/Assessment.vue"
import Job from "@/views/Job.vue"

const routes = [
    {
        path: '/',
        redirect: () => {
            const domainRoute = hrbCore.getDomain()?.route || 'careerpilotjobs'
            return `/${domainRoute}`
        }
    },
    {
        path: '/:domainRoute?/login',
        component: Login,
    },
    {
        path: '/:domainRoute?/register-employer',
        component: RegisterEmployer,
    },{
        path: '/:domainRoute?/invite-employer',
        component: InviteEmployer,
    },{
        path: '/:domainRoute?',
        component: MainLayout,
        children: [
            {
                path: '',
                component: Dashboard,
            },{
                path: 'job',
                component: Job,
            },{
                path: 'job-candidates',
                component: Candidates,
            },{
                path: 'assessments',
                component: Assessment
            }
        ]
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
        return { left: 0, top: 0 }
    }
});

router.beforeEach((to: any, _from: any, next: any) => {
    if (to.path.indexOf('/login') !== -1 || to.path.indexOf('/register-employer') !== -1 || to.path.indexOf('/invite-employer') !== -1) {
        next();
    } else {
        const stateStr = localStorage.getItem(hrbCore.APP_KEY)
        if (stateStr) {
            const state = JSON.parse(stateStr)
            if (state && state.user.token) {
                next()
            } else {
                next(`/${state.domain.route}/login`)
            }
        } else {
            next(`/careerpilotjobs/login`)
        }
    }
});

export default router
