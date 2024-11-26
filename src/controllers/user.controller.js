import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from "../utils/ApiError.js"
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinery.js'
import { ApiResponse } from '../utils/ApiResponse.js'

//creating function for generating access and refreshtokens

const generateAccessAndRefreshTokens = async(userId) =>{
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    //store the refresh token in db
    user.refreshToken= refreshToken
    await user.save({validateBeforeSave:false})  //jab bhi save karne jayenge tab baki ke field bhi kick in ho jate he for example password field is required ye problem aa sakata he s we use this

    return {accessToken,refreshToken}
  } catch (error) {
    throw new ApiError(500,"Something went wrong while generating refresh and access tokens")
  }
}


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


const loginUser = asyncHandler(async (req,res) =>{
    //get username or email from user (req.body)
    //check whether the username or email exists in db or not?
    //then get user password from user
    //check the password is correct or not?
    //if correct then login the user
    //and generate refresh and access token for user
    //send both tokens in cookies
    
    const {email,username,password} = req.body
     
    if(!username || !email)
    {
       throw new ApiError(400,"username or email is required")
    }
    
    const user = await User.findOne({  //user is whole object we get from monogDb
      $or:[{username},{email}]
    })

    if(!user)
    {
      throw new ApiError(404,"User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

     if(!isPasswordValid)
     {
        throw new ApiError(401,"Invalid user credentials")
     }

    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
      httpOnly:true,  //this both field : they prevent cookies from getting modified on frontend by enabling this two fields cookies can only be modified on server
      secure :true
    }
     

    return res
    .status(200)
    .cookie("accessToken", accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
      new ApiResponse(
        200,
        {
          user:loggedInUser,accessToken,refreshToken
        },
        "User Logged In Successfully"
      )
    )
})

const logoutUser = asyncHandler(async(req,res)=>{
     await User.findByIdAndUpdate(
      req.user._id,
      {
        $set:{
          refreshToken: undefined
        }
      },
      {
        new:true
      }
     )

     const options = {
      httpOnly:true,  
      secure :true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged Out"))

     
})
export {
  registerUser,
  loginUser,
  logoutUser
}

