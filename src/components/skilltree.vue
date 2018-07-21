<template>
<div id="cy" ref="cy" style="height:100%; width:100%">
</div>
</template>

<script>
import * as controller from '@/controller'
export default {
    data() {
        return {}
    },
    mounted() {
        controller.setupView(this.$refs.cy);
        window.addEventListener('keyup', this.keyPressed);
    },
    methods: {
        addNodeWrapper: function (value) {
            tree.addNode();
        },
        keyPressed: (event) => {
            if (event.which === 46) { //delete
                controller.deleteSelectedNodes();
            }
        }
    }
}
</script>
