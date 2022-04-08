<template>
  <div class="w-full pr-10 overflow-hidden">
    <!--Chart-->
    <div :style="[chartHeight]">
      <vue3-chart-js
        v-if="chartData !== null"
        :ref="id"
        :type="'bar'"
        :data="chartData"
        :options="chartOptions"
        :class="[mouseState.cursor]"
      />
    </div>

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
      <div class="text-center text-sm font-bold mt-12 text-gray-600">
        {{ xTitle }}
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment";

export default {
  components: {},

  props: {
    chartHeight: {
      default: "height: 250px",
    },

    signals: {
      default: null,
    },

    selection: {
      default: {
        from: null,
        to: null,
        from2: null,
        to2: null,
      },
    },

    linked: {
      default: false,
    },

    xTitle: {
      default: "time",
    },

    unit: {
      default: "datetime", //ms, datetime, date
    },
  },

  emits: ["update:selection"],

  data() {
    return {
      id: "aesg1",
      chartOptions: null,
      chartData: null,
      chartArea: null,
      chart: null,
      categories: null,
      min: null,
      max: null,
      mouseState: {
        catchedLine: null,
        down: false,
        dragging: false,
        cursor: "cursor-default",
      },
    };
  },

  mounted() {
    let initDataset = this.signals[0].histogramOverall;
    this.min = parseInt(initDataset[0].start);
    this.max = parseInt(initDataset[initDataset.length - 1].end);
    this.categories = initDataset.length;
    this.init(initDataset);
    this.signals.forEach((signal) => {
      this.addSignal(signal);
    });
  },

  computed: {
    paddingLeft() {
      if (this.chartArea === null) return "padding-left: 0px;";
      return "padding-left: " + this.chartArea.left + "px;";
    },

    paddingRight() {
      return "padding-right: 6px;";
    },
  },

  watch: {
    selection(val) {
      //Set new line position
      let ann = this.chartOptions.plugins.annotation.annotations;
      ann["from"].xMin = val.from - 0.5;
      ann["from"].xMax = val.from - 0.5;
      ann["to"].xMin = val.to - 0.5;
      ann["to"].xMax = val.to - 0.5;

      //Update filler box
      ann["filler"].xMin = val.from - 0.5;
      ann["filler"].xMax = val.to - 0.5;

      if (val.hasOwnProperty("from2")) {
        ann["from2"].xMin = val.from2 - 0.5;
        ann["from2"].xMax = val.from2 - 0.5;
        ann["to2"].xMin = val.to2 - 0.5;
        ann["to2"].xMax = val.to2 - 0.5;
        ann["filler2"].xMin = val.from2 - 0.5;
        ann["filler2"].xMax = val.to2 - 0.5;
      }

      //Update chart
      this.$refs[this.id].chartJSState.chart.update("none");
    },
  },

  methods: {
    addSignal(data) {
      this.chartData.datasets.push({
        label: data.id,
        data: data.histogramOverall.map((e) => e.count),
        backgroundColor: this.colors(this.chartData.datasets.length, "99"),
        clip: 0,
        xAxisID: "x",
        yAxisID: "y",
      });
    },

    init(data) {
      //Set chart data
      this.chartData = {
        labels: data.map((e) => e.category),
        datasets: [],
      };

      //Set chart options
      this.chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        normalized: false,
        layout: {
          padding: { right: 0 },
        },
        scales: {
          x: {
            stacked: true,
            ticks: {
              display: false,
            },
            grid: {
              offset: true,
              display: true,
              drawTicks: false,
              color: "#f1f1f1",
            },
            title: {
              display: false,
              text: "range",
              font: {
                weight: "bold",
              },
            },
          },

          y: {
            stacked: true,
            title: {
              display: true,
              text: "frequency",
              font: {
                weight: "bold",
              },
            },
            ticks: {
              beginAtZero: true,
            },
          },
          r: {
            type: "linear",
            position: "right",
            ticks: {
              display: false,
            },
            grid: {
              display: false,
            },
          },
        },

        plugins: {
          legend: {
            display: true,
          },
          annotation: {
            annotations: {
              from: {
                type: "line",
                xMin: this.selection.from - 0.5,
                xMax: this.selection.from - 0.5,
                borderColor: "rgb(43,123,177, 0.5)",
                borderWidth: 2,
              },

              to: {
                type: "line",
                xMin: this.selection.to - 0.5,
                xMax: this.selection.to - 0.5,
                borderColor: "rgb(43,123,177, 0.5)",
                borderWidth: 2,
              },

              filler: {
                type: "box",
                xMin: this.selection.from - 0.5,
                xMax: this.selection.to - 0.5,
                backgroundColor: "rgb(43,123,177, 0.1)",
                borderWidth: 0,
              },

              from2: {
                display: this.selection.hasOwnProperty("from2"),
                type: "line",
                xMin: this.selection.from2 - 0.5,
                xMax: this.selection.from2 - 0.5,
                borderColor: "rgb(232,134,111, 0.5)",
                borderWidth: 2,
              },

              to2: {
                display: this.selection.hasOwnProperty("from2"),
                type: "line",
                xMin: this.selection.to2 - 0.5,
                xMax: this.selection.to2 - 0.5,
                borderColor: "rgb(232,134,111, 0.5)",
                borderWidth: 2,
              },

              filler2: {
                display: this.selection.hasOwnProperty("from2"),
                type: "box",
                xMin: this.selection.from2 - 0.5,
                xMax: this.selection.to2 - 0.5,
                backgroundColor: "rgb(232,134,111, 0.1)",
                borderWidth: 0,
              },
            },
          },
        },
      };
      //Add event listeners
      setTimeout(
        function () {
          let chart = this.$refs[this.id].chartJSState.chart;
          chart.canvas.addEventListener(
            "mousedown",
            function (transition) {
              this.mouseEvent("mousedown", transition);
            }.bind(this)
          );

          chart.canvas.addEventListener(
            "mousemove",
            function (transition) {
              this.mouseEvent("mousemove", transition);
            }.bind(this)
          );

          chart.canvas.addEventListener(
            "mouseup",
            function (transition) {
              this.mouseEvent("mouseup", transition);
            }.bind(this)
          );

          this.chartArea = chart.chartArea;
        }.bind(this),
        0
      );
    },

    colors(index, opacity = "ff") {
      let colors = [
        "#3366cc",
        "#dc3912",
        "#ff9900",
        "#109618",
        "#990099",
        "#0099c6",
        "#dd4477",
        "#66aa00",
        "#b82e2e",
        "#316395",
        "#3366cc",
        "#994499",
      ];
      return colors[index] + opacity;
    },

    mouseEvent(type, event) {
      //prepare
      let chart = this.$refs[this.id].chartJSState.chart;
      let chartArea = chart.chartArea;

      //focalPoint
      const rect = event.target.getBoundingClientRect();
      let x = event.clientX - rect.left;
      let y = event.clientY - rect.top;

      //check if inside chart area
      if (
        x < chartArea.left ||
        x > chartArea.right ||
        y < chartArea.top ||
        y > chartArea.bottom
      ) {
        this.mouseState.cursor = "cursor-default";
        return;
      }

      //Calc x val
      let chartXRange = chartArea.right - chartArea.left;
      let xVal = ((x - chartArea.left) / chartXRange) * this.categories;

      //Catch near line
      let catchRadius = 0.5;
      let catchedLine = null;
      if (
        xVal >= this.selection.from - catchRadius &&
        xVal <= this.selection.from + catchRadius
      )
        catchedLine = "from";
      else if (
        xVal >= this.selection.to - catchRadius &&
        xVal <= this.selection.to + catchRadius
      )
        catchedLine = "to";
      else if (
        xVal >= this.selection.from2 - catchRadius &&
        xVal <= this.selection.from2 + catchRadius
      )
        catchedLine = "from2";
      else if (
        xVal >= this.selection.to2 - catchRadius &&
        xVal <= this.selection.to2 + catchRadius
      )
        catchedLine = "to2";

      //Decide
      switch (type) {
        case "mousedown":
          this.mouseState.down = true;
          this.mouseState.catchedLine = catchedLine;
          if (catchedLine !== null) this.mouseState.cursor = "cursor-grabbing";
          break;

        case "mouseup":
          this.mouseState.catchedLine = null;
          this.mouseState.down = false;
          this.mouseState.cursor = "cursor-grab";
          break;

        case "mousemove":
          //Left in between
          if (this.mouseState.down && event.buttons == 0) {
            this.mouseState.left = false;
            this.mouseState.catchedLine = null;
            this.mouseState.down = false;
            this.mouseState.cursor = "cursor-default";
            return;
          }

          //Dragging
          else if (
            this.mouseState.down &&
            this.mouseState.catchedLine !== null
          ) {
            //Save new position
            this.emit(xVal);
          } else if (!this.mouseState.down && catchedLine !== null) {
            this.mouseState.cursor = "cursor-grab";
          } else {
            this.mouseState.cursor = "cursor-default";
          }
          break;
      }
    },

    emit(xVal) {
      //Set new selection
      let selection = {
        from:
          this.mouseState.catchedLine === "from" ? xVal : this.selection.from,
        to: this.mouseState.catchedLine === "to" ? xVal : this.selection.to,
        from2:
          this.mouseState.catchedLine === "from2" ? xVal : this.selection.from2,
        to2: this.mouseState.catchedLine === "to2" ? xVal : this.selection.to2,
      };

      //revert
      if (selection.from > selection.to)
        this.mouseState.catchedLine =
          this.mouseState.catchedLine === "from" ? "to" : "from";

      if (selection.from2 > selection.to2)
        this.mouseState.catchedLine =
          this.mouseState.catchedLine === "from2" ? "to2" : "from2";

      //Linked
      if (this.linked) {
        if (this.mouseState.catchedLine === "to")
          selection.from2 = selection.to;
        if (this.mouseState.catchedLine === "from2")
          selection.to = selection.from2;
      }

      //emit
      this.$emit("update:selection", selection);
    },

    //Create labels
    getLabel(index) {
      let range = this.max - this.min;
      let ms = this.min + (index - 1) * range;
      let date = moment(ms);

      switch (this.unit) {
        case "date":
          return [date.format("YYYY-MM-DD"), null];

        case "datetime":
          return [date.format("YYYY-MM-DD"), date.format("HH:mm:ss")];
      }

      return [ms, null];
    },
  },
};
</script>