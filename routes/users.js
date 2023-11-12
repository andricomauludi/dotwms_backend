import express from "express";
import {
  createUser,
  deleteUser,
  editUser,
  getAllUser,
  getUser,
} from "../controllers/users.js";

const router = express.Router();



//RESTful API ini menggunakan x-www-form-urlencoded

//all routes in here are starting with /users
router.get("/", getAllUser);

router.post("/", createUser);

//router ini untuk mendapatkan params dengan key id
router.get("/:id", getUser);

router.delete("/:id", deleteUser);

router.patch("/:id", editUser);

export default router;
