import { Job } from "../models/job.model.js";
import { User } from "../models/user.schema.js";

//admin posted a job
export const postJob=async(req,res)=>{
    try {
        const {title,description,requirements,salary,location,jobType,experience,position,companyId}=req.body;
        const userId=req.id;
        if(!title||!description||!requirements||!salary||!location||!jobType||!experience||!position||!companyId){
            return res.status(400).json({
                message:"Something is missing",
                success:false
            })
        }
        const job = await Job.create({
              title,
              description,
              requirements:requirements.split(","),
              salary:Number(salary),
              location,
              jobType,
              experienceLevel:experience,
              position,
              company:companyId,
              created_by:userId
        })
        return res.status(201).json({
            message:"New Job Created successfully",
            job,
            success:true
        })
    } catch (error) {
        console.log(error);
    }
    
}
//student ke liye
export const getAllJobs=async(req,res)=>{
    try {
        const keyword=req.query.keyword||"";
        const query={
            $or:[
              {title:{$regex:keyword,$options:"i"}},
              {description:{$regex:keyword,$options:"i"}},
            ]
        };
        const jobs=await Job.find(query).populate({
           path:"company",
        }).sort({createdAt:-1});
        if(!jobs){
            return res.status(404).json({
                message:"Jobs not found",
                success:false
            })
        }
        return res.status(200).json({
            jobs,
            success:true
        })
    } catch (error) {
        console.log(error);
    }
    
}
//student ke liye
export const getJobById=async(req,res)=>{
    try {
const jobId=req.params.id;
const job=await Job.findById(jobId).populate({
    path:"applications"
});
if(!job){
    return res.status(404).json({
        message:"Jobs not found",
        success:false
    })
}
return res.status(200).json({
    job,
    success:true
})
    } catch (error) {
        console.log(error);
    }
}

//admin kitne job created kare
export const getAdminJobs=async(req,res)=>{
    try {
        const adminId=req.id;
        const jobs=await Job.find({created_by:adminId}).populate({path:'company',createdAt:-1});
        if(!jobs){
            return res.status(404).json({
                message:"Jobs are not found",
                success:false
            })
        }
        return res.status(200).json({
            jobs,
            success:true
        })
    } catch (error) {
        console.log(error);
    }
}

//saved job
export const toggleBookmark = async (req, res) => {
  try {
    const userId = req.id;
    const jobId = req.params.jobId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const alreadySaved = user.bookmarks.includes(jobId);

    if (alreadySaved) {
      user.bookmarks.pull(jobId);
      await user.save();
      return res.json({ success: true, message: "Removed from bookmarks" });
    }

    user.bookmarks.push(jobId);
    await user.save();
    return res.json({ success: true, message: "Saved to bookmarks" });

  } catch (err) {
    console.log("BOOKMARK CONTROLLER ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};



