import Joi from "joi";

export const userSchema = Joi.object({
  name: Joi.string().alphanum().required(),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "de"] } })
    .required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(5).required(),
});
