<template>
  <div class="container">
    <h1 class="title">Ukes menyer!</h1>
    <p>Nedenfor har du to ulikes ukesmenyer du kan velge mellom<br>
      den ene er anbefalt basert på varene du har i kjøleskapet ditt og varer som snart går ut på dato<br>
      den andre består av helt tilfeldige retter som kan gi inspirasjonn</p>
    <div class="week-menus">
    <WeekMenuCardComp :week-menu="randomMenu" @click="goToMenu(recipeItemsIdList)"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, ref } from 'vue'
import { useUserStore } from '../stores/UserStore'
import { useRecipeStore } from '../stores/RecipeStore'
import axios from 'axios'
import { RecipeInterface, WeekMenuCardInterface } from '../components/types'
import router from '../router'
const WeekMenuCardComp = defineAsyncComponent(
  () => import('../components/WeekMenuCardComp.vue')
)

const userStore = useUserStore()
const recipeStore = useRecipeStore()
const recipes = ref<RecipeInterface[]>([])
const recipeItemsIdList: number[] = []
const randomMenu = ref<WeekMenuCardInterface>()

onMounted(() => {
  getWeekMenuRandom()
})

async function getWeekMenuRandom () {
  const path = 'http://localhost:8080/week-menu/list-random'
  const config = {
    headers: {
      'Content-Type': 'application/json'
    },
    withCredentials: true
  }
  await axios.get(path, config)
    .then(async (response) => {
      if (response.status === 200) {
        recipes.value = response.data

        let counter = 0
        recipes.value.forEach((recipe) => {
          if (counter === 0) {
            randomMenu.value = {
              firstRecipeImage: recipe.image,
              type: 'Random'
            }
          }
          recipeItemsIdList.push(recipe.id)
          counter++
        })
      }
    })
    .catch((error) => {
      if (error.response.status === 400) {
        console.log('error')
      } else if (error.response.status === 600) {
        userStore.logout()
      }
    })
}

function goToMenu (menuIds: number[]) {
  recipeStore.setRecipeIds(menuIds)
  router.push('/specificMenu')
}
</script>

<style scoped>

.container {
  /* Fixed distance from nav bar, need to change this so it corresponds with window size */
  display: grid;
  margin-top: 75px;
  height: 100vh;
}

.title {
  padding: 20px;
}

.week-menus {
  margin-left: 20%;
}

</style>