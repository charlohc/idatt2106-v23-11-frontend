<template>
  <div class="search-form">
    <img
      id="search-icon"
      src="../assets/icons/search.svg"
      />
    <input
      id="search-input"
      type="text"
      v-model="searchQuery"
      :placeholder="props.searchPlaceholder"
      @keyup.enter="updateSearch"
      @input="updateSearch"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['search'])
const props = defineProps({
  searchPlaceholder: {
    type: String,
    required: true
  }
})
const searchQuery = ref('')

function updateSearch () {
  emit('search', searchQuery.value)
}

</script>

<style scoped>

.search-form{
  height: 70px;
  width: 100%;
  position: relative;
  background: #e9f1fe;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
  border-radius: 100px;
  align-items: center;
  justify-content: center;
  display: flex;
}

#search-button{
  position: absolute;
}

#search-icon {
  width: 35px;
  color: #707070;
}

#search-input{
  height: 100%;
  width: 100%;
  outline: none;
  font-size: 20px;
  font-weight: 400;
  border: none;
  padding: 0 0 0 35px;
  background-color: transparent;
  border-radius: 50%;
}

#search-button {
  top: 16%;
  right: 20px;
  cursor: pointer;
  background-color: #1A7028;
  font-family: 'Lato', sans-serif;
  font-size: 22px;
  color: #fff;
  border: none;
  padding: 12px 12px;
  border-radius: 100px;

  transition: all .14s;
  cursor: pointer;
}

#search-button:hover{
  transform: scale(1.1);
  background-color: #25A13A;
  box-shadow: 0px 15px 25px -5px rgba(darken(dodgerblue, 40%));
}

#search-button:active{
  background-color: black;
  box-shadow: 0px 4px 8px rgba(darken(dodgerblue, 30%));
  transform: scale(.90);
}

@media only screen and (max-width: 425px){
  #search-input{
      width: 70%;
  }
  #search-button{
      width: 40%;
  }
}
@media only screen and (min-width: 425px){
  #search-input{
      width: 70%;
  }
  #search-button{
      width: 30%;
  }
}

@media only screen and (min-width: 530px) {
  #search-input{
      width: 70%;
  }
  #search-button{
      width: 30%;
  }
}

@media only screen and (max-width: 850px) {
  #search-button{
    display: none;
  }
}
@media only screen and (max-width: 600px) {
  .search-form{
    justify-content: center;
    justify-items: center;
  }
  #search-input{
    justify-content: center;
    justify-items: center;
    padding: 0;
    padding-left: 20px;
  }
}

@media only screen and (max-width: 500px) {
  #search-icon{
    display: none;
  }
  #search-input {
    justify-self: left;
    margin: 0;
    padding: 0;
    text-align: left;
  }
}
@media only screen and (min-width: 825px) {
  #search-input{
      width: 70%;
  }
  #search-button{
      width: 30%;
  }
}

@media only screen and (min-width: 992px) {
  #search-input{
      width: 80%;
  }

  #search-button{
      width: 25%;
  }
}
</style>
