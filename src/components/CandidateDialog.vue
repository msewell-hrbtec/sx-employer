<script setup lang="ts">

import {CandidateStatus} from "@/types.ts";
import utils from "@/utils.ts";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Drawer from "primevue/drawer";
import Button from "primevue/button";
import Select from "primevue/select";
import hrbCore from "@/hrbCore.ts";
import {ref} from "vue";
import PhoneNumberInput from "@/components/PhoneNumberInput.vue";
import Textarea from "primevue/textarea";
import InputText from "primevue/inputtext";
import Chip from "primevue/chip";

const assessmentResult: any = ref({})
const loadingCandidates = ref(false)
const totalRecords = ref(0)
const thisId = ref("")
const pagingInfo = ref({
  query: "",
  order: "u_updated desc",
  page: 1,
  size: 10,
})
const candidate = ref({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  postal: "",
})
const loadingDetailResults = ref(false)
const additionalQuestions: any = ref([])
const message = ref("")
const subject = ref("")
const loadType = ref("")
const openResultDialog = ref(false)
const openCandidateDialog = ref(false)
const openCandidatesDialog = ref(false)
const candidates = ref([])
const viewResume = (resume: any) => {
  const win = window.open(`https://static.skillxchange.io/pdfviewer.html?url=${resume}`, "_blank")
  if (win) {
    win.focus()
  }
}
const updateCandidateStatus = (candidate: any) => {
  hrbCore.updateCandidateStatus(candidate.id, thisId.value, candidate.status).then((response) => {
    if (!response.success) {
      hrbCore.putMessage(response.message, true)
    }
  });
}
const sendCandidateEmail = () => {
  hrbCore.sendCandidateEmail(candidate.value.email, subject.value, message.value).then((response: any) => {
    if (!response.success) {
      hrbCore.putMessage(response.message, true)
    } else {
      openCandidateDialog.value = false
      hrbCore.putMessage('Email sent', false)
    }
  });
}
const showByJobId = (id: string) => {
  thisId.value = id
  loadingCandidates.value = true
  loadType.value = "job"
  hrbCore.getCandidatesByJobId(id, pagingInfo.value).then((response) => {
    loadingCandidates.value = false
    if (!response.success) {
      hrbCore.putMessage(response.message, true)
    } else {
      candidates.value = response.payload.data
      totalRecords.value = response.payload.rowCount
      openCandidatesDialog.value = true
    }
  });
}
const showNewCandidate = () => {
}
const showByAssessmentId = (id: string) => {
  thisId.value = id
  loadType.value = "assessment"
  hrbCore.getCandidatesByAssessmentId(id, pagingInfo.value).then((response) => {
    loadingCandidates.value = false
    if (!response.success) {
      hrbCore.putMessage(response.message, true)
    } else {
      candidates.value = response.payload.data
      totalRecords.value = response.payload.rowCount
      openCandidatesDialog.value = true
    }
  });
}
const hide = () => {
  openCandidatesDialog.value = false
}
const candidatesOnPage = (event: any) => {
  if (event && event.page) {
    pagingInfo.value.page = event.page + 1
  }
  let sortField = "u_updated"
  let sortOrder = "desc"
  pagingInfo.value.order = sortField + " " + sortOrder;
  if (loadType.value === "job") {
    showByJobId(thisId.value)
  } else if (loadType.value === "assessment") {
    showByAssessmentId(thisId.value)
  }
}
const viewResults = (arid: any) => {
  loadingDetailResults.value = true
  hrbCore.getAssessmentResult(arid).then((response: any) => {
    loadingDetailResults.value = false
    if (response.success) {
      assessmentResult.value = response.payload
      openResultDialog.value = true
    } else {
      hrbCore.putMessage(response.message, true)
    }
  })
}
const viewCandidate = (obj: any) => {
  candidate.value.firstName = obj.firstName
  candidate.value.lastName = obj.lastName
  candidate.value.email = obj.email
  candidate.value.phone = obj.phone
  candidate.value.city = obj.city
  candidate.value.state = obj.state
  candidate.value.postal = obj.postal
  message.value = ""
  subject.value = ""
  additionalQuestions.value = []
  if (obj.udf != null && obj.udf !== "") {
    const udf = JSON.parse(obj.udf)
    if ("questions" in udf) {
      for (const key in udf.questions) {
        additionalQuestions.value.push({
          label: key,
          value: udf.questions[key],
        })
      }
    }
  }
  openCandidateDialog.value = true
}
defineExpose({ showByJobId, showByAssessmentId, showNewCandidate, hide })

</script>
<template >
  <Drawer :visible="openCandidatesDialog" @update:visible="(value) => openCandidatesDialog = value" header="Right Drawer" position="right" class="!w-full md:!w-80 lg:!w-[70rem]">
    <template #container="{ closeCallback }">
      <div class="overflow-auto">
        <div class="px-6 py-5 flex items-center justify-end">
          <Button type="button" @click="closeCallback" icon="pi pi-times" text severity="secondary" />
        </div>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-8 m-2">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Candidates</h2>
            <p class="text-gray-600 mt-1">Start by defining the basic details of your job posting</p>
          </div>
        </div>
        <DataTable
            :value="candidates"
            paginator
            :rows="10"
            lazy
            sort-mode="single"
            :rowHover="true"
            size="small"
            sortField="email"
            @page="candidatesOnPage($event)"
            :loading="loadingCandidates"
            :totalRecords="totalRecords"
            :sort-order="1"
            showCurrentPageReport
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
        >
          <template #empty> No candidates found. </template>
          <template #loading> Loading candidate data. Please wait. </template>
          <Column :sortable="true" field="firstName" header="Name">
            <template #body="{ data }">
              <span class="text-sm font-semibold">{{ data?.firstName + ' ' + data?.lastName }}</span>
            </template>
          </Column>
          <Column :sortable="true" field="status" header="Candidate Status">
            <template #body="{ data }">
              <Select v-model="data.status" :options="Object.values(CandidateStatus)" optionLabel="label" optionValue="label" placeholder="All Statuses" class="w-full" @change="updateCandidateStatus(data)">
                <template #value="data">
                  <div class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="utils.candidateStatusColor(data.value)">{{ data.value || data.placeholder}}</div>
                </template>
                <template #option="slotProps">
                  <div class="flex flex-row gap-2 items-center">
                    <div class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="slotProps.option.color">{{ slotProps.option.label }}</div>
                  </div>
                </template>
              </Select>
            </template>
          </Column>
          <Column :sortable="true" field="title" header="Job Title">
            <template #body="{ data }">
              <span class="text-sm">{{ data?.job ? data?.job.title : '' }}</span>
            </template>
          </Column>
          <Column :sortable="true" field="score" header="Score" style="text-align: center">
            <template #body="{ data }">
              <span class="text-sm">{{ data?.result ? data?.result.score : '' }}</span>
            </template>
          </Column>
          <Column field="payscale" header="Pay Scale">
            <template #body="{ data }">
              <span class="text-sm">{{ data?.result ? (data?.result?.salaryLower ? utils.formatCurrency(data?.result?.salaryUpper) + " - " + utils.formatCurrency(data?.result?.salaryUpper) : '') : ''}}</span>
            </template>
          </Column>
          <Column field="competency" header="Competency">
            <template #body="{ data }">
              <span class="text-sm">{{ data?.result ? data?.result?.competencyLevelName : ''}}</span>
            </template>
          </Column>
          <Column field="action" header="Action">
            <template #body="{ data }">
              <div class="flex flex-row">
                <a v-if="data.resume" @click="viewResume(data.resume)" class="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50" title="View Resume"><i class="pi pi-file-check"></i></a>
                <a @click="viewCandidate(data)" class="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50" title="View Candidate"><i class="pi pi-user-plus"></i></a>
                <a v-if="data.result" @click="viewResults(data.result.id)" class="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50" title="View Candidate"><i class="pi pi-receipt"></i></a>
              </div>
            </template>
          </Column>
        </DataTable>
        <div class="p-6 flex justify-start">
          <Button @click="closeCallback" class="p-button p-component p-button-secondary" data-p="" type="button" aria-label="Logout" data-pc-name="button" data-p-disabled="false" data-p-severity="secondary" data-pc-section="root">
            <span class="p-button-label" data-pc-section="label" data-p="" >Close</span>
          </Button>
        </div>
      </div>
    </template>
  </Drawer>
  <Drawer :visible="openResultDialog" @update:visible="(value) => openResultDialog = value" header="" position="right" class="!w-full md:!w-80 lg:!w-[90rem]">
    <template #container="{ closeCallback }">
      <div class="px-6 py-5 flex items-center justify-between">
        <span class="font-medium">Assessment Result</span>
        <Button type="button" @click="closeCallback" icon="pi pi-times" text severity="secondary" />
      </div>
      <div class="bg-white rounded-xl border border-gray-200 m-1 p-6">
        <div class="flex flex-row gap-4 mb-2">
          <div class="flex-col gap-4 w-full">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Assessment Name</label>
            <InputText :readonly="true" :value="assessmentResult.assessmentName" class="w-full"/>
          </div>
          <div class="flex-col gap-4 w-full">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <InputText :readonly="true" :value="assessmentResult.status" class="w-full"/>
          </div>
          <div class="flex-col gap-4 w-full">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Score</label>
            <InputText :readonly="true" :value="assessmentResult.score" class="w-full"/>
          </div>
        </div>
        <div class="flex flex-row gap-4 mb-2">
          <div class="flex-col gap-4 w-full">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Start</label>
            <InputText :readonly="true" :value="utils.formatDateTime(assessmentResult.started)" class="w-full"/>
          </div>
          <div class="flex-col gap-4 w-full">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Completed</label>
            <InputText :readonly="true" :value="utils.formatDateTime(assessmentResult.completed)" class="w-full"/>
          </div>
          <div class="flex-col gap-4 w-full">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
            <InputText :readonly="true" :value="utils.inMinutes(assessmentResult.duration)" class="w-full"/>
          </div>
          <div class="flex-col gap-4 w-full">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Progress</label>
            <InputText :readonly="true" :value="assessmentResult.progress" class="w-full"/>
          </div>
        </div>
        <div class="flex flex-row gap-4 mb-2">
          <div class="flex-col gap-4 w-full">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Competency</label>
            <InputText :readonly="true" :value="assessmentResult.competencyLevelName" class="w-full"/>
          </div>
          <div class="flex-col gap-4 w-full">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Salary Lower</label>
            <InputText :readonly="true" :value="utils.formatCurrency(assessmentResult.salaryLower)" class="w-full"/>
          </div>
          <div class="flex-col gap-4 w-full">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Salary Upper</label>
            <InputText :readonly="true" :value="utils.formatCurrency(assessmentResult.salaryUpper)" class="w-full"/>
          </div>
          <div class="flex-col gap-4 w-full">
            <label class="block text-sm font-semibold text-gray-700 mb-2">National Avg</label>
            <InputText :readonly="true" :value="utils.formatCurrency(assessmentResult.nationalAverage)" class="w-full"/>
          </div>
        </div>
        <DataTable
            :value="assessmentResult.details"
            dataKey="id"
            size="small"
            :rowHover="true"
            :loading="loadingDetailResults"
            scroll-height="500px"
            :scrollable="true"
        >

          <Column field="questionTitle" header="Question">
            <template #body="{ data }">
              <span class="text-sm font-semibold">{{ data.questionTitle }}</span>
            </template>
          </Column>
          <Column field="answer" header="Answer">
            <template #body="{ data }">
              <span class="text-sm">{{ data.answer }}</span>
            </template>
          </Column>
          <Column field="skill" header="Skill">
            <template #body="{ data }">
              <Chip :label="data.questionSkill" rounded class="text-sm" style="background-color: #41b883;color:white;"></Chip>
            </template>
          </Column>
          <Column field="updated" header="Time">
            <template #body="{ data }">
              <span class="text-sm">{{ utils.formatDateTime(data.updated) }}</span>
            </template>
          </Column>
          <Column field="pass" header="Pass">
            <template #body="{ data }">
              <i class="pi" :class="data.pass ? 'pi-check text-green-600' : 'pi-times text-red-600'"></i>
            </template>
          </Column>
          <Column field="duration" header="Duration">
            <template #body="{ data }">
              <span class="text-sm">{{ utils.inMinutes(data.duration) }}</span>
            </template>
          </Column>
        </DataTable>
      </div>
      <div class="p-6 flex justify-start">
        <Button @click="closeCallback" severity="secondary" type="button" label="Close" />
      </div>
    </template>
  </Drawer>
  <Drawer :visible="openCandidateDialog" @update:visible="(value) => openCandidateDialog = value" header="" position="right" class="!w-full md:!w-80 lg:!w-[40rem]">
    <template #container="{ closeCallback }">
      <div class="px-6 py-5 flex items-center justify-between">
        <span class="font-medium">Candidate Information</span>
        <Button type="button" @click="closeCallback" icon="pi pi-times" text severity="secondary" />
      </div>
      <div class="bg-white rounded-xl border border-gray-200 m-1 p-6">
        <div class="flex flex-row gap-4">
          <div class="flex-col gap-4 w-full">
            <label class="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
            <InputText :readonly="true" :value="candidate.firstName" placeholder="First Name of candidate" class="w-full"/>
          </div>
          <div class="flex-col gap-4 w-full">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
            <InputText :readonly="true" :value="candidate.lastName" placeholder="Last Name of candidate" class="w-full"/>
          </div>
        </div>
        <div class="flex flex-row gap-4 mt-4">
          <div class="flex-col gap-4 w-full">
            <label class="block text-sm font-semibold text-gray-700 mb-2">City</label>
            <InputText :readonly="true" :value="candidate.city" placeholder="Address City of candidate" class="w-full"/>
          </div>
          <div class="flex-col gap-4 w-xs">
            <label class="block text-sm font-semibold text-gray-700 mb-2">State</label>
            <InputText :readonly="true" :value="candidate.state" placeholder="Address State of candidate" class="w-full"/>
          </div>
          <div class="flex-col gap-4 w-xs">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Postal</label>
            <InputText :readonly="true" :value="candidate.postal" placeholder="Address Postal of candidate" class="w-full"/>
          </div>
        </div>
        <div class="flex flex-row gap-4 mt-4">
          <div class="flex-col gap-4 w-full">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <InputText :readonly="true" :value="candidate.email" placeholder="Email of candidate" class="w-full"/>
          </div>
          <div class="flex-col gap-4 w-full">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
            <PhoneNumberInput :readonly="true" v-model="candidate.phone" placeholder="Phone of candidate" class="w-full"/>
          </div>
        </div>
        <div class="space-y-6 mt-4" v-if="additionalQuestions.length > 0">
          <div class="text-md font-bold p-4 bg-gray-100 rounded-md">Additional Information</div>
          <template v-for="question in additionalQuestions" :key="question.label">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                {{question.label}}
              </label>
              <InputText :readonly="true" :value="question.value" placeholder="Answer" class="w-full"/>
            </div>
          </template>
        </div>
        <div class="space-y-6 mt-4">
          <div class="text-md font-bold p-4 bg-gray-100 rounded-md">Email Communication</div>
          <p class="text-sm text-gray-500 mt-1">If you would like to send an email to this candidate, fill out the following information.</p>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Subject
            </label>
            <InputText v-model="subject" placeholder="Enter a subject" class="w-full"/>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Message
            </label>
            <Textarea v-model="message" placeholder="Message" class="w-full"/>
          </div>
          <div class="p-6 flex justify-end">
            <Button type="button" @click="sendCandidateEmail()" label="Send" />
          </div>
        </div>
      </div>
    </template>
  </Drawer>
</template>