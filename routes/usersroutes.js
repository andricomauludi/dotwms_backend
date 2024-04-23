import express from "express";
import {
  changePassword,
  createUser,
  deleteUser,
  detailUser,
  dropdownUser,
  editUser,  
  getAllUser,    
  getMe,    
  login,  
  logout
} from "../controllers/userscontroller.js";
import { verifyToken } from "../middleware/verifytoken.js";
import { refreshToken } from "../controllers/refreshtokencontroller.js";

const router = express.Router();
router.options('/login', function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.end();
});



//RESTful API ini menggunakan x-www-form-urlencoded

//all routes in here are starting with /users
router.get("/", verifyToken, getAllUser);

router.post("/", verifyToken, createUser);

//router ini untuk mendapatkan params dengan key id
router.get("/detail/:id", verifyToken, detailUser);

router.get("/me", verifyToken, getMe);
router.get("/dropdown-user", verifyToken, dropdownUser);

router.delete("/:id", verifyToken, deleteUser);

router.patch("/:id", verifyToken, editUser);
router.post("/change-password", verifyToken, changePassword);
router.post("/login", login);
router.delete("/logout", logout);

router.get("/renew/token", verifyToken, refreshToken);     //  untuk melakukan refresh token tanpa perlu login ulang

export default router;
