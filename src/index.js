//require('dotenv').config({path: './env'});
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({
    path:'./env'
})

connectDB()  //asynchronous method he so ye function after execution promise bhi return karta he
.then(()=>{
  app.listen(process.env.PORT || 8000,()=>{
    console.log(`Server is running at ${process.env.PORT}`);
  })
})
.catch((err)=>{
   console.log("MongoDB connection failed!!",err);
})
































//first aproach to connect to database in this we are going to write code in index.js not in db folders index.js 
/*import express from "express";
const app= express();
(async()=>{
    try{
      await mongoose.connect(`${process.env.MONGODB_URI }/${DB_NAME}`)
      app.on("error",(error)=>{
        console.log("ERROR:" , error);
        throw error
      })

      app.listen(process.env.PORT, ()=>{
        console.log(`App is listening on port ${process.env.PORT}`);
      })
    }
    catch(error){
      console.error("ERROR:", error)
      throw err
    }
})()*/