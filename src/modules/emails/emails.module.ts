import { Module } from '@nestjs/common';
import { EmailsService } from './emails.service';
import { EmailsController } from './emails.controller';
import { EmailsCronService } from './emails-cron.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EmailsController],
  providers: [EmailsService, EmailsCronService],
  exports: [EmailsService], // Para usarlo en otros módulos
})
export class EmailsModule {}
