import express from "express";
import { verifyToken } from "../middleware/verifytoken.js";
import { createProject, createTableProject, getAllProject, getAllTableByProject } from "../controllers/workspacescontroller.js";

const router = express.Router();



//RESTful API ini menggunakan x-www-form-urlencoded

//all routes in here are starting with /users
router.post("/create-project", verifyToken, createProject);
router.get("/all-project", verifyToken, getAllProject);

router.post("/create-table-project", verifyToken, createTableProject);
router.get("/all-table-project/:id", verifyToken, getAllTableByProject);
export default router;
