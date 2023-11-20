import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {                                    //MEMBUAT middleware untuk authentication

  const refreshToken = req.cookies.refreshToken; //mengambil cookies bernama refresh token
  if (!refreshToken) return res.sendStatus(401); //bila tidak ada cookies maka unauthorized


  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];                             //mengambil authheader kalo ada ambil token nya, token di split karena nanti tulisannya : token eySAFas.....
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {            //melakukan decoded token untuk mengambil payload
    if (err) return res.sendStatus(403);   //forbidden
    req.email = decoded.email;
    next();
  });
};
