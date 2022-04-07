<template>
  <div class="flex justify-center items-center h-screen w-screen">
    <div style="width: 1000px; height: 700px">
      <selector-chart
        :signals="signals"
        @paddingLeft="setPaddingLeft"
        v-model:selection="selection"
      />

      <div></div>
    </div>
  </div>
</template>

<script>
import signalsData from "/test/signals.json";
import SelectorChart from "/src/Partials/SelectorChart.vue";

export default {
  components: {
    SelectorChart: SelectorChart,
  },

  data() {
    return {
      selection: { from: 0, to: 80 },
      signals: signalsData.signals,
    };
  },

  methods: {
    setPaddingLeft() {
      //
    },
  },
};
</script>