import * as Joi from "joi";

/**
 * Validation schema for environment variables at application startup.
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),
  PORT: Joi.number().default(3000),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  TOKEN_PROVIDER: Joi.string().valid("jwt", "paseto").default("jwt"),
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default("8h"),
  PASETO_SECRET: Joi.string().min(16).optional(),
});
