import express from "express";
import { verifyToken } from "../middleware/verifytoken.js";
import multer from "multer";
import { getContentsCard } from "../controllers/dashboardcontroller.js";


const router = express.Router();

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


router.get("/get-contents-card", verifyToken, getContentsCard);


export default router;
