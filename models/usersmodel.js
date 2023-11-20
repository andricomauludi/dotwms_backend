import mongoose from "mongoose";

const {Schema, model} = mongoose;

const userSchema = new Schema({
  _id:String,
  full_name: String,
  role: String,
  email: String,
  phone: String,
  address: String,
  birthday: String,
  profile_picture: String,
  is_admin: String,
  date: Date,
  password: String,
  refresh_token: String,

  
});

const UsersModel = model('users', userSchema);
export default UsersModel;
