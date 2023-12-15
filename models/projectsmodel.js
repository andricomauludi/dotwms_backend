import mongoose from "mongoose";

const {Schema, model} = mongoose;

const projectSchema = new Schema({
  _id:String,
  project_name: String,
  group_project: String,  
  group_project_id: String,  
  color_project: String,
  created_at: Date,
  created_by: String,
  updated_by: String,
});

const ProjectsModel = model('projects', projectSchema);
export default ProjectsModel;
