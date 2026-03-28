import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as fs from 'fs';
import * as yaml from 'yaml';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const logger = new Logger('Bootstrap');

  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableCors({
    origin: process.env.APP_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('Vector API')
      .setDescription('Vector Delivery Management API documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);

    const yamlString = yaml.stringify(document);
    fs.writeFileSync(join(process.cwd(), 'openapi.yaml'), yamlString);

    SwaggerModule.setup('api-docs', app, document);
  }

  const port = process.env.PORT || 8080;
  await app.listen(port);
  logger.log(`Vector Server running on port ${port}`);
}
bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
