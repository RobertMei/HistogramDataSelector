<template>
  <div class="w-full pr-10" style="height: 300px">
    <histogram
      :signals="signals"
      @update:chartArea="chartArea = $event"
      v-model:selection="selection"
    />

    <!--Scale-->
    <div class="-mt-2.5" :style="[paddingLeft, paddingRight]">
      <!--Ticks-->
      <div class="flex justify-between relative h-2">
        <div
          v-for="index in 10"
          :key="index"
          class="border-l w-0 border-gray-300 relative"
        >
          <!--Label-->
          <div
            class="
              absolute
              origin-bottom
              top-3
              left-0
              transform
              -translate-x-1/2
              text-xs text-center
              font-semibold
              whitespace-nowrap
              text-gray-500
            "
          >
            {{ getLabel(index)[0] }}
            <br />
            {{ getLabel(index)[1] }}
          </div>
        </div>
      </div>

      <!--Title-->
      <div class="text-center text-xs font-bold mt-12 text-gray-600">time</div>
    </div>
  </div>
</template>

<script>
import Histogram from "./SelectorChart/Histogram.vue";
import moment from "moment";

export default {
  components: {
    Histogram: Histogram,
  },

  props: ["signals"],

  data() {
    return {
      chartArea: null,
      selection: { from: 0, to: 80 },
      min: null,
      max: null,
    };
  },

  mounted() {
    let initDataset = this.signals[0].histogramOverall;
    this.min = parseInt(initDataset[0].start);
    this.max = parseInt(initDataset[initDataset.length - 1].end);
  },

  computed: {
    paddingLeft() {
      if (this.chartArea === null) return "padding-left: 0px;";
      return "padding-left: " + this.chartArea.left + "px;";
    },

    paddingRight() {
      return "padding-right: 6px;";
    },

    range() {
      if (this.max === null) return null;
      return this.max - this.min;
    },
  },

  methods: {
    getLabel(index) {
      let ms = this.min + (index - 1) * this.range;
      let date = moment(ms);
      return [date.format("YYYY-MM-DD"), date.format("HH:mm:ss")];
    },
  },
};
</script>