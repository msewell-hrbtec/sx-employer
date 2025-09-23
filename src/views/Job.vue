<script setup lang="ts">
import {onMounted, ref} from "vue"
import hrbCore from "@/hrbCore.ts"
import Select from "primevue/select"
import InputText from "primevue/inputtext"
import Checkbox from "primevue/checkbox"
import Button from "primevue/button"
import InputNumber from "primevue/inputnumber"
import ToggleSwitch from "primevue/toggleswitch"
import RadioButton from "primevue/radiobutton"
import InputGroup from "primevue/inputgroup"
import InputGroupAddon from "primevue/inputgroupaddon"
import {
  EducationLevel,
  EmploymentType, ExperienceLevel, IncentiveCompensation,
  type Job,
  PayFrequency,
  PayType,
  PublishStatus,
  States,
  Travel,
  WorkEnvironment
} from "@/types.ts"
import utils from "@/utils.ts"
import Editor from 'primevue/editor'
import {Form} from "@primevue/forms"
import Message from "primevue/message"

const isNewJob = ref(true)
const skillColors = ["bg-blue-100", "bg-green-100", "bg-purple-100", "bg-orange-100", "bg-pink-100"]
const publishStatus: any = ref(PublishStatus.INCOMPLETE.label)
const qualification = ref("")
const qualifications: any = ref([])
const responsibility = ref("")
const responsibilities: any = ref([])
const skill = ref("")
const skills: any = ref([])
const industries: any = ref([])
const categories: any = ref([])
const showSalaryRange = ref(false)
const medicalInsurance = ref(false)
const dentalInsurance = ref(false)
const visionInsurance = ref(false)
const retirementPlan = ref(false)
const lifeInsurance = ref(false)
const noBenefits = ref(false)
const salaryCurrentLocation: any = ref([])
const salaryNational: any = ref([])
const loadingAI = ref(false)

const job = ref({
  id:"",
  title:"",
  city: "",
  state: "",
  postal: "",
  industry: "",
  category: "",
  description: "",
  workEnvironment: WorkEnvironment.ON_SITE,
  payFrequency: PayFrequency.MONTHLY,
  payType: PayType.YEARLY,
  travel: Travel.TRAVEL_NONE,
  employmentType: EmploymentType.FULL_TIME,
  performanceBonus: false,
  education: EducationLevel.HIGH_SCHOOL,
  autoRenew: false,
  skipAssessment: false,
  skipForm: false,
} as Job)

const props = defineProps({
  id: {
    type: String,
    default: ''
  }
});

const getIconForPayType = (payType: string | undefined) => {
  switch (payType) {
    case PayType.HOURLY: return "fas fa-clock"
    case PayType.MONTHLY: return "fas fa-calendar"
    case PayType.YEARLY: return "fas fa-calendar-alt"
  }
}

const getIconForWorkEnvironment = (workEnvironment: string | undefined) => {
  switch (workEnvironment) {
    case WorkEnvironment.ON_SITE: return "fas fa-building"
    case WorkEnvironment.REMOTE: return "fas fa-home"
    case WorkEnvironment.HYBRID: return "fas fa-laptop-house"
  }
}

const getIconForEmploymentType = (employmentType: string | undefined) => {
  switch (employmentType) {
    case EmploymentType.FULL_TIME: return "fas fa-briefcase"
    case EmploymentType.PART_TIME: return "fas fa-clock"
    case EmploymentType.CONTRACT: return "fas fa-handshake"
    case EmploymentType.TEMPORARY: return "fas fa-calendar-times"
  }
}

const getIconForIncentiveCompensation = (incentiveCompensation: string | undefined) => {
  switch (incentiveCompensation) {
    case IncentiveCompensation.NONE: return "fas fa-times"
    case IncentiveCompensation.BONUS: return "fas fa-coins"
    case IncentiveCompensation.COMMISSION: return "fas fa-percent"
    case IncentiveCompensation.PROFIT: return "fas fa-chart-line"
    case IncentiveCompensation.OTHER: return "fas fa-question"
  }
}

const toggleBenefits = (event: any) => {
  const item = event.target.closest("label")?.id
  if (item === "no-benefits") {
   medicalInsurance.value = false
   dentalInsurance.value = false
   visionInsurance.value = false
   retirementPlan.value = false
   lifeInsurance.value = false
  } else {
    noBenefits.value = false
  }
  let thisBenefits = ""
  if (medicalInsurance.value) {
    thisBenefits += "medical-insurance|"
  }
  if (dentalInsurance.value) {
    thisBenefits += "dental-insurance|"
  }
  if (visionInsurance.value) {
    thisBenefits += "vision-insurance|"
  }
  if (retirementPlan.value) {
    thisBenefits += "retirement-plan|"
  }
  if (lifeInsurance.value) {
    thisBenefits += "life-insurance|"
  }
  if (noBenefits.value) {
    thisBenefits += "no-benefits"
  } else {
    thisBenefits = thisBenefits.substring(0, thisBenefits.length - 1)
  }
  job.value.benefits = thisBenefits
}


const addResponsibility = () => {
  if (responsibility.value) {
    responsibilities.value.push(responsibility.value.trim())
    responsibility.value = ""
  }
}

const removeResponsibility = (responsibility: string) => {
  responsibilities.value = responsibilities.value.filter((item: string) => item !== responsibility)
}

const addSkill = () => {
  if (skill.value) {
    skills.value.push(skill.value.trim())
    skill.value = ""
  }
}

const removeSkill = (skill: string) => {
  skills.value = skills.value.filter((item: string) => item !== skill)
}

const getSkillButtonColor = (index: number) => {
  let color = skillColors[index % skillColors.length]
  return  color.replace("bg-", "text-").replace("-100", "-600") + " hover:text-" + color.replace("bg-", "").replace("-100", "-800")
}

const getSkillTextColor = (index: number) => {
  let color = skillColors[index % skillColors.length]
  return color + " text-" + color.replace("bg-", "").replace("-100", "-800")
}

const addQualification = () => {
  if (qualification.value) {
    qualifications.value.push(qualification.value.trim())
    qualification.value = ""
  }
}

const removeQualification = (qualification: string) => {
  qualifications.value = qualifications.value.filter((item: string) => item !== qualification)
}

const strToArray = (str: string | undefined) => {
  if (str) {
    const arr = str.split("|")
    if (arr.length === 1 && arr[0] === "") {
      return []
    } else {
      return arr
    }
  }
  return []
}

const resolver = () => {
  const errors: any = {}

  if (!job.value.title) {
    errors.title = [{ message: 'Job Title is required' }]
  }
  if (!job.value.industry) {
    errors.industry = [{ message: 'Industry is required' }]
  }
  if (!job.value.category) {
    errors.category = [{ message: 'Category is required' }]
  }
  if (!job.value.city) {
    errors.city = [{ message: 'City is required' }]
  }
  if (!job.value.state) {
    errors.state = [{ message: 'State is required' }]
  }
  if (!job.value.postal) {
    errors.postal = [{ message: 'Postal is required' }]
  }
  return { errors }
}

const handleSubmit = (evt: any) => {
  if (evt.valid) {
    loadingAI.value = true
    // Defaults
    job.value.payType = PayType.YEARLY
    job.value.payFrequency = PayFrequency.BI_WEEKLY
    job.value.employmentType = EmploymentType.FULL_TIME
    job.value.travel = Travel.TRAVEL_NONE
    job.value.publishStatus = publishStatus.value.label
    job.value.responsibilities = responsibilities.value.join("|")
    job.value.requiredSkills = skills.value.join("|")
    job.value.qualifications = qualifications.value.join("|")
    hrbCore.generateAI(job.value).then((response: any) => {
      loadingAI.value = false
      if (response.success) {
        loadJob(response.payload.id)
        if (!isNewJob.value) {
          emit("reload")
        }
        isNewJob.value = false
      } else {
        hrbCore.putMessage(response.message, true)
      }
    })
  }
}

const loadJob = (jobId: string) => {
  hrbCore.getJobById(jobId).then((response: any) => {
    if (response.success) {
      job.value = response.payload
      job.value.category = response.payload.category.name
      job.value.industry = response.payload.industry.name
      const current: any = []
      const national: any = []
      switch (job.value.publishStatus) {
        case PublishStatus.PUBLISHED.label:
          publishStatus.value = PublishStatus.PUBLISHED
          break;
        case PublishStatus.REVIEW.label:
          publishStatus.value = PublishStatus.REVIEW
          break;
        case PublishStatus.INCOMPLETE.label:
          publishStatus.value = PublishStatus.INCOMPLETE
          break;
        case PublishStatus.ARCHIVED.label:
          publishStatus.value = PublishStatus.ARCHIVED
          break;
      }
      if (job.value.salaryLower && job.value.salaryLower > 0) {
        showSalaryRange.value = true
      } else {
        showSalaryRange.value = false
      }
      if (job.value.benefits) {
        const benefits = job.value.benefits
        if (benefits.length === 0) {
          noBenefits.value = true
        }
        if (benefits.indexOf("Medical Insurance") !== -1) {
          medicalInsurance.value = true
        }
        if (benefits.indexOf("Dental Insurance") !== -1) {
          dentalInsurance.value = true
        }
        if (benefits.indexOf("Vision Insurance") !== -1) {
          visionInsurance.value = true
        }
        if (benefits.indexOf("Life Insurance") !== -1) {
          lifeInsurance.value = true
        }
        if (benefits.indexOf("401k") !== -1) {
          retirementPlan.value = true
        }
      }
      qualifications.value = strToArray(job.value.qualifications)
      responsibilities.value = strToArray(job.value.responsibilities)
      skills.value = strToArray(job.value.requiredSkills)

      try {
        if ("salaryEstimate" in response.payload) {
          const jsonObj = JSON.parse(response.payload.salaryEstimate)
          for (let i = 0; i < jsonObj.length; i++) {
            current.push({
              lower: jsonObj[i]["pay_lower"],
              upper: jsonObj[i]["pay_upper"],
            })
            national.push(jsonObj[i].national_average)
          }
          salaryNational.value = national
          salaryCurrentLocation.value = current
        }
      } catch (err) {
        console.log(err)
      }
    }
  })
}
onMounted(() => {
  hrbCore.getJobIndustries().then((response: any) => {
    industries.value = response.payload
  })
  hrbCore.getJobCategories().then((response: any) => {
    categories.value = response.payload
  })
  if (props.hasOwnProperty("id") && props.id) {
    isNewJob.value = false
    loadJob(props.id)
  } else {
    showSalaryRange.value = true
    medicalInsurance.value = true
    publishStatus.value = PublishStatus.INCOMPLETE
  }
})
const emit = defineEmits(["reload"]);
</script>
<template>
  <Form v-slot="$form" :resolver="resolver" @submit="handleSubmit">
    <!-- Core Job Information Section -->
    <section id="core-job-info" class="mb-8">
      <div class="bg-white rounded-xl border border-gray-200 p-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Core Job Information</h2>
            <p class="text-gray-600 mt-1">Start by defining the basic details of your job posting</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Left Column -->
          <div class="space-y-6">
            <!-- Job Title -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Job Title <span class="text-red-500">*</span>
              </label>
              <InputText name="title" v-model="job.title" placeholder="e.g. Senior Frontend Developer" class="w-full"/>
              <Message v-if="$form.title?.invalid" severity="error" size="small" variant="simple">{{ $form.title.error.message }}</Message>
              <p class="text-xs text-gray-500 mt-1">This will be the main headline candidates see</p>
            </div>
            <!-- Industry -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Industry <span class="text-red-500">*</span>
              </label>
              <Select name="industry" v-model="job.industry" :options="industries" optionLabel="name" optionValue="name" placeholder="Select an industry" class="w-full"/>
              <Message v-if="$form.industry?.invalid" severity="error" size="small" variant="simple">{{ $form.industry.error.message }}</Message>
            </div>

            <!-- Department -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Department <span class="text-red-500">*</span>
              </label>
              <Select name="category" v-model="job.category" :options="categories" optionLabel="name" optionValue="name" placeholder="Select a category" class="w-full"/>
              <Message v-if="$form.category?.invalid" severity="error" size="small" variant="simple">{{ $form.category.error.message }}</Message>
            </div>

            <!-- Publish Status -->
            <div v-if="!isNewJob">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Publish Status <span class="text-red-500">*</span></label>
              <div class="relative">
                <Select v-model="publishStatus" :options="Object.values(PublishStatus)" optionLabel="label" class="w-full">
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

            <!-- Auto Renew Toggle -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 class="font-medium text-gray-900">Auto-renew job posting</h4>
                <p class="text-sm text-gray-600">Automatically repost when the listing expires</p>
              </div>
              <label class="relative cursor-pointer">
                <ToggleSwitch v-model="job.autoRenew" />
              </label>
            </div>
          </div>

          <!-- Right Column - Location -->
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Job Location</h3>

              <!-- Work Type -->
              <div class="mb-4">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Work Environment</label>
                <div class="grid gap-3" :class="'grid-cols-' + Object.values(WorkEnvironment).length">
                  <template v-for="workEnvironment in Object.values(WorkEnvironment)" :key="workEnvironment">
                    <label class="flex items-center p-3 border rounded-lg cursor-pointer " :class="job.workEnvironment === workEnvironment ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50 border-gray-300'">
                      <RadioButton v-model="job.workEnvironment" :value="workEnvironment" />
                      <i class="pl-1" :class="getIconForWorkEnvironment(workEnvironment) + ' ' + (job.workEnvironment === workEnvironment ? 'text-blue-600' : 'text-gray-600')"></i>
                      <span class="pl-1 text-sm font-medium" :class="job.workEnvironment ===workEnvironment ? 'text-blue-600' : 'text-gray-600'">{{workEnvironment}}</span>
                    </label>
                  </template>
                </div>
              </div>

              <!-- Address Fields -->
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Address Line</label>
                  <InputText v-model="job.address" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="123 Main Street" />
                </div>

                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">City <span class="text-red-500">*</span></label>
                    <InputText name="city" v-model="job.city" class="w-full" placeholder="Austin"/>
                    <Message v-if="$form.city?.invalid" severity="error" size="small" variant="simple">{{ $form.city.error.message }}</Message>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">State <span class="text-red-500">*</span></label>
                    <div class="relative">
                      <Select name="state" v-model="job.state" :options="Object.values(States)" placeholder="Select a state" class="w-full" />
                      <Message v-if="$form.state?.invalid" severity="error" size="small" variant="simple">{{ $form.state.error.message }}</Message>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Postal Code <span class="text-red-500">*</span></label>
                    <InputText name="postal" v-model="job.postal" class="w-full" placeholder="78701" />
                    <Message v-if="$form.postal?.invalid" severity="error" size="small" variant="simple">{{ $form.postal.error.message }}</Message>
                  </div>
                </div>
              </div>
              <div class="flex justify-end mt-10">
                <button id="ai-generate-description" :disabled="loadingAI" type="submit" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
                  <i class="fas" :class="loadingAI ? 'fa-spinner fa-spin' : 'fa-magic'"></i>
                  <span>{{(loadingAI ? 'Generating' : (isNewJob ? 'Generate' : 'Regenerate')) + ' with AI'}}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- Job Description Section -->
    <section id="job-description" class="mb-8" v-if="!isNewJob">
      <div class="bg-white rounded-xl border border-gray-200 p-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Job Description</h2>
            <p class="text-gray-600 mt-1">Create a compelling description that attracts the right candidates</p>
          </div>
        </div>
        <Editor v-model="job.description" editorStyle="height: 150px" />
      </div>
    </section>
    <!-- Compensation Section -->
    <section id="compensation" class="mb-8" v-if="!isNewJob">
      <div class="bg-white rounded-xl border border-gray-200 p-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Compensation &amp; Benefits</h2>
            <p class="text-gray-600 mt-1">Define salary ranges and benefits to attract quality candidates</p>
          </div>
          <div class="flex items-center space-x-2 text-sm text-gray-500">
            <i class="fas fa-info-circle"></i>
            <span>Salary ranges increase application rates by 30%</span>
          </div>
        </div>

        <div class="space-y-6 mb-5">
          <label class="block text-sm font-semibold text-gray-700 mb-2">Salary Estimates</label>
          <div class="grid grid-cols-6" id="salary-estimates" v-if="salaryCurrentLocation.length > 0">
            <div>
              <div class="text-center m-1 p-1 bg-purple-300 " style="border-top-left-radius: 10px;">Level</div>
              <div class="text-center m-1 p-1 bg-gray-300">Current Location</div>
              <div class="text-center m-1 p-1 bg-gray-300" style="border-bottom-left-radius: 10px;">National Average</div>
            </div>
            <div>
              <div class="text-center m-1 p-1 bg-purple-300 ">Novice</div>
              <div class="text-center m-1 p-1 bg-gray-300">{{ utils.formatCurrency(salaryCurrentLocation[0].lower) + "-" + utils.formatCurrency(salaryCurrentLocation[0].upper) }}</div>
              <div class="text-center m-1 p-1 bg-gray-300">{{ utils.formatCurrency(salaryNational[0]) }}</div>
            </div>
            <div>
              <div class="text-center m-1 p-1 bg-purple-300 ">Intermediate</div>
              <div class="text-center m-1 p-1 bg-gray-300">{{ utils.formatCurrency(salaryCurrentLocation[1].lower) + "-" + utils.formatCurrency(salaryCurrentLocation[1].upper) }}</div>
              <div class="text-center m-1 p-1 bg-gray-300">{{ utils.formatCurrency(salaryNational[1]) }}</div>
            </div>
            <div>
              <div class="text-center m-1 p-1 bg-purple-300 ">Proficient</div>
              <div class="text-center m-1 p-1 bg-gray-300">{{ utils.formatCurrency(salaryCurrentLocation[2].lower) + "-" + utils.formatCurrency(salaryCurrentLocation[2].upper) }}</div>
              <div class="text-center m-1 p-1 bg-gray-300">{{ utils.formatCurrency(salaryNational[2]) }}</div>
            </div>
            <div>
              <div class="text-center m-1 p-1 bg-purple-300 ">Advanced</div>
              <div class="text-center m-1 p-1 bg-gray-300">{{ utils.formatCurrency(salaryCurrentLocation[3].lower) + "-" + utils.formatCurrency(salaryCurrentLocation[3].upper) }}</div>
              <div class="text-center m-1 p-1 bg-gray-300">{{ utils.formatCurrency(salaryNational[3]) }}</div>
            </div>
            <div>
              <div class="text-center m-1 p-1 bg-purple-300 " style="border-top-right-radius: 10px;">Expert</div>
              <div class="text-center m-1 p-1 bg-gray-300">{{ utils.formatCurrency(salaryCurrentLocation[4].lower) + "-" + utils.formatCurrency(salaryCurrentLocation[4].upper) }}</div>
              <div class="text-center m-1 p-1 bg-gray-300"  style="border-bottom-right-radius: 10px;">{{ utils.formatCurrency(salaryNational[4]) }}</div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Left Column - Salary Information -->
          <div class="space-y-6">
            <!-- Pay Type -->
            <div class="mb-4">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Pay Type</label>
              <div class="grid gap-3" :class="'grid-cols-' + Object.values(PayType).length">
                <template v-for="payType in Object.values(PayType)" :key="payType">
                  <label class="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer " :class="job.payType === payType ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50 border-gray-300'">
                    <RadioButton v-model="job.payType" :value="payType"/>
                    <i class="pl-1 text-gray-600 mb-1" :class="getIconForPayType(payType) + ' ' + (job.payType === payType ? 'text-blue-600' : 'text-gray-600')"></i>
                    <div class="pl-1 text-sm font-medium text-normal text-nowrap" :class="job.payType === payType ? 'text-blue-600' : 'text-gray-600'">{{payType.replace("Salary", "")}}</div>
                  </label>
                </template>
              </div>
            </div>

            <!-- Salary Range Toggle -->
            <div class="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <h4 class="font-medium text-blue-900">Show salary range</h4>
                <p class="text-sm text-blue-700">Increases application quality and quantity</p>
              </div>
              <label class="relative cursor-pointer">
                <ToggleSwitch v-model="showSalaryRange" />
              </label>
            </div>

            <!-- Salary Range Inputs -->
            <div class="grid grid-cols-2 gap-4">
              <div v-if="showSalaryRange">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Minimum Salary</label>
                <InputNumber v-model="job.salaryLower" inputId="currency-us" mode="currency" currency="USD" locale="en-US" fluid placeholder="$75,000" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">{{showSalaryRange ? 'Maximum Salary' : 'Salary'}}</label>
                <InputNumber v-model="job.salaryUpper" inputId="currency-us" mode="currency" currency="USD" locale="en-US" fluid placeholder="$95,000" />
              </div>
            </div>

            <!-- Pay Frequency -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Pay Frequency</label>
              <Select v-model="job.payFrequency" :options="Object.values(PayFrequency)" placeholder="Select a pay frequency" class="w-full" />
            </div>

            <!-- Travel Requirement -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Travel Requirement</label>
              <Select v-model="job.travel" :options="Object.values(Travel)" placeholder="Select a travel requirement" class="w-full" />
            </div>

            <!-- Employment Type -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Employment Type</label>
              <div class="grid gap-3 grid-cols-2">
                <template v-for="employmentType in Object.values(EmploymentType)" :key="employmentType">
                  <label class="flex items-center p-3 border rounded-lg cursor-pointer " :class="job.employmentType === employmentType ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50 border-gray-300'">
                    <RadioButton v-model="job.employmentType" :value="employmentType" class="sr-only"/>
                    <i class="pl-1 fas fa-building" :class="getIconForEmploymentType(employmentType) + ' ' + (job.employmentType === employmentType ? 'text-blue-600' : 'text-gray-600')"></i>
                    <span class="pl-1 text-sm font-medium" :class="job.employmentType === employmentType ? 'text-blue-600' : 'text-gray-600'">{{employmentType}}</span>
                  </label>
                </template>
              </div>
            </div>
          </div>

          <!-- Right Column - Benefits & Additional Compensation -->
          <div class="space-y-6">
            <!-- Benefits -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-3">Benefits Package</label>
              <div class="space-y-3">
                <label id="medical-insurance" class="flex items-center p-3 border rounded-lg cursor-pointer" :class="medicalInsurance ? 'border-green-500 bg-green-50' : 'hover:bg-gray-50 border-gray-300'" @change="toggleBenefits">
                  <Checkbox v-model="medicalInsurance" binary :class="medicalInsurance ? 'border-green-500 bg-green-50' : 'hover:bg-gray-50 border-gray-300'" />
                  <i class="fas fa-heartbeat ml-2" :class="medicalInsurance ? 'text-green-600' : 'text-gray-600'"></i>
                  <span class="font-medium ml-2" :class="medicalInsurance ? 'text-green-700' : 'text-gray-700'">Medical Insurance</span>
                </label>
                <label id="dental-insurance" class="flex items-center p-3 border rounded-lg cursor-pointer" :class="dentalInsurance ? 'border-green-500 bg-green-50' : 'hover:bg-gray-50 border-gray-300'" @change="toggleBenefits">
                  <Checkbox v-model="dentalInsurance" binary :class="dentalInsurance ? 'border-green-500 bg-green-50' : 'hover:bg-gray-50 border-gray-300'" />
                  <i class="fas fa-heartbeat ml-2" :class="dentalInsurance ? 'text-green-600' : 'text-gray-600'"></i>
                  <span class="font-medium ml-2" :class="dentalInsurance ? 'text-green-700' : 'text-gray-700'">Dental Insurance</span>
                </label>
                <label id="vision-insurance" class="flex items-center p-3 border rounded-lg cursor-pointer" :class="visionInsurance ? 'border-green-500 bg-green-50' : 'hover:bg-gray-50 border-gray-300'" @change="toggleBenefits">
                  <Checkbox v-model="visionInsurance" binary :class="visionInsurance ? 'border-green-500 bg-green-50' : 'hover:bg-gray-50 border-gray-300'" />
                  <i class="fas fa-heartbeat ml-2" :class="visionInsurance ? 'text-green-600' : 'text-gray-600'"></i>
                  <span class="font-medium ml-2" :class="visionInsurance ? 'text-green-700' : 'text-gray-700'">Vision Insurance</span>
                </label>
                <label id="retirement-plan" class="flex items-center p-3 border rounded-lg cursor-pointer" :class="retirementPlan ? 'border-green-500 bg-green-50' : 'hover:bg-gray-50 border-gray-300'" @change="toggleBenefits">
                  <Checkbox v-model="retirementPlan" binary :class="retirementPlan ? 'border-green-500 bg-green-50' : 'hover:bg-gray-50 border-gray-300'" />
                  <i class="fas fa-heartbeat ml-2" :class="retirementPlan ? 'text-green-600' : 'text-gray-600'"></i>
                  <span class="font-medium ml-2" :class="retirementPlan ? 'text-green-700' : 'text-gray-700'">401(k)Retirement Plan</span>
                </label>
                <label id="life-insurance" class="flex items-center p-3 border rounded-lg cursor-pointer" :class="lifeInsurance ? 'border-green-500 bg-green-50' : 'hover:bg-gray-50 border-gray-300'" @change="toggleBenefits">
                  <Checkbox v-model="lifeInsurance" binary :class="lifeInsurance ? 'border-green-500 bg-green-50' : 'hover:bg-gray-50 border-gray-300'" />
                  <i class="fas fa-heartbeat ml-2" :class="lifeInsurance ? 'text-green-600' : 'text-gray-600'"></i>
                  <span class="font-medium ml-2" :class="lifeInsurance ? 'text-green-700' : 'text-gray-700'">Life Insurance</span>
                </label>
                <label id="no-benefits" class="flex items-center p-3 border rounded-lg cursor-pointer" :class="noBenefits ? 'border-red-300 bg-red-50' : 'hover:bg-gray-50 border-gray-300'" @change="toggleBenefits">
                  <Checkbox v-model="noBenefits" binary :class="noBenefits ? 'border-red-600 ' : 'hover:bg-gray-50 border-gray-300'" />
                  <i class="fas fa-heartbeat ml-2" :class="noBenefits ? 'text-red-600' : 'text-gray-600'"></i>
                  <span class="font-medium ml-2" :class="noBenefits ? 'text-red-700' : 'text-gray-700'">No Benefits Offered</span>
                </label>
              </div>
            </div>

            <!-- Incentive Compensation -->
            <label class="block text-sm font-semibold text-gray-700 mb-2">Incentive Compensation</label>
            <div class="grid gap-3 grid-cols-2">
              <template v-for="incentiveCompensation in Object.values(IncentiveCompensation)" :key="incentiveCompensation">
                <label class="flex items-center p-3 border rounded-lg cursor-pointer " :class="job.incentiveCompensation === incentiveCompensation ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50 border-gray-300'">
                  <RadioButton v-model="job.incentiveCompensation" :value="incentiveCompensation"/>
                  <i class="pl-1 fas fa-building" :class="getIconForIncentiveCompensation(incentiveCompensation) + ' ' + (job.incentiveCompensation === incentiveCompensation ? 'text-blue-600' : 'text-gray-600')"></i>
                  <span class="pl-1 text-sm font-medium" :class="job.incentiveCompensation === incentiveCompensation ? 'text-blue-600' : 'text-gray-600'">{{incentiveCompensation}}</span>
                </label>
              </template>
            </div>
            <!-- Signing Bonus -->
            <div id="signing-bonus-section">
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 class="font-medium text-gray-900">Signing Bonus</h4>
                  <p class="text-sm text-gray-600">One-time bonus for accepting the position</p>
                </div>
                <InputNumber v-model="job.signingBonus" inputId="currency-us" mode="currency" currency="USD" locale="en-US" placeholder="$5,000" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- Skills & Responsibilities Section -->
    <section id="skills-responsibilities" class="mb-8" v-if="!isNewJob">
      <div class="bg-white rounded-xl border border-gray-200 p-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Skills &amp; Responsibilities</h2>
            <p class="text-gray-600 mt-1">Define the key skills and responsibilities for this role</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Required Skills -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Required Skills</h3>
              <span class="text-sm text-gray-500">5-8 recommended</span>
            </div>

            <!-- Skill Input -->
            <div class="mb-4">
              <InputGroup>
                <InputText v-model="skill" placeholder="Type a skill and press Enter" @keyup.enter="addSkill"  />
                <InputGroupAddon>
                  <Button @click="addSkill" icon="pi pi-plus" severity="primary" />
                </InputGroupAddon>
              </InputGroup>
            </div>

            <!-- Skills List -->
            <div id="skills-container" class="flex flex-wrap gap-2 mb-4">
              <template v-for="(skill, index) in skills" :key="skill">
                <div class="skill-tag flex items-center px-3 py-1.5 text-sm font-medium rounded-full" :class="getSkillTextColor(index)">
                    {{skill}}
                    <button @click="removeSkill(skill)" class="ml-2" :class="getSkillButtonColor(index)">
                        <i class="fas fa-times text-xs"></i>
                    </button>
                </div>
              </template>
            </div>
          </div>

          <!-- Key Responsibilities -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Key Responsibilities</h3>
              <span class="text-sm text-gray-500">3-6 recommended</span>
            </div>

            <!-- Responsibility Input -->
            <div class="mb-4">
              <InputGroup>
                <InputText v-model="responsibility" placeholder="Describe a key responsibility" @keyup.enter="addResponsibility" />
                <InputGroupAddon>
                  <Button @click="addResponsibility" icon="pi pi-plus" severity="success" />
                </InputGroupAddon>
              </InputGroup>
            </div>

            <!-- Responsibilities List -->
            <div id="responsibilities-container" class="flex flex-wrap gap-2 mb-4">
              <template v-for="responsibility in responsibilities" :key="responsibility">
                <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i class="fas fa-check text-green-600 text-xs"></i>
                  </div>
                  <div class="flex-1">
                    <p class="text-gray-800">{{responsibility}}</p>
                  </div>
                  <button @click="removeResponsibility(responsibility)" class="text-gray-400 hover:text-red-600">
                    <i class="fas fa-times text-sm"></i>
                  </button>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Education & Experience Section -->
    <section id="education-experience" class="mb-8" v-if="!isNewJob">
      <div class="bg-white rounded-xl border border-gray-200 p-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Education &amp; Experience</h2>
            <p class="text-gray-600 mt-1">Define the educational background and experience requirements</p>
          </div>
          <div class="flex items-center space-x-2 text-sm text-gray-500">
            <i class="fas fa-lightbulb"></i>
            <span>Be flexible to attract diverse talent</span>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Education Requirements -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Education Requirements</h3>

            <!-- Education Level -->
            <div class="mb-4">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Minimum Education Level</label>
              <div class="space-y-2">
                <template v-for="educationLevel in Object.values(EducationLevel)" :key="educationLevel">
                  <label class="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50" :class="job.minEducation === educationLevel ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50 border-gray-300'">
                    <RadioButton :id="'education-level-' + educationLevel" v-model="job.minEducation" :value="educationLevel" />
                    <span class="text-sm">{{educationLevel}}</span>
                  </label>
                </template>
              </div>
            </div>
          </div>
          <!-- Experience Requirements -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Experience Requirements</h3>

            <!-- Years of Experience -->
            <div class="mb-4">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Years of Experience</label>
              <div class="grid gap-3">
                <div>
                  <Select v-model="job.experienceLevel" :options="Object.values(ExperienceLevel)" placeholder="Experience Level" class="w-full" />
                </div>
              </div>
            </div>
          </div>

          <!-- Certifications -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Required Certifications</h3>

            <div class="mb-4">
              <InputGroup>
                <InputText v-model="qualification" placeholder="Add required certification" @keyup.enter="addQualification" />
                <InputGroupAddon>
                  <Button @click="addQualification" icon="pi pi-plus" severity="warn" />
                </InputGroupAddon>
              </InputGroup>
            </div>

            <!-- Certifications List -->
            <div id="certifications-container" class="flex flex-wrap gap-2 mb-4">
              <template v-for="qualification in qualifications" :key="qualification">
                <div class="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                  <div class="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i class="fas fa-check text-orange-600 text-xs"></i>
                  </div>
                  <div class="flex-1">
                    <p class="text-blue-800">{{qualification}}</p>
                  </div>
                  <button @click="removeQualification(qualification)" class="text-blue-600 hover:text-blue-800">
                    <i class="fas fa-times text-sm"></i>
                  </button>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- Action Buttons Section -->
    <section id="action-buttons" class="mb-8" v-if="!isNewJob">
      <div class="bg-white rounded-xl border border-gray-200 p-8">
        <div class="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-check-circle text-green-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Job Details Complete</h3>
              <p class="text-sm text-gray-600">All required information has been provided</p>
            </div>
          </div>
          <div class="flex items-center">
            <Button :disabled="loadingAI" type="submit" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
              <i class="fas" :class="loadingAI ? 'fa-spinner fa-spin' : 'fa-save'"></i>
              <span>{{loadingAI ? 'Saving...' : 'Save'}}</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  </Form>
</template>
