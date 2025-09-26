<script setup lang="ts">

import router from "@/router"
import hrbCore from "@/hrbCore.ts"
import { Form } from '@primevue/forms'
import {onMounted, ref} from "vue"
import utils from "@/utils.ts"
import InputText from "primevue/inputtext"
import Select from "primevue/select"
import IconField from "primevue/iconfield"
import Column from "primevue/column"
import DataTable from "primevue/datatable"
import Drawer from "primevue/drawer"
import Button from "primevue/button"
import InputIcon from "primevue/inputicon"
import { VAceEditor } from "vue3-ace-editor"

import "ace-builds/src-noconflict/mode-json"
import "ace-builds/src-noconflict/mode-html"
import "ace-builds/src-noconflict/theme-chrome"
import Message from "primevue/message"

const data = ref([])
const openEditDialog = ref(false)
const totalRecords = ref(0)
const pagingInfo = ref({
  query: "",
  order: "name asc",
  page: 1,
  size: 10,
})
const loading = ref(false)
const onPage = (event: any) => {
  loadData(event)
}

const onSort = (event: any) => {
  loadData(event)
}

const onFilter = () => {
  pagingInfo.value.page = 1
  loadData()
}

const loadData = (event?: any) => {
  loading.value = true
  let sortField = "name"
  let sortOrder = "asc"
  if (event) {
    if ('page' in event) {
      pagingInfo.value.page = event.page + 1
    }
    if ('sortField' in event) {
      sortField = event.sortField
      sortOrder = event.sortOrder === -1 ? "desc" : "asc"
    }
  }
  switch (sortField) {
    case "name":
      sortField = "t_name"
      break;
    case "type":
      sortField = "t_type"
      break;
    case "update":
      sortField = "t_update"
      break;
  }

  pagingInfo.value.order = sortField + " " + sortOrder
  let eid = ""
  if (searchEmployer.value && ("id" in searchEmployer.value)) {
    eid = searchEmployer.value.id || ""
  }
  hrbCore.getTemplatesByEmployerIdAndArchivedWithPaging(eid, searchArchived.value, pagingInfo.value).then((response: any) => {
    loading.value = false
    data.value = response.payload.data
    totalRecords.value = response.payload.rowCount
  })
}
const editorLang = ref("html")
const template: any = ref({})
const employers: any = ref([])
const searchEmployer: any = ref({})
const searchArchived = ref(false)
const resolver = () => {
  const errors: any = {};

  if (template.value.name === "") {
    errors.name = [{ message: 'Name is required' }];
  }
  if (template.value.content === "") {
    errors.content = [{ message: 'Content is required' }];
  }
  if (template.value.type === "") {
    errors.content = [{ message: 'Type is required' }];
  }

  return { errors };
}

const editRecord = (record: any) => {
  template.value = record
  if (template.value.type === "Job Form Config") {
    editorLang.value = "json"
  } else {
    editorLang.value = "html"
  }
  openEditDialog.value = true
}

const handleSubmit = (event: any) => {
  if (event.valid) {
    loading.value = true
    hrbCore.updateTemplate(template.value).then((response) => {
      loading.value = false
      if (response.success) {
        hrbCore.putMessage('Template updated', false)
        openEditDialog.value = false
        loadData()
      } else {
        hrbCore.putMessage(response.message, true)
      }
    });
  }
}
onMounted(() => {
  // make sure we're allowed
  if (!hrbCore.getUser().superAdmin) {
    hrbCore.putMessage("You are not authorized to view Templates", true)
    router.push("/")
  }
  hrbCore.getEmployers().then((response: any) => {
    employers.value = response.payload
  })
  loadData()
})
</script>
<template>
  <div class="w-full">
    <div class="text-xl font-bold py-4">Templates</div>
    <DataTable
        :value="data"
        paginator
        lazy
        :rows="10"
        :totalRecords="totalRecords"
        dataKey="id"
        size="small"
        sort-mode="single"
        @page="onPage($event)"
        @sort="onSort($event)"
        :rowHover="true"
        sortField="name"
        :loading="loading"
        :sort-order="1"
        showCurrentPageReport
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
    >
      <template #header>
        <div class="flex justify-end">
          <Select v-model="searchEmployer" :options="employers" filter optionLabel="name" placeholder="All Employers" class="w-full md:w-56 mr-2" @change="onFilter()" showClear>
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex items-center">
                <div>{{ slotProps.value.name }}</div>
              </div>
              <span v-else>
                {{ slotProps.placeholder }}
              </span>
            </template>
            <template #option="slotProps">
              <div class="flex items-center">
                <div>{{ slotProps.option.name }}</div>
              </div>
            </template>
          </Select>
          <IconField>
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText v-model="pagingInfo.query" placeholder="Keyword Search" @input="onFilter()" showClear />
          </IconField>
        </div>
      </template>
      <template #empty> No templates found. </template>
      <template #loading> Loading templates. Please wait. </template>
      <Column :sortable="true" field="name" header="Name">
        <template #body="{ data }">
          <span class="text-sm font-semibold">{{ data.name }}</span>
        </template>
      </Column>
      <Column :sortable="true" field="employer" header="Employer">
        <template #body="{ data }">
          <span class="text-sm">{{ data.employer && data.employer.name ? data.employer.name : "" }}</span>
        </template>
      </Column>
      <Column :sortable="true" field="type" header="Type">
        <template #body="{ data }">
          <span class="text-sm">{{ data?.type }}</span>
        </template>
      </Column>
      <Column :sortable="true" field="update" header="Last Update">
        <template #body="{ data }">
          <span class="text-sm">{{ utils.formatDateTime(data?.updated) }}</span>
        </template>
      </Column>
      <Column field="action" header="Action">
        <template #body="{ data }">
          <div class="flex flex-row">
            <a @click="editRecord(data.id)" class="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50" title="View Resume"><i class="pi pi-pencil"></i></a>
<!--            <a @click="viewCandidate(data)" class="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50" title="View Candidate"><i class="pi pi-user-plus"></i></a>-->
<!--            <a v-if="data.result" @click="viewResults(data.result.id)" class="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50" title="View Candidate"><i class="pi pi-receipt"></i></a>-->
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
  <Drawer :visible="openEditDialog" @update:visible="(value) => openEditDialog = value" header="" position="right" class="!w-full md:!w-80 lg:!w-[40rem]">
    <template #container="{ closeCallback }">
      <div class="overflow-auto">
        <div class="px-6 py-5 flex items-center justify-between">
          <span class="font-medium">Template Information</span>
          <Button type="button" @click="closeCallback" icon="pi pi-times" text severity="secondary" />
        </div>
      </div>
      <Form v-slot="$form" :resolver="resolver" @submit="handleSubmit">
        <div class="overflow-auto">
          <div class="bg-white rounded-xl border border-gray-200 m-1 p-6">
            <div class="flex flex-row gap-4">
              <div class="flex-col gap-4 w-full">
                <label class="block text-sm font-semibold text-gray-700 mb-2 required">Name</label>
                <InputText :readonly="true" :value="template.name" placeholder="Template Name" class="w-full"/>
                <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">{{ $form.name.error.message }}</Message>
              </div>
              <div class="flex-col gap-4 w-full">
                <label class="block text-sm font-semibold text-gray-700 mb-2 required">Type</label>
                <InputText :readonly="true" :value="template.type" placeholder="Template Type" class="w-full"/>
                <Message v-if="$form.type?.invalid" severity="error" size="small" variant="simple">{{ $form.type.error.message }}</Message>
              </div>
            </div>
            <div class="flex flex-row gap-4 mt-4">
              <div class="flex-col gap-4 w-full">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Employer</label>
                <Select v-model="template.employer.id" :options="employers" filter optionLabel="name" placeholder="Select an Employer" class="w-full md:w-56" clearIcon="">
                  <template #value="slotProps">
                    <div v-if="slotProps.value" class="flex items-center">
                      <div>{{ slotProps.value.name }}</div>
                    </div>
                    <span v-else>
                      {{ slotProps.placeholder }}
                    </span>
                  </template>
                  <template #option="slotProps">
                    <div class="flex items-center">
                      <div>{{ slotProps.option.name }}</div>
                    </div>
                  </template>
                </Select>
              </div>
              <div class="flex-col gap-4 w-full">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                <InputText :readonly="true" :value="template.subject" placeholder="Email subject (optional)" class="w-full"/>
              </div>
            </div>
            <div class="flex flex-row gap-4 mt-4">
              <label class="block text-sm font-semibold text-gray-700 mb-2 required">Content</label>
              <v-ace-editor id="editor" v-model:value="template.content" :lang="editorLang" theme="chrome" style="height: 600px" />
              <Message v-if="$form.content?.invalid" severity="error" size="small" variant="simple">{{ $form.content.error.message }}</Message>
            </div>
            <div class="p-6 flex justify-between">
              <Button @click="closeCallback" severity="secondary" type="button" label="Close" />
              <Button type="submit" label="Save" />
            </div>
          </div>
        </div>
      </Form>
    </template>
  </Drawer>
</template>