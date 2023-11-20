// import { mongoose } from "mongoose";
// import posts from "./posts.js";

// mongoose.Promise = global.Promise; //melakukan promise

// const db = {}; //inisiasi db

// db.mongoose = mongoose; //menggunakan requirement mongoose ( requirement dari mongodb )
// db.url = "mongodb+srv://andricomauludi:sigma123@dots-wms.v66yxkb.mongodb.net/"; //mengambil dbconfig
// db.posts = posts(mongoose);

// // module.exports = db  //kalo ada ini akan terjadi error
// export default db;


import { MongoClient } from "mongodb";
const connectionString = "mongodb://localhost:27017";
const client = new MongoClient(connectionString);
let conn;
try {
  conn = await client.connect();
} catch(e) {
  console.error(e);
}
let db = conn.db("DOTS-WMS");
export default db;