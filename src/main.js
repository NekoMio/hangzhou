import { createApp } from "vue";
import App from "./App.vue";
import '@fortawesome/fontawesome-free/css/all.css';
import SocketIO from "./utils/io";

import "./assets/main.css";

const app = createApp(App);

app.use(SocketIO, {
    connection: "http://127.0.0.1:3000",
    options: {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 10,
    }
})
// createApp(App).mount("#app");
app.mount("#app");