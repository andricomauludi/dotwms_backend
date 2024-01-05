import mongoose from "mongoose";

const { Schema, model } = mongoose;

const subItemSchema = new Schema({
  _id: String,
  table_project_id:String,
  table_project_name:String,
  subitem:String,
  owner:String,
  owner_email:String,
  avatar: String,
  status: String,
  date: String,
  created_by: String,
  updated_by: String,
  created_at: Date,
  updated_at : Date,
  deleted_at : Date,
});

const SubItemModel = model("sub-items", subItemSchema);
export default SubItemModel;
