import Login from "@/views/Login.vue"
import {createRouter, createWebHistory} from "vue-router"
import hrbCore from "@/hrbCore.ts"
import MainLayout from "@/layout/MainLayout.vue"
import Dashboard from "@/views/Dashboard.vue"
import Candidates from "@/views/Candidates.vue"
import Assessment from "@/views/Assessment.vue"
import Job from "@/views/Job.vue"
import Feed from "@/views/Feed.vue"
import JobIndustry from "@/views/JobIndustry.vue"
import JobCategory from "@/views/JobCategory.vue"
import User from "@/views/User.vue"
import PromptTemplate from "@/views/PromptTemplate.vue"
import Template from "@/views/Template.vue"

const routes = [
    {
        path: '/login',
        component: Login,
    },{
        path: '/',
        component: MainLayout,
        children: [
            {
                path: '',
                component: Dashboard,
            },{
                path: '/job',
                component: Job,
            },{
                path: '/job-candidates',
                component: Candidates,
            },{
                path: '/assessments',
                component: Assessment
            },{
                path: '/templates',
                component: Template
            },{
                path: '/prompt-templates',
                component: PromptTemplate
            },{
                path: '/users',
                component: User
            },{
                path: '/job-industries',
                component: JobIndustry
            },{
                path: '/job-categories',
                component: JobCategory
            }, {
                path: '/feeds',
                component: Feed
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
    if (to.path.indexOf('/login') !== -1 || to.path.indexOf('/register') !== -1) {
        next();
    } else {
        const stateStr = localStorage.getItem(hrbCore.APP_KEY)
        if (stateStr) {
            const state = JSON.parse(stateStr)
            if (state && state.user.token) {
                next()
            } else {
                next(`/login`)
            }
        } else {
            next(`/login`)
        }
    }
});

export default router
