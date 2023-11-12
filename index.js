import express from "express";


import usersRoutes from './routes/users.js'
import bodyParser from "body-parser";

const app = express();
const PORT = 5000; //menjalankan di port 5000

app.use(express.json());

app.use(express.urlencoded({ extended: true }));   //extended true akan menghilangkan object :null protoype, kalo false akan muncul si objectnya

app.use('/users', usersRoutes);

app.get("/", (req, res) => {
  res.send("Hello from homepage");
});

app.listen(PORT, () =>
  console.log(`server Running on port : http://localhost:${PORT}`)
); //untuk menjalankan listen, console log bisa diganti dengan aplikasi rest yang mau kita tampilkan
