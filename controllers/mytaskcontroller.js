import { v4 as uuidv4 } from "uuid";
import express from "express";
import fs from "fs";
import SubItemModel from "../models/subitemmodel.js";
import TableProjectModel from "../models/tableprojectsmodel.js";
import ProjectModel from "../models/projectsmodel.js";
import GroupProjectModel from "../models/groupprojectmodel.js";


const app = express();

uuidv4();

export const myTaskOld = async (req, res) => {
  try {
    let query = { owner_email: req.params.id };
    const subItem = await SubItemModel.find(query)
      .where("status")
      .in(["not yet", "on progress"])
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

    return res.status(200).json({ status: 1, message: `Get My Task`, subItem });
  } catch (error) {
    return res.status(400).json({
      status: 0,
      message: `Error on getting my task`,
      error,
    });
  }
};
export const myTask = async (req, res) => {
  try {
    let query = { owner_email: req.params.id };  
    var hasil=[];
    const subItem = await SubItemModel.find(query)
      .where("status")
      .in(["not yet", "on progress"])
      .select
      // "-_id"
      ()
      .lean()
    if (!subItem)
      return res.status(404).json({ status: 0, message: `Data not Found` });

    for (let i = 0; i < subItem.length; i++) {
      let query = { _id: subItem[i]["table_project_id"]};
      const tableprojectid = await TableProjectModel.find(query)
        .select
        // "-_id"
        ();
      let query2 = { _id: tableprojectid[0]["project_id"]};
      const projectid = await ProjectModel.find(query2)
        .select
        // "-_id"
        ();
      let query3 = { _id: projectid[0]["group_project_id"]};
      const groupproject = await GroupProjectModel.find(query3)
        .select
        // "-_id"
        ();
      const contentsavatar = base64Encode(
        subItem[i]["avatar"],
        "profile_picture"
      );                 
      subItem[i]["avatar"] = await contentsavatar;
      subItem[i]["item"] = await tableprojectid[0]['item'];
      subItem[i]["project_name"] = await projectid[0]['project_name'];
      subItem[i]["group_project_name"] = await groupproject[0]['group_project'];
    }

    return res.status(200).json({ status: 1, message: `Get My Task`, subItem });
  } catch (error) {
    return res.status(400).json({
      status: 0,
      message: `Error on getting my task`,
      error,
    });
  }
};
export const myTaskDone = async (req, res) => {
  try {
    let query = { owner_email: req.params.id };
    const subItem = await SubItemModel.find(query)
      .where("status")
      .in(["done"])
      .select
      // "-_id"
      ()
      .lean();
    if (!subItem)
      return res.status(404).json({ status: 0, message: `Data not Found` });

      for (let i = 0; i < subItem.length; i++) {
        let query = { _id: subItem[i]["table_project_id"]};
        const tableprojectid = await TableProjectModel.find(query)
          .select
          // "-_id"
          ();
        let query2 = { _id: tableprojectid[0]["project_id"]};
        const projectid = await ProjectModel.find(query2)
          .select
          // "-_id"
          ();
        let query3 = { _id: projectid[0]["group_project_id"]};
        const groupproject = await GroupProjectModel.find(query3)
          .select
          // "-_id"
          ();
        const contentsavatar = base64Encode(
          subItem[i]["avatar"],
          "profile_picture"
        );                 
        subItem[i]["avatar"] = await contentsavatar;
        subItem[i]["item"] = await tableprojectid[0]['item'];
        subItem[i]["project_name"] = await projectid[0]['project_name'];
        subItem[i]["group_project_name"] = await groupproject[0]['group_project'];
      }

    return res.status(200).json({ status: 1, message: `Get My Task`, subItem });
  } catch (error) {
    return res.status(400).json({
      status: 0,
      message: `Error on getting my task`,
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
