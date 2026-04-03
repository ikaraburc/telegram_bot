"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
    }));
    const swaggerPath = 'api-docs';
    app.use(`/${swaggerPath}`, (req, res, next) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');
        next();
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Telegram Kanal Yönetim Botu API')
        .setDescription('Telegram kanalları için küfür filtresi, sinyal analizi ve kullanıcı yönetimi özellikleri sunan bot servisi.')
        .setVersion('1.0')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup(swaggerPath, app, document, {
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
//# sourceMappingURL=main.js.map