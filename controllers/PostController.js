import PostModel from "../models/Post.js";
import jwt from "jsonwebtoken";
import UserModel from "../models/User.js";

export const getAll = async (req, res) => {
  try {
    const posts = await PostModel.find().populate("user").exec();

    if (Boolean(posts)) {
      res.json(posts);
    } else {
      res.json({
        message: "not found",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалосъ получить статью",
    });
  }
};
export const getOne = async (req, res) => {
  const id = req.params.id;
  PostModel.findByIdAndUpdate(
    id,
    { $inc: { viewsCount: 1 } },
    { returnDocument: "after" },
    (err, doc) => {
      if (err) {
        return res.status(500).json({
          message: "Не удалосъ вернуть статью",
        });
      }
      if (!doc) {
        res.status(404).json({
          message: "Статью не найден",
        });
      }

      res.json(doc);
    }
  ).populate("user");
};
export const getLastTags = async (req, res) => {
  try {
    const posts = await PostModel.find().limit(5).exec();
    console.log(posts);
    console.log(req.body);
    const tags = posts
      .map((obj) => obj.tags)
      .flat()
      .slice(0, 5);
    const uniqueTags = [...new Set(tags)];
    res.json(uniqueTags);
    res.json({
      message: "tags",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const create = async (req, res) => {
  // Extract and verify token
  const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");
  try {
    const decoded = jwt.verify(token, "sav571p");
    const { id, _id } = decoded;
    req.userID = id || _id;
    console.log(decoded);

    // Create a new post document
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags
        ? req.body.tags.split(",").map((tag) => tag.trim()) // har bir tagni trim qilamiz
        : [],
      user: req.userID,
    });
    // Save the post to the database
    const post = await doc.save();

    // Send success response
    res.json({
      message: "Статья успешно сохранена",
      post,
    });
  } catch (err) {
    console.error(err);

    // Send error response
    res.status(500).json({
      message: "Не удалось создать статью",
    });
  }
};
export const remove = async (req, res) => {
  try {
    const userID = req.params.id;
    PostModel.findByIdAndDelete(userID, (err, doc) => {
      if (err) {
        return res.status(500).json({
          message: "Не удалось получить статьи",
        });
      }
      if (!doc) {
        res.status(404).json({
          message: "Статья не найдена",
        });
      }
      res.json({
        success: true,
        doc,
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Не удалось получить статьи",
    });
  }
};
export const update = async (req, res) => {
  try {
    const postId = req.params.id;

    await PostModel.updateOne(
      {
        _id: postId,
      },
      {
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        user: req.userId,
        tags: req.body.tags,
      }
    );

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось обновить статью",
    });
  }
};
export const comment = async (req, res) => {
  const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");
  const { id, _id } = await jwt.verify(token, "sav571p");

  try {
    const user = await UserModel.findById(Boolean(id) === true ? id : _id);

    const commentObj = {
      text: req.body.text,
      fullName: Boolean(user) === true ? user.fullName : "null",
      avatarUrl: Boolean(user) === true ? user.avatarUrl : "null",
      user: _id,
    };
    PostModel.findByIdAndUpdate(
      { _id: req.params.id },
      { $push: { comments: commentObj } },
      { returnDocument: "after" },
      function (err, doc) {
        if (err) {
          console.log(err, "qeqdan null kelopti");
        } else {
          res.status(200).json({ message: true });
        }
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).json(err.message);
  }
};
