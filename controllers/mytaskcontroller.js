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
    const subItem = await SubItemModel.find(query)
      .where("status")
      .in(["not yet", "on progress"])
      .lean()
      .sort({ created_at: -1 });

    if (!subItem)
      return res.status(404).json({ status: 0, message: `Data not Found` });

    const results = []; // Store valid subItems here

    for (let i = 0; i < subItem.length; i++) {
      let query = { _id: subItem[i]["table_project_id"] };
      const tableprojectid = await TableProjectModel.find(query).lean();

      // If table project ID is not found, skip this subItem and do not add it to results
      if (!tableprojectid || tableprojectid.length === 0) {
        console.log(
          `Table project ID not found for subItem: ${subItem[i]._id}`
        );
        continue; // Skip this iteration and proceed to the next
      }

      let query2 = { _id: tableprojectid[0]["project_id"] };
      const projectid = await ProjectModel.find(query2).lean();
      if (!projectid || projectid.length === 0) {
        console.log(`Project ID not found for subItem: ${subItem[i]._id}`);
        continue; // Skip this iteration
      }

      let query3 = { _id: projectid[0]["group_project_id"] };
      const groupproject = await GroupProjectModel.find(query3).lean();
      if (!groupproject || groupproject.length === 0) {
        console.log(`Group Project not found for subItem: ${subItem[i]._id}`);
        continue; // Skip this iteration
      }

      // If all checks pass, process the subItem
      const contentsavatar = base64Encode(
        subItem[i]["avatar"],
        "profile_picture"
      );
      subItem[i]["avatar"] = await contentsavatar;
      subItem[i]["item"] = await tableprojectid[0]["item"];
      subItem[i]["project_name"] = await projectid[0]["project_name"];
      subItem[i]["group_project_name"] = await groupproject[0]["group_project"];

      // Add the processed subItem to results
      results.push(subItem[i]);
    }

    req.io.emit("taskUpdated", results); // Emit an event when tasks are fetched

    return res
      .status(200)
      .json({ status: 1, message: `Get My Task`, subItem: results });
  } catch (error) {
    console.log(error);
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

    const results = []; // Store valid subItems here

    for (let i = 0; i < subItem.length; i++) {
      let query = { _id: subItem[i]["table_project_id"] };
      const tableprojectid = await TableProjectModel.find(query).lean();

      // If table project ID is not found, skip this subItem and do not add it to results
      if (!tableprojectid || tableprojectid.length === 0) {
        console.log(
          `Table project ID not found for subItem: ${subItem[i]._id}`
        );
        continue; // Skip this iteration and proceed to the next
      }

      let query2 = { _id: tableprojectid[0]["project_id"] };
      const projectid = await ProjectModel.find(query2).lean();
      if (!projectid || projectid.length === 0) {
        console.log(`Project ID not found for subItem: ${subItem[i]._id}`);
        continue; // Skip this iteration
      }

      let query3 = { _id: projectid[0]["group_project_id"] };
      const groupproject = await GroupProjectModel.find(query3).lean();
      if (!groupproject || groupproject.length === 0) {
        console.log(`Group Project not found for subItem: ${subItem[i]._id}`);
        continue; // Skip this iteration
      }

      // If all checks pass, process the subItem
      const contentsavatar = base64Encode(
        subItem[i]["avatar"],
        "profile_picture"
      );
      subItem[i]["avatar"] = await contentsavatar;
      subItem[i]["item"] = await tableprojectid[0]["item"];
      subItem[i]["project_name"] = await projectid[0]["project_name"];
      subItem[i]["group_project_name"] = await groupproject[0]["group_project"];

      // Add the processed subItem to results
      results.push(subItem[i]);
    }

    const limitedResults = results.slice(0, 15);


    req.io.emit("taskUpdated", results); // Emit an event when tasks are fetched

    return res
      .status(200)
      .json({ status: 1, message: `Get My Task`, subItem: limitedResults });
  } catch (error) {
    console.log(error);
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
