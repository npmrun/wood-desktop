<script setup lang="ts">
import { Splitpanes, Pane } from 'splitpanes'
</script>

<template>
    <Splitpanes style="height: 100%;">
        <Pane min-size="20" max-size="30" size="20">
            <div h-full border-r border-r-solid border-red bg-gray>
                sad
            </div>
        </Pane>
        <Pane>
            <Splitpanes class="default-theme" horizontal>
                <Pane>2</Pane>
                <Pane>3</Pane>
                <Pane>4</Pane>
            </Splitpanes>
        </Pane>
        <Pane>5</Pane>
    </Splitpanes>
</template>

<style lang="scss">
// .splitpanes__pane {
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   position: relative;
//   box-shadow: 0 0 3px rgba(0, 0, 0, .2) inset;
// }

// em.specs {
//   font-size: 0.2em;
//   line-height: 1;
//   position: absolute;
//   color: #bbb;
//   bottom: 0.5em;
//   left: 0;
//   right: 0;
//   text-align: center;
// }


// // GENERAL STYLES.
// html, body, #app {height: 100%;margin: 0;}
// body {
//   font-family: Helvetica, Arial, sans-serif;
//   color: rgba(255, 255, 255, 0.6);
//   font-size: 5em;
// }

// // documentation link.
// p {
//   position: absolute;
//   bottom: 5px;
//   right: 5px;
//   color: #666;
//   z-index: 10;
//   font-size: 12px;
  
//   a {color: inherit;}
// }

</style>