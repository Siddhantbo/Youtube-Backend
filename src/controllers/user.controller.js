import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from "../utils/ApiError.js"
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinery.js'
import { ApiResponse } from '../utils/ApiResponse.js'

const registerUser = asyncHandler(async (req,res)=>{
  //get user details from frontend
  //validation - not empty
  //check if user alreay exists - username,email
  //check for images, check for avatar
  //upload them to cloudinary,avatar
  //create user object - create entry in db
  //remove password and refresh token field from response
  //check for user creation
  //return response


    //get user details from frontend
  const {fullName,email,username,password}=req.body
 
    //validation - not empty
  if([fullName,email,username,password].some((field)=>
    field?.trim()=== ""))
  {
    throw new ApiError(400,"Fullname is required")
  }
  //check if user alreay exists - username,email
  const existingUser = await User.findOne({
    $or:[{username},{email}]
  })
   
  if(existingUser)
  {
    throw new ApiError(409,"User with email or username already exists")
  }
  console.log(req.files);
  //check for images, check for avatar
  const avatarLocalPath = req.files?.avatar?.[0]?.path
  //const coverImageLocalPath =  req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0)
  {
     coverImageLocalPath = req.files.coverImage[0].path;
  }


  console.log('Request body:', req.body);  // Check if fullname is sent
 console.log('Uploaded files:', req.files);  // Check if avatar file is uploaded
  if(!avatarLocalPath)
  {
    throw new ApiError(400,"Avatar file is required")
  }

    //upload them to cloudinary,avatar

  const avatarupload = await uploadOnCloudinary(avatarLocalPath)
  const coverImageupload = coverImageLocalPath? await uploadOnCloudinary(coverImageLocalPath):null
  
  if(!avatarupload)
  {
    throw new ApiError(400,"Avatar file is required")
  }

   //create user object - create entry in db
  const user = await User.create(
    {
        fullName,
        avatar:avatarupload.url,
        coverImage:coverImageupload?.url || "",
        email,
        password,
        username : username.toLowerCase()
    }
  )

  //remove password and refresh token field from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )
  
   //check for user creation
  if(!createdUser)
  {
    throw new ApiError(500,"Something went wrong while registering the user")
  }
   //return response
  return res.status(201).json(
    new ApiResponse(200,createdUser, "User registered Successfully")
  )
})

export {registerUser}

