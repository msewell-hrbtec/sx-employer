<script setup lang="ts">
import { onMounted, ref} from 'vue'
import hrbCore from "@/hrbCore"
import Avatar from "primevue/avatar"
import {useConfirm} from "primevue"
import Button from "primevue/button"
import {Form} from "@primevue/forms"
import Profile from "@/views/Profile.vue"
import PhoneNumberInput from "@/components/PhoneNumberInput.vue"
import Message from "primevue/message"
import Drawer from "primevue/drawer"
import DataTable from "primevue/datatable"
import Column from "primevue/column"
import Checkbox from "primevue/checkbox"
import ConfirmPopup from "primevue/confirmpopup"
import InputText from "primevue/inputtext"
import Select from "primevue/select"

const buttonClass = 'w-full px-3 py-2 rounded-lg  flex items-center gap-2 font-medium text-surface-500 hover:text-surface-950 dark:hover:text-surface-0 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150'
const openTeamList = ref(false)
const users = ref([])
const profileRef: any = ref(null)
const loading = ref(true)
const selectedTeamMembers: any = ref([])
const confirmPopup = useConfirm()
const currentEmployer = ref("")
const employers: any = ref([])
const teamMember: any = ref({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
})
const showDeleteButton = ref(false)
const loadUsers = () => {
  loading.value = true
  hrbCore.getTeam().then((response) => {
    loading.value = false
    if (response.success) {
      users.value = response.payload
    } else {
      hrbCore.putMessage(response.message, true)
    }
  })
}
const openSettingsMenu = ref(false)
const onRowClick = (event: any) => {
  editRecord(event.data)
}
const editRecord = (record: any) => {
  teamMember.value.email = record.email
  teamMember.value.firstName = record.firstName
  teamMember.value.lastName = record.lastName
  teamMember.value.phone = record.phone
  openTeamDialog.value = true
}
const openTeamDialog = ref(false)
const openTeamListDialog = () => {
  openTeamList.value = true
  openSettingsMenu.value = false
  loadUsers()
}
const openProfileDialog = () => {
  openSettingsMenu.value = false
  hrbCore.getProfile().then((res) => {
    if (res.success) {
      profileRef.value?.userRef(res.payload)
    }
  });
};
const teamMemberResolver = () => {
  const errors: any = {}

  if (!teamMember.value.email) {
    errors.email = [{ message: 'Email is required' }]
  } else if (!/\S+@\S+\.\S+/.test(teamMember.value.email)) {
    errors.email = [{ message: 'Email is invalid' }]
  }
  if (!teamMember.value.firstName) {
    errors.firstName = [{ message: 'First name is required' }]
  }
  if (!teamMember.value.lastName) {
    errors.lastName = [{ message: 'Last name is required' }]
  }
  return { errors };
};
const handleTeamMemberSubmit = (event: any) => {
  if (event.valid) {
    loading.value = true
    hrbCore.addTeamMember(teamMember.value).then((response) => {
      loading.value = false
      if (response.success) {
        hrbCore.putMessage('Team member updated', false)
        openTeamDialog.value = false
        loadUsers()
      } else {
        hrbCore.putMessage(response.message, true)
      }
    });
  }
};

const onTeamMemberCheckboxChange = (event: any) => {
  if (event.target.checked) {
    selectedTeamMembers.value.push(event.target.value)
  } else {
    selectedTeamMembers.value = selectedTeamMembers.value.filter((id: any) => id !== event.target.value)
  }
  showDeleteButton.value = selectedTeamMembers.value.length > 0
};

const addTeamMember = () => {
  for (const fld in teamMember.value) {
    teamMember.value[fld] = ""
  }
  openTeamDialog.value = true
};

const confirmTeamDelete = (event: any) => {
  confirmPopup.require({
    target: event.target,
    message: 'Are you sure you wish to remove the checked team members?',
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
      hrbCore.removeTeamMembers(selectedTeamMembers.value).then((response) => {
        if (response.success) {
          hrbCore.putMessage('Team member(s) removed', false)
          loadUsers()
        } else {
          hrbCore.putMessage(response.message, true)
        }
      })
    },
    reject: () => {

    }
  })
};
const changeEmployer = () => {
  for (var i=0; i<employers.value.length; i++) {
    if (employers.value[i].id === currentEmployer.value) {
      hrbCore.changeEmployer(employers.value[i]).then((response) => {
        if (!response.success) {
          hrbCore.putMessage(response.message, true)
        } else {
          hrbCore.saveState(response.payload)
          window.location.reload()
        }
      })
      break
    }
  }
};
onMounted(() => {
  const targetElement = document.getElementById('profile-dropdown')
  document.addEventListener('click', function(event: any) {
    if (event.target.classList.contains('profile-menu')) {
      return
    }
    // Check if the clicked element is NOT the targetElement and NOT a descendant of targetElement
    if (!targetElement?.contains(event.target) && event.target !== targetElement) {
      // Add your code here to close or hide the element
      openSettingsMenu.value = false
    }
  });
  hrbCore.getEmployers().then((response: any) => {
    if (response.success) {
      employers.value = response.payload
      for (var i=0; i<employers.value.length; i++) {
        if (employers.value[i].id === hrbCore.getEmployer().id) {
          currentEmployer.value = employers.value[i].id
          break
        }
      }
    } else {
      hrbCore.putMessage(response.message, true)
    }
  })
})
</script>

<template>
  <header class="md:max-h-16 py-4 pr-4 flex md:flex-row flex-col items-center justify-between gap-3 border-b">
    <div class="flex items-center md:flex-1 gap-2">
      <a @click="$router.push('/')">
        <img :src="hrbCore.getDomain().image" class="mx-8" alt="Logo" style="width: 150px"/>
      </a>
      <div class="flex flex-row items-center gap-2">
        <div class="flex flex-col">
          <Avatar class="pi pi-briefcase text-blue-600! bg-blue-100!" shape="circle" />
        </div>
        <div class="flex flex-col">
          <a href="/">
            <div class="flex flex-row font-bold">
              {{hrbCore.employerStats().activeJobs}}
            </div>
            <div class="flex flex-row text-sm">
              Active Jobs
            </div>
          </a>
        </div>
      </div>
      <div class="flex flex-row items-center gap-2">
        <div class="flex flex-col">
          <Avatar class="pi pi-users text-green-600! bg-green-100!" shape="circle"/>
        </div>
        <div class="flex flex-col">
          <a href="/job-candidates">
            <div class="flex flex-row font-bold">
              {{hrbCore.employerStats().totalCandidates}}
            </div>
            <div class="flex flex-row text-sm">
              Total Candidates
            </div>
          </a>
        </div>
      </div>
      <div class="flex flex-row items-center gap-2">
        <div class="flex flex-col">
          <Avatar class="pi pi-pen-to-square text-purple-600! bg-purple-100!" shape="circle" />
        </div>
        <div class="flex flex-col">
          <div class="flex flex-row font-bold">
            {{hrbCore.employerStats().totalAssessments}}
          </div>
          <div class="flex flex-row text-sm">
            Total Assessments
          </div>
        </div>
      </div>
    </div>

    <div class="flex items-center md:flex-row flex-col gap-4">
      <div class="flex gap-4">
        <Select name="employer" v-model="currentEmployer" :options="employers" optionLabel="name" optionValue="id" placeholder="Select One" class="w-full" @change="changeEmployer"/>
        <button type="button" @click="openSettingsMenu = !openSettingsMenu" class="profile-menu " id="profile-dropdown">
          <i class="pi pi-cog"></i>
        </button>
        <!-- Profile -->
        <div class="relative">
          <a >
            <Avatar :image="hrbCore.getUser().image || ''" class="!rounded-md overflow-hidden !w-10 !h-10 !cursor-pointer !block" />
          </a>
          <div v-if="openSettingsMenu" id="profile-dropdown" class="absolute top-full right-0 z-[999] mt-2 w-40" >
            <div
                class="p-2 space-y-2 rounded-2xl bg-surface-0 dark:bg-surface-950 shadow-[0px_129.205px_36.493px_0px_rgba(44,54,87,0.00),_0px_82.849px_33.534px_0px_rgba(44,54,87,0.01),_0px_46.356px_27.616px_0px_rgba(44,54,87,0.03),_0px_20.712px_20.712px_0px_rgba(44,54,87,0.05),_0px_4.932px_11.836px_0px_rgba(44,54,87,0.06)] dark:shadow-stroke"
            >
              <button :class="buttonClass" @click="openTeamListDialog()">
                <i class="pi pi-users" />
                <span>Team</span>
              </button>
              <button :class="buttonClass" @click="openProfileDialog()">
                <i class="pi pi-user" />
                <span>Profile</span>
              </button>
              <button :class="buttonClass" @click="hrbCore.logout()">
                <i class="pi pi-sign-in" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
  <Drawer :visible="openTeamList"  @update:visible="(value) => openTeamList = value" header="Right Drawer" position="right" class="!w-full md:!w-80 lg:!w-[40rem]">
    <template #container="{ closeCallback }">
      <div class="h-full overflow-auto">
        <div class="px-6 py-5 flex items-center justify-between">
          <div class="flex items-center gap-2">
            Team
          </div>
          <Button type="button" @click="closeCallback" icon="pi pi-times" text severity="secondary" />
        </div>

        <DataTable
            :value="users"
            size="small"
            scrollable
            scrollHeight="400px"
            sort-mode="single"
            :rowHover="true"
            sortField="email"
            :loading="loading"
            @row-click="onRowClick($event)"
            :sort-order="1"
            table-style="min-width: 50rem"
        >
          <template #header>
            <div class="flex" :class="showDeleteButton ? 'justify-between' : 'justify-end'">
              <Button class="p-button-danger" type="button" icon="pi pi-trash" label="Remove" @click="confirmTeamDelete($event)" v-if="showDeleteButton" />
              <ConfirmPopup />
              <Button class="p-button-success" type="button" icon="pi pi-plus" label="New" @click="addTeamMember()" />
            </div>
          </template>
          <template #empty> No team members found. </template>
          <template #loading> Loading user data. Please wait. </template>
          <Column field="image" header="" style="text-align: center">
            <template #body="{ data }">
              <Checkbox name="team-members-selected" :value="data?.id" @change="onTeamMemberCheckboxChange($event)" />
            </template>
          </Column>
          <Column :sortable="true" field="email" header="Email">
            <template #body="{ data }">
              <span class="font-semibold">{{ data?.email }}</span>
            </template>
          </Column>
          <Column :sortable="true" field="firstName" header="First Name">
            <template #body="{ data }">
              <span class="font-semibold">{{ data?.firstName }}</span>
            </template>
          </Column>
          <Column :sortable="true" field="lastName" header="Last Name">
            <template #body="{ data }">
              <span class="font-semibold">{{ data?.lastName }}</span>
            </template>
          </Column>
          <Column :sortable="true" field="phone" header="Phone">
            <template #body="{ data }">
              <span class="font-semibold">{{ data?.phone }}</span>
            </template>
          </Column>
        </DataTable>
      </div>
      <div class="p-6 flex justify-between">
        <Button @click="closeCallback" class="p-button p-component p-button-secondary" data-p="" type="button" aria-label="Logout" data-pc-name="button" data-p-disabled="false" data-p-severity="secondary" data-pc-section="root">
          <span class="p-button-label" data-pc-section="label" data-p="">Close</span>
        </Button>
      </div>
    </template>
  </Drawer>
  <Drawer :visible="openTeamDialog" @update:visible="(value) => openTeamDialog = value" header="Team Member" position="right" class="!w-full md:!w-70 lg:!w-[30rem]">
    <template #container="{ closeCallback }">
      <div class="h-full overflow-auto">
        <div class="px-6 py-5 flex items-center justify-between">
          <span class="font-medium">Add Team Member</span>
          <Button type="button" @click="closeCallback" icon="pi pi-times" text severity="secondary" />
        </div>
        <Form v-slot="$form" :resolver="teamMemberResolver" @submit="handleTeamMemberSubmit">
          <div class="flex flex-col gap-4 w-full p-2">
            <div class="flex flex-col md:flex-row gap-2">
              <div class="flex flex-col gap-2 w-full">
                <label for="first-name" class="required" >First Name</label>
                <InputText id="first-name" type="text" v-model="teamMember.firstName" name="firstName"/>
                <Message v-if="$form.firstName?.invalid" severity="error" size="small" variant="simple">{{ $form.firstName.error.message }}</Message>
              </div>
              <div class="flex flex-col gap-2 w-full">
                <label for="last-name" class="required">Last Name</label>
                <InputText id="last-name" type="text" v-model="teamMember.lastName" name="lastName"/>
                <Message v-if="$form.lastName?.invalid" severity="error" size="small" variant="simple">{{ $form.lastName.error.message }}</Message>
              </div>
            </div>
            <div class="flex flex-col md:flex-row gap-2">
              <div class="flex flex-col gap-2 w-full">
                <label for="email" class="required">Email</label>
                <InputText id="email" type="text" v-model="teamMember.email" name="email"/>
                <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">{{ $form.email.error.message }}</Message>
              </div>
              <div class="flex flex-col gap-2 w-full">
                <label for="phone" >Phone</label>
                <PhoneNumberInput id="phone" v-model="teamMember.phone" name="phone"/>
              </div>
            </div>
          </div>
          <div class="p-6 flex justify-between">
            <Button @click="closeCallback" class="p-button p-component p-button-secondary" data-p="" type="button" aria-label="Logout" data-pc-name="button" data-p-disabled="false" data-p-severity="secondary" data-pc-section="root">
              <span class="p-button-label" data-pc-section="label" data-p="">Close</span>
            </Button>
            <Button class="p-button p-component" data-p="" type="submit" aria-label="Save" data-pc-name="button" data-p-disabled="false" data-pc-section="root">
              <span class="p-button-label" data-pc-section="label" data-p="">Save</span>
            </Button>
          </div>
        </Form>
      </div>
    </template>
  </Drawer>
  <Profile ref="profileRef" />
</template>
