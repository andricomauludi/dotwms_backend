import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";

import usersRoutes from "./routes/usersroutes.js";
import dashboardRoutes from "./routes/dashboardroutes.js";
import workspacesRoutes from "./routes/workspacesroutes.js";


const app = express();
const PORT = 3001; //menjalankan di port 3001

dotenv.config();

// let corsOptions = { 
//   origin : ['https://wms.dots.co.id','https://dots.co.id'], 
//   optionsSuccessStatus: 200
// } 
// // app.use(cors(corsOptions));
// app.use(cors({origin:true,credentials: true}));
// app.options('*', cors()) ;
app.use(express.json());
app.use(cookieParser()); //bisa mengambil value dari cookie

// Add headers before the routes are defined
// app.use(function (req, res, next) {

//   // Website you wish to allow to connect
//   res.setHeader('Access-Control-Allow-Origin', 'https://wms.dots.co.id');

//   // Request methods you wish to allow
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

//   // Request headers you wish to allow
//   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

//   // Set to true if you need the website to include cookies in the requests sent
//   // to the API (e.g. in case you use sessions)
//   res.setHeader('Access-Control-Allow-Credentials', true);

//   // Pass to next layer of middleware
//   next();
// });
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.urlencoded({ extended: true })); //extended true akan menghilangkan object :null protoype, kalo false akan muncul si objectnya

mongoose.connect(process.env.mongodb_connection);

app.use("/users", usersRoutes);
app.use("/workspaces", workspacesRoutes);
app.use("/dashboard", dashboardRoutes);

// db.mongoose
//     .connect(db.url,{
//       useNewUrlParser:true,
//       useUnifiedTopology:true //Konfigurasi basic
//     })
//     .then(() =>{
//       console.log(`database connected`)
//     }).catch((err) => {
//       console.log(`cannot connect to the database`, err)
//       process.exit()    //tidak akan melanjutkan proses apabila terdapateror
//     })

app.get("/", (req, res) => {
  res.send("Hello from homepage");
});

app.listen(PORT, () =>
  console.log(`server Running on port : http://localhost:${PORT}`)
); //untuk menjalankan listen, console log bisa diganti dengan aplikasi rest yang mau kita tampilkan
