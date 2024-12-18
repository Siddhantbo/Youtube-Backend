import {v2 as cloudinary} from "cloudinary"
import { error } from "console";
import fs from "fs"

 // Configuration
cloudinary.config({ 
    cloud_name: process.env.CLODINARY_CLOUD_NAME, 
    api_key: process.env.CLODINARY_API_KEY, 
    api_secret: process.env.CLODINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async(localFilePath)=>{
   try {
      if(!localFilePath) return null
      //upload file on cloudinery
      const response = await cloudinary.uploader.upload(localFilePath,{
        resource_type:"auto"
      })
      //file has been uploaded successfully
     // console.log("File is uploaded on cloudinery",response.url)
     fs.unlinkSync(localFilePath)
      return response;
   } catch (error) {
      fs.unlinkSync(localFilePath);
      //remove the locale saved 
      //temporary file as the upload operation got failed
      return null;
   }
}
const getPublicId = (url)=>{
   const parts = url.split("/upload/")

   const publicId = parts[1].split("/")[1].split(".")[0];

   return publicId;
}
 const deleteAvatar = async(url)=>{
   try {
      const publicId = getPublicId(url);
      console.log(publicId)
      if(!publicId)
      {
         throw new Error("Invalid Cloudinary URL");
      }
      const result = await cloudinary.uploader.destroy(publicId)

      console.log("Image deleted:",result)
   } catch (error) {
      console.log("Error deleting image:", error.message)
   }
}

export {uploadOnCloudinary,deleteAvatar}