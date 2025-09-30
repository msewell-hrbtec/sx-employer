<script setup lang="ts">

import utils from "@/utils.ts"
import Column from "primevue/column"
import DataTable from "primevue/datatable"
import IconField from "primevue/iconfield"
import InputIcon from "primevue/inputicon"
import InputText from "primevue/inputtext"
import Avatar from "primevue/avatar"
import {onMounted, ref} from "vue"
import hrbCore from "@/hrbCore.ts"
import Dialog from "primevue/dialog"
import Button from "primevue/button"

const ShareBodyText = ref("")
const ShareHeaderText = ref("Share Company Link")
const shareUrl = ref("")
const openShareDialog = ref(false)
const loadEmployers = (event?: any) => {
  loadingEmployers.value = true
  let sortField = "name"
  let sortOrder = "asc"
  if (event) {
    if (event.page) {
      employersPagingInfo.value.page = event.page + 1
    }
    if (event.sortField) {
      sortField = event.sortField
      sortOrder = event.sortOrder === -1 ? "desc" : "asc"
    }
  }
  if (sortField === "name") {
    sortField = "emp_name"
  } else if (sortField === "city") {
    sortField = "emp_city"
  } else if (sortField === "state") {
    sortField = "emp_state"
  } else if (sortField === "updated") {
    sortField = "emp_updated"
  }
  employersPagingInfo.value.order = sortField + " " + sortOrder

  hrbCore.getEmployersByDomainIdWithPaging(employersPagingInfo.value).then((response) => {
    loadingEmployers.value = false
    employers.value = response.payload.data
    totalEmployerRecords.value = response.payload.rowCount
  })
}
const totalEmployerRecords = ref(0)
const loadingEmployers = ref(false)
const employers = ref([])
const employersPagingInfo = ref({
  query: "",
  order: "name asc",
  page: 1,
  size: 10,
})
const employersOnPage = (event: any) => {
  loadEmployers(event)
}
const employersOnSort = (event: any) => {
  employersPagingInfo.value.page = 1
  loadEmployers(event)
}
const employersOnFilter = () => {
  employersPagingInfo.value.page = 1
  loadEmployers()
}
onMounted(() => {
  debugger;
  loadEmployers()
})
const registerNewEmployer = () => {
  ShareHeaderText.value = "Register Company Link"
  ShareBodyText.value = "This link can be sent to a new company to register them.   Send this to any unregistered company.   The url has been copied to your clipboard."

  if (window.location.hostname.indexOf('staging') == -1) {
    shareUrl.value = `https://employer.skillxchange.io/${hrbCore.getDomain().route}/register-employer`
  } else {
    shareUrl.value = `https://employer.staging-skillxchange.io/${hrbCore.getDomain().route}/register-employer`
  }
  openShareDialog.value = true
  setTimeout(function () {
    const e = document.getElementById("shareUrl") as HTMLInputElement;
    e.select();
    e.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(e.value);
  }, 500);
}
const shareEmployer = (emp: any) => {
  ShareHeaderText.value = "Share Company Link"
  ShareBodyText.value = "This is the company invite link.   Send this to any person you would like to invite to join your company.   The url has been copied to your clipboard."
  if (window.location.hostname.indexOf('staging') == -1) {
    shareUrl.value = `https://employer.skillxchange.io/${hrbCore.getDomain().route}/invite-employer?eid=${emp.id}`
  } else {
    shareUrl.value = `https://employer.staging-skillxchange.io/${hrbCore.getDomain().route}/invite-employer?eid=${emp.id}`
  }
  openShareDialog.value = true
  setTimeout(function () {
    const e = document.getElementById("shareUrl") as HTMLInputElement;
    e.select();
    e.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(e.value);
  }, 500);
}
</script>
<template>
  <div class="w-full">
    <div class="text-xl font-bold py-4">Company Management</div>
    <DataTable
        :value="employers"
        paginator
        lazy
        :rows="10"
        :totalRecords="totalEmployerRecords"
        dataKey="id"
        size="small"
        sort-mode="single"
        @page="employersOnPage($event)"
        @sort="employersOnSort($event)"
        :rowHover="true"
        :loading="loadingEmployers"
        :sort-order="1"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
    >
      <template #header>
        <div class="flex justify-end">
          <Button label="New Company Link" @click="registerNewEmployer()" class="mr-2"/>
          <IconField>
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText v-model="employersPagingInfo.query" placeholder="Keyword Search" @input="employersOnFilter()" showClear />
          </IconField>
        </div>
      </template>
      <template #empty> No employers found. </template>
      <template #loading> Loading employer data. Please wait. </template>
      <Column field="thumbnail" header="" style="text-align: center">
        <template #body="{ data }">
          <Avatar :image="data?.image" class="!w-8 !h-8 !rounded-md !overflow-hidden" />
        </template>
      </Column>
      <Column :sortable="true" field="name" header="Name">
        <template #body="{ data }">
          <span class="text-sm font-semibold">{{ data.name }}</span>
        </template>
      </Column>
      <Column :sortable ="true" field="city" header="City" style="text-align: center">
        <template #body="{ data }">
          <span class="text-sm">{{ data.city }}</span>
        </template>
      </Column>
      <Column :sortable ="true" field="state" header="State" style="text-align: center">
        <template #body="{ data }">
          <span class="text-sm">{{ data.state }}</span>
        </template>
      </Column>
      <Column :sortable ="true" field="updated" header="Updated">
        <template #body="{ data }">
          <span class="text-sm">{{ data.updated ? utils.formatDateTime(data.updated) : '' }}</span>
        </template>
      </Column>
      <Column header="Actions">
        <template #body="{ data }">
          <div class="flex flex-row">
            <a @click="shareEmployer(data)" target="_blank" class="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 cursor-pointer" title="View Details"><i class="pi pi-share-alt"></i></a>
<!--            <a @click="viewCandidates(data.id)" target="_blank" class="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50" title="View Candidates"><i class="pi pi-users"></i></a>-->
<!--            <a href="#" @click="shareAssessment(data)" class="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50" title="Share Job"><i class="pi pi-share-alt"></i></a>-->
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
  <Dialog v-model:visible="openShareDialog" modal :header="ShareHeaderText" :style="{ width: '40rem' }">
    <span class="text-surface-500 dark:text-surface-400 block mb-8">{{ShareBodyText}}</span>
    <div class="flex items-center gap-4 mb-4">
      <InputText id="shareUrl" class="flex-auto w-full" autocomplete="off" :value="shareUrl" readonly/>
    </div>
    <template #footer>
      <Button label="OK" text severity="secondary" @click="openShareDialog = false" autofocus />
    </template>
  </Dialog>
</template>
