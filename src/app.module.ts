import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configuration } from './config';
import { PrismaModule } from './prisma';

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

    // Módulos de la aplicación (se irán agregando)
    // AuthModule,
    // UsersModule,
    // CoursesModule,
    // CartModule,
    // CheckoutModule,
    // PaymentsModule,
    // OrdersModule,
    // CouponsModule,
    // MessagesModule,
    // SiteConfigModule,
    // DashboardModule,
    // EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
