import {CandidateStatus, PublishStatus} from "@/types.ts";

export default {
    formatCurrency(v: string) {
        const us = Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
        });
        return us.format(parseFloat(v));
    },
    publishStatusColor(status: string) {
        for (const [_key, value] of Object.entries(PublishStatus)) {
            if (value.label === status) {
                return value.color
            }
        }
        return ""
    },
    candidateStatusColor(status: string) {
        for (const [_key, value] of Object.entries(CandidateStatus)) {
            if (value.label === status) {
                return value.color
            }
        }
        return ""
    },
    formatDate(date: string) {
        return new Date(date).toLocaleDateString();
    }
}