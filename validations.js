import { body } from "express-validator";

export const registerValidation = [
  body("email", "неверный формать почты").isEmail().isString(),
  body("password", "пароль должен быть длиной не менее 5 символов")
    .isLength({
      min: 5,
    })
    .isString(),
  body("fullName", "укажите имя").isLength({ min: 3 }).isString(),
  body("image", "Неверная ссылка на аватарку").optional(),
];

export const loginValidation = [
  body("email", "неверный формать почты").trim().isEmail(),
  body("password", "пароль должен быть длиной не менее 5 символов")
    .trim()
    .isLength({
      min: 5,
    }),
];

export const PostCreateValidation = [
  body("title", "Введите загаловок статъи").isLength({ min: 3 }).isString(),
  body("text", "Введите текст статъи").isLength({ min: 3 }).isString(),
  body("tags", "Неверный ссылка на тегов, (укажите массив)")
    .optional()
    .isString(),
  body("imageUrl", "Неверный ссылка на изоброжение").optional().isString(),
  body("user", "user not found").optional().isString(),
];
