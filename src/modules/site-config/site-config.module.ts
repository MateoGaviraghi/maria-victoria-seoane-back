import { Module, Global } from '@nestjs/common';
import { SiteConfigService } from './site-config.service';
import { SiteConfigController } from './site-config.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Global() // Lo hacemos global para que el cron service pueda usarlo
@Module({
  imports: [PrismaModule],
  controllers: [SiteConfigController],
  providers: [SiteConfigService],
  exports: [SiteConfigService],
})
export class SiteConfigModule {}
