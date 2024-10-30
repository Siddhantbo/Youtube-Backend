import mongoose, {Schema} from "mongoose";
import mongooseAggeragatePaginate from "mongoose-aggregate-paginate-v2"

const videoSchema = new Schema(
    {
         videoFile:{
            type:String, //cloudnery url
            required:true
         },
         thumbnail:{
            type:String, //cloudnery url
            required:true
         },
         title:{
            type:String, 
            required:true
         },
         description:{
            type:String, 
            required:true
         },
         duration:{
            type:Number, //cloudnery url
            required:true
         },
         views:{
            type:Number,
            default:0
         },
         isPublished:{
            type:Boolean,
            default:true
         },
         owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
         }

    },{timestamps:true}
)

videoSchema.plugin(mongooseAggeragatePaginate)
export const Video = mongoose.model("Video",videoSchema)