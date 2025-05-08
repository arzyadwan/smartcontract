import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage });

const processImage = async (req: any, res: any, next: any) => {
  if (!req.file) {
    return next();
  }

  const filePath = path.join(uploadDir, req.file.filename);
  const newFileName = `${req.file.filename}`;
  const newFilePath = path.join(uploadDir, newFileName);

  try {
    await sharp(filePath)
      .resize(600, 250) // Resize ke 600x250px
      .toFormat("jpeg")
      .jpeg({ quality: 80 })
      .toFile(newFilePath);

    fs.unlinkSync(filePath); // Hapus file asli
    req.file.filename = newFileName; // Update filename
    req.file.path = newFilePath;
  } catch (error) {
    console.error("Error processing image:", error);
  }

  next();
};

export { upload, processImage };
