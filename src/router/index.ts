import Login from "@/views/Login.vue"
import {createRouter, createWebHistory} from "vue-router"
import hrbCore from "@/hrbCore.ts"
import MainLayout from "@/layout/MainLayout.vue"
import Dashboard from "@/views/Dashboard.vue"
import Register from "@/views/Register.vue"
import Candidates from "@/views/Candidates.vue"
import Assessment from "@/views/Assessment.vue"
import Job from "@/views/Job.vue"

const routes = [
    {
        path: '/login',
        component: Login,
    },
    {
        path: '/register',
        component: Register,
    },{
        path: '/',
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
