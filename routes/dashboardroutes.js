import express from "express";
import { verifyToken } from "../middleware/verifytoken.js";
import multer from "multer";
import { getAllUserDashboard, getContentsCard } from "../controllers/dashboardcontroller.js";

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

router.get("/get-contents-card", verifyToken, getContentsCard);
router.get("/get-users-dashboard", verifyToken, getAllUserDashboard);


export default router;
