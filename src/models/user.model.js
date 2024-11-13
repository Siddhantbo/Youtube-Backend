import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
{
   username:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true,    // Trims whitespace from the beginning and end of the string
    index:true  //searchin enable karne he kisi field pe like yaha pe username to index field true kar do optimize karta he
   },
   email:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true,
   },
   fullname:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true,
    index:true
   },
   avatar:{
    type:String,  //cloudenery url
    required:true,
   },
   coverImage:{
    type:String,
   },
   watchHistory:[
    {
        type:Schema.Types.ObjectId,
        ref:"Video"
    }
   ],
   password:{
    type:String,
    required:[true,'Password is required']
   },
   refreshToken:{
    type:String
   },  
},{timestamps:true})

userSchema.pre('save',async function (next){
    if(this.isModified("password"))
    {
        this.password = bcrypt.hash(this.password,10)
        next()
    }else{
        return next()
    }    
})
//checking of password
userSchema.methods.isPasswordCorrect = async function(password){
   return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function(){
    jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY   //The client uses the refresh token to request a new access token.When the server verifies the refresh token, it generates a new access token (and possibly a new refresh token) to extend the session.
        }
    ) 
}

export const User = mongoose.model("User",userSchema)