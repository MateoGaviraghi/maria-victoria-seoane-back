import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters';
import { TransformInterceptor } from './common/interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Prefijo global para todas las rutas
  app.setGlobalPrefix('api');

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Filtro global de excepciones
  app.useGlobalFilters(new AllExceptionsFilter());

  // Interceptor de transformación de respuestas
  app.useGlobalInterceptors(new TransformInterceptor());

  // Configuración CORS
  const corsOrigins = configService.get<string>('cors.origins') || [
    'http://localhost:3001',
  ];
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Configuración Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('API Cursos Online - Sistema de Ventas')
    .setDescription('API REST para la plataforma de venta de cursos online')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa tu token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Autenticación y registro')
    .addTag('Users', 'Gestión de usuarios')
    .addTag('Courses', 'Gestión de cursos')
    .addTag('Cart', 'Carrito de compras')
    .addTag('Checkout', 'Proceso de pago')
    .addTag('Payments', 'Webhooks de MercadoPago')
    .addTag('Orders', 'Historial de órdenes')
    .addTag('Coupons', 'Gestión de cupones')
    .addTag('Messages', 'Mensajes de contacto')
    .addTag('Site Config', 'Configuración del sitio')
    .addTag('Dashboard', 'Panel de administración')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = configService.get<number>('port') || 3000;
  await app.listen(port);

  logger.log(`🚀 Servidor corriendo en: http://localhost:${port}`);
  logger.log(`📚 Documentación Swagger: http://localhost:${port}/api/docs`);
}
void bootstrap();
