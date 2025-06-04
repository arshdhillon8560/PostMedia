const mongoose =require('mongoose');


const userSchema = mongoose.Schema({
    username:String,
    name:String,
    age:Number,
    email:String,
    password:String,
    posts:[
        {type:mongoose.Schema.Types.ObjectId,
            ref:"posts",
        }
    ]
})


const User =mongoose.model('user',userSchema);
module.exports=User;
