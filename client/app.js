const app = Vue.createApp({
  data() {
    return {
      transcriptions: [],
      isDragging: false,
      draggingValue: false,
    };
  },
  mounted() {
    this.connect();
  },
  created() {
    window.addEventListener("touchmove", this.handleTouchMove);
    window.addEventListener("touchstart", this.handleTouchStart);
    window.addEventListener("touchend", this.handleTouchEnd);
    window.addEventListener("mouseup", () => {
      this.isDragging = false;
    });
  },
  methods: {
    connect() {
      const eventSource = new EventSource(
        "http://192.168.0.10:5000/transcription/stream"
      );
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.transcriptions = data.map((text) => ({ text, selected: false }));
      };
    },
    toggleSelection(index) {
      this.draggingValue = !this.transcriptions[index].selected;
      this.transcriptions[index].selected = this.draggingValue;
      this.isDragging = true;
    },
    mouseover(index) {
      if (this.isDragging) {
        this.transcriptions[index].selected = this.draggingValue;
      }
    },
    copyToClipboard() {
      const selectedTexts = this.transcriptions
        .filter((t) => t.selected)
        .map((t) => t.text)
        .join("\n");
      navigator.clipboard.writeText(selectedTexts);
    },
    handleTouchStart(e) {
      const index = parseInt(e.target.getAttribute("data-index"));
      if (index !== NaN) this.toggleSelection(index);
    },
    handleTouchMove(e) {
      const index = parseInt(e.target.getAttribute("data-index"));
      if (index !== NaN) this.mouseover(index);
    },
    handleTouchEnd() {
      this.isDragging = false;
    },
  },
}).mount("#app");
