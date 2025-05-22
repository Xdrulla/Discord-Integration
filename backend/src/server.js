require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const routes = require("./routes");

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use("/uploads", express.static("uploads"));
app.use("/", routes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.set("io", io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
