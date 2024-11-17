import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import path from "path";
import dotenv from "dotenv";
import * as fs from "fs";

import { userControllers, postControllers } from "./controllers/index.js";
import {
  registerValidation,
  loginValidation,
  PostCreateValidation,
  PostCommentValidation,
} from "./validations.js";
import handleValidationErrors from "./utils/handleValidationErros.js";
import checkAuth from "./utils/checkAuth.js";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/uploads", express.static("uploads"));

mongoose.set("strictQuery", false);

// mongoose
//   .connect(process.env.STRMONGO, {
//     connectTimeoutMS: 40000,
//     serverSelectionTimeoutMS: 40000,
//   })
//   .then(() => console.log("mongoose connected"))
//   .catch((err) => console.error("connect error:", err));

mongoose
  .connect(process.env.STRMONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 40000,
    serverSelectionTimeoutMS: 40000,
  })
  .then(() => console.log("mongoose connected"))
  .catch((err) => console.error("connect error:", err));

mongoose.connection.on("error", (err) => {
  console.log("err", err);
});

mongoose.connection.on("connected", (err, res) => {
  console.log("mongoose is connected");
});

const createFolders = () => {
  const folders = ["uploads", "uploads/avatarUrl", "uploads/postFile"];
  folders.forEach((folder) => {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  });
};
createFolders();

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
      console.log("Avatar original name:", avatar.originalname);
    } else {
      console.log("No avatar file uploaded");
    }

    if (postFile) {
      console.log("Post file saved at:", postFile.path);
      console.log("Post file original name:", postFile.originalname);
    } else {
      console.log("No post file uploaded");
    }

    if (Boolean(avatar)) {
      console.log(avatar.path);

      res.json({
        avatarUrl: avatar ? `${avatar.path}` : null,
      });
    } else {
      res.json({
        postFileUrl: postFile ? `${postFile.path}` : null,
      });
    }
  }
);
app.post(
  "/auth/login",
  loginValidation,
  handleValidationErrors,
  userControllers.login
);
app.post(
  "/auth/register",
  registerValidation,
  handleValidationErrors,
  userControllers.register
);

app.get("/auth/me", checkAuth, userControllers.getMe);

app.get("/posts", postControllers.getAll);
app.get("/posts/:id", postControllers.getOne);

app.get("/tags", postControllers.tags);

app.post(
  "/posts",
  checkAuth,
  PostCreateValidation,
  handleValidationErrors,
  postControllers.create
);
app.delete("/posts/:id", checkAuth, postControllers.remove);

app.patch(
  "/posts/:id",
  checkAuth,
  PostCreateValidation,
  handleValidationErrors,
  postControllers.update
);
app.patch(
  "/posts/:id/comment",
  checkAuth,
  PostCommentValidation,
  handleValidationErrors,
  postControllers.comment
);

const port = process.env.PORT || 1010;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
