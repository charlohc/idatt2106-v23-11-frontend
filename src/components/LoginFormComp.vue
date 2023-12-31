<template>
  <div class="login-form">
    <div class="title">Logg inn</div>
    <div class="update-message">
      <h4> {{ updateMessage }}</h4>
    </div>
    <form @submit.prevent="submitLogin">
      <div class="input-boxes">
        <div class="input-box">
          <i class="fas fa-envelope"></i>
          <input
          data-cy="input-email"
          type="email"
          v-model="email"
          placeholder="E-post..."
          @input="resetUpdate"
          required>
        </div>
        <div class="input-box">
          <i class="fas fa-lock"></i>
          <input
          data-cy="input-password"
          type="password"
          v-model="password"
          placeholder="Passord..."
          @input="resetUpdate"
          required>
        </div>
        <div class="button input-box" data-cy="button-login">
          <input type="submit" value="Logg inn">
        </div>
        <div class="text sign-up-text">Har du ikke bruker?
          <label data-cy="switch-to-signup" @click="emit('switch-view')">Registrer deg</label>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '../stores/UserStore'
import { useUtilityStore } from '../stores/UtilityStore'
import router from '../router/index'
import { ref, watchEffect } from 'vue'
import api from '../utils/httputils'
import { SHA256 } from 'crypto-js'

const email = ref('')
const password = ref('')
const updateMessage = ref('')
const emit = defineEmits(['switch-view'])
const userStore = useUserStore()
const utilityStore = useUtilityStore()
const props = defineProps({
  signupMessage: {
    type: String,
    required: true
  }
})
watchEffect(() => {
  if (props.signupMessage) {
    updateMessage.value = props.signupMessage
  }
})
const validateLogin = () => {
  const emailRegex = ref(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)

  if (email.value === '' || password.value === '') {
    updateMessage.value = 'Vennligst fyll alle felt.'
    return false
  }
  if (!emailRegex.value.test(String(email.value).toLowerCase())) {
    updateMessage.value = 'Ugyldig e-post.'
    return
  }
  if (email.value.length > 60) {
    updateMessage.value = 'E-post er for lang.'
    return false
  }
  if (password.value.length > 200) {
    updateMessage.value = 'Passord er for lang.'
    return false
  }

  if (password.value.length < 8) {
    updateMessage.value = 'Passord må være minst 8 karakterer langt.'
    return false
  }
  return true
}

function resetUpdate () {
  updateMessage.value = ''
}

async function submitLogin () {
  resetUpdate()
  if (validateLogin()) {
    const path = '/user/login'
    const hashedPassword = SHA256(password.value)
    const request = {
      email: email.value,
      password: hashedPassword.toString()
    }

    await api.post(path, request)
      .then(async (response) => {
        if (response.status === 200) {
          userStore.login(response.data.userEmail)
          if (response.data.childUser) {
            router.push('/subuser')
          } else {
            router.push('/savings')
            userStore.noSubUserLogin()
            utilityStore.showItems()
          }
        }
      })
      .catch((error) => {
        if (error.response.status === 400) {
          updateMessage.value = error.response.data.message
        }
      })
  }
}
</script>

<style scoped>

.update-message {
  margin-top: 20px;
  height: 30px;
  padding: 0;
}

.update-message h4 {
  font-size: 17px;
  padding: 0;
  margin: 0;
}
</style>
