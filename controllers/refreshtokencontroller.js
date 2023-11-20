import UsersModel from "../models/usersmodel.js";
import  Jwt  from "jsonwebtoken";

export const refreshToken = async (req, res) => {           //melakukan refresh token tanpa login ulang
  try {
    const refreshToken = req.cookies.refreshToken; //mengambil cookies bernama refresh token
    if (!refreshToken) return res.sendStatus(401); //bila tidak ada cookies maka unauthorized
    let query = { refreshToken: req.body.refresh_token   }; //mencocokkan cookies refresh token dengan refresh token yang ada di db
    let result = await UsersModel.findOne(query); //cari 1 user
    if (!result) return res.sendStatus(403); //mengembalikan forbidden kalo ga sesuai rolesnya
    Jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) return res.sendStatus(403);
        const userId = result._id;
        const userName = result.full_name;
        const email = result.email;
        const role = result.role;
        const accessToken = Jwt.sign(
            { userId, userName, email, role },
            process.env.ACCESS_TOKEN_SECRET,
            {
              expiresIn: "20s",
            }
          );
          res.json(accessToken);
      }
    );
  } catch (error) {
    console.log(error);
  }
};
