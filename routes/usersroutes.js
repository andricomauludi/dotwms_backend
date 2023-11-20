import express from "express";
import {
  changePassword,
  createUser,
  deleteUser,
  detailUser,
  editUser,  
  getAllUser,    
  login,  
  logout
} from "../controllers/userscontroller.js";
import { verifyToken } from "../middleware/verifytoken.js";
import { refreshToken } from "../controllers/refreshtokencontroller.js";

const router = express.Router();



//RESTful API ini menggunakan x-www-form-urlencoded

//all routes in here are starting with /users
router.get("/",verifyToken, getAllUser);

router.post("/", createUser);

//router ini untuk mendapatkan params dengan key id
router.get("/:id", detailUser);

router.delete("/:id", deleteUser);

router.patch("/:id", editUser);
router.post("/change-password", changePassword);
router.post("/login", login);
router.delete("/auth/logout", logout);

router.get("/renew/token", refreshToken);     //  untuk melakukan refresh token tanpa perlu login ulang

export default router;
