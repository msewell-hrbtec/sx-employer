import Login from "@/views/Login.vue"
import {createRouter, createWebHistory} from "vue-router"
import hrbCore from "@/hrbCore.ts";
import MainLayout from "@/layout/MainLayout.vue";
import Dashboard from "@/views/Dashboard.vue";

const routes = [
    {
        path: '/login',
        component: Login,
    },{
        path: '/',
        component: MainLayout,
        children: [
            {
                path: '/',
                component: Dashboard,
            },{
                path: '/job',
                component: () => import("@/views/Job.vue"),
            },{
                path: '/job-candidates',
                component: () => import("@/views/Candidates.vue"),
            },{
                path: '/assessments',
                component: () => import("@/views/Assessment.vue"),
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
    if (to.path === '/login' || to.path === '/register-employer') {
        next();
    } else {
        const stateStr = localStorage.getItem(hrbCore.APP_KEY)
        if (stateStr) {
            const state = JSON.parse(stateStr)
            if (state && state.user.token) {
                next()
            } else {
                next('/login')
            }
        } else {
            next('/login')
        }
    }
});

export default router
