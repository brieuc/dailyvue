<template>
<table width="1000px" id="border-solid">
    <tr>
      <td>{{ label }} </td>
      <td>{{ description ? description : "NoDesc"}}</td>
      <td>{{ kcal }}</td>
      <td>{{ newQuantity }}</td>
      <td width="100px"><span id="border" @click="onAdd"> + </span></td>
      <td><span id="border" @click="onSub"> - </span></td>
    </tr>
</table>    

</template>

<script>
export default {
    props: {
        label: String,
        description: String,
        kcal: Number,
        quantity: Number,
        entryId: String,
        modelId: String
    },
    data() {
        return {
            // impossible to do that, the newQuantity isn't diplayed.
            // isn't set either.
            // newQuantity: this.quantity
            // We're trying something else.
            delta: 0,

        }
    },
    computed: {
        newQuantity() {
            return this.quantity + this.delta;
        }
    },
    methods: {
        onAdd() {
            console.log('onAdd  ' + this.entryId);
            this.delta = this.delta + 1;
            this.$emit("onUpdateEntry", this.modelId, this.entryId, this.newQuantity);
        },
        onSub() {
            this.delta = this.delta - 1;
            this.$emit("onUpdateEntry", this.modelId, this.entryId, this.newQuantity);
        }
    },
    updated() {
        this.delta = 0;
        console.log('updated entryId ' + this.entryId + ' ');
    }
}
</script>

<style>

</style>