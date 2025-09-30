<script setup lang="ts">

import utils from "@/utils.ts"
import InputText from "primevue/inputtext"
import DataTable from "primevue/datatable"
import InputIcon from "primevue/inputicon"
import IconField from "primevue/iconfield"
import Column from "primevue/column"
import {onMounted, ref} from "vue"
import hrbCore from "@/hrbCore.ts"
import Avatar from "primevue/avatar"
import Drawer from "primevue/drawer"
import Button from "primevue/button"
import Textarea from "primevue/textarea"
import Chip from "primevue/chip"
import CandidateDialog from "@/components/CandidateDialog.vue"
import Dialog from "primevue/dialog"
import Select from "primevue/select"

const loadingJobs = ref(false)
const jobs = ref([])
const selectedJob = ref("")
const openShareDialog = ref(false)
const shareUrl = ref("")
const candidateDialogRef: any = ref(null)
const loadingQuestions = ref(false)
const questions = ref([])
const openAssessmentDialog = ref(false)
const assessment: any = ref({})
const assessments = ref([])
const totalAssessmentRecords = ref(0)
const loadingAssessments = ref(false)
const assessmentPagingInfo = ref({
  query: "",
  order: "as_name desc",
  page: 1,
  size: 10,
})
const assessmentsOnPage = (event: any) => {
  loadAssessments(event)
}

const assessmentsOnSort = (event: any) => {
  assessmentPagingInfo.value.page = 1
  loadAssessments(event)
}

const shareAssessment = (job: any) => {
  shareUrl.value = `https://careerpilot.skillxchange.io/${hrbCore.getDomain().route}/assessments/${job.id}`
  setTimeout(function () {
    const e = document.getElementById("shareUrl") as HTMLInputElement;
    e.select();
    e.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(e.value);
  }, 500);
  loadingJobs.value = true
  hrbCore.getPublishedJobsByEmployerId().then((response: any) => {
    loadingJobs.value = false
    jobs.value = response.payload.data
  })
  openShareDialog.value = true
}

const assessmentsOnFilter = () => {
  assessmentPagingInfo.value.page = 1
  loadAssessments()
}

const loadAssessments = (event?: any) => {
  loadingAssessments.value = true
  let sortField = "as_name"
  let sortOrder = "desc"
  if (event) {
    if ('page' in event) {
      assessmentPagingInfo.value.page = event.page + 1
    }
    if ('sortField' in event && event.sortField) {
      sortField = event.sortField
      sortOrder = event.sortOrder === -1 ? "desc" : "asc"
    }
  }
  if (sortField === "name") {
    sortField = "as_name"
  }
  assessmentPagingInfo.value.order = sortField + " " + sortOrder
  hrbCore.getAssessmentsOnJobsWithPaging(assessmentPagingInfo.value).then((response: any) => {
    loadingAssessments.value = false
    const tassessments = response.data
    for (var i=0; i<tassessments.length; i++) {
      const udfObj = tassessments[i].udf ? JSON.parse(tassessments[i].udf) : {}
      tassessments[i].started = 'started' in udfObj ? udfObj.started : "0"
      tassessments[i].passed = 'passed' in udfObj ? udfObj.passed : "0"
      tassessments[i].failed = 'failed' in udfObj ? udfObj.failed : "0"
    }
    assessments.value = tassessments
    totalAssessmentRecords.value = response.rowCount
  })
}
const loadAssessment = (aid: string) => {
  loadingQuestions.value = true
  hrbCore.getAssessmentById(aid).then((response: any) => {
    if (response.success) {
      assessment.value = response.payload
      loadQuestions(aid)
      openAssessmentDialog.value = true
    } else {
      hrbCore.putMessage(response.message, true)
    }
  })
}
const loadQuestions = (aid: string) => {
  hrbCore.getAssessmentQuestions(aid).then((response: any) => {
    if (response.success) {
      questions.value = response.payload
      loadingQuestions.value = false
    } else {
      hrbCore.putMessage(response.message, true)
    }
  })
}
const viewCandidates = (aid: string) => {
  candidateDialogRef.value.showByAssessmentId(aid)
}
const selectedJobChanged = () => {
  shareUrl.value = `https://careerpilot.skillxchange.io/${hrbCore.getDomain().route}/assessments/${selectedJob.value}&jobid=${selectedJob.value}`
  setTimeout(function () {
    const e = document.getElementById("shareUrl") as HTMLInputElement;
    e.select();
    e.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(e.value);
  }, 500);
}
const formatJobLabel = (job: any) => {
  return `${job.title + ' - ' + job.city + ', ' + job.state}`;
};
onMounted(() => {
  loadAssessments()
})
</script>
<template>
  <div class="w-full">
    <div class="text-xl font-bold py-4">Assessment Management</div>
    <DataTable
        :value="assessments"
        paginator
        lazy
        :rows="10"
        :totalRecords="totalAssessmentRecords"
        dataKey="id"
        size="small"
        sort-mode="single"
        @page="assessmentsOnPage($event)"
        @sort="assessmentsOnSort($event)"
        :rowHover="true"
        :loading="loadingAssessments"
        :sort-order="1"
        showCurrentPageReport
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
    >
      <template #header>
        <div class="flex justify-end">
          <IconField>
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText v-model="assessmentPagingInfo.query" placeholder="Keyword Search" @input="assessmentsOnFilter()" showClear />
          </IconField>
        </div>
      </template>
      <template #empty> No assessments found. </template>
      <template #loading> Loading assessment data. Please wait. </template>
      <Column field="thumbnail" header="" style="text-align: center">
        <template #body="{ data }">
          <Avatar :image="data?.thumbnail" class="!w-8 !h-8 !rounded-md !overflow-hidden" />
        </template>
      </Column>
      <Column :sortable="true" field="name" header="Name">
        <template #body="{ data }">
          <span class="text-sm font-semibold">{{ data.name }}</span>
        </template>
      </Column>
      <Column field="numQuestions" header="Question Count" style="text-align: center">
        <template #body="{ data }">
          <span class="text-sm">{{ data.numQuestions }}</span>
        </template>
      </Column>
      <Column field="maxTime" header="Max Time" style="text-align: center">
        <template #body="{ data }">
          <span class="text-sm">{{ data.maxTime }}</span>
        </template>
      </Column>
      <Column field="passScore" header="Pass Score" style="text-align: center">
        <template #body="{ data }">
          <span class="text-sm">{{ data?.passScore }}</span>
        </template>
      </Column>
      <Column field="created" header="Created">
        <template #body="{ data }">
          <span class="text-sm">{{ data.created ? utils.formatDate(data.created) : '' }}</span>
        </template>
      </Column>
      <Column field="randomQuestions" header="Started" style="text-align: center">
        <template #body="{ data }">
          <span class="text-sm">{{ data.started }}</span>
        </template>
      </Column>
      <Column field="questionCounter" header="Passed" style="text-align: center">
        <template #body="{ data }">
          <span class="text-sm">{{ data.passed }}</span>
        </template>
      </Column>
      <Column field="createStatus" header="Failed" style="text-align: center">
        <template #body="{ data }">
          <span class="text-sm">{{ data.failed }}</span>
        </template>
      </Column>
      <Column header="Actions">
        <template #body="{ data }">
          <div class="flex flex-row">
            <a @click="loadAssessment(data.id)" target="_blank" class="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50" title="View Details"><i class="pi pi-eye"></i></a>
            <a @click="viewCandidates(data.id)" target="_blank" class="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50" title="View Candidates"><i class="pi pi-users"></i></a>
            <a href="#" @click="shareAssessment(data)" class="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50" title="Share Job"><i class="pi pi-share-alt"></i></a>
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
  <Drawer :visible="openAssessmentDialog" @update:visible="(value) => openAssessmentDialog = value" header="Assessment Details" position="right" class="!w-full md:!w-80 lg:!w-[70rem]">
    <template #container="{ closeCallback }">
      <div class="px-6 py-5 flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Assessment Information</h2>
          <p class="text-gray-600 mt-1">View assessment details</p>
        </div>
        <Button type="button" @click="closeCallback" icon="pi pi-times" text severity="secondary" />
      </div>
      <div class="overflow-auto">
        <div class="bg-white rounded-xl border border-gray-200 m-3 p-6">
          <div class="flex gap-8 w-full mb-4">
            <div class="flex flex-row gap-2 w-full">
              <div class="flex flex-col gap-2 w-1/3">
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Assessment Name
                </label>
                <InputText name="name" :readonly="true" v-model="assessment.name" placeholder="Name of assessment" class="w-full"/>
              </div>
              <div class="flex flex-col gap-2 w-2/3">
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Assessment Description
                </label>
                <Textarea rows="4" name="desc" :readonly="true" v-model="assessment.desc" placeholder="Description of assessment" class="w-full"/>
              </div>
            </div>
          </div>
          <div class="text-md font-bold p-4 bg-gray-100 rounded-md mb-4">Skills</div>
          <div class="flex flex-wrap">
            <Chip class="float-start m-1 text-sm" :label="skill" rounded v-for="skill in assessment.skills" :key="skill"></Chip>
          </div>
        </div>
        <div class="p-4">
          <div class="text-md font-bold p-4 bg-gray-100! rounded-md mb-4">Questions</div>
          <DataTable
              :value="questions"
              dataKey="id"
              size="small"
              :rowHover="true"
              :loading="loadingQuestions"
          >
            <template #empty> No questions found. </template>
            <template #loading> Loading question data. Please wait. </template>
            <Column field="title" header="Title">
              <template #body="{ data }">
                <span class="text-sm font-semibold">{{ data.title }}</span>
              </template>
            </Column>
            <Column field="type" header="Type" class="text-nowrap">
              <template #body="{ data }">
                <span class="text-sm">{{ data.type }}</span>
              </template>
            </Column>
            <Column field="skill" header="Skill" class="text-nowrap">
              <template #body="{ data }">
                <Chip :label="data.skill" rounded class="text-sm" style="background-color: #41b883;color:white;"></Chip>
              </template>
            </Column>
            <Column field="competencyLevel" header="Competency">
              <template #body="{ data }">
                <span class="text-sm">{{ data.competencyLevel }}</span>
              </template>
            </Column>
          </DataTable>
        </div>
        <div class="p-6 flex justify-start">
          <Button @click="closeCallback" severity="secondary" type="button" label="Close" />
        </div>
      </div>
    </template>
  </Drawer>
  <CandidateDialog ref="candidateDialogRef" />
  <Dialog v-model:visible="openShareDialog" modal header="Share Url" :style="{ width: '40rem' }">
    <span class="text-surface-500 dark:text-surface-400 block mb-8">This is the job share link.   If you would like to also associate a job, select it now.   The url has been copied to your clipboard.</span>
    <div class="flex items-center gap-4 mb-4">
      <label for="shareUrl" class="required text-nowrap">Share Job Link</label>
      <InputText id="shareUrl" class="flex-auto w-full" autocomplete="off" :value="shareUrl" readonly/>
    </div>
    <div class="flex items-center gap-4 mb-4">
      <label for="jobs" class="required">Jobs</label>
      <Select v-model="selectedJob" :options="jobs" :loading="loadingJobs" :optionLabel="formatJobLabel" optionValue="id" placeholder="Select a job" class="w-full" @change="selectedJobChanged()" />
    </div>
    <template #footer>
      <Button label="OK" text severity="secondary" @click="openShareDialog = false" autofocus />
    </template>
  </Dialog>
</template>
