import db from '../models/index.js'
const Post = db.posts

export const findAll(req,res)=>{
    Post.find()
    .then((result) =>{
        res.send(result)
    }).catch((err)=>{
        res.status(500).send({
            message:err.message || "Some error while retrieving posts"
        })
    });
}