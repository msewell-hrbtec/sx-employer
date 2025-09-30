<script setup lang="ts">
import { ref} from 'vue'
import hrbCore from "@/hrbCore"
import {Form} from "@primevue/forms"
import Message from "primevue/message"
import Button from 'primevue/button'
import InputText from "primevue/inputtext"
import {useConfirm} from "primevue"
import ResourceUpload from "@/components/ResourceUpload.vue"
import {States,ResourceTypes} from "@/types"
import Select from "primevue/select"
import Textarea from "primevue/textarea"
import ToggleSwitch from "primevue/togglebutton"
import Drawer from "primevue/drawer"
import Tabs from "primevue/tabs"
import Tab from "primevue/tab"
import TabList from "primevue/tablist"
import TabPanel from "primevue/tabpanel"
import TabPanels from "primevue/tabpanels"
import DataTable from "primevue/datatable"
import Column from "primevue/column"
import Avatar from "primevue/avatar"
import PhoneNumberInput from "@/components/PhoneNumberInput.vue"

const resourceUploadRef: any = ref(null)
const StatesArray = Object.values(States)
const ResourceTypesArray = Object.values(ResourceTypes)
const showDeleteButton = ref(false)
const selectedResources = ref([])
const user: any = ref({})
const openDialog = ref(false)
const loadingResources = ref(false)
const resource: any = ref({
  id: "",
  name: "",
  desc: "",
  type: "",
  resource: "",
  uid: "",
  archived: false,
})
const openResourceDialog = ref(false)
const loading = ref(true)

const userRef = (userObj: any) => {
  openDialog.value = true
  user.value = userObj
};

const show = () => {
  openDialog.value = true
}

const hide = () => {
  openDialog.value = false
}

const resources = ref([])

defineExpose({
    userRef,
    show,
    hide,
})

const onTabChange = (event: string|number) => {
  if (event === "1") {

  } else if (event === "2") {
    loadResources()
  }
}

const loadResources = () => {
  hrbCore.getUserResources().then((response) => {
    if (response.success) {
      resources.value = response.payload
    }
  })
}

const resolver = () => {
  const errors: any = {}

  if (!user.value.email) {
    errors.email = [{ message: 'Email is required' }]
  } else if (!/\S+@\S+\.\S+/.test(user.value.email)) {
    errors.email = [{ message: 'Email is invalid' }]
  }
  if (!user.value.firstName) {
    errors.firstName = [{ message: 'First name is required' }]
  }
  if (!user.value.lastName) {
    errors.lastName = [{ message: 'Last name is required' }]
  }
  return { errors }
};

const resourceResolver = () => {
  const errors: any = {}
  resourceUploadRef.value.clearError()
  if (!resource.value.name) {
    errors.name = [{ message: 'Name is required' }]
  }
  if (!resource.value.type) {
    errors.type = [{ message: 'Type is required' }]
  }
  if (!resource.value.resource) {
    resourceUploadRef.value.addError("Resource is required")
  }
  return { errors }
};

const handleSubmit = (event: any) => {
  if (event.valid) {
    loading.value = true
    hrbCore.updateProfile(user.value).then((response) => {
      loading.value = false
      if (response.success) {
        hrbCore.putMessage('Profile updated', false)
        openDialog.value = false
      } else {
        hrbCore.putMessage(response.message, true)
      }
    });
  }
};

const handleResourceSubmit = (event: any) => {
  if (event.valid) {
    loading.value = true
    resource.uid = user.id
    hrbCore.updateResource(resource.value).then((response) => {
      loading.value = false
      if (response.success) {
        hrbCore.putMessage('Resource updated', false)
      } else {
        hrbCore.putMessage(response.message, true)
      }
    });
  }
};

const addResource = () => {
  resource.value = {
    name: "",
    type: "",
    resource: ""
  }
  openResourceDialog.value = true
};
const confirmPopup = useConfirm();
const onResourceSelectedFiles = (event: any) => {
  resource.resource = event
}
const onImageSelectedFiles = (event: any) => {
  user.value.image = event
}
const confirmResourceDelete = (event: any) => {
  confirmPopup.require({
    target: event.target,
    message: 'Are you sure you wish to archive the checked resources?',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Save'
    },
    accept: () => {
      hrbCore.archiveUserResources(selectedResources.value).then((response) => {
        if (response.success) {
          hrbCore.putMessage('Resources archived', false)
          loadResources()
        } else {
          hrbCore.putMessage(response.message, true)
        }
      });
    },
    reject: () => {

    }
  });
};

</script>

<template>
    <Drawer :visible="openResourceDialog" @update:visible="(value) => openResourceDialog = value" header="Right Drawer" position="right" class="!w-full md:!w-80 lg:!w-[30rem]">
      <template #container="{ closeCallback }">
        <div class="h-full overflow-auto p-3">
          <div class=" flex items-center justify-between">
            <span class="font-medium p-6">Add Resource</span>
            <Button type="button" @click="closeCallback" icon="pi pi-times" text severity="secondary" />
          </div>
          <Form v-slot="$form" :resolver="resourceResolver" @submit="handleResourceSubmit">
            <div class="flex flex-col py-2 gap-2">
              <label for="name" class="required">Name</label>
              <InputText id="name" type="text" v-model="resource.name" name="name"/>
              <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">{{ $form.name.error.message }}</Message>
            </div>
            <div class="flex flex-col py-2 gap-2">
              <label for="desc">Description</label>
              <Textarea id="desc" type="text" v-model="resource.desc" name="desc"/>
            </div>
            <div class="flex flex-col py-2 gap-2">
              <label for="type" class="required">Type</label>
              <Select id="type" v-model="resource.type" name="type" :options="ResourceTypesArray" placeholder="Select One" class="w-full" />
              <Message v-if="$form.type?.invalid" severity="error" size="small" variant="simple">{{ $form.type.error.message }}</Message>
            </div>
            <div class="flex flex-col py-2 gap-2">
              <label for="archived" class="required">Archived</label>
              <ToggleSwitch id="archived" v-model="resource.archived" />
            </div>
            <div class="flex flex-col py-2 gap-2">
              <label for="resource" class="required">Resource</label>
              <ResourceUpload ref="resourceUploadRef" id="resource" name="resource" accept="image/*,.pdf" @select="onResourceSelectedFiles" button-label="Upload" v-model="resource.resource" image-placeholder="https://static.skillxchange.io/images/resume.png" />
              <Message v-if="$form.resource?.invalid" severity="error" size="small" variant="simple">{{ $form.resource.error.message }}</Message>
            </div>
            <div class="p-6 flex justify-between">
              <Button @click="closeCallback" severity="secondary" type="button" label="Close" />
              <Button type="submit" label="Save" />
            </div>
          </Form>
        </div>
      </template>
    </Drawer>
    <Drawer :visible="openDialog" @update:visible="(value) => openDialog = value" header="Right Drawer" position="right" class="!w-full md:!w-80 lg:!w-[40rem]">
        <template #container="{ closeCallback }">
            <div class="h-full overflow-auto">
                <div class="px-6 py-5 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <Avatar :image="user?.image ? user?.image : ''" class="!w-8 !h-8 !rounded-md !overflow-hidden" />
                        <span class="font-medium">{{ user?.firstName + ' ' + user?.lastName }}</span>
                    </div>
                    <Button type="button" @click="closeCallback" icon="pi pi-times" text severity="secondary" />
                </div>
                <Tabs value="0" @update:value="onTabChange">
                  <TabList>
                    <Tab value="0">Info</Tab>
                    <Tab value="1">Resources</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel value="0">
                      <Form v-slot="$form" :resolver="resolver" @submit="handleSubmit">
                        <div class="flex flex-col gap-4 w-full">
                          <div class="flex flex-col md:flex-row gap-2">
                            <div class="flex flex-col gap-2 w-full">
                              <label for="first-name" class="required">First Name</label>
                              <InputText id="first-name" type="text" v-model="user.firstName" name="firstName"/>
                              <Message v-if="$form.firstName?.invalid" severity="error" size="small" variant="simple">{{ $form.firstName.error.message }}</Message>
                            </div>
                            <div class="flex flex-col gap-2 w-full">
                              <label for="last-name" class="required">Last Name</label>
                              <InputText id="last-name" type="text" v-model="user.lastName" name="lastName"/>
                              <Message v-if="$form.lastName?.invalid" severity="error" size="small" variant="simple">{{ $form.lastName.error.message }}</Message>
                            </div>
                          </div>
                          <div class="flex flex-col md:flex-row gap-2">
                            <div class="flex flex-col gap-2 w-full">
                              <label for="email" class="required">Email</label>
                              <InputText id="email" type="text" v-model="user.email" name="email"/>
                              <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">{{ $form.email.error.message }}</Message>
                            </div>
                            <div class="flex flex-col gap-2 w-full">
                              <label for="phone" >Phone</label>
                              <PhoneNumberInput id="phone" v-model="user.phone" name="phone"/>
                            </div>
                          </div>
                          <div class="flex flex-col gap-2 w-full">
                            <label for="email" >Address</label>
                            <InputText id="email" type="text" v-model="user.address" name="address"/>
                          </div>
                          <div class="flex flex-col md:flex-row gap-2">
                            <div class="flex flex-col gap-2 w-full">
                              <label for="city" >City</label>
                              <InputText id="city" type="text" v-model="user.city" name="city"/>
                            </div>
                            <div class="flex flex-col gap-2 w-full">
                              <label for="state" >State</label>
                              <Select id="state" v-model="user.state" name="state" :options="StatesArray" placeholder="Select One" class="w-full" />
                            </div>
                            <div class="flex flex-col gap-2 w-full">
                              <label for="postal" >Postal</label>
                              <InputText id="postal" type="text" v-model="user.postal" name="postal"/>
                            </div>
                          </div>
                          <div class="flex flex-col md:flex-row gap-2">
                            <div class="flex flex-col gap-2 w-1/2">
                              <label for="image">Profile Image (Optional, must be less than 1M in size)</label>
                              <ResourceUpload id="image" name="image" accept="image/*" @select="onImageSelectedFiles" button-label="Upload" v-model="user.image" />
                            </div>
                          </div>
                        </div>
                        <div class="p-6 flex justify-between">
                          <Button @click="closeCallback" severity="secondary" type="button" label="Close" />
                          <Button type="submit" label="Save" />
                        </div>
                      </Form>
                    </TabPanel>
                    <TabPanel value="1">
                      <DataTable
                          :value="resources"
                          dataKey="id"
                          sort-mode="single"
                          size="small"
                          :rowHover="true"
                          sortField="title"
                          :loading="loadingResources"
                          :sort-order="1"
                          showGridlines
                          table-style="min-width: 50rem"
                      >
                        <template #header>
                          <div class="flex" :class="showDeleteButton ? 'justify-between' : 'justify-end'">
                            <Button class="p-button-danger" type="button" icon="pi pi-trash" label="Remove" @click="confirmResourceDelete($event)" v-if="showDeleteButton" />
                            <ConfirmPopup />
                            <Button class="p-button-success" type="button" icon="pi pi-plus" label="New" @click="addResource()" />
                          </div>
                        </template>
                        <template #empty> No resources found. </template>
                        <template #loading> Loading resource data. Please wait. </template>
                        <Column :sortable="true" field="name" header="Name" >
                          <template #body="{ data }">
                            <span class="font-semibold">{{ data?.name }}</span>
                          </template>
                        </Column>
                        <Column :sortable="true" field="type" header="Type">
                          <template #body="{ data }">
                            <span class="font-semibold">{{ data?.type }}</span>
                          </template>
                        </Column>
                        <Column :sortable="true" field="archived" header="Archived">
                          <template #body="{ data }">
                            <span class="font-semibold">{{ data?.archived }}</span>
                          </template>
                        </Column>
                        <Column :sortable="true" field="download">
                          <template #body="{ data }">
                            <a download :href="data?.resource">download</a>
                          </template>
                        </Column>
                      </DataTable>
                      <div class="p-6 flex justify-start">
                        <Button @click="closeCallback" severity="secondary" type="button" label="Close" />
                      </div>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
            </div>
        </template>
    </Drawer>
</template>
