<template>
      <h3>login</h3>
      <table class="center">
            <tbody>
                  <tr><td>username</td><td><input type="text" v-model="username"></td></tr>
                  <tr><td>password</td><td><input type="text" v-model="password"></td></tr>
            </tbody>
      </table>
      <input type="submit" @click="login()" value="Login">
</template>

<script setup>

import { ref, defineEmits } from 'vue'

const emit = defineEmits(["onGeneratedToken"]);
let username = ref('');
let password = ref('');

function login() {
      fetch(process.env.VUE_APP_URL + '/auth/login', {
            method: 'POST',
            headers: {
                  'Acces-Control-Allow-Origin': '*',
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  //'Authorization' : 'Bearer ' + localStorage.getItem("token"), no need
            },
            body: JSON.stringify({
                  username: username.value,
                  password: password.value
            }),
      })
      .then(response => {
            console.log(response);
            if (response.ok)
                  return response.json();
      })
      .then(json => {
            console.log(json.token);
            emit("onGeneratedToken", json.token);
      });
}
</script>
<style>
.center {
      margin: auto;
}
</style>