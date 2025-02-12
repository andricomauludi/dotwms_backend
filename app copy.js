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
const PORT = 3001; //menjalankan di port 3001

app.use(express.json());
app.use(cookieParser()); //bisa mengambil value dari cookie



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
 
app.listen(PORT, () =>
  console.log(`server Running on port : http://localhost:${PORT}`)
); //untuk menjalankan listen, console log bisa diganti dengan aplikasi rest yang mau kita tampilkan
