import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import ProjectsModel from "../models/projectsmodel.js";
import TableProjectsModel from "../models/tableprojectsmodel.js";
import ContentPostingsModel from "../models/contentpostingsmodel.js";
import express from "express";
import fs from "fs";
import SubItemModel from "../models/subitemmodel.js";
import GroupProjectModel from "../models/groupprojectmodel.js";
import { google } from "googleapis"; // Jika Anda menggunakan ES Modules
import axios from "axios";
import dotenv from "dotenv";
import { Readable } from "stream";

const app = express();
dotenv.config();

uuidv4();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const FOLDER_ID = process.env.FOLDER_ID; // ID dari folder di Google Drive tempat file akan diupload

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

// Function to refresh the access token
const refreshAccessToken = async () => {
  try {
    const response = await axios.post(
      "https://oauth2.googleapis.com/token",
      null,
      {
        params: {
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          refresh_token: REFRESH_TOKEN,
          grant_type: "refresh_token",
        },
      }
    );
    const newAccessToken = response.data.access_token;
    oauth2Client.setCredentials({ access_token: newAccessToken });
    console.log("Access token refreshed successfully.");
    return newAccessToken;
  } catch (error) {
    console.error("Failed to refresh access token:", error);
    throw error;
  }
};

const getFileFromGoogleDrive = async (fileId) => {
  try {
    await refreshAccessToken(); // Ensure the token is fresh before making the request
    const response = await drive.files.get(
      {
        fileId: fileId,
        alt: "media", // Mendapatkan konten file
      },
      { responseType: "stream" }
    );

    return response.data; // Kembalikan stream data file
  } catch (error) {
    console.error("Error retrieving file from Google Drive:", error);
    throw error;
  }
};
// Fungsi upload file ke Google Drive menggunakan async/await
const uploadFile = async (filename, file, folderId) => {
  const bufferStream = new Readable();
  bufferStream.push(file.buffer);
  bufferStream.push(null); // Menandakan akhir stream
  // Debugging: Check if buffer is valid
  if (Buffer.isBuffer(file.buffer)) {
    console.log("Buffer is active and valid. Size:", file.buffer.length);
    console.log("First 20 bytes of buffer:", file.buffer.slice(0, 20));
  } else {
    console.error("Invalid buffer:", file.buffer);
    return null;
  }
  try {
    await refreshAccessToken(); // Ensure the token is fresh before making the request
    const fileMetadata = {
      name: filename,
      parents: [folderId], // Tentukan folder tujuan
    };

    const media = {
      mimeType: file.mimeType,
      body: bufferStream,
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id",
    });

    return response.data.id;
  } catch (error) {
    console.error("Error uploading to Google Drive:", error.message);
    return null;
  }
};

const deleteFileFromGoogleDrive = async (fileId) => {
  try {
    await refreshAccessToken();
    const res = await drive.files.delete({ fileId });
    console.log(`🗑️ Deleted file ${fileId} from Google Drive`);
    return res.status === 204;
  } catch (err) {
    console.error("❌ Error deleting from Google Drive:", err.message);
    return false;
  }
};

// Endpoint Express.js untuk upload file
export const uploadHandler = async (req, res) => {
  let newDocument = req.body;

  const files = req.files["contentposting"];
  if (!files) {
    return res.status(400).send("No file uploaded.");
  }

  const file = files;
  const filePath = `./assets/contentposting/${file[0].filename}`;
  // await file.mv(filePath);

  const result = await uploadFile(filePath, file.mimetype, FOLDER_ID);

  if (result) {
    res.status(200).send({ success: true, fileId: result.id });
  } else {
    res.status(500).send("Failed to upload file.");
  }
};
export const readHandler = async (req, res) => {
  const fileId = "1W4RmTYDPphALod4zAiI4SugOGmGG77Po"; // Ganti dengan ID file yang ingin diambil
  try {
    const fileStream = await getFileFromGoogleDrive(fileId);
    fileStream.pipe(res); // Stream the file directly to the response
  } catch (error) {
    res.status(500).send("Error retrieving file");
  }
};
export const uploadHandler2 = async (req, res) => {
  let newDocument = req.body;

  const file = req.files["contentposting"];
  if (!file) {
    return res.status(400).send("No file uploaded.");
  }

  const files = file;
  try {
    const uploadPromises = files.map(async (file) => {
      // Upload file ke Google Drive
      const timestampwib = getTimestampWIB();
      const filename = `${timestampwib}` + "-" + item.originalname;

      return await uploadFile(filename, file, FOLDER_ID);
    });

    // Tunggu semua file selesai diupload
    const uploadedFiles = await Promise.all(uploadPromises);
    console.log("Uploaded files:", await uploadedFiles); // Log seluruh hasil

    // Ambil ID file yang berhasil diupload
    const fileIds = uploadedFiles.filter((id) => id !== null); // Filter out null IDs

    console.log("File IDs:", fileIds); // Log file IDs yang terfilter

    // Simpan ID file ke database atau lakukan apa pun yang diperlukan
    // Misalnya, bisa menyimpan fileIds ke dalam newDocument
    newDocument.fileIds = fileIds; // Menyimpan array ID ke dalam newDocument

    // Simpan newDocument ke database (misalnya menggunakan Mongoose)
    // await DocumentModel.create(newDocument); // Ganti dengan model dan method yang sesuai

    res.send({
      message: "Files uploaded to Google Drive successfully.",
      fileIds,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to upload files to Google Drive.");
  }
};

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
  try {
    let newDocument = req.body;
    const projectid = uuidv4();
    newDocument._id = projectid;
    newDocument.created_at = new Date();

    const result = await ProjectsModel.create(newDocument);

    if (!result) {
      return res.status(404).send({
        status: 0,
        message: "Cannot create data in database",
      });
    }

    // ✅ Emit hanya ke room sesuai group_project_id
    console.log("🟢 Emitting to room:", result.group_project_id);
    req.io.to(result.group_project_id).emit("newProject", result);

    return res.status(201).send({
      status: 1,
      message: "Project created",
      result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      status: -1,
      message: "Internal server error",
      error: error.message,
    });
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
function getTimestampWIB() {
  const date = new Date();

  // Konversi ke WIB (UTC +7)
  const wibTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);

  const year = wibTime.getUTCFullYear();
  const month = String(wibTime.getUTCMonth() + 1).padStart(2, "0");
  const day = String(wibTime.getUTCDate()).padStart(2, "0");
  const hours = String(wibTime.getUTCHours()).padStart(2, "0");
  const minutes = String(wibTime.getUTCMinutes()).padStart(2, "0");
  const seconds = String(wibTime.getUTCSeconds()).padStart(2, "0");

  // Format: YYYY-MM-DD_HH-mm-ss
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}
async function createUpdateContentPosting2(
  newDocument,
  projectid,
  contentposting,
  res
) {
  //MASUK CREATE

  // if (!tableproject) {
  let itemsUpload = contentposting.map(async (item) => {
    const timestampwib = getTimestampWIB();
    const filename = `${timestampwib}` + "-" + item.originalname;    
    const id_file = await uploadFile(filename, item, FOLDER_ID);
    return {
      _id: uuidv4(),
      project_id: newDocument.project_id,
      project_name: newDocument.project_name,
      table_project_id: projectid,
      table_project_name: newDocument.item,
      file_name: id_file,
      file_name_real: filename,
      file_type: item.mimetype,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: newDocument.created_by,
      updated_by: newDocument.updated_by,
    };
  });

  const uploadedFiles = await Promise.all(itemsUpload);

  const result = await ContentPostingsModel.insertMany(await uploadedFiles);
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
  try {
    const ids = req.body.id;

    // Ambil data file dari DB
    const contents = await ContentPostingsModel.find({
      _id: { $in: ids },
    }).select({ file_name: 1 });

    // Jalankan penghapusan paralel untuk efisiensi
    await Promise.all(
      contents.map(async (item) => {
        // 1️⃣ Hapus file lokal
        if (item.file_name) {
          const localPath = `./assets/contentposting/${item.file_name}`;
          try {
            await fs.unlink(localPath);
            console.log(`🗑️ Deleted local file: ${item.file_name}`);
          } catch (err) {
            console.warn(
              `⚠️ File ${item.file_name} not found or already deleted.`
            );
          }
        }

        // 2️⃣ Hapus file dari Google Drive
        console.log(item.file_name);
        if (item.file_name) {
          await deleteFileFromGoogleDrive(item.file_name);
        }
      })
    );

    // 3️⃣ Hapus data dari MongoDB
    const result = await ContentPostingsModel.deleteMany({ _id: { $in: ids } });

    if (result.deletedCount > 0) {
      return res.status(200).json({
        status: 1,
        message: "✅ Content Posting deleted successfully (local + Drive + DB)",
      });
    } else {
      return res.status(200).json({
        status: 1,
        message: "No content found to delete",
      });
    }
  } catch (err) {
    console.error("❌ Error in deleteContentPosting:", err);
    return res.status(500).json({
      status: -1,
      message: "Error while deleting content posting",
      error: err.message,
    });
  }
};
export const createTableProject = async (req, res) => {
  try {
    let newDocument = req.body;
    const projectId = newDocument.project_id; // pastikan frontend kirim project_id
    const tableId = uuidv4();

    newDocument._id = tableId;
    newDocument.created_at = new Date();

    const contentposting = req.files?.["contentposting"];

    // 🔹 Upload file kalau ada
    if (contentposting && contentposting.length > 0) {
      if (contentposting.length > 1) {
        for (let i = 0; i < contentposting.length; i++) {
          newDocument.contentposting = contentposting[i].filename;
        }
      } else {
        newDocument.contentposting = contentposting[0].filename;
      }

      const resultContentPosting = await createUpdateContentPosting2(
        newDocument,
        tableId,
        contentposting
      );

      if (resultContentPosting === 0) {
        return res.status(400).send({
          status: 0,
          message: "Error while uploading file, please try again",
        });
      }
    }

    // 🔹 Simpan ke database
    const result = await TableProjectsModel.create(newDocument);
    if (!result) {
      return res.status(400).send({
        status: 0,
        message: "Cannot create data in the database",
      });
    }

    // 🔹 Encode avatar (biar konsisten kayak endpoint lain)
    newDocument.lead_avatar = base64Encode(
      newDocument.lead_avatar,
      "profile_picture"
    );
    newDocument.updated_by_avatar = base64Encode(
      newDocument.updated_by_avatar,
      "profile_picture"
    );

    // 🧩 Emit hanya ke room project_id terkait
    if (req.io) {
      req.io.emit("newTableProject", {
        projectId, // penting buat filter di frontend
        newTableProject: newDocument,
      });
      console.log(
        `New table project emitted globally for project ${projectId}`
      );
    }

    return res.status(201).send({
      status: 1,
      message: "Table Project created",
      result,
    });
  } catch (error) {
    console.error("Error in createTableProject:", error);
    return res.status(500).send({
      status: 0,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const createSubItem = async (req, res) => {
  let newDocument = req.body;
  const projectid = uuidv4(); // Generate a unique ID for the sub-item
  newDocument._id = projectid;
  newDocument.created_at = new Date();

  const result = await SubItemModel.create(newDocument);

  if (!result) {
    res.status(404).send({
      status: 0,
      message: `Cannot create data in database`,
      result,
    });
  } else {
    result.avatar = base64Encode(result.avatar, "profile_picture");

    // Emit only to the clients listening for this specific `table_project_id`
    console.log(
      "🟢 Emitting newSubItem for table:",
      newDocument.table_project_id
    );

    req.io.emit("newSubItem", {
      projectId: newDocument.table_project_id,
      newSubItem: newDocument,
    });

    res.status(201).send({
      status: 1,
      message: "Sub Item created",
      result,
    });
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
    const subItem = await SubItemModel.find(query);

    if (!subItem) {
      return res.status(404).json({ status: 0, message: `Data not Found` });
    }

    for (let i = 0; i < subItem.length; i++) {
      const contentsavatar = base64Encode(
        subItem[i]["avatar"],
        "profile_picture"
      );
      subItem[i]["avatar"] = await contentsavatar;
    }

    // Emit only to the clients listening for this specific `table_project_id`
    req.io.emit(`subItemData_${req.params.id}`, subItem);

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
      const contentfile = base64EncodeContentPosting(
        body.file_name,
        "contentposting"
      );

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
export const showContentPosting2 = async (req, res) => {
  const { file_name, file_type } = req.body;

  try {
    const fileStream = await getFileFromGoogleDrive(file_name);

    // Atur header sesuai tipe file
    if (file_type === "video/mp4") {
      res.setHeader("Content-Type", "video/mp4");
      res.setHeader("Content-Disposition", `inline; filename="${file_name}"`);
    } else if (file_type.startsWith("image/")) {
      res.setHeader("Content-Type", file_type);
      res.setHeader("Content-Disposition", `inline; filename="${file_name}"`);
    } else {
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader("Content-Disposition", `attachment; filename="${file_name}"`);
    }

    fileStream.pipe(res);
  } catch (error) {
    console.error("Error retrieving file:", error);
    res.status(500).send("Error retrieving file");
  }
};

export const showContentPosting3 = async (req, res) => {
  const body = req.body; // body contains file_name and file_type
  try {
    const { file_name } = body;

    // Generate a Google Drive direct access URL
    const fileUrl = `https://drive.google.com/file/d/${file_name}/view`;

    // Return HTML with a link to open the file directly on Google Drive
    return res
      .status(200)
      .json({ status: 1, message: `showing url file`, fileUrl });
  } catch (error) {
    res.status(500).send("Error retrieving file");
  }
};
export const showContentPostingHtml = async (req, res) => {
  const body = req.body; // body contains file_name and file_type
  try {
    const { file_name } = body;

    // Generate a Google Drive direct access URL
    const fileUrl = `https://drive.google.com/file/d/${file_name}/view`;

    // Return HTML with a link to open the file directly on Google Drive
    res.send(`
      <html>
        <body style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column;">
          <a href="${fileUrl}" target="_blank" style="font-size: 18px; text-decoration: none; color: blue;">
            Click here to view the file on Google Drive
          </a>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send("Error retrieving file");
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
    const projectId = req.params.id;
    const query = { project_id: projectId };
    const tableproject = await TableProjectsModel.find(query).lean();

    if (!tableproject) {
      return res.status(404).json({ status: 0, message: `Data not Found` });
    }

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

    // 🔹 Emit hanya ke room sesuai ID project
    req.io.to(projectId).emit("tableProjectData", {
      projectId, // biar frontend bisa bedain ID-nya
      tableproject,
    });
    console.log("tableproject data lewat");

    return res.status(200).json({
      status: 1,
      message: `Get All Table Projects`,
      tableproject,
    });
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
function base64EncodeContentPosting(inputFileName, content) {
  if (!inputFileName == "") {
    const contents = fs.readFileSync(
      `./assets/` + content + `/` + inputFileName,
      {
        encoding: "base64",
      }
    );
    return contents;
  }
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
    const projectId = req.params.id;

    // Cari dulu data sebelum dihapus biar bisa di-broadcast
    const deletedProject = await TableProjectsModel.findById(req.params.id);
    if (!deletedProject) {
      return res.status(404).json({ status: 0, message: "Data not found" });
    }

    await TableProjectsModel.deleteOne({ _id: req.params.id });

    req.io.emit("tableProjectDeleted", {
      projectId: deletedProject.project_id, // ambil project_id dari record
      deletedProject,
    });

    return res.status(200).json({
      status: 1,
      message: `Table Project with id ${req.params.id} is deleted`,
    });
  } catch (error) {
    console.error("Error in deleteTableProject:", error);
    return res.status(400).json({
      status: -1,
      message: `Error on delete Table Project`,
    });
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
    // Cari dulu subitem yang akan dihapus
    const deletedSubItem = await SubItemModel.findById(req.params.id);
    if (!deletedSubItem) {
      return res.status(404).json({ status: 0, message: `Data not Found` });
    }

    await SubItemModel.deleteOne({ _id: req.params.id });

    // Emit event sesuai frontend
    req.io.emit("subItemDeleted", {
      projectId: deletedSubItem.table_project_id, // pastikan ini cocok dengan frontend
      deletedSubItem,
    });

    return res.status(200).json({
      status: 1,
      message: `Sub Item with id ${req.params.id} is deleted`,
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
  try {
    const newDocument = req.body;
    const query = { _id: newDocument._id };

    const updates = { $set: newDocument };
    const updatedSubItem = await SubItemModel.findByIdAndUpdate(
      query,
      updates,
      {
        new: true,
      }
    );

    if (!updatedSubItem) {
      return res.status(404).send({
        status: 0,
        message: `data not found`,
      });
    }

    updatedSubItem.avatar = base64Encode(
      updatedSubItem.avatar,
      "profile_picture"
    );

    // Emit event sesuai frontend
    req.io.emit("subItemEdited", {
      projectId: updatedSubItem.table_project_id, // harus sama fieldnya dengan frontend filter
      updatedSubItem,
    });

    return res.status(200).send({
      status: 1,
      message: `Sub Item with id ${updatedSubItem._id} successfully updated`,
      result: updatedSubItem,
    });
  } catch (error) {
    return res.status(400).send({
      status: -1,
      message: `Error on edit Sub Item`,
    });
  }
};

export const editTableProject = async (req, res) => {
  try {
    let newDocument = req.body;
    const query = { _id: newDocument._id }; // pakai uuid

    const contentposting = req.files?.["contentposting"];

    if (contentposting) {
      if (contentposting.length > 1) {
        for (let i = 0; i < contentposting.length; i++) {
          newDocument.contentposting = contentposting[i].filename;
        }
      } else {
        newDocument.contentposting = contentposting[0].filename;
      }

      const resultContentPosting = await createUpdateContentPosting2(
        newDocument,
        newDocument._id,
        contentposting
      );

      if (resultContentPosting === 0) {
        return res.status(400).send({
          status: 0,
          message: `Error while uploading file, please try again`,
        });
      }
    }

    const updates = { $set: newDocument };

    let result = await TableProjectsModel.findByIdAndUpdate(query, updates, {
      new: true,
    });

    if (!result) {
      return res.status(404).send({
        status: 0,
        message: `Data not found`,
      });
    }

    // Encode avatar
    result.lead_avatar = base64Encode(result.lead_avatar, "profile_picture");
    result.updated_by_avatar = base64Encode(
      result.updated_by_avatar,
      "profile_picture"
    );

    // Emit ke semua client
    const projectId = newDocument.project_id; // ambil project_id dari dokumen

    req.io.emit("tableProjectEdited", {
      projectId, // kirim project_id yang benar
      updatedProject: result,
    });

    res.status(200).send({
      status: 1,
      message: `Table Project with id ${newDocument._id} successfully updated`,
      result,
    });
  } catch (error) {
    console.error("Error in editTableProject:", error);
    return res.status(500).send({
      status: -1,
      message: "Internal server error",
    });
  }
};
