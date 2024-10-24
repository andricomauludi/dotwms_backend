import mongoose from "mongoose";

const { Schema, model } = mongoose;

const contentPostingSchema = new Schema({
  _id: String,
  project_id:String,
  project_name:String,
  table_project_id:String,
  table_project_name:String,
  file_name:String,  
  file_name_real:String,  
  file_type:String,  
  created_by: String,
  updated_by: String,
  created_at: Date,
  updated_at : Date,
  deleted_at : Date,
});

const ContentPostingsModel = model("content-postings", contentPostingSchema);
export default ContentPostingsModel;
