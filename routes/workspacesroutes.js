import express from "express";
import { verifyToken } from "../middleware/verifytoken.js";
import multer from "multer";

import {
  createGroupProject,
  createProject,
  createSubItem,
  createTableProject,
  deleteSubItem,
  deleteTableProject,
  detailTableProject,
  editSubItem,
  editTableProject,
  getAllGroupProject,
  getAllProject,
  getAllSubItemByTable,
  getAllTableByProject,  
  getProjectByGroupProject,  
} from "../controllers/workspacescontroller.js";
import { myTask } from "../controllers/mytaskcontroller.js";

const router = express.Router();

// membuat konfigurasi diskStorage multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "contenttext") {
      cb(null, "./assets/contenttext/");
    } else if (file.fieldname === "contentposting") {
      cb(null, "./assets/contentposting/");
    } else if (file.fieldname === "postingcaption") {
      cb(null, "./assets/postingcaption/");
    }
  },
  filename: (req, file, cb) => {
    if (file.fieldname === "contenttext") {
      cb(null, Date.now() + "-" + file.originalname);
    } else if (file.fieldname === "contentposting") {
      cb(null, Date.now() + "-" + file.originalname);
    } else if (file.fieldname === "postingcaption") {
      cb(null, Date.now() + "-" + file.originalname);
    }
  },
});

const uploads = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10,
  },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});
function checkFileType(file, cb) {
  if (file.fieldname === "contenttext" || file.fieldname === "postingcaption") {
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/msword" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      // check file type to be pdf, doc, or docx
      cb(null, true);
    } else {
      cb(null, false); // else fails
    }
  } else if (file.fieldname === "contentposting") {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/gif"
    ) {
      // check file type to be png, jpeg, or jpg
      cb(null, true);
    } else {
      cb(null, false); // else fails
    }
  }
}
//at the save function
const multipleUpload = uploads.fields([
  { name: "contenttext", maxCount: 1 },
  { name: "contentposting", maxCount: 1 },
  { name: "postingcaption", maxCount: 1 },
]);

//RESTful API ini menggunakan x-www-form-urlencoded

//all routes in here are starting with /users
router.post("/create-group-project", uploads.none(), verifyToken, createGroupProject);
router.get("/all-group-project", verifyToken, getAllGroupProject);
router.get("/get-project-specific/:id", verifyToken, getProjectByGroupProject);

router.post("/create-project", uploads.none(), verifyToken, createProject);
router.get("/all-project", verifyToken, getAllProject);

router.post(
  "/create-table-project",
  multipleUpload,
  verifyToken,
  createTableProject
);
// router.post("/create-table-project", uploads.single('foto'), verifyToken, createTableProject);
router.get("/all-table-project/:id", verifyToken, getAllTableByProject);
router.get("/detail-table-project/:id", verifyToken, detailTableProject);
router.patch("/edit-table-project", multipleUpload, verifyToken, editTableProject);
router.delete("/delete-table-project/:id", verifyToken, deleteTableProject);

router.post("/create-sub-item", uploads.none(), verifyToken, createSubItem);
router.patch("/edit-sub-item", uploads.none(), verifyToken, editSubItem);
router.delete("/delete-sub-item/:id", verifyToken, deleteSubItem);
router.get(
  "/all-sub-item/:id",
  uploads.none(),
  verifyToken,
  getAllSubItemByTable
);
router.get(
  "/my-task/:id",
  uploads.none(),
  verifyToken,
  myTask
);

export default router;
