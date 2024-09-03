import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from 'http';
import { Server } from 'socket.io';

import usersRoutes from "./routes/usersroutes.js";
import dashboardRoutes from "./routes/dashboardroutes.js";
import workspacesRoutes from "./routes/workspacesroutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
// Initialize Socket.IO with the server
const io = new Server(server, {
  cors: {
    origin: 'https://wms.dots.co.id', // Specify the allowed origin
    methods: ["GET", "POST", "PATCH"] // Specify allowed methods
  },
  pingTimeout: 60000, // Set the ping timeout to 60000ms (60 seconds)
  pingInterval: 25000 // Set the ping interval to 25000ms (25 seconds)
});


const PORT = 3001; //menjalankan di port 3001

app.use(express.json());
app.use(cookieParser()); //bisa mengambil value dari cookie
app.use((req, res, next) => {
  req.io = io;
  next();
});



app.use(express.urlencoded({ extended: true })); //extended true akan menghilangkan object :null protoype, kalo false akan muncul si objectnya

mongoose.connect(process.env.mongodb_connection);

const corsOptions = {
  origin: 'https://wms.dots.co.id',
  // origin: 'http://localhost:3000',
  credentials: true,
};

app.use(cors(corsOptions));
// app.use(cors(allowedOrigins));

app.use("/users", usersRoutes);
app.use("/workspaces", workspacesRoutes);
app.use("/dashboard", dashboardRoutes);


app.get("/", (req, res) => {
  res.send("Hello from homepage");
});
 
server.listen(PORT, () =>
  console.log(`server Running on port : http://localhost:${PORT}`)
); //untuk menjalankan listen, console log bisa diganti dengan aplikasi rest yang mau kita tampilkan
// Socket.IO connection event

// io.on('connection', (socket) => {
//   console.log('A client connected: ', socket.id);

//   socket.on('disconnect', () => {
//     console.log('A client disconnected: ', socket.id);
//   });
// });
