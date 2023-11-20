import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import usersRoutes from './routes/usersroutes.js'

const app = express();
const PORT = 5000; //menjalankan di port 5000

dotenv.config();

app.use(express.json());
app.use(cookieParser());                            //bisa mengambil value dari cookie

app.use(express.urlencoded({ extended: true }));   //extended true akan menghilangkan object :null protoype, kalo false akan muncul si objectnya

mongoose.connect(process.env.mongodb_connection)

app.use('/users', usersRoutes);

 

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
