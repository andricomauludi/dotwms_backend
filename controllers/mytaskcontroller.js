import { v4 as uuidv4 } from "uuid";
import express from "express";
import fs from "fs";
import SubItemModel from "../models/subitemmodel.js";

const app = express();

uuidv4();

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