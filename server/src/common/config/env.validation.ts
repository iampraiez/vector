import Joi from 'joi';

export const envValidationSchema = Joi.object({
  DATABASE_URL: Joi.string().required(),
  REDIS_URL: Joi.string().required(),
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
});
