import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import UserModel from "../models/User.js";

export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }

    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const value = {
      avatarUrl: req.body.avatarUrl,
      passwordHash: hash,
      fullName: req.body.fullName,
      email: req.body.email,
    };
    const doc = new UserModel(value);
    const user = await doc.save();

    const token = jwt.sign(
      {
        _id: user._id,
      },
      "sav571p",
      {
        expiresIn: "30d",
      }
    );
    const { passwordHash, ...userData } = user._doc;

    res.json({
      userData,
      token,
      message: "Registration completed successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Вы не смогли зарегистрироваться",
    });
  }
};
export const login = async (req, res) => {
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      res.status(404).json({
        message: "Пользователь не найден",
      });
    }
    if (user !== null) {
      const token = jwt.sign(
        {
          id: user._id,
        },
        "sav571p",
        {
          expiresIn: "30d",
        }
      );
      const { passwordHash, ...userData } = user._doc;

      const isValidPass = await bcrypt.compare(req.body.password, passwordHash);
      if (!isValidPass) {
        return res.status(400).json({
          message: "не верный логин или пароль",
        });
      }
      res.json({
        ...userData,
        token,
        message: "Login completed successfully",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Вы не смогли Авторизоваться",
    });
  }
};
export const getMe = async (req, res) => {
  const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");
  const decoded = await jwt.verify(token, "sav571p");
  const user = await UserModel.findById(
    (decoded.id = decoded.id || decoded._id)
  );
  try {
    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }
    const { passwordHash, ...userData } = user._doc;
    res.json(userData);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Нет доступа",
    });
  }
};
