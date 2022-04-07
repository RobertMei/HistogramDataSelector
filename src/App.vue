<template>
  <div class="flex justify-center items-center h-screen max-w-6xl mx-auto">
    <selector-chart :signals="signals" />
  </div>
</template>

<script>
import signalsData from "/test/signals.json";
import SelectorChart from "./SelectorChart.vue";

export default {
  components: {
    SelectorChart: SelectorChart,
  },

  data() {
    return {
      signals: signalsData.signals,
    };
  },
};
</script>