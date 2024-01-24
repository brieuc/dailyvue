<template>
<table>
    <tr>
      <td>{{ label }} </td>
      <td>{{ description ? description : "NoDesc"}}</td>
      <td>{{ kcal }}</td>
      <td>{{ quantity }}</td>
    </tr>
</table>
</template>

<script>
export default {
    props: {
        label: String,
        description: String,
        kcal: Number,
        quantity: Number
    }
}
</script>

<style>
.border-section {
    align-self: center;
    border-style: solid;
    border: 2px;
    width: fit-content;
}
</style>