<script setup lang="ts">
import hrbCore from "@/hrbCore"
import Button from "primevue/button"
import IconField from "primevue/iconfield"
import InputText from "primevue/inputtext"
import InputIcon from "primevue/inputicon"
import Select from "primevue/select"
import {onMounted, ref} from "vue"
import DataTable from "primevue/datatable"
import Column from "primevue/column"
import Drawer from "primevue/drawer"
import utils from "@/utils";
import {PublishStatus, type Employer, States} from "@/types"
import Job from "@/views/Job.vue";
import Message from "primevue/message"
import {Form} from "@primevue/forms"
import Textarea from "primevue/textarea"
import ResourceUpload from "@/components/ResourceUpload.vue"
import CandidateDialog from "@/components/CandidateDialog.vue"
import Dialog from "primevue/dialog"

const searchState = ref("")
const openShareDialog = ref(false)
const shareUrl = ref("")
const candidateDialogRef: any = ref(null)
const selectedStatus: any = ref("")
const StatusArray: any = ref([])
const jobs = ref([])
const loadingJobs = ref(false)
const loadingJobCandidates = ref(false)
const totalJobRecords = ref(0)
const openJobTargetDialog = ref(false)

const jtManagerUrl = ref("")
const openJobDialog = ref(false)
const openEmployerDialog = ref(false)
const employer = ref({} as Employer)
const jobPagingInfo = ref({
  query: "",
  order: "title asc",
  page: 1,
  size: 10,
});
const thisId = ref("")

const loadJobs = (event?: any) => {
  loadingJobs.value = true;
  let sortField = "job_publish_date"
  let sortOrder = "desc"
  if (event && event.page) {
    jobPagingInfo.value.page = event.page + 1
  }
  jobPagingInfo.value.order = sortField + " " + sortOrder;
  hrbCore.getJobsByEmployerIdAndStateAndStatusWithPaging(searchState.value, selectedStatus.value ? selectedStatus.value.label: "",jobPagingInfo.value).then((response) => {
    loadingJobs.value = false;
    if (response.success) {
      jobs.value = response.payload.data
      totalJobRecords.value = response.payload.rowCount
    }
  })
}
const jobsOnPage = (event: any) => {
  loadJobs(event)
}
const onJobFilter = () => {
  if (searchState.value === null) {
    searchState.value = ""
  }
  jobPagingInfo.value.page = 1
  loadJobs()
}
const calculatePostedAt = (date: any) => {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) {
    return "Posted Today"
  } else if (days === 1) {
    return "Posted Yesterday"
  } else if (days > 7) {
    const weeks = Math.floor(days / 7)
    if (weeks === 1) {
      return "Posted 1 week ago"
    } else {
      return "Posted " + weeks + " weeks ago"
    }
  } else {
    return "Posted " + days + " days ago"
  }
}
const editJob = (job: any) => {
  thisId.value = job.id
  openJobDialog.value = true
}
const shareJob = (job: any) => {
  shareUrl.value = `https://careerpilot.skillxchange.io/jobs/${job.id}`
  setTimeout(function () {
    const e = document.getElementById("shareUrl") as HTMLInputElement;
    e.select();
    e.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(e.value);
  }, 500);
  openShareDialog.value = true
}
const openJobTarget = (job: any) => {
  jtManagerUrl.value = ""
  hrbCore.jobTarget(job.id).then((response: any) => {
    if (response.success) {
      if ("udf" in response.payload) {
        const udfs = JSON.parse(response.payload.udf)
        jtManagerUrl.value = udfs["jt-marketplace-url"]
        openJobTargetDialog.value = true
      }
    } else {
      hrbCore.putMessage(response.message, true)
    }
  })
}
const viewCandidates = (job: any) => {
  loadingJobCandidates.value = true;
  thisId.value = job.id
  candidateDialogRef.value.showByJobId(job.id)
}
const editProfile = () => {
  openEmployerDialog.value = true
}
const resolver = () => {
  const errors: any = {}

  if (!employer.value.name) {
    errors.name = [{ message: 'Name is required' }]
  }
  if (!employer.value.url) {
    errors.url = [{ message: 'Url is required' }]
  }
  if (!employer.value.city) {
    errors.city = [{ message: 'City is required' }]
  }
  if (!employer.value.state) {
    errors.state = [{ message: 'State is required' }]
  }
  if (!employer.value.postalCode) {
    errors.postalCode = [{ message: 'Postal is required' }]
  }
  return { errors }
}
const handleSubmit = (event: any) => {
  if (event.valid) {
    hrbCore.updateEmployer(employer.value).then((response: any) => {
      if (response.success) {
        hrbCore.putMessage('Employer updated', false)
        openEmployerDialog.value = false
      } else {
        hrbCore.putMessage(response.message, true)
      }
    })
  }
}
const refreshJobs = () => {
  openJobDialog.value = false
  loadJobs()
}
onMounted(() => {
  loadJobs()
  StatusArray.value = Object.values(PublishStatus)
  StatusArray.value.unshift({label: "All Statuses", value: "", color: ""})
  if (!hrbCore.getUser().superAdmin) {
    hrbCore.getEmployerProfile().then((response: any) => {
      if (response.success) {
        employer.value = response.payload
      }
    })
  }
})
</script>
<template>
  <div class="flex flex-row gap-2 rounded-lg p-4 bg-primary shadow-md mb-3">
    <div class="flex flex-col grow">
      <div class="text-2xl font-bold text-white">Welcome back, {{ hrbCore.getUser().firstName }}!</div>
      <div class="text-white py-4">Here's what's happening with your recruitment today.</div>
      <div class="flex flex-row gap-4">
        <div class="flex flex-col rounded-lg py-2 px-4" style="background-color: #85a8f9">
          <div class="text-white">This week</div>
          <div class="text-xl font-bold text-white">{{hrbCore.employerStats().newApplicationsWeek}} New Applications</div>
        </div>
        <div class="flex flex-col rounded-lg py-2 px-4"  style="background-color: #85a8f9">
          <div class="text-white">This Month</div>
          <div class="text-xl font-bold text-white">{{hrbCore.employerStats().totalViewsMonth}} Profile Views</div>
        </div>
      </div>
    </div>
  </div>
  <div class="text-xl font-bold py-4">Quick Actions</div>
  <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
    <button class="justify-between flex bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group" @click="$router.push('/job')">
      <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center  group-hover:bg-blue-200 transition-colors">
        <i class="text-blue-600 text-xl" data-fa-i2svg=""><svg class="svg-inline--fa fa-plus" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="plus" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-fa-i2svg=""><path fill="currentColor" d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"></path></svg></i>
      </div>
      <div class="flex flex-col grow">
        <h4 class="font-semibold text-gray-900 mb-1">Create New Job</h4>
        <p class="text-sm text-gray-500">Create a new position</p>
      </div>
    </button>
    <button class="justify-between flex bg-white p-6 rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all group" @click="$router.push('/job-candidates')">
      <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
        <i class="text-green-600 text-xl" data-fa-i2svg=""><svg class="svg-inline--fa fa-magnifying-glass" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="magnifying-glass" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg=""><path fill="currentColor" d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"></path></svg></i>
      </div>
      <div class="flex flex-col grow">
        <h4 class="font-semibold text-gray-900 mb-1">Manage Talent</h4>
        <p class="text-sm text-gray-500">Browse and search candidates</p>
      </div>
    </button>
    <button class="justify-between flex bg-white p-6 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all group" @click="$router.push('/assessments')">
      <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
        <i class="text-purple-600 text-xl" data-fa-i2svg=""><svg class="svg-inline--fa fa-clipboard-check" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="clipboard-check" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" data-fa-i2svg=""><path fill="currentColor" d="M192 0c-41.8 0-77.4 26.7-90.5 64H64C28.7 64 0 92.7 0 128V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H282.5C269.4 26.7 233.8 0 192 0zm0 64a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM305 273L177 401c-9.4 9.4-24.6 9.4-33.9 0L79 337c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L271 239c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"></path></svg></i>
      </div>
      <div class="flex flex-col grow">
        <h4 class="font-semibold text-gray-900 mb-1">View Assessments</h4>
        <p class="text-sm text-gray-500">Review candidate assessments</p>
      </div>
    </button>
  </div>
  <DataTable
    :value="jobs"
    paginator
    :rows="10"
    lazy
    class="mt-6"
    @page="jobsOnPage($event)"
    :totalRecords="totalJobRecords"
    showCurrentPageReport
    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
  >
    <template #header>
      <div class="flex flex-row gap-2">
        <div class="flex flex-col text-xl font-bold py-4 grow">Active Job Listings</div>
        <div class="flex flex-col">
          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText type="text" placeholder="Search jobs..." style="color: #9da4b0" v-model="jobPagingInfo.query" @input="onJobFilter()" />
          </IconField>
        </div>
        <div class="flex flex-col">
          <Select v-model="searchState" :options="Object.values(States)" placeholder="All States" class="w-full" showClear @change="onJobFilter()"/>
        </div>
        <div class="flex flex-col">
          <Select v-model="selectedStatus" :options="StatusArray" optionLabel="label" placeholder="All Statuses" class="w-full" showClear @change="onJobFilter()">
            <template #value="data">
              <div class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="utils.publishStatusColor(data.value?.label)">{{ data.value?.label || data.placeholder }}</div>
            </template>
            <template #option="slotProps">
              <div class="flex flex-row gap-2 items-center">
                <div class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="slotProps.option.color">{{ slotProps.option.label }}</div>
              </div>
            </template>
          </Select>
        </div>
      </div>
    </template>
    <template #empty> No jobs found. </template>
    <template #loading> Loading jobs data. Please wait. </template>
    <Column field="title" header="Job Title" >
      <template #body="{ data }">
        <div class="flex flex-col gap-2">
          <span class="font-semibold">{{ data?.title }}</span>
          <span class="text-sm">{{ calculatePostedAt(data?.publishDate) }}</span>
        </div>
      </template>
    </Column>
    <Column field="publishStatus" header="Status">
      <template #body="{ data }">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="utils.publishStatusColor(data?.publishStatus)">{{ data?.publishStatus }}</span>
      </template>
    </Column>
    <Column field="location" header="Location">
      <template #body="{ data }">
        <div class="flex flex-row gap-2 items-center">
          <i class="pi pi-map-marker" style="color: black"></i>
          <span class="text-sm">{{ data?.city + ", " + data?.state + " " + data?.postal }}</span>
        </div>
      </template>
    </Column>
    <Column field="count" header="Applications">
      <template #body="{ data }">
        <a class="text-sm font-bold text-blue-600" href="#" @click="viewCandidates(data)">{{ data?.count + " applications" }}</a>
      </template>
    </Column>
    <Column header="Actions">
      <template #body="{ data }">
        <div class="flex flex-row">
          <a :href="'https://careerpilot.skillxchange.io/jobs/' + data?.id" target="_blank" class="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50" title="View Details"><i class="pi pi-eye"></i></a>
          <a href="#" @click="shareJob(data)" class="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50" title="Share Job"><i class="pi pi-share-alt"></i></a>
          <a href="#" @click="editJob(data)" class="p-2 text-gray-400 hover:text-orange-600 rounded-lg hover:bg-orange-50" title="Edit Job"><i class="pi pi-pencil"></i></a>
          <a href="#" @click="openJobTarget(data)" v-if="hrbCore.getEmployer().jobTargetEnabled" class="p-2 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-purple-50" title="Job Target"><i class="pi pi-megaphone" /></a>
        </div>
      </template>
    </Column>
  </DataTable>
  <section id="company-profile" class="mb-8 mt-4" v-if="!hrbCore.getUser().superAdmin">
    <div class="bg-white rounded-xl border border-gray-200 p-8">
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
        <div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Company Profile</h3>
          <p class="text-gray-600">Manage your employer brand and company information</p>
        </div>
        <button @click="editProfile()" class="mt-4 lg:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <i data-fa-i2svg=""><svg class="svg-inline--fa fa-pen-to-square" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="pen-to-square" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg=""><path fill="currentColor" d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z"></path></svg></i>
          <span>Edit Profile</span>
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Company Info -->
        <div class="lg:col-span-2">
          <div class="flex items-start space-x-6">
            <img v-if="employer.thumbnail" :src="employer.thumbnail" style="width: 200px;" />
            <div class="flex-1">
              <h4 class="text-2xl font-bold text-gray-900 mb-2">{{employer.name}}</h4>
              <p class="text-gray-600 mb-4">{{employer.desc}}</p>
              <div class="flex flex-wrap gap-4 text-sm text-gray-600">
                <div class="flex items-center space-x-2" v-if="employer.city && employer.state">
                  <i class="text-gray-400" data-fa-i2svg=""><svg class="svg-inline--fa fa-location-dot" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="location-dot" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" data-fa-i2svg=""><path fill="currentColor" d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"></path></svg></i>
                  <span>{{employer.city + ", " + employer.state}}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <Drawer :visible="openJobTargetDialog" @update:visible="(value) => openJobTargetDialog = value" header="Right Drawer" position="right" class="!w-full md:!w-80 lg:!w-[50rem]">
    <template #container="{ closeCallback }">
      <div class="overflow-auto">
        <div class="px-6 py-5 flex items-center justify-between">
          <span class="font-medium">Job Target</span>
          <Button type="button" @click="closeCallback" icon="pi pi-times" text severity="secondary" />
        </div>
      </div>
      <iframe :src="jtManagerUrl" height="1200" width="800"></iframe>
      <div class="p-6 flex justify-start">
        <Button @click="closeCallback" class="p-button p-component p-button-secondary" data-p="" type="button" aria-label="Logout" data-pc-name="button" data-p-disabled="false" data-p-severity="secondary" data-pc-section="root">
          <span class="p-button-label" data-pc-section="label" data-p="" >Close</span>
        </Button>
      </div>
    </template>
  </Drawer>
  <CandidateDialog ref="candidateDialogRef" />
  <Drawer :visible="openJobDialog" @update:visible="(value) => openJobDialog = value" header="Job Details" position="right" class="!w-full md:!w-80 lg:!w-[70rem]">
    <Job :id="thisId" @reload="refreshJobs" />
  </Drawer>
  <Drawer :visible="openEmployerDialog" @update:visible="(value) => openEmployerDialog = value" header="Employer Details" position="right" class="!w-full md:!w-80 lg:!w-[70rem]">
    <template #container="{ closeCallback }">
      <div class="overflow-auto">
        <div class="bg-white rounded-xl border border-gray-200 m-1 p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Employer Information</h2>
              <p class="text-gray-600 mt-1">Define the basic employer details</p>
            </div>
            <Button type="button" @click="closeCallback" icon="pi pi-times" text severity="secondary" />
          </div>
          <div class="flex gap-8 w-full">
            <Form v-slot="$form" :resolver="resolver" @submit="handleSubmit" class="w-full">
              <div class="space-y-6 w-full">
                <div class="flex flex-row gap-2 w-full">
                  <div class="flex flex-col gap-2 w-full">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                      Employer Name <span class="text-red-500">*</span>
                    </label>
                    <InputText name="name" v-model="employer.name" placeholder="Name of employer" class="w-full"/>
                    <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">{{ $form.name.error.message }}</Message>
                    <p class="text-xs text-gray-500 mt-1">This will be the employer name candidates see</p>
                  </div>
                  <div class="flex flex-col gap-2 w-full">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                      Employer Url <span class="text-red-500">*</span>
                    </label>
                    <InputText name="url" type="url" v-model="employer.url" placeholder="Url of employer" class="w-full"/>
                    <Message v-if="$form.url?.invalid" severity="error" size="small" variant="simple">{{ $form.url.error.message }}</Message>
                    <p class="text-xs text-gray-500 mt-1">This is the employer's website.</p>
                  </div>
                </div>
                <div class="flex flex-row gap-2 w-full">
                  <div class="flex flex-col gap-2 w-full">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                      Employer City <span class="text-red-500">*</span>
                    </label>
                    <InputText name="city" v-model="employer.city" placeholder="City of employer" class="w-full"/>
                  </div>
                  <div class="flex flex-col gap-2 w-full">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                      Employer State <span class="text-red-500">*</span>
                    </label>
                    <Select name="state" v-model="employer.state" :options="Object.values(States)" placeholder="Select a state" class="w-full" />
                    <Message v-if="$form.state?.invalid" severity="error" size="small" variant="simple">{{ $form.state.error.message }}</Message>
                    <p class="text-xs text-gray-500 mt-1">This is the employer's state.</p>
                  </div>
                  <div class="flex flex-col gap-2 w-full">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                      Employer Postal <span class="text-red-500">*</span>
                    </label>
                    <InputText name="postalCode" v-model="employer.postalCode" placeholder="Postal code of employer" class="w-full"/>
                    <Message v-if="$form.postalCode?.invalid" severity="error" size="small" variant="simple">{{ $form.postalCode.error.message }}</Message>
                    <p class="text-xs text-gray-500 mt-1">This is the employer's postal code.</p>
                  </div>
                </div>
                <div class="flex flex-row gap-2 w-full">
                  <div class="flex flex-col gap-2 w-full">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                      Employer Image
                    </label>
                    <ResourceUpload id="thumbnail" name="thumbnail" accept="image/*" button-label="Upload" v-model="employer.thumbnail" />
                  </div>
                  <div class="flex flex-col gap-2 w-full">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                      Employer Description <span class="text-red-500">*</span>
                    </label>
                    <Textarea rows="5" name="desc" v-model="employer.desc" placeholder="Description of employer" class="w-full"/>
                    <p class="text-xs text-gray-500 mt-1">This is the employer's description.</p>
                  </div>
                </div>
                <div class="flex flex-row gap-2 w-full">
                  <div class="flex flex-col gap-2 w-full">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                      Employer Opportunity Description
                    </label>
                    <Textarea rows="5" name="employerOpportunity" v-model="employer.opportunity" placeholder="Opportunity description of employer" class="w-full"/>
                    <p class="text-xs text-gray-500 mt-1">This is the employer's opportunity description.</p>
                  </div>
                  <div class="flex flex-col gap-2 w-full">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                      Employer Cultural Description
                    </label>
                    <Textarea rows="5" name="employerCultural" v-model="employer.cultural" placeholder="Cultural description of employer" class="w-full"/>
                    <p class="text-xs text-gray-500 mt-1">This is the employer's cultural description.</p>
                  </div>
                </div>
              </div>
              <div class="p-6 flex justify-between">
                <Button @click="closeCallback" severity="secondary" type="button" label="Close" />
                <Button type="submit" label="Save" />
              </div>
            </Form>
          </div>
        </div>
      </div>
    </template>
  </Drawer>
  <Dialog v-model:visible="openShareDialog" modal header="Share Url" :style="{ width: '40rem' }">
    <span class="text-surface-500 dark:text-surface-400 block mb-8">This is the job share url.   It has been copied to your clipboard.</span>
    <div class="flex items-center gap-4 mb-4">
      <InputText id="shareUrl" class="flex-auto w-full" autocomplete="off" :value="shareUrl" readonly/>
    </div>
    <template #footer>
      <Button label="OK" text severity="secondary" @click="openShareDialog = false" autofocus />
    </template>
  </Dialog>
</template>