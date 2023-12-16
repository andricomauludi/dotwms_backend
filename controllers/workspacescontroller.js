import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import ProjectsModel from "../models/projectsmodel.js";
import TableProjectsModel from "../models/tableprojectsmodel.js";

uuidv4();


export const createProject = async (req, res) => {
  // Create a new blog post object
  let newDocument = req.body;   
  const projectid = uuidv4(); //generate user id
  newDocument._id = projectid;
  newDocument.created_at = new Date();
  const result = await ProjectsModel.create(newDocument);

  if (!result)
    res
      .send({
        status: 0,
        message: `Cannot create data in database`,
        result,
      })
      .status(404);
  else
    res
      .send({
        status: 1,
        message: "Project created",
        result,
      })
      .status(201);
};
export const createTableProject = async (req, res) => {
  // Create a new blog post object
  let newDocument = req.body;   
  const projectid = uuidv4(); //generate user id
  newDocument._id = projectid;
  newDocument.created_at = new Date();
   
  const result = await TableProjectsModel.create(newDocument);

  if (!result)
    res
      .send({
        status: 0,
        message: `Cannot create data in database`,
        result,
      })
      .status(404);
  else
    res
      .send({
        status: 1,
        message: "Table Project created",
        result,
      })
      .status(201);
};

export const getAllProject = async (req, res) => {
  try {
    const project = await ProjectsModel.find().select(
      "-_id"
    );
    if (!project)
      return res.status(404).json({ status: 0, message: `Data not Found` });

    return res.status(200).json({ status: 1, message: `Get All Projects`, project });
  } catch (error) {
    return res
      .status(400)
      .json({ status: 0, message: `Error on getting all projects` });
  }
};
export const getAllTableByProject = async (req, res) => {     //cari dari project id
  try {
    let query = { project_id: req.params.id };
    const tableproject = await TableProjectsModel.find(query).select(
      // "-_id"
    );
    if (!tableproject)
      return res.status(404).json({ status: 0, message: `Data not Found` });

    return res.status(200).json({ status: 1, message: `Get All Table Projects`, tableproject });
  } catch (error) {
    return res
      .status(400)
      .json({ status: 0, message: `Error on getting all table projects` });
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
