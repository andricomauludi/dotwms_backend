import mongoose from "mongoose";

const { Schema, model } = mongoose;

const tableProjectSchema = new Schema({
  _id: String,
  project_id:String,
  project_name:String,
  lead_name: String,
  lead_email: String,
  lead_avatar: String,
  updated_by_avatar: String,
  email: String,
  item: String,
  postingschedule:String,
  postingtime: String,
  contentcategory: String,
  contenttextlink: String,
  contenttext: String,
  postingcaption: String,
  postingstatus: String,  
  created_by: String,
  updated_by: String,
  created_at: Date,
  updated_at : Date,
  deleted_at : Date,
});

const TableProjectsModel = model("table-projects", tableProjectSchema);
export default TableProjectsModel;
