import { v4 as uuidv4 } from "uuid";
import UsersModel from "../models/usersmodel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

uuidv4();


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
    let result = await UsersModel.findOneAndUpdate(query, updates);
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
    let result = await UsersModel.findOne(query); //cari 1 user
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
    // const refreshToken = jwt.sign(
    //   { userId, userName, email, role }, //bangun payload
    //   process.env.REFRESH_TOKEN_SECRET,
    //   {
    //     expiresIn: "1d",
    //   }
    // );
    // const querydb = { email: email };
    // const updates = {
    //   $set: { refresh_token: refreshToken }, //harus pake set buat di update
    // };
    // await collection.updateOne(querydb, updates);
    // res.cookie("refreshToken", refreshToken, {
    //   //menyalakan cookie
    //   httpOnly: true,
    //   maxAge: 24 * 60 * 60 * 1000,
    //   // secure : true   //ini untuk https
    // });
    return res.status(200).json({ status: 1, message: `OK`, accessToken });
  } catch (error) {
    return res.status(400).json({ status: -1, message: `Error on system` });
  }
};

export const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken; //mengambil cookies bernama refresh token
  if (!refreshToken) return res.sendStatus(204); //bila tidak ada cookies maka unauthorized
  let query = { refreshToken: req.body.refresh_token }; //mencocokkan cookies refresh token dengan refresh token yang ada di db
  let result = await UsersModel.findOne(query); //cari 1 user
  if (!result) return res.sendStatus(204); //mengembalikan forbidden kalo ga sesuai rolesnya
  const userId = result._id;

  const query2 = { _id: userId };
  const updates = {
    $set: { refresh_token: null }, //harus pake set buat di update
  };
  let result2 = await UsersModel.findOneAndUpdate(query2, updates);
  res.clearCookie("refreshToken");
  if (!result2)
    res
      .send({
        status: 0,
        message: `data not found`,
      })
      .status(404);
  else
    res
      .send({
        status: 1,
        message: `Logout Success`,
      })
      .status(200);
};

export const createUser = async (req, res) => {
  // Create a new blog post object
  let newDocument = req.body;
  const userId = uuidv4(); //generate user id

  const salt = await bcrypt.genSalt(); //melakukan bcrypt
  const hashPassword = await bcrypt.hash(newDocument.password, salt); //password nya dilakukan hash

  newDocument.date = new Date();
  newDocument.password = hashPassword;
  newDocument._id = userId;
  const result = await UsersModel.create(newDocument);

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
  try {
    const user = await UsersModel.find().select(
      "-password -is_admin -refresh_Token"
    );
    if (!user)
      return res.status(404).json({ status: 0, message: `Data not Found` });

    return res.status(200).json({ status: 1, message: `Get All Users`, user });
  } catch (error) {
    return res
      .status(400)
      .json({ status: 0, message: `Error on getting all users` });
  }
};
export const dropdownUser = async (req, res) => {
  try {
    const user = await UsersModel.find().select(
      "-password -is_admin -refresh_Token -birthday -address -phone"
    );
    if (!user)
      return res.status(404).json({ status: 0, message: `Data not Found` });

    return res.status(200).json({ status: 1, message: `Get All Users for dropdown`, user });
  } catch (error) {
    return res
      .status(400)
      .json({ status: 0, message: `Error on getting all users` });
  }
};
export const detailUser = async (req, res) => {
  let query = { _id: req.params.id };
  try {
    const user = await UsersModel.findOne(query).select(
      "-password -is_admin -refresh_Token"
    );
    if (!user)
      return res.status(404).json({ status: 0, message: `Data not Found` });

    return res
      .status(200)
      .json({ status: 1, message: `Get Detail User`, user });
  } catch (error) {
    return res
      .status(400)
      .json({ status: 0, message: `Error on showing detail user` });
  }
};
export const getMe = async (req, res) => {
;

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; //mengambil authheader kalo ada ambil token nya, token di split karena nanti tulisannya : token eySAFas.....
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    //melakukan decoded token untuk mengambil payload
    if (err) return res.sendStatus(403); //forbidden
    req.userId = decoded.userId;
  });

  let query = { _id: req.userId }
  console.log(req.userId);

  try {
    const user= await UsersModel.findOne(query).select(
      "-password -is_admin -refresh_Token"
    );
    if (!user)
      return res.status(404).json({ status: 0, message: `Data not Found` });

    return res
      .status(200)
      .json({ status: 1, message: `Get Me success`, user });
  } catch (error) {
    return res
      .status(400)
      .json({ status: 0, message: `Error on showing get me` });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    let result = await UsersModel.deleteOne(query);

    if (!result)
      return res.status(404).json({ status: 0, message: `Data not Found` });

    return res.status(200).json({
      status: 1,
      message: `User with id ` + req.params.id + ` is deleted`,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ status: -1, message: `Error on delete user` });
  }
};

export const editUser = async (req, res) => {
  const query = { _id: req.params.id }; //pake ini kalo idnya pake uuid

  const updates = {
    $set: req.body,
  };
  let result = await UsersModel.findByIdAndUpdate(query, updates);
  if (!result)
    res
      .send({
        status: 0,
        message: `data not found`,
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
