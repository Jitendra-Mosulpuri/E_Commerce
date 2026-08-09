import mongoose from "mongoose"

const connectDB = async()=>{
    try{
        const conn=await mongoose.connect(process.env.MONGO_URI)
        console.log("MongoDB connected succerfully")
    }catch(err){
        console.log("MongoDB connection failed", err)
        process.exit(1);
    }
}
export default connectDB