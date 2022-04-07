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

  props: {
    signals: {
      default: null,
    },
    selection: {
      default: {
        from: null,
        to: null,
      },
    },
  },

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
    this.signals.forEach((signal) => {
      this.addSignal(signal);
    });
  },

  watch: {
    selection(val) {
      //Set new line position
      this.chartOptions.plugins.annotation.annotations["from"].xMin =
        val.from - 0.5;
      this.chartOptions.plugins.annotation.annotations["from"].xMax =
        val.from - 0.5;
      this.chartOptions.plugins.annotation.annotations["to"].xMin =
        val.to - 0.5;
      this.chartOptions.plugins.annotation.annotations["to"].xMax =
        val.to - 0.5;

      //Update filler box
      this.chartOptions.plugins.annotation.annotations.filler.xMin =
        val.from - 0.5;
      this.chartOptions.plugins.annotation.annotations.filler.xMax =
        val.to - 0.5;

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
                display: true,
                type: "box",
                xMin: this.selection.from - 0.5,
                xMax: this.selection.to - 0.5,
                backgroundColor: "rgb(43,123,177, 0.1)",
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

          this.$emit("update:chartArea", chart.chartArea);
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
      };

      //revert
      if (selection.from > selection.to)
        this.mouseState.catchedLine =
          this.mouseState.catchedLine === "from" ? "to" : "from";

      //emit
      this.$emit("update:selection", selection);
    },
  },
};
</script>