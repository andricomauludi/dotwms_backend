
  function posts(mongoose) {
    //perlu parameter mongoose buat dipake didalamnya
    const schema = mongoose.Schema(
      //memerlukan objek mongoose saat mengambil file postman
      {
        first_name: String,
        last_name: String,
        age: String,
      },
      { timestamps: true }
    );

    //untuk menghindari mongodb membuat field _id untuk primary key

    schema.method("toJSON", function () {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });

    const Post = mongoose.model("posts", schema); //nama model akan menjadi plural dari kata model yang dibuat
    return Post;
  }

export default posts;
