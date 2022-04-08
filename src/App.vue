<template>
  <div class="flex justify-center items-center h-screen max-w-6xl mx-auto">
    <histogram-data-selector
      :signals="signals"
      :linked="true"
      v-model:selection="selection"
    />
  </div>
</template>

<script>
import HistogramDataSelector from "./Components/HistogramDataSelector.vue";
import signalsData from "/test/signals.json";

export default {
  components: {
    HistogramDataSelector: HistogramDataSelector,
  },

  data() {
    return {
      selection: { from: 0, to: 80, from2: 80, to2: 100 },
      signals: signalsData.signals,
    };
  },
};
</script>