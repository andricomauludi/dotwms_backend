import express from "express";
import { verifyToken } from "../middleware/verifytoken.js";
import multer from "multer";

import {
  createGroupProject,
  createProject,
  createSubItem,
  createTableProject,
  deleteContentPosting,
  deleteGroupProject,
  deleteProject,
  deleteSubItem,
  deleteTableProject,
  detailTableProject,
  editGroupProject,
  editProject,
  editSubItem,
  editTableProject,
  getAllGroupProject,
  getAllProject,
  getAllSubItemByTable,
  getAllTableByProject,
  getContentPostingByTable,
  getProjectByGroupProject,
  showContentPosting,
  showContentPosting2,
  showContentPosting3,
  streamVideo,
} from "../controllers/workspacescontroller.js";
import { myTask, myTaskDone } from "../controllers/mytaskcontroller.js";

const router = express.Router();

// Set up multer with memory storage
const storage = multer.memoryStorage();

const uploads = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 300, // 300MB limit
  },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});

// Function to check file type
function checkFileType(file, cb) {
  if (file.fieldname === "contentposting") {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/gif" ||
      file.mimetype === "video/x-matroska" ||
      file.mimetype === "video/mp4"
    ) {
      cb(null, true); // Accept these types
    } else {
      cb(null, false); // Reject unsupported file types
    }
  } else {
    cb(new Error('Invalid fieldname')); // Handle unexpected fieldname
  }
}

// Middleware for multiple uploads
const multipleUpload = uploads.fields([
  { name: "contentposting" },
]);

//RESTful API ini menggunakan x-www-form-urlencoded

//all routes in here are starting with /users
router.post(
  "/create-group-project",
  uploads.none(),
  verifyToken,
  createGroupProject
);
router.get("/stream-video/:name", streamVideo);
router.get("/all-group-project", verifyToken, getAllGroupProject);
router.delete("/delete-group-project/:id", verifyToken, deleteGroupProject);
router.patch(
  "/edit-group-project",
  uploads.none(),
  verifyToken,
  editGroupProject
);
router.get("/get-project-specific/:id", verifyToken, getProjectByGroupProject);

router.post("/create-project", uploads.none(), verifyToken, createProject);
router.get("/all-project", verifyToken, getAllProject);
router.patch("/edit-project", uploads.none(), verifyToken, editProject);
router.delete("/delete-project/:id", verifyToken, deleteProject);

router.post(
  "/create-table-project",
  multipleUpload,
  verifyToken,
  createTableProject
);
// router.post("/create-table-project", uploads.single('foto'), verifyToken, createTableProject);
router.get("/all-table-project/:id", verifyToken, getAllTableByProject);
router.get("/detail-table-project/:id", verifyToken, detailTableProject);
router.patch(
  "/edit-table-project",
  multipleUpload,
  verifyToken,
  editTableProject
);
router.delete("/delete-table-project/:id", verifyToken, deleteTableProject);
router.post(
  "/delete-content-posting",
  uploads.none(),
  verifyToken,
  deleteContentPosting
);

router.post("/create-sub-item", uploads.none(), verifyToken, createSubItem);
router.patch("/edit-sub-item", uploads.none(), verifyToken, editSubItem);
router.delete("/delete-sub-item/:id", verifyToken, deleteSubItem);
router.get(
  "/all-sub-item/:id",
  uploads.none(),
  verifyToken,
  getAllSubItemByTable
);
router.post(
  "/show-content-posting",
  uploads.none(),
  verifyToken,
  showContentPosting2
);
router.post(
  "/show-content-posting-link",
  uploads.none(),
  verifyToken,
  showContentPosting3
);
router.get(
  "/content-posting/:id",
  uploads.none(),
  verifyToken,
  getContentPostingByTable
);
router.get("/my-task/:id", uploads.none(), verifyToken, myTask);
router.get("/my-task-done/:id", uploads.none(), verifyToken, myTaskDone);

export default router;
