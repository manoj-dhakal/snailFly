import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    console.log("Received request to upload file");

    // Getting form data
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.error("No file uploaded");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log("File received:", file.name);

    // Read the file as a buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    console.log("Buffer created for the file");

    // Define the upload path
    const uploadPath = path.join(process.cwd(), "../backend/storage/uploads", file.name);
    console.log("Saving file to:", uploadPath);

    // Ensure the uploads folder exists
    const fs = require('fs');
    const uploadsDir = path.join(process.cwd(), "../backend/storage/uploads");
    
    if (!fs.existsSync(uploadsDir)) {
      console.log("Uploads folder does not exist. Creating it now...");
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Write the file to the specified location
    await writeFile(uploadPath, fileBuffer);

    console.log("File uploaded successfully");
    return NextResponse.json({ message: "File uploaded successfully", fileName: file.name });
  } catch (error) {
    // Log the error with more details
    console.error("Upload failed:", error);

    // Detailed error message
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error details:", errorMessage);

    return NextResponse.json({ error: "Upload failed", details: errorMessage }, { status: 500 });
  }
}