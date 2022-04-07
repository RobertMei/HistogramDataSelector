<template>
  <vue3-chart-js
    v-if="chartData !== null"
    :ref="id"
    :type="'bar'"
    :data="chartData"
    :options="chartOptions"
    :class="[mouseState.cursor]"
  />
</template>

<script>
export default {
  components: {},

  props: ["signals", "selection"],

  emits: ["update:chartArea", "update:selection"],

  data() {
    return {
      id: "aesg1",
      chartOptions: null,
      chartData: null,
      chart: null,
      categories: null,
      min: null,
      max: null,
      range: null,
      chartPaddingLeft: null,
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
    this.categories = initDataset.length;
    this.init(initDataset);

    this.addSignal(this.signals[0], "gray");
    this.addSignal(this.signals[1], "green");
    this.addSignal(this.signals[2], "red");
  },

  methods: {
    addSignal(data, color = "gray") {
      this.chartData.datasets.push({
        label: data.id,
        data: data.histogramOverall.map((e) => e.count),
        backgroundColor: this.colors(color, 0.6),
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
            reverse: true,
          },
          annotation: {
            annotations: {
              from: {
                type: "line",
                xMin: this.selection.from - 0.5,
                xMax: this.selection.from - 0.5,
                borderColor: this.colors("blue", 0.5),
                borderWidth: 3,
              },

              to: {
                type: "line",
                xMin: this.selection.to - 0.5,
                xMax: this.selection.to - 0.5,
                borderColor: this.colors("blue", 0.5),
                borderWidth: 3,
              },

              filler: {
                display: true,
                type: "box",
                xMin: this.selection.from - 0.5,
                xMax: this.selection.to - 0.5,
                backgroundColor: this.colors("blue", 0.1),
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

          this.$emit("update:chartArea", chart.chartArea);
        }.bind(this),
        0
      );
    },

    colors(key, alpha = 1) {
      let colors = {
        green: "141,199,141",
        red: "235,130,130",
        gray: "200,200,200",
        blue: "43,123,177",
      };
      return "rgba(" + colors[key] + "," + alpha + ")";
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
            this.$emit("update:selection", {
              from:
                this.mouseState.catchedLine === "from"
                  ? xVal
                  : this.selection.from,
              to:
                this.mouseState.catchedLine === "to" ? xVal : this.selection.to,
            });
            //this.selection[this.mouseState.catchedLine] = xVal;

            //Set new line position
            this.chartOptions.plugins.annotation.annotations[
              this.mouseState.catchedLine
            ].xMin = xVal - 0.5;
            this.chartOptions.plugins.annotation.annotations[
              this.mouseState.catchedLine
            ].xMax = xVal - 0.5;

            //Update filler box
            this.chartOptions.plugins.annotation.annotations.filler.xMin =
              this.selection.from - 0.5;
            this.chartOptions.plugins.annotation.annotations.filler.xMax =
              this.selection.to - 0.5;

            //Update chart
            chart.update("none");
          } else if (!this.mouseState.down && catchedLine !== null) {
            this.mouseState.cursor = "cursor-grab";
          } else {
            this.mouseState.cursor = "cursor-default";
          }

          break;
      }
    },
  },
};
</script>