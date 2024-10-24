import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import ProjectsModel from "../models/projectsmodel.js";
import TableProjectsModel from "../models/tableprojectsmodel.js";
import express from "express";
import fs from "fs";
import SubItemModel from "../models/subitemmodel.js";
import GroupProjectModel from "../models/groupprojectmodel.js";
import UsersModel from "../models/usersmodel.js";

const app = express();

uuidv4();

export const getContentsCard = async (req, res) => {
  try {
    // const project = await ProjectsModel.find().select("-_id");
    const groupproject = await GroupProjectModel.findOne()
    .sort({ created_at: -1 })
    .select("_id");
    
    const user = await UsersModel.find().count();
    if (!groupproject) {
      return res.status(200).json({ 
        status: 1, 
        message: `Get All contents for dashboard`, 
        groupproject, 
        project: { count: 0 }, 
        tableproject: { count: 0 }, 
        subitem: { count: 0 }, 
        user: user
      });
    }

    if (!groupproject) {
      return res.status(200).json({
        status: 1,
        message: `Get All contents for dashboard`,
        groupproject,
        project: { count: 0 },
        tableproject: { count: 0 },
        subitem: { count: 0 },
        user: user,
      });
    }

    var project = await ProjectsModel.findOne({
      group_project_id: groupproject._id,
    })
      .select("_id")
      .lean();
    // If no project is found, return zero for all counts

    if (project != null) {
      project.count = await ProjectsModel.find({
        group_project_id: groupproject._id,
      }).count();
      var tableproject = await TableProjectsModel.findOne({
        project_id: project._id,
      })
        .select("_id")
        .lean();
      if (tableproject != null) {
        tableproject.count = await TableProjectsModel.find({
          project_id: project._id,
        }).count();
        var subitem = await SubItemModel.findOne({
          table_project_id: tableproject._id,
        })
          .select("_id")
          .lean();
        // console.log(subitem==null)
        if (subitem != null) {
          subitem.count = await SubItemModel.find({
            table_project_id: tableproject._id,
          }).count();
        } else {
          subitem = { count: 0 };
        }
      } else {
        var subitem = { count: 0 };
        tableproject = { count: 0 };
      }
    } else {
      var tableproject = { count: 0 };
      var subitem = { count: 0 };
      project = { count: 0 };
    }

    // if (!groupproject) return res.status(404).json({ status: 0, message: `Data not Found` });
    // if (!project) return res.status(404).json({ status: 0, message: `Data not Found` });
    // if (!tableproject) return res.status(404).json({ status: 0, message: `Data not Found` });
    // if (!subitem) return res.status(404).json({ status: 0, message: `Data not Found` });
    // if (!user) return res.status(404).json({ status: 0, message: `Data not Found` });

    return res.status(200).json({
      status: 1,
      message: `Get All contents for dashboard`,
      groupproject,
      project,
      tableproject,
      subitem,
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      status: 0,
      message: `Error on getting all contents for dashboard`,
      error,
    });
  }
};

function base64Encode(inputFileName, content) {
  const contents = fs.readFileSync(
    `./assets/` + content + `/` + inputFileName,
    {
      encoding: "base64",
    }
  );

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
export const getAllUserDashboard = async (req, res) => {
  try {
    const user = await UsersModel.find().select(
      "-password -is_admin -refresh_Token"
    );
    if (!user)
      return res.status(404).json({ status: 0, message: `Data not Found` });

    for (let i = 0; i < user.length; i++) {
      const content = base64Encode(
        user[i]["profile_picture"],
        "profile_picture"
      );
      user[i]["profile_picture"] = await content;
    }

    return res.status(200).json({ status: 1, message: `Get All Users`, user });
  } catch (error) {
    return res
      .status(400)
      .json({ status: 0, message: `Error on getting all users`, error });
  }
};
