import bcrypt from "bcryptjs";
import {User} from "../models/user.schema.js";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from '../utils/cloudinary.js'; // ✅
export const register=async(req,res)=>{
    try {
        const {name,email,phone,password,role}=req.body;
        if(!name||!email||!phone||!password||!role){
            return res.status(400).json({
                message:"Something is missing",
                success:false,
            })
        };
        //const file=req.file;
        //const fileUri=getDataUri(file);
        //const cloudResponse=await cloudinary.uploader.upload(fileUri.content);
        let cloudResponse;
if (req.file) {
  const fileUri = getDataUri(req.file);
  cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
    folder: "profile_photos",
  });
}

        const user=await User.findOne({email});
        if(user){
            return res.status(400).json({
                message:"User already exist with this email",
                success:false,
                
            })
        }
        const hashPassword=await bcrypt.hash(password,10);
        await User.create({
            name,
            email,
            phone,
            password:hashPassword,
            role,
            profile:{
                profilePhoto:cloudResponse?.secure_url || ""
            }
        })
        return res.status(201).json({
            message:"Account created Successfully",
            success:true,
            
        })

    } catch (error) {
        console.log(`${error} is`);
    }
}

export const login=async(req,res)=>{
    try {
        const {email,password,role}=req.body;
        if(!email||!password||!role){
            return res.status(400).json({
                message:"Something is missing",
                success:false,
            })
        }
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({
                message:"Incorrect  email or password",
                success:false,
                
            })
        }
        const isPasswordMatch=await bcrypt.compare(password,user.password);
        if(!isPasswordMatch){
            return res.status(400).json({
                message:"Incorrect  email or password",
                success:false,
            })
        }
        //check role correct or not.
        if(role!==user.role){
            return res.status(400).json({
                message:"Account doesn't exist with this role",
                success:false,   
            })
        }
        const tokenData={
            userId:user._id,
        }
        const token=await jwt.sign(tokenData, process.env.SECRET_KEY,{expiresIn:'1d'});
        let Updateuser={
            _id:user._id,
            name:user.name,
            email:user.email,
            phone:user.phone,
            role:user.role,
            profile:user.profile,
        }
        return res.status(200).cookie("token",token,{ maxAge:1*24*60*60*60*1000,httpOnly:true,sameSite:"strict"}).json({
            message:`Welcome back ${Updateuser.name}`,
            user,
            success:true,
        });
    } catch (error) {
        console.log(error);
    }
}


export const logout=async(req,res)=>{
    try {
            return res.status(200).cookie("token","",{maxAge:0}).json({
                message:`Logged out Successfully`,
                success:true
            });   
    }
    catch (error) {
        console.log(error);
    }
}

export const updateProfile=async(req,res)=>{
    try {
        const {name,email,phone,bio,skills}=req.body;
       // const file=req.file;
        //const fileUri=getDataUri(req.file);
        //const cloudResponse=await cloudinary.uploader.upload(fileUri.content);
        //cloudnary aayega..........
        let cloudResponse;
if (req.file) {
  const fileUri = getDataUri(req.file);

  cloudResponse = await cloudinary.uploader.upload(
    fileUri.content,
    {
      resource_type: "raw",   // ⭐ MOST IMPORTANT
      folder: "resumes",
    }
  );
}
        let skillsArray=[];
        if(skills)skillsArray=skills.split(",").map(s => s.trim());;
        const userId=req.id; //middleware authentication
        let user=await User.findById(userId);
         if(!user){
            return res.status(400).json({
                message:"User not found",
                success:false,
            })
        }
        if(name){user.name=name}
        if(email){user.email=email}

        if(phone){user.phone=phone}
        if(bio){
            user.profile.bio=bio}
        if(skills){
                user.profile.skills=skillsArray
        }

        //resume comes later...........
        if(cloudResponse){
            user.profile.resume=cloudResponse.secure_url;
            user.profile.resumeOriginalName=req.file.originalname;
        }
        await user.save();
        user={
            _id:user._id,
            name:user.name,
            email:user.email,
            phone:user.phone,
            role:user.role,
            profile:user.profile,
        }
        return res.status(200).json({
            message:"Profile updated Successfully",
            user,
            success:true,
        })
    }
    catch (error) {
        console.log(error);
    }
}

export const getSavedJobs = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .populate({
        path: "bookmarks",
        populate: { path: "company" },
      });
    
    return res.status(200).json({
      success: true,
      savedJobs: user.bookmarks, // 👈 YAHI JSON JAYEGA
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch saved jobs",
    });
  }
};
