<template>
  <div class="my-fridge">
    <div v-if="props.fridge" class="search-div">
      <SearchBar id="search-bar" :search-placeholder="searchPlaceholder" @search="searchProducts"/>
      <button v-if="userStore.role === 'PARENT'" class="products-button" @click="toggleProductSelector">Se alle produkter</button>
      <div v-if="showProductSelector" class="popup-overlay" @click="toggleProductSelector"></div>
      <div v-if="showProductSelector" class="product-selector-popup">
        <button class="close-button" @click="toggleProductSelector">x</button>
        <ProductSelector :fridge-items="products" :button-type="buttonType" @select="handleSelect" @refresh-page="refreshShoppingList" />
      </div>
    </div>
    <div class="update-message">
      {{ updateMessage }}
    </div>
    <div class="item-cards" v-for="product in filteredProducts" :key="product.id">
      <FridgeItemCard
        :product="product"
        @update="onUpdate"
        @selection-changed="onSelectionChanged"
        @item-eaten="markSingleItemAsEaten"
        @item-thrown="markSingleItemAsWaste"
      />
    </div>
    <div class="buttons">
      <button
        v-if="products.length > 0"
        class="fridge-button delete-button"
        @click="markAsWaste"
        v-bind:disabled="!isAnyProductSelected || userStore.role === Role.CHILD"
        v-bind:class="{ 'disabled-button': !isAnyProductSelected || userStore.role === Role.CHILD }"
      >
      Jeg har kastet dette
      </button>
      <button
        v-if="products.length > 0"
        class="fridge-button add-button"
        @click="markAsEaten"
        v-bind:disabled="!isAnyProductSelected || userStore.role === Role.CHILD"
        v-bind:class="{ 'disabled-button': !isAnyProductSelected || userStore.role === Role.CHILD }"
      >
      Jeg har spist dette
      </button>
      <div  v-if="products.length === 0" class="no-items">
        <h2 v-if="!props.fridge">Ingen utgåtte varer i kjøleskapet</h2>
        <h2 v-if="props.fridge">Ingen varer i kjøleskapet</h2>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import SearchBar from './SearchBarComp.vue'
import { FridgeItemCardInterface, Role } from '../components/types'
import { useUserStore } from '../stores/UserStore'
import FridgeItemCard from './FridgeItemCardComp.vue'
import ProductSelector from './ProductSelectorComp.vue'
import api from '../utils/httputils'

const props = defineProps({
  fridge: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['handle-swap', 'handle-decrement', 'refresh-page'])
const products = ref<FridgeItemCardInterface[]>([])
const selectedProducts = ref<FridgeItemCardInterface[]>([])
const userStore = useUserStore()
const updateMessage = ref('')
const searchPlaceholder = ref('Søk i kjøleskapet...')
const searchQuery = ref('')
const showProductSelector = ref(false)
const buttonType = ref('fridge')
const isAnyProductSelected = computed(() => selectedProducts.value.length > 0)

let messageTimeout: ReturnType<typeof setTimeout> | null = null

function showUpdateMessage (newMessage: string) {
  if (messageTimeout) {
    clearTimeout(messageTimeout)
  }
  updateMessage.value = newMessage
  messageTimeout = setTimeout(() => {
    updateMessage.value = ''
  }, 5000)
}

onMounted(() => {
  getItemsInFridge()
})

async function getItemsInFridge () {
  const path =
    props.fridge
      ? '/fridge/get'
      : '/fridge/get/expired'

  await api.get(path)
    .then(async (response) => {
      if (response.status === 200) {
        products.value = response.data
      }
    })
    .catch((error) => {
      if (error.response.status === 401) {
        userStore.logout()
      }
      updateMessage.value = error.response.data.message
    })
}

async function onUpdate (updatedProduct: FridgeItemCardInterface) {
  const path = '/fridge/edit'
  const fridgeItemRequest = {
    itemId: updatedProduct.id,
    quantity: updatedProduct.quantity,
    expirationDate: updatedProduct.expirationDate
  }

  await api.put(path, fridgeItemRequest)
    .then(async (response) => {
      if (response.status === 200) {
        const index = products.value.findIndex(
          (product) => product.id === updatedProduct.id
        )
        if ((checkExpirationDate(updatedProduct.expirationDate) && !props.fridge) ||
            (!checkExpirationDate(updatedProduct.expirationDate) && props.fridge)) {
          if (index !== -1) {
            products.value.splice(index, 1)
            const moved = props.fridge ? '"Utgåtte varer"' : '"Kjøleskap"'
            emit('handle-swap', props.fridge)
            showUpdateMessage(`Vare flyttet til ${moved}`)
          }
        } else {
          if (index !== -1) {
            products.value[index] = updatedProduct
            products.value = [...products.value]
            showUpdateMessage('Vare redigert')
          }
        }
      }
    })
    .catch((error) => {
      if (error.response.status === 401) {
        userStore.logout()
      }
      updateMessage.value = error.response.data.message
    })
}

function onSelectionChanged (event: { selected: boolean; product: FridgeItemCardInterface }) {
  if (event.selected) {
    selectedProducts.value.push(event.product)
  } else {
    selectedProducts.value = selectedProducts.value.filter((item) => item.id !== event.product.id)
  }
}

function searchProducts (query: string) {
  searchQuery.value = query
}

const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value
  return products.value.filter((product) =>
    product.item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const toggleProductSelector = () => {
  showProductSelector.value = !showProductSelector.value
}

const handleSelect = () => {
  showProductSelector.value = false
}

function refreshShoppingList () {
  emit('refresh-page')
  getItemsInFridge()
  toggleProductSelector()
}

const checkExpirationDate = (date: string) => {
  const currentDate = normalizeDate(new Date())
  const inputDate = normalizeDate(new Date(date))
  return inputDate >= currentDate
}

const normalizeDate = (date: Date) => {
  return new Date(date.setHours(0, 0, 0, 0))
}

async function removeItemsFromFridge (productsParam: FridgeItemCardInterface[]) {
  const selectedIds = productsParam.map((item) => item.id)

  const pathRemove = '/fridge/remove'
  const request = selectedIds

  await api.delete(pathRemove, { data: request })
    .then(async (response) => {
      if (response.status === 200) {
        showUpdateMessage('Varer spist')
        products.value = products.value.filter((product) => !selectedIds.includes(product.id))
      }
    })
    .catch((error) => {
      if (error.response.status === 401) {
        userStore.logout()
      }
      updateMessage.value = error.response.data.message
    })

  products.value = products.value.filter((product) => !selectedIds.includes(product.id))
}

function turnItemsToWaste (productsParam: FridgeItemCardInterface[]) {
  const totalWeight = productsParam.reduce(
    (sum, item) => sum + item.item.weightPerUnit * item.quantity,
    0
  )
  return totalWeight
}

async function addItemsToWaste (totalWaste: number) {
  const wasteRequest = {
    weight: totalWaste,
    entryDate: new Date().toISOString().split('T')[0]
  }

  const pathAddWaste = '/waste/add'
  await api.post(pathAddWaste, wasteRequest)
    .then(async (response) => {
      if (response.status === 200) {
        showUpdateMessage('Varer kastet')
        emit('handle-decrement', props.fridge, selectedProducts.value.length)
        selectedProducts.value = []
      }
    })
    .catch((error) => {
      if (error.response.status === 401) {
        userStore.logout()
      }
      updateMessage.value = error.response.data.message
    })
}

async function markAsEaten () {
  await removeItemsFromFridge(selectedProducts.value)
  emit('handle-decrement', props.fridge, selectedProducts.value.length)
  await new Promise(resolve => setTimeout(resolve, 0))
  window.scrollTo({ top: 0, behavior: 'smooth' })
  selectedProducts.value = []
}

async function markAsWaste () {
  await removeItemsFromFridge(selectedProducts.value)
  const totalWaste = turnItemsToWaste(selectedProducts.value)
  await addItemsToWaste(totalWaste)
  emit('handle-decrement', props.fridge, selectedProducts.value.length)
  await new Promise(resolve => setTimeout(resolve, 0))
  window.scrollTo({ top: 0, behavior: 'smooth' })
  selectedProducts.value = []
}

async function markSingleItemAsEaten (productParam: FridgeItemCardInterface) {
  const list = [productParam]
  await removeItemsFromFridge(list)
  emit('handle-decrement', props.fridge, list.length)
}

async function markSingleItemAsWaste (productParam: FridgeItemCardInterface) {
  const list = [productParam]
  await removeItemsFromFridge(list)
  const totalWaste = turnItemsToWaste(list)
  await addItemsToWaste(totalWaste)
  emit('handle-decrement', props.fridge, list.length)
}
</script>

<style scoped>

.search-div {
  margin-top: 10px;
  display: flex;
  width: 100%;
  max-width: 1000px;
  justify-content: center;
  align-items: center;
  justify-self: center;
  align-self: center;
}

.products-button {
  background-color: #1A7028;
  color: white;
  height: 40px;
  width: 200px;
  border-radius: 100px;
  border: none;
  margin: 0;
  padding: 0;
  z-index: 4;
  margin-left: -50px;
}

.products-button:hover {
  transform: scale(1.1);
  color: white;
  box-shadow: 0px 15px 25px -5px rgba(darken(dodgerblue, 40%));
  background-color: #25A13A;
}
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.product-selector-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1001;
  background-color: rgb(224, 224, 224);
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 20px;
  width: 80%;
  max-width: 1500px;
  min-width: 300px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  max-height: 80%;
  overflow-y: auto;
}

.close-button {
  position: absolute;
  top: -15px;
  right: 0px;
  background: none;
  border: none;
  font-size: 40px;
  color: black;
  font-weight: 500;
  cursor: pointer;
}

.close-button:focus {
  outline: none;
}
.my-fridge {
  display: flex;
  flex-direction: column;
  align-items: center;
}

#search-bar {
  text-align: center;
  justify-self: center;
  align-self: center;
  color: black;
  max-width: 1000px;
  width: 70%;
  z-index: 3;
  margin-right: 0;
  scale: 0.8;
}
.update-message {
  margin-top: 30px;
  font-size: 20px;
}

.no-items {
  margin-top: 80px;
}

.item-cards {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  margin-bottom: 20px;
}

.add-button {
  background-color: #1A7028;
}

.add-button:hover {
  background-color: #25A13A;
}

.fridge-button {
  color: white;
  height: 40px;
  width: 200px;
  margin-top: 60px;
  margin-left: 20px;
  margin-right: 20px;
  margin-bottom: 100px;
  border-radius: 100px;
  border: none;
}

.fridge-button:hover {
  transform: scale(1.1);
  color: white;
  box-shadow: 0px 15px 25px -5px rgba(darken(dodgerblue, 40%));
}

.fridge-button:active {
  background-color: black;
  box-shadow: 0px 4px 8px rgba(darken(dodgerblue, 30%));
  transform: scale(.90);
}

.delete-button {
  background-color: rgb(147, 0, 0);
}

.delete-button:hover {
  background-color: rgb(179, 6, 6);
}

.disabled-button {
  background-color: #bbb;
  color: black;
  cursor: not-allowed;
  opacity: 0.6;
}

.disabled-button:hover {
  background-color: #bbb;
  color: black;
  transform: scale(1);
}

@media only screen and (max-width: 800px) {
  .search-div {
    flex-direction: column;
    justify-content: center;
  }
  #search-bar {
    width: 400px;
  }
  .products-button {
    margin: 0;
    margin-top: 10px;
  }
}

@media only screen and (max-width: 600px) {
  .fridge-button {
    margin-top: 20px;
    margin-bottom: 0px;
  }
  .buttons {
    display: flex;
    flex-direction: column;
    margin-bottom: 50px;
  }
  .item-cards {
    width: 80%;
    min-width: 280px;
  }
}

@media only screen and (max-width: 360px) {
  #search-bar {
    width: 100%;
  }
  .product-selector-popup {
    width: 270px;
    max-width: 270px;
    min-width: 270px;
  }
}

</style>
