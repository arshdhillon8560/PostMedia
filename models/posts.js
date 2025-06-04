const mongoose =require('mongoose');


const postSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
    },
    date:{
        type:Date,
        default:Date.now(),

    },
    content:String,
    likes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'user'
        }
    ]
})


const Post =mongoose.model('posts',postSchema);
module.exports=Post;
