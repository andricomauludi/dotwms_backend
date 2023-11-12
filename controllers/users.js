import { v4 as uuidv4 } from "uuid";
import db from "../models/posts.js";
import { MongoClient, ObjectId } from "mongodb";

uuidv4();

let users = []; //apabila ada perubahan delete maka tidak bisa dilakukan pada const, harus let

export const createUser = async (req, res) => {
  //   const user = req.body;

  //   const userId = uuidv4(); //generate user id

  //   const userWithId = { ...user, id: userId }; // titik tiga untuk property user yang nanti kita tambahkan, tambahkan id didalam titik tiga itu

  //   users.push(userWithId);
  //   console.log(users);

  //   res.send(`user with the name ${user.first_name} added to the database`);

  let collection = await db.collection("posts");

  let newDocument = req.body;
  const userId = uuidv4(); //generate user id
  console.log(userId);

  const userWithId = { ...newDocument, _id: userId }; // titik tiga untuk property user yang nanti kita tambahkan, tambahkan id didalam titik tiga itu

  newDocument.date = new Date();
  newDocument._id = userId;
  let result = await collection.insertOne(newDocument);
  if (!result)
    res
      .send({
        status: 0,
        message: `data not found`,
        result,
      })
      .status(404);
  else
    res
      .send({
        status: 1,
        message: "User created",
        result,
      })
      .status(201);
};

export const getAllUser = async (req, res) => {
  //   const post = db.posts;
  //   console.log(post.find())
  //   post
  //     .find()
  //     .then((result) => {
  //         console.log(post.find())
  //       res.send(result);
  //     })
  //     .catch((err) => {
  //       res.status(500).send({
  //         message: err.message || "somne error while retrieving posts",
  //       });
  //     });

  let collection = await db.collection("posts");
  let results = await collection.find({}).limit(50).toArray();
  if (!results)
    res
      .send({
        status: 0,
        message: `data not found`,
        result,
      })
      .status(404);
  else
    res
      .send({ status: 1, message: "get all users success", results })
      .status(200);
};

export const getUser = async (req, res) => {
  let collection = await db.collection("posts");
  let query = { _id: new ObjectId(req.params.id) }; //harus pake new, gatau ini karena apa new nya
  let result = await collection.findOne(query);
  console.log(req.params.id);
  if (!result)
    res
      .send({
        status: 0,
        message: `data not found`,
        result,
      })
      .status(404);
  else
    res
      .send({
        status: 1,
        message: `get user with id ${req.params.id} success`,
        result,
      })
      .status(200);

  const foundUser = users.find((user) => user.id == id); //melakukan pengecekan dari json user id dengan id yang didapatkan dari params

  res.send(foundUser);
};

export const deleteUser = (req, res) => {
  const { id } = req.params;

  users = users.filter((user) => user.id !== id); //filter akan melakukan remove apabila function menjalankan false. sehingga logic yang di dalam harus melakukan return false agar gak didelete. kalo true maka otomatis akan didelete

  res.send(`User with the id ${id} deleted from the database`);
};

export const editUser = (req, res) => {
  const { id } = req.params;

  const userTobeUpdated = users.find((user) => user.id == id); //melakukan pencarian si users dengan params yang didapatkan dari constant id

  const { first_name, last_name, age } = req.body;

  if (first_name) userTobeUpdated.first_name = first_name;

  if (last_name) userTobeUpdated.last_name = last_name;

  if (age) userTobeUpdated.age = age;

  res.send(`user with the id ${id} has been updated`);
};
