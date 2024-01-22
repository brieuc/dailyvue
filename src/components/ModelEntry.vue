<template>
<li class="border-section">
    {{ label }} {{ description ? description : "NoDesc"}} {{ kcal }}
</li>
</template>

<script>
export default {
    props: {
        label: String,
        description: String,
        kcal: Number
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