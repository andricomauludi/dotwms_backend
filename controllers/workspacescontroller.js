import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import ProjectsModel from "../models/projectsmodel.js";
import TableProjectsModel from "../models/tableprojectsmodel.js";
import ContentPostingsModel from "../models/contentpostingsmodel.js";
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
  else {
    req.io.emit("newProject", result);

    res
      .send({
        status: 1,
        message: "Project created",
        result,
      })
      .status(201);
  }
};

export const streamVideo = async (req, res) => {
  let file_name = req.params.name;

  const path = "./assets/contentposting/" + file_name;
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    const chunksize = end - start + 1;
    const file = fs.createReadStream(path, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    };

    res.writeHead(200, head);
    fs.createReadStream(path).pipe(res);
  }
};

async function createUpdateContentPosting(
  newDocument,
  projectid,
  contentposting,
  res
) {
  let query = { _id: newDocument._id };
  const tableproject = await TableProjectsModel.find(query);

  //MASUK CREATE

  // if (!tableproject) {
  let itemsUpload = contentposting.map((item) => {
    return {
      _id: uuidv4(),
      project_id: newDocument.project_id,
      project_name: newDocument.project_name,
      table_project_id: projectid,
      table_project_name: newDocument.item,
      file_name: item.filename,
      file_type: item.mimetype,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: newDocument.created_by,
      updated_by: newDocument.updated_by,
    };
  });

  const result = await ContentPostingsModel.insertMany(itemsUpload);
  if (!result) {
    const hasilgakbener = 0;
    return hasilgakbener;
  }
  const hasilbener = 1;
  return hasilbener;
  // }
  // else {
  //   // MASUK UPDATE
  //   console.log("masuk updatee");
  //   let itemsUpload = contentposting.map((item) => {
  //     return {
  //       _id: uuidv4(),
  //       table_project_id: projectid,
  //       table_project_name: newDocument.item,
  //       file_name: item.filename,
  //       created_at: new Date(),
  //       updated_at: new Date(),
  //       created_by: newDocument.created_by,
  //       updated_by: newDocument.updated_by,
  //     };
  //   });
  //   const query = { table_project_id: newDocument._id };
  //   await ContentPostingsModel.deleteMany(query);

  //   const result = await ContentPostingsModel.insertMany(itemsUpload);
  //   if (!result) {
  //     const hasilgakbener = 0;
  //     return hasilgakbener;
  //   }
  //   const hasilbener = 1;
  //   return hasilbener;
  // }
}
export const deleteContentPosting = async (req, res) => {
  const ids = req.body.id;

  const contentposting = await ContentPostingsModel.find({
    _id: {
      $in: ids,
    },
  }).select({ file_name: 1, _id: 0 });

  for (let i = 0; i < contentposting.length; i++) {
    const path = "./assets/contentposting/" + contentposting[i].file_name;
    fs.unlink(path, (err) => {
      if (err) {
        res
          .send({
            status: -1,
            message: "Error while deleting file on directory",
            err,
          })
          .status(401);
      }
    });
  }

  const result = await ContentPostingsModel.deleteMany({
    _id: { $in: ids }, //bulking delete
  });
  if (result) {
    return res
      .send({
        status: 1,
        message: "Content Posting deleted successfully",
      })
      .status(200);
  }
  return res
    .send({
      status: 1,
      message: "Failed while deleting data on database",
    })
    .status(400);

  // var idList = ["559e0dbd045ac712fa1f19fa","559e0dbe045ac712fa1f19fb"];

  // var pincode = mongoose.model('pincode');

  // pincode.find({ "city_id": { "$in": idList } },function(err,docs) {
  //    // do something here
  // });

  // try {
  //   const query = { file_name: req.params.file_name };
  //   let result = await UsersModel.deleteOne(query);

  //   if (!result)
  //     return res.status(404).json({ status: 0, message: `Data not Found` });

  //   return res.status(200).json({
  //     status: 1,
  //     message: `User with id ` + req.params.id + ` is deleted`,
  //   });
  // } catch (error) {
  //   return res
  //     .status(400)
  //     .json({ status: -1, message: `Error on delete user` });
  // }
};
export const createTableProject = async (req, res) => {
  let newDocument = req.body;

  const projectid = uuidv4();
  newDocument._id = projectid;
  newDocument.created_at = new Date();

  const contentposting = req.files["contentposting"];

  if (contentposting) {
    if (contentposting.length > 1) {
      for (let i = 0; i < contentposting.length; i++) {
        newDocument.contentposting = contentposting[i].filename;
      }
    } else {
      newDocument.contentposting = contentposting[0].filename;
    }

    const resultContentPosting = await createUpdateContentPosting(
      newDocument,
      projectid,
      contentposting
    );

    if (resultContentPosting === 0) {
      return res.status(404).send({
        status: 0,
        message: `Error while uploading file, please try again`,
      });
    }
  }

  const result = await TableProjectsModel.create(newDocument);
  // Base64 encode the avatars before saving and emitting the event

  if (!result) {
    return res.status(404).send({
      status: 0,
      message: `Cannot create data in the database`,
    });
  }
  newDocument.lead_avatar = base64Encode(
    newDocument.lead_avatar,
    "profile_picture"
  );
  newDocument.updated_by_avatar = base64Encode(
    newDocument.updated_by_avatar,
    "profile_picture"
  );

  // Emit event to all connected clients
  req.io.emit("newTableProject", newDocument);

  return res.status(201).send({
    status: 1,
    message: "Table Project created",
    result,
  });
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
  else {
    result.avatar = base64Encode(result.avatar, "profile_picture");

    req.io.emit("newSubItem", result);
    console.log(result);

    res
      .send({
        status: 1,
        message: "Sub Item created",
        result,
      })
      .status(201);
  }
};

export const getAllGroupProject = async (req, res) => {
  try {
    // const project = await ProjectsModel.find().select("-_id");
    const groupproject = await GroupProjectModel.find()
      .select()
      .sort({ created_at: -1 });
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
      const contentsavatar = base64Encode(
        subItem[i]["avatar"],
        "profile_picture"
      );
      subItem[i]["avatar"] = await contentsavatar;
    }

    // Emit event to all clients
    req.io.emit("subItemData", subItem);

    return res
      .status(200)
      .json({ status: 1, message: `Get All Sub Item`, subItem });
  } catch (error) {
    return res.status(400).json({
      status: 0,
      message: `Error on getting all sub items`,
      error,
    });
  }
};
export const showContentPosting = async (req, res) => {
  const body = req.body; //body isinya file_name sama file_type
  try {
    if (body.file_type == "video/mp4") {
      const path = "./assets/contentposting/" + body.file_name;
      const stat = fs.statSync(path);
      const fileSize = stat.size;
      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        const chunksize = end - start + 1;
        const file = fs.createReadStream(path, { start, end });
        const head = {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": "video/mp4",
        };

        res.writeHead(206, head);
        file.pipe(res);
        return;
      } else {
        const head = {
          "Content-Length": fileSize,
          "Content-Type": "video/mp4",
        };

        res.writeHead(200, head);
        fs.createReadStream(path).pipe(res);
        return;
      }
    } else if (
      body.file_type == "image/png" ||
      body.file_type == "image/jpeg" ||
      body.file_type == "image/jpg"
    ) {
      const contentfile = base64Encode(body.file_name, "contentposting");

      return res
        .status(200)
        .json({ status: 1, message: `showing base64`, contentfile });
    }

    return res
      .status(200)
      .json({ status: 1, message: `Get All Content Postings`, contentPosting });
  } catch (error) {
    return res.status(400).json({
      status: 0,
      message: `Error on getting all content postings`,
      error,
    });
  }
};
export const getContentPostingByTable = async (req, res) => {
  try {
    let query = { table_project_id: req.params.id };
    const contentPosting = await ContentPostingsModel.find(query)
      .select()
      .lean();
    if (!contentPosting)
      return res.status(404).json({ status: 0, message: `Data not Found` });

    // for (let i = 0; i < contentPosting.length; i++) {
    // const contentfile = base64Encode(
    //   contentPosting[i]["file_name"],
    //   "contentPosting"
    // );
    // contentPosting[i]["file"] = await contentfile;
    // if (contentPosting[i]['file_type']=="video/mp4") {

    // }
    // const contents = fs.readFileSync(
    //   `./assets/` + "contentPosting" + `/` + contentPosting[i]["file_name"]
    // );
    // console.log(contentPosting[i]["file_name"]);
    // }

    return res
      .status(200)
      .json({ status: 1, message: `Get All Content Postings`, contentPosting });
  } catch (error) {
    return res.status(400).json({
      status: 0,
      message: `Error on getting all content postings`,
      error,
    });
  }
};

export const getProjectByGroupProject = async (req, res) => {
  try {
    let query = { group_project_id: req.params.id };
    const groupproject = await ProjectsModel.find(query).select();

    if (!groupproject) {
      return res.status(404).json({ status: 0, message: `Data not Found` });
    }

    // Emit event to all clients
    req.io.emit("groupProjectData", groupproject);

    res.status(200).json({
      status: 1,
      message: `Get All Project by Group Project`,
      groupproject,
    });
  } catch (error) {
    res.status(400).json({
      status: 0,
      message: `Error on getting all project by group project`,
      error,
    });
  }
};
export const getAllTableByProject = async (req, res) => {
  try {
    const query = { project_id: req.params.id };
    const tableproject = await TableProjectsModel.find(query).lean();

    if (!tableproject) {
      return res.status(404).json({ status: 0, message: `Data not Found` });
    }

    // Encode avatar images asynchronously
    const encodeAvatar = async (avatarPath) =>
      base64Encode(avatarPath, "profile_picture");

    await Promise.all(
      tableproject.map(async (project, index) => {
        tableproject[index]["lead_avatar"] = await encodeAvatar(
          project["lead_avatar"]
        );
        tableproject[index]["updated_by_avatar"] = await encodeAvatar(
          project["updated_by_avatar"]
        );
      })
    );

    // Emit event to all connected clients
    req.io.emit("tableProjectData", tableproject);

    return res
      .status(200)
      .json({ status: 1, message: `Get All Table Projects`, tableproject });
  } catch (error) {
    return res.status(400).json({
      status: 0,
      message: `Error on getting all table projects`,
      error: error.message,
    });
  }
};

export const detailTableProject = async (req, res) => {
  let query = { _id: req.params.id };
  try {
    const tableproject = await TableProjectsModel.findOne(query).select();
    if (!tableproject)
      return res.status(404).json({ status: 0, message: `Data not Found` });

    const contents = base64Encode(tableproject["contenttext"], "contenttext");
    tableproject["contenttext"] = await contents;
    const contentsavatar = base64Encode(
      tableproject["avatar"],
      "profile_picture"
    );
    tableproject["avatar"] = await contentsavatar;
    const contentposting = base64Encode(
      tableproject["contentposting"],
      "contentposting"
    );
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

function base64Encode(inputFileName, content) {
  // if (!inputFileName == "") {
  //   const contents = fs.readFileSync(
  //     `./assets/` + content + `/` + inputFileName,
  //     {
  //       encoding: "base64",
  //     }
  //   );
  //   return contents;
  // }
  const contents = "";

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

    req.io.emit("tableProjectDeleted", { projectId: req.params.id });

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
export const deleteGroupProject = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    let result = await GroupProjectModel.deleteOne(query);

    if (!result)
      return res.status(404).json({ status: 0, message: `Data not Found` });

    return res.status(200).json({
      status: 1,
      message: `Group Project with id ` + req.params.id + ` is deleted`,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ status: -1, message: `Error on delete Group Project` });
  }
};
export const deleteProject = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    let result = await ProjectsModel.deleteOne(query);

    if (!result) {
      return res.status(404).json({ status: 0, message: `Data not Found` });
    }

    // Emit a Socket.IO event to notify clients that a project was deleted
    req.io.emit("projectDeleted", { projectId: req.params.id });

    return res.status(200).json({
      status: 1,
      message: `Project with id ` + req.params.id + ` is deleted`,
    });
  } catch (error) {
    return res.status(400).json({
      status: -1,
      message: `Error on delete Project`,
      error,
    });
  }
};
export const deleteSubItem = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    let result = await SubItemModel.deleteOne(query);

    if (!result)
      return res.status(404).json({ status: 0, message: `Data not Found` });

    req.io.emit("subItemDeleted", { projectId: req.params.id });
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

export const editGroupProject = async (req, res) => {
  let newDocument = req.body;
  const query = { _id: newDocument._id }; //pake ini kalo idnya pake uuid

  const updates = {
    $set: newDocument,
  };
  let result = await GroupProjectModel.findByIdAndUpdate(query, updates);
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
        message: `Group Project with id ${req.params.id} successfully updated`,
        result,
      })
      .status(200);
};
export const editProject = async (req, res) => {
  try {
    const newDocument = req.body;
    const query = { _id: newDocument._id }; // using the ID to find the document

    const updates = {
      $set: newDocument,
    };

    const result = await ProjectsModel.findByIdAndUpdate(query, updates, {
      new: true,
    });

    if (!result) {
      res.status(404).send({
        status: 0,
        message: `Data not found`,
      });
    } else {
      // Emit the updated project to all connected clients
      req.io.emit("projectEdited", result);

      res.status(200).send({
        status: 1,
        message: `Project with id ${newDocument._id} successfully updated`,
        result,
      });
    }
  } catch (error) {
    res.status(400).send({
      status: -1,
      message: `Error on updating Project`,
      error,
    });
  }
};
export const editSubItem = async (req, res) => {
  let newDocument = req.body;
  const query = { _id: newDocument._id }; //pake ini kalo idnya pake uuid

  const updates = {
    $set: newDocument,
  };
  let result = await SubItemModel.findByIdAndUpdate(query, updates, { new: true });
  if (!result)
    res
      .send({
        status: 0,
        message: `data not found`,
      })
      .status(404);
  else{
    result.avatar = base64Encode(result.avatar, "profile_picture");
    req.io.emit("subItemEdited", result);    
    res
      .send({
        status: 1,
        message: `Sub Item with id ${req.params.id} successfully updated`,
        result,
      })
      .status(200);
    
  }
};
export const editTableProject = async (req, res) => {
  let newDocument = req.body;
  const query = { _id: newDocument._id }; //pake ini kalo idnya pake uuid

  const contentposting = req.files["contentposting"];

  if (contentposting) {
    if (contentposting.length > 1) {
      for (let i = 0; i < contentposting.length; i++) {
        newDocument.contentposting = contentposting[i].filename;
      }
    } else {
      // if (contentposting) {
      newDocument.contentposting = contentposting[0].filename;
      // }
    }
    const resultContentPosting = await createUpdateContentPosting(
      newDocument,
      newDocument._id,
      contentposting
    );
    if (resultContentPosting == 0) {
      res
        .send({
          status: 0,
          message: `Error while upload file, please try again`,
          result,
        })
        .status(401);
    }
  }
  const updates = {
    $set: newDocument,
  };
  let result = await TableProjectsModel.findByIdAndUpdate(query, updates, {
    new: true,
  });
  if (!result)
    res
      .send({
        status: 0,
        message: `data not found`,
      })
      .status(404);
  else {
    result.lead_avatar = base64Encode(result.lead_avatar, "profile_picture");
    result.updated_by_avatar = base64Encode(
      result.updated_by_avatar,
      "profile_picture"
    );
    req.io.emit("tableProjectEdited", result);
    res
      .send({
        status: 1,
        message: `Table Project with id ${newDocument._id} successfully updated`,
        result,
      })
      .status(200);
  }
};
