import express from "express";


import usersRoutes from './routes/users.js'

const app = express();
const PORT = 5000; //menjalankan di port 5000

app.use(express.json());

app.use(express.urlencoded({ extended: true }));   //extended true akan menghilangkan object :null protoype, kalo false akan muncul si objectnya

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
