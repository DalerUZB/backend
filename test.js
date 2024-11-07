import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const app = express();

// Ensure the necessary folders exist
const createFolders = () => {
  const folders = ["uploads", "uploads/avatarUrl", "uploads/postFile"];
  folders.forEach((folder) => {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  });
};

createFolders();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "avatarUrl") {
      cb(null, "uploads/avatarUrl"); // Save avatar images in 'uploads/avatarUrl'
    } else if (file.fieldname === "postFile") {
      cb(null, "uploads/postFile"); // Save post files in 'uploads/postFile'
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Save with a unique name
  },
});

const upload = multer({ storage: storage });

// Route to handle file uploads
app.post(
  "/upload",
  upload.fields([
    { name: "avatarUrl", maxCount: 1 }, // Accept one file for avatarUrl
    { name: "postFile", maxCount: 1 }, // Accept one file for postFile
  ]),
  (req, res) => {
    const avatar = req.files["avatarUrl"] ? req.files["avatarUrl"][0] : null;
    const postFile = req.files["postFile"] ? req.files["postFile"][0] : null;

    if (avatar) {
      console.log("Avatar file saved at:", avatar.path);
    } else {
      console.log("No avatar file uploaded");
    }

    if (postFile) {
      console.log("Post file saved at:", postFile.path);
    } else {
      console.log("No post file uploaded");
    }
    res.json({
      url: `uploads/${req.file.originalname}`,
    });
  }
);

app.get("/", (req, res) => {
  console.log("get pahe");
});

// Start the server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});   
