import fs from "fs";
import AWS from "aws-sdk";
import { s3 } from "../../config.js";


export const uploadFileToS3 = async (base64Data: string, fileName: string, mimeType: string): Promise<string | null> => {
    try {
      const base64String = base64Data.split(';base64,').pop() || base64Data;
      
      // Convert base64 to buffer
      const fileBuffer = Buffer.from(base64String, 'base64');
      
      const params: AWS.S3.PutObjectRequest = {
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: `uploads/${Date.now()}_${fileName}`,
        Body: fileBuffer,
        ContentType: mimeType,
        ACL: "public-read", // Ensure public access if needed
      };
  
      const data = await s3.upload(params).promise();
      return data.Location; // The AWS S3 file URL
    } catch (error) {
      console.error("Upload failed:", error);
      return null;
    }
  };