import mongoose from "mongoose";

const { Schema, model } = mongoose;

const groupProjectSchema = new Schema({
  _id: String,
  group_project:String,
  description:String, 
  created_by: String,
  updated_by: String,
  created_at: Date,
  updated_at : Date,
});

const GroupProjectModel = model("group-projects", groupProjectSchema);
export default GroupProjectModel;
