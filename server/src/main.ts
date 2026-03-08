import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as fs from 'fs';
import * as yaml from 'yaml';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.use(helmet());

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Vector API')
    .setDescription(
      'Full API specification for the Vector fleet management platform',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  try {
    if (!fs.existsSync('./api-docs')) fs.mkdirSync('./api-docs');
    fs.writeFileSync('./api-docs/openapi.yaml', yaml.stringify(document));
  } catch (err) {
    logger.warn('Failed to write openapi.yaml: ' + err);
  }

  const port = process.env.PORT || 8080;
  await app.listen(port);
  logger.log(`Vector Server running on port ${port}`);
}
bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
