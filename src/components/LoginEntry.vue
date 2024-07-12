<template>
      <div v-if="displayLogin">
            <h3>login</h3>
            <table class="center">
                  <tr><td>username</td><td><input type="text" v-model="username"></td></tr>
                  <tr><td>password</td><td><input type="text" v-model="password"></td></tr>
            </table>
            <button @click="login()">Login</button>
      </div>
</template>

<script setup>

import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps(["displayLogin"]);
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
            },
            body: JSON.stringify({
                  username: username.value,
                  password: password.value
            }),
      })
      .then(response => {
            if (response.ok)
                  return response.json();
      })
      .then(json => {
            emit("onGeneratedToken", json.token);
      });
}
</script>
<style>
.center {
      margin: auto;
}
</style>