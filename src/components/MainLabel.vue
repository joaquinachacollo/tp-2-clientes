<script>
export default {
    name: 'MainLabel',
    props: {
        for: { // Define la prop 'for'
            type: String,
            default: ''
        }
    }
}
</script>

<template>
    <label :for="for" class="block mb-2"><slot /></label>
</template>