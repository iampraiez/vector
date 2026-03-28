import Joi from 'joi';

export const envValidationSchema = Joi.object({
  DATABASE_URL: Joi.string().required(),
  REDIS_URL: Joi.string().required(),
  REDIS_PASSWORD: Joi.string().optional().default('vector_redis_pass'),
  POSTGRES_USER: Joi.string().optional().default('vector'),
  POSTGRES_PASSWORD: Joi.string().optional().default('vector'),
  POSTGRES_DB: Joi.string().optional().default('vector'),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  SENDGRID_API_KEY: Joi.string().required(),
  SENDER_EMAIL: Joi.string().email().required(),
  GEOAPIFY_API_KEY: Joi.string().required(),
  APP_URL: Joi.string().uri().required(),
  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  CLOUDINARY_UPLOAD_PRESET: Joi.string().required(),
  PAYSTACK_SECRET_KEY: Joi.string().required(),
  PAYSTACK_PUBLIC_KEY: Joi.string().required(),
  PORT: Joi.number().integer().min(1).max(65535).default(8080),
});
