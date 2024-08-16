import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const registerUser = asyncHandler( async(req,res)=>{
    // get user details from frontend
    // validation -- not empty and others
    // check if user already exists : username, email 
    // check for images, check for avatar(compulsory)
    // upload them to cloudinary, avatar if successful  
    // create user object - create entry in db 
    // remove password and refresh token field from response 
    // check for user creation 
    // return response if user created : false


   const {fullName, username, email, password} =req.body
   console.log("email: ",email);

   if(fullName===""){
    throw new ApiError(400,"fullname is required ")
   }

   if(
    [fullName,email,username,password].some((field)=>
    field?.trim()==="")
   ){
    throw new ApiError(400,"All fields are required")
   }

    const existedUser = User.findOne({            // User from our user.models(as it has direct access to mongodb ) and findOne() func from mongodb to match already existing field 
        $or:[{username},{email}]                  //operators from mongodb 
    })
    if(existedUser){
        throw new ApiError(409,"User with email or username already exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;        //we get .files access from multer and also path from multer
    
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    const avatar =await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }

    const user = await User.create({                   //create from mongoose to pass a data entry 
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",          
        email,
        password,
        username: username.toLowerCase(),
    })

    //
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )       //_id is automatically by mongodb with each data entry and findById is given by mongoose library
            //.select(with this same syntax) also given by mongooose

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

})

export {registerUser} 