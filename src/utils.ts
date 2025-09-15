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
    },
    formatDateTime(v: any, withSeconds?: boolean): string {
        const dt = this.utcStringToDate(v);
        if (dt === undefined) return "";
        const thisDate: Date = dt;
        let dateSz = "";
        if (thisDate.getMonth() + 1 < 10) {
            dateSz += "0";
        }
        dateSz += thisDate.getMonth() + 1;
        dateSz += "/";
        if (thisDate.getDate() < 10) {
            dateSz += "0";
        }
        dateSz += thisDate.getDate();
        dateSz += "/";
        dateSz += thisDate.getFullYear();
        dateSz += " ";
        const ampm = thisDate.getHours() >= 12 ? " pm" : " am";
        let hours = thisDate.getHours();
        if (hours > 12) {
            hours = hours - 12;
        }
        if (hours < 10) {
            dateSz += "0";
        }
        if (thisDate.getHours() > 12) {
            dateSz += thisDate.getHours() - 12;
        } else {
            dateSz += thisDate.getHours();
        }
        dateSz += ":";
        if (thisDate.getMinutes() < 10) {
            dateSz += "0";
        }
        dateSz += thisDate.getMinutes();
        if (withSeconds) {
            dateSz += ":";
            if (thisDate.getSeconds() < 10) {
                dateSz += "0";
            }
            dateSz += thisDate.getSeconds();
        }
        dateSz += ampm;
        return dateSz;
    },
    utcStringToDate(v: any): Date | undefined {
        if (v === null || v === undefined || v === "") return undefined;
        if (v.indexOf("T") != -1) {
            const parts = v.split("T");
            const datePart = parts[0].split("-");
            const timePart = parts[1].split(":");
            const thisDate = new Date(datePart[0], parseInt(datePart[1]) - 1, datePart[2], timePart[0], timePart[1], timePart[2], 0);
            return new Date(thisDate.getTime() - new Date().getTimezoneOffset() * 60 * 1000);
        } else if (v.indexOf(" ") != -1) {
            const parts = v.split(" ");
            const datePart = parts[0].split("-");
            const timePart = parts[1].split(":");
            const thisDate = new Date(datePart[0], parseInt(datePart[1]) - 1, datePart[2], timePart[0], timePart[1], timePart[2], 0);
            return new Date(thisDate.getTime() - new Date().getTimezoneOffset() * 60 * 1000);
        }
        return undefined;
    },
    inMinutes(secs: number) {
        const rsecs = Math.round(secs);
        if (rsecs == 0) {
            return "0 mins";
        }
        return Math.round(rsecs / 60) + " mins " + Math.round(rsecs % 60) + " secs";
    },
}