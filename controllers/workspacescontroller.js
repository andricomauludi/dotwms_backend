import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import ProjectsModel from "../models/projectsmodel.js";
import TableProjectsModel from "../models/tableprojectsmodel.js";
import express from "express";
import fs from "fs";
import SubItemModel from "../models/subitemmodel.js";
import GroupProjectModel from "../models/groupprojectmodel.js";

const app = express();

uuidv4();

export const createGroupProject = async (req, res) => {
  // Create a new blog post object
  let newDocument = req.body;
  const groupprojectid = uuidv4(); //generate user id
  newDocument._id = groupprojectid;
  newDocument.created_at = new Date();
  const result = await GroupProjectModel.create(newDocument);

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
        message: "Group Project created",
        result,
      })
      .status(201);
};

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
  // foto = req.file
  const contenttext = req.files["contenttext"];
  const contentposting = req.files["contentposting"];
  const postingcaption = req.files["postingcaption"];

  if (contenttext) newDocument.contenttext = contenttext[0].filename;
  if (contentposting) newDocument.contentposting = contentposting[0].filename;
  if (postingcaption) newDocument.postingcaption = postingcaption[0].filename;

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
export const createSubItem = async (req, res) => {
  // Create a new blog post object
  let newDocument = req.body;
  const projectid = uuidv4(); //generate user id
  newDocument._id = projectid;
  newDocument.created_at = new Date();
  // foto = req.file

  const result = await SubItemModel.create(newDocument);

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
        message: "Sub Item created",
        result,
      })
      .status(201);
};

export const getAllGroupProject = async (req, res) => {
  try {
    // const project = await ProjectsModel.find().select("-_id");
    const groupproject = await GroupProjectModel.find().select();
    if (!groupproject)
      return res.status(404).json({ status: 0, message: `Data not Found` });

    return res
      .status(200)
      .json({ status: 1, message: `Get All Group Projects`, groupproject });
  } catch (error) {
    return res
      .status(400)
      .json({ status: 0, message: `Error on getting all group projects` });
  }
};
export const getAllProject = async (req, res) => {
  try {
    // const project = await ProjectsModel.find().select("-_id");
    const project = await ProjectsModel.find().select();
    if (!project)
      return res.status(404).json({ status: 0, message: `Data not Found` });

    return res
      .status(200)
      .json({ status: 1, message: `Get All Projects`, project });
  } catch (error) {
    return res
      .status(400)
      .json({ status: 0, message: `Error on getting all projects` });
  }
};
export const getAllSubItemByTable = async (req, res) => {
  try {
    let query = { table_project_id: req.params.id };
    const subItem = await SubItemModel.find(query)
      .select
      // "-_id"
      ();
    if (!subItem)
      return res.status(404).json({ status: 0, message: `Data not Found` });

      for (let i = 0; i < subItem.length; i++) {              
        const contentsavatar = base64Encode(subItem[i]["avatar"],'profile_picture');
        subItem[i]["avatar"] = await contentsavatar;                  
      }
  

    return res
      .status(200)
      .json({ status: 1, message: `Get All Sub Item`, subItem });
  } catch (error) {
    return res
      .status(400)
      .json({
        status: 0,
        message: `Error on getting all sub items`,
        error,
      });
  }
};
export const myTask = async (req, res) => {
  try {
    let query = { owner_email: req.params.id };
    const subItem = await SubItemModel.find(query)
      .select
      // "-_id"
      ();
    if (!subItem)
      return res.status(404).json({ status: 0, message: `Data not Found` });

      for (let i = 0; i < subItem.length; i++) {              
        const contentsavatar = base64Encode(subItem[i]["avatar"],'profile_picture');
        subItem[i]["avatar"] = await contentsavatar;                  
      }
  

    return res
      .status(200)
      .json({ status: 1, message: `Get My Task`, subItem });
  } catch (error) {
    return res
      .status(400)
      .json({
        status: 0,
        message: `Error on getting my task`,
        error,
      });
  }
};
export const getProjectByGroupProject = async (req, res) => {
  //cari dari project id
  try {
    let query = { group_project_id: req.params.id };
    const groupproject = await ProjectsModel.find(query)
      .select
      // "-_id"
      ();
    if (!groupproject)
      return res.status(404).json({ status: 0, message: `Data not Found` });  
    
    return res
      .status(200)
      .json({ status: 1, message: `Get All Project by Group Project`, groupproject });
  } catch (error) {
    return res
      .status(400)
      .json({
        status: 0,
        message: `Error on getting all project by group project`,
        error,
      });
  }
};
export const getAllTableByProject = async (req, res) => {
  //cari dari project id
  try {
    let query = { project_id: req.params.id };
    const tableproject = await TableProjectsModel.find(query)
      .select
      // "-_id"
      ();
    if (!tableproject)
      return res.status(404).json({ status: 0, message: `Data not Found` });

    for (let i = 0; i < tableproject.length; i++) {      
      const contents = base64Encode(tableproject[i]["contenttext"],'contenttext');
      tableproject[i]["contenttext"] = await contents;
      const contentsavatar = base64Encode(tableproject[i]["lead_avatar"],'profile_picture');
      tableproject[i]["lead_avatar"] = await contentsavatar;
      const contentsavatarupdatedby = base64Encode(tableproject[i]["updated_by_avatar"],'profile_picture');
      tableproject[i]["updated_by_avatar"] = await contentsavatarupdatedby;
      const contentposting = base64Encode(tableproject[i]["contentposting"],'contentposting');
      tableproject[i]["contentposting"] = await contentposting;

      
    }

    
    return res
      .status(200)
      .json({ status: 1, message: `Get All Table Projects`, tableproject });
  } catch (error) {
    return res
      .status(400)
      .json({
        status: 0,
        message: `Error on getting all table projects`,
        error,
      });
  }
};
export const detailTableProject = async (req, res) => {
  let query = { _id: req.params.id };
  try {
    const tableproject = await TableProjectsModel.findOne(query).select();
    if (!tableproject)
      return res.status(404).json({ status: 0, message: `Data not Found` });
         
        const contents = base64Encode(tableproject["contenttext"],'contenttext');
        tableproject["contenttext"] = await contents;
        const contentsavatar = base64Encode(tableproject["avatar"],'profile_picture');
        tableproject["avatar"] = await contentsavatar;
        const contentposting = base64Encode(tableproject["contentposting"],'contentposting');
        tableproject["contentposting"] = await contentposting;
  
              

    // const contentoutput = base64Decode(tableproject["contenttext"] );
    // tableproject["contenttext"] = await contentoutput;

    return res.status(200).json({
      status: 1,
      message: `Get Detail Table Project success!`,
      tableproject,
    });
  } catch (error) {
    return res.status(400).json({
      status: 0,
      message: `Error on showing detail Table Project`,
      error,
    });
  }
};

function base64Encode(inputFileName,content) {  
  const contents = fs.readFileSync(`./assets/`+content+`/` + inputFileName, {
    encoding: "base64",
  });

  return contents;
}

function base64Decode(inputFile) {
  // const decodedString = atob(inputFile); // Decoded string

  var bitmap = Buffer.from(inputFile, "base64");
  //  res.writeHead(200, {
  //   'Content-Type': 'image/png',
  //   'Content-Length': img.length
  // });
  // res.end(img);
  // write buffer to file
  // fs.writeFileSync(`./assets/contenttext/1703461997912-mantab.pdf`, bitmap);

  return bitmap;
}

export const getMe = async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; //mengambil authheader kalo ada ambil token nya, token di split karena nanti tulisannya : token eySAFas.....
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    //melakukan decoded token untuk mengambil payload
    if (err) return res.sendStatus(403); //forbidden
    req.userId = decoded.userId;
  });

  let query = { _id: req.userId };
  console.log(req.userId);

  try {
    const user = await UsersModel.findOne(query).select(
      "-password -is_admin -refresh_Token"
    );
    if (!user)
      return res.status(404).json({ status: 0, message: `Data not Found` });

    return res.status(200).json({ status: 1, message: `Get Me success`, user });
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
export const deleteTableProject = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    let result = await TableProjectsModel.deleteOne(query);

    if (!result)
      return res.status(404).json({ status: 0, message: `Data not Found` });

    return res.status(200).json({
      status: 1,
      message: `Table Project with id ` + req.params.id + ` is deleted`,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ status: -1, message: `Error on delete Table Project` });
  }
};
export const deleteSubItem = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    let result = await SubItemModel.deleteOne(query);

    if (!result)
      return res.status(404).json({ status: 0, message: `Data not Found` });

    return res.status(200).json({
      status: 1,
      message: `Sub Item with id ` + req.params.id + ` is deleted`,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ status: -1, message: `Error on delete Sub Item` });
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
export const editSubItem = async (req, res) => {
  
  let newDocument = req.body;
  const query = { _id: newDocument._id }; //pake ini kalo idnya pake uuid

  const updates = {
    $set: newDocument,
  };
  let result = await SubItemModel.findByIdAndUpdate(query, updates);
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
        message: `Sub Item with id ${req.params.id} successfully updated`,
        result,
      })
      .status(200);
};
export const editTableProject = async (req, res) => {
  
  let newDocument = req.body;
  const query = { _id: newDocument._id }; //pake ini kalo idnya pake uuid

  if ( req.files["contenttext"]) newDocument.contenttext = req.files["contenttext"].filename;
  if ( req.files["contentposting"]) newDocument.contentposting = req.files["contentposting"].filename;
  if ( req.files["postingcaption"]) newDocument.postingcaption =  req.files["postingcaption"].filename;

  const updates = {
    $set: newDocument,
  };
  let result = await TableProjectsModel.findByIdAndUpdate(query, updates);
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
        message: `Table Project with id ${req.params.id} successfully updated`,
        result,
      })
      .status(200);
};
