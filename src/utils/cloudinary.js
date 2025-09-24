import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (
  localFilePath,
  folder = "devTinder"
) => {
  try {
    if (!localFilePath) return null;

    const respone = await cloudinary.uploader.upload(localFilePath, {
      folder,
      resource_type: "auto",
    });

    console.log("file is uploaded on cloudinary", respone.url);
    fs.unlinkSync(localFilePath); //removed the  localy saved temporary file
    return respone;
  } catch (error) {
    console.error("Cloudinary Upload Failed:", error);

    fs.unlinkSync(localFilePath);
    return null;
  }
};

export const deleteFromCloudinary = async (
  publicId,
  resourceType = "image"
) => {
  try {
    // Call Cloudinary to delete the media by public ID
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType, // Can be 'image' or 'video'
    });

    if (result.result === "ok") {
      console.log(`Successfully deleted from Cloudinary: ${publicId}`);
      return true;
    } else {
      console.error(`Failed to delete from Cloudinary: ${publicId}`);
      return false;
    }
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return false;
  }
};
