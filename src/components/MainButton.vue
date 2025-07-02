<script>
export default {
    name: 'MainButton',
    props: {
        buttonStyle: {
            type: String,
            default: 'primary',
        },
    },
    computed: {
        buttonColor() {
            switch(this.buttonStyle) {
                case 'secondary':
                    // return "gray";
                    return "bg-gray-600 hover:bg-gray-500 focus:bg-gray-500 active:bg-gray-700";
                
                case 'danger':
                    // return "red";
                    return "bg-red-600 hover:bg-red-500 focus:bg-red-500 active:bg-red-700";
                    
                case 'success':
                    // return "green";
                    return "bg-green-600 hover:bg-green-500 focus:bg-green-500 active:bg-green-700";

                default:
                    // return "blue";
                    return "bg-blue-600 hover:bg-blue-500 focus:bg-blue-500 active:bg-blue-700";
            }
        }
    },
}
</script>

<template>
    <button 
        :class="`transition-colors py-2 px-4 rounded ${buttonColor} text-white`"
    >
        <slot>Enviar</slot>
    </button>
</template>