import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";

// Ensure we use formidable to parse form data
export async function GET(request: Request) {
  console.log("GET request received at:", new Date().toISOString());
  try {
    const { searchParams } = new URL(request.url);
    let fileUrl = searchParams.get("fileUrl");
    const requestId = searchParams.get("requestId") || uuidv4(); // Generate a unique ID if not provided
    const tempDir = os.tmpdir();
    const lockFilePath = path.join(tempDir, `${requestId}.lock`);

    // Check if the request is already being processed
    if (await fs.access(lockFilePath).then(() => true).catch(() => false)) {
      console.log("Duplicate request detected, ignoring...");
      return NextResponse.json({ error: "Duplicate request" }, { status: 429 });
    }

    // Create a lock file to mark this request as processed
    await fs.writeFile(lockFilePath, "processing");

    if (!fileUrl) {
      // Clean up the lock file after processing
      await fs.unlink(lockFilePath);
      return NextResponse.json({ error: "Missing file URL" }, { status: 400 });
    }

    // Ensure fileUrl is an absolute URL
    if (!fileUrl.startsWith("http://") && !fileUrl.startsWith("https://")) {
      const baseUrl = `${request.headers.get("x-forwarded-proto") || "http"}://${request.headers.get("host")}`;
      fileUrl = new URL(fileUrl, baseUrl).toString();
    }

    // Download the file locally
    const response = await fetch(fileUrl);
    if (!response.ok) {
      // Clean up the lock file after processing
      await fs.unlink(lockFilePath);
      throw new Error(`Failed to fetch file from URL: ${fileUrl}`);
    }

    // Generate unique filenames
    const fileExt = path.extname(fileUrl).toLowerCase();
    const inputFileName = `input-${uuidv4()}${fileExt}`;
    const inputFilePath = path.join(tempDir, inputFileName);

    // Write file to temp directory
    const fileBuffer = await response.arrayBuffer();
    await fs.writeFile(inputFilePath, Buffer.from(fileBuffer));

    // If it's already a PDF, return the original URL
    if (fileExt === ".pdf") {
      // Clean up the lock file after processing
      await fs.unlink(lockFilePath);
      return NextResponse.json({ pdfUrl: fileUrl });
    }

    // Convert to PDF using LibreOffice (headless mode)
    await new Promise((resolve, reject) => {
      exec(
        `libreoffice --headless --convert-to pdf "${inputFilePath}" --outdir "${tempDir}"`,
        (error, stdout, stderr) => {
          if (error) {
            console.error("LibreOffice conversion error:", error.message);
            reject(new Error("Conversion failed"));
          } else {
            console.log("LibreOffice conversion successful:", stdout);
            resolve(stdout);
          }
        }
      );
    });

    // Check for PDF files in the directory
    const tempFilesAfterConversion = await fs.readdir(tempDir);
    const pdfFiles = tempFilesAfterConversion.filter(file => file.endsWith(".pdf"));

    if (pdfFiles.length === 0) {
      // Clean up the lock file after processing
      await fs.unlink(lockFilePath);
      throw new Error("PDF conversion failed");
    }

    // Use the first PDF file found
    const outputFilePath = path.join(tempDir, pdfFiles[0]);

    // Move the file to the /uploads directory
    const uploadsDir = path.join(process.cwd(), "public/uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const finalOutputPath = path.join(uploadsDir, path.basename(outputFilePath));
    await fs.rename(outputFilePath, finalOutputPath);

    // Serve the converted PDF file
    const pdfUrl = `http://localhost:3000/uploads/${path.basename(finalOutputPath)}`;
    console.log("PDF successfully converted and available at:", pdfUrl);

    // Clean up the lock file after processing
    await fs.unlink(lockFilePath);
    return NextResponse.json({ pdfUrl });
  } catch (error) {
    console.error("Error in file conversion:", error);
    return NextResponse.json({ error: "Failed to convert file" }, { status: 500 });
  }
}
