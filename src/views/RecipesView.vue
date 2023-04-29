<template>
  <div class="recipes-container">
    <div class="recipes-title">
      <h1>Middagsforslag</h1>
    </div>
    <SearchBarComp :search-placeholder="searchPlaceholder" id="search-bar" @search="filterRecipes"/>
    <div v-if="updateMessage.length === 0" class="recipes-grid">
      <RecipeCardComp v-for="(recipe, index) in filteredRecipes" :key="index" :recipe="recipe"/>
    </div>
    <div v-if="updateMessage.length > 0" class="update-message">
      <h3> {{ updateMessage }}</h3>
    </div>
  </div>
</template>

<script setup lang="ts">
import SearchBarComp from '../components/SearchBarComp.vue'
import RecipeCardComp from '../components/RecipeCardComp.vue'
import { ref, onMounted } from 'vue'
import axios, { AxiosError } from 'axios'
import { useUserStore } from '../stores/UserStore'
import { RecipeCardInterface } from '../components/types'

const userStore = useUserStore()
const searchPlaceholder = ref('Søk etter oppskrifter...')
const recipes = ref<RecipeCardInterface[]>([])
onMounted(() => {
  getRecipes().then(() => {
    filteredRecipes.value = recipes.value
  })
})
const updateMessage = ref('')
const filteredRecipes = ref<RecipeCardInterface[]>([])

async function getRecipes () {
  const path = 'http://localhost:8080/recipe/list/sorted'
  const config = {
    headers: {
      'Content-Type': 'application/json'
    },
    withCredentials: true
  }

  try {
    const response = await axios.get(path, config)

    if (response.status === 200) {
      recipes.value = response.data
    }
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      if (error.response && error.response.status === 600) {
        userStore.logout()
      } else {
        if (error.message && error.message === 'Network Error') {
          updateMessage.value = 'Kunne ikke nå server.'
        } else {
          updateMessage.value = error.message
        }
      }
    }
  }
}

async function filterRecipes (searchInput: string) {
  filteredRecipes.value = recipes.value.filter((recipeCard: RecipeCardInterface) => {
    return recipeCard.recipe.name.toLowerCase().includes(searchInput.toLowerCase())
  })
}
</script>

<style scoped>

.recipes-container {
  min-height: 100vh;
  height: 100%;
  padding-top: 15vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.recipes-title h1 {
  font-size: 40px;
  margin: 0;
  margin-top: 5px;
  font-weight: normal;
  font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
}

#search-bar{
  position: relative;
  text-align: center;
  margin-top: 17px;
  color: black;
  width: 50%;
  max-width: 1000px;
  z-index: 3;
  scale: 0.8;
}

.recipes-grid {
  margin-top: 30px;
  margin-bottom: 50px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 40px;
}

.update-message {
  margin-top: 80px;
}
</style>