import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // Swagger Documentation
  const swaggerPath = 'api-docs';
  
  // Add cache prevention middleware for Swagger assets
  app.use(`/${swaggerPath}`, (req: any, res: any, next: any) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
  });

  const config = new DocumentBuilder()
    .setTitle('Telegram Kanal Yönetim Botu API')
    .setDescription(
      'Telegram kanalları için küfür filtresi, sinyal analizi ve kullanıcı yönetimi özellikleri sunan bot servisi.',
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerPath, app, document, {
    customSiteTitle: 'Telegram Bot API',
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; }
      .swagger-ui .info .title { color: #2c3e50; font-size: 2rem; }
      .swagger-ui .info .description { color: #555; line-height: 1.6; }
      .swagger-ui .scheme-container { background: #f8f9fa; border: 1px solid #dee2e6; padding: 1rem; border-radius: 4px; }
    `,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 Swagger documentation: http://localhost:${port}/${swaggerPath}`);
}
bootstrap();
