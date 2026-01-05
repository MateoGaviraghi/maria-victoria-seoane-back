import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configuration } from './config';
import { PrismaModule } from './prisma';
import { AuthModule } from './modules/auth';
import { UsersModule } from './modules/users';
import { CategoriesModule } from './modules/categories';
import { CoursesModule } from './modules/courses';
import { CourseModulesModule } from './modules/course-modules';
import { LessonsModule } from './modules/lessons';
import { CartModule } from './modules/cart/cart.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { JwtAuthGuard, RolesGuard } from './common/guards';
import { AllExceptionsFilter } from './common/filters';
import { TransformInterceptor } from './common/interceptors';

@Module({
  imports: [
    // Configuración global
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),

    // Tareas programadas (cron jobs)
    ScheduleModule.forRoot(),

    // Base de datos
    PrismaModule,

    // Módulos de la aplicación
    AuthModule,
    UsersModule,
    CategoriesModule,
    CoursesModule,
    CourseModulesModule,
    LessonsModule,

    // Módulos de Ventas
    CartModule,
    CouponsModule,
    CheckoutModule,
    OrdersModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Guard global de JWT
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Guard global de roles
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // Filtro global de excepciones
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    // Interceptor global de transformación
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
