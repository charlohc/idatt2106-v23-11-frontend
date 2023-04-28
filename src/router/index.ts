import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import StartView from '../views/StartView.vue'
import MyFridgeView from '../views/MyFridgeView.vue'
import ShoppingListView from '../views/ShoppingListView.vue'
import SubUserView from '../views/SubUserView.vue'
import ProductSelectorView from '../views/ProductSelectorView.vue'
import SavingsOverview from '../views/SavingsOverviewView.vue'
import ProfileView from '../views/ProfileView.vue'
import RecipeSuggestionsView from '../views/RecipeSuggestionsView.vue'
import AddProductView from '../views/AddProductView.vue'
import AboutRecipeView from '../views/AboutRecipeView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'start',
    component: StartView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/fridge',
    name: 'fridge',
    component: MyFridgeView
  },
  {
    path: '/shoppinglist',
    name: 'shoppinglist',
    component: ShoppingListView
  },
  {
    path: '/subuser',
    name: 'subuser',
    component: SubUserView
  },
  {
    path: '/productSelection',
    name: 'productSelection',
    component: ProductSelectorView
  },
  {
    path: '/savings',
    name: 'savings',
    component: SavingsOverview
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView
  },
  {
    path: '/recipesuggestions',
    name: 'recipesuggestions',
    component: RecipeSuggestionsView
  },
  {
    path: '/addProduct',
    name: 'addProduct',
    component: AddProductView
  },

  {
    path: '/aboutRecipe',
    name: 'aboutRecipe',
    component: AboutRecipeView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
