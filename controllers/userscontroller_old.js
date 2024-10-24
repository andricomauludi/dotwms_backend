import { v4 as uuidv4 } from "uuid";
import db from "../models/usersmodel_old.js";
import UsersModel from "../models/usersmodel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { MongoClient, ObjectId } from "mongodb";

uuidv4();

let collection = await db.collection("user"); //apabila ada perubahan delete maka tidak bisa dilakukan pada const, harus let

export const createUser = async (req, res) => {
  //   const user = req.body;

  //   const userId = uuidv4(); //generate user id

  //   const userWithId = { ...user, id: userId }; // titik tiga untuk property user yang nanti kita tambahkan, tambahkan id didalam titik tiga itu

  //   users.push(userWithId);
  //   console.log(users);

  //   res.send(`user with the name ${user.first_name} added to the database`);

  let newDocument = req.body;
  const userId = uuidv4(); //generate user id  

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

  let results = await collection
    .aggregate([{ $project: { password: 0, refresh_token: 0, is_admin: 0 } }])
    .limit(50)
    .toArray(); //agar password refresh token sama is admin ga ngikut

  if (!results)
    res
      .send({
        status: 0,
        message: `data not found`,
      })
      .status(404);
  else
    res
      .send({ status: 1, message: "get all users success", results })
      .status(200);
};

export const getUser = async (req, res) => {
  let query = { _id: req.params.id };
  let result = await collection.findOne(query).select("-password");

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
};

export const deleteUser = async (req, res) => {
  //   const { id } = req.params;

  //   users = users.filter((user) => user.id !== id); //filter akan melakukan remove apabila function menjalankan false. sehingga logic yang di dalam harus melakukan return false agar gak didelete. kalo true maka otomatis akan didelete

  //   res.send(`User with the id ${id} deleted from the database`);

  const query = { _id: req.params.id };
  const collection = db.collection("user");
  let result = await collection.deleteOne(query);
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
        message: `user with id ${req.params.id} successfully deleted`,
        result,
      })
      .status(200);
};

export const editUser = async (req, res) => {
  //   const { id } = req.params;

  //   const userTobeUpdated = users.find((user) => user.id == id); //melakukan pencarian si users dengan params yang didapatkan dari constant id

  //   const { first_name, last_name, age } = req.body;

  //   if (first_name) userTobeUpdated.first_name = first_name;

  //   if (last_name) userTobeUpdated.last_name = last_name;

  //   if (age) userTobeUpdated.age = age;

  //   res.send(`user with the id ${id} has been updated`);

  //   const query = { _id: new ObjectId(req.params.id) };   //pake ini kalo id nya pake id nya mongodb
  const query = { _id: req.params.id }; //pake ini kalo idnya pake uuid

  const updates = {
    $set: req.body,
  };
  let result = await collection.updateOne(query, updates);
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
        message: `user with id ${req.params.id} successfully updated`,
        result,
      })
      .status(200);
};

export const changePassword = async (req, res) => {
  const { email, password, confPassword } = req.body;
  if (password !== confPassword)
    return res
      .status(400)
      .json({ status: -1, message: `Password not matched` });
  const salt = await bcrypt.genSalt(); //melakukan bcrypt
  const hashPassword = await bcrypt.hash(password, salt); //password nya dilakukan hash
  try {
    const query = { email: email };
    const updates = {
      $set: { password: hashPassword }, //harus pake set buat di update
    };
    let result = await collection.updateOne(query, updates);
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
          message: `Password changed`,
          result,
        })
        .status(200);
  } catch (error) {
    console.log(error);
  }
};

export const login = async (req, res) => {
  try {
    let query = { email: req.body.email };
    let result = await collection.findOne(query); //cari 1 user
    if (!result) {
      return res.status(404).json({ status: 0, message: `Email not found` });
    }
    const match = await bcrypt.compare(req.body.password, result.password); //compare password yang dimasukin sama di db
    if (!match) {
      return res.status(404).json({ status: 0, message: `Wrong Password` });
    }
    const userId = result._id;
    const userName = result.full_name;
    const email = result.email;
    const role = result.role;
    const accessToken = jwt.sign(
      { userId, userName, email, role },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );
    const refreshToken = jwt.sign(
      { userId, userName, email, role }, //bangun payload
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );    
    const querydb = { email: email };
    const updates = {
      $set: { refresh_token: refreshToken }, //harus pake set buat di update
    };
    await collection.updateOne(querydb, updates);
    res.cookie("refreshToken", refreshToken, {
      //menyalakan cookie
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      // secure : true   //ini untuk https
    });
    return res.status(200).json({ status: 1, message: `OK`, accessToken });
  } catch (error) {
    return res.status(400).json({ status: -1, message: `Error on system` });
  }
};