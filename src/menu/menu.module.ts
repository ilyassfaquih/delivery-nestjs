import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItem } from './entities/menu-item.entity';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';

/**
 * NestJS Module grouping all Menu-related components.
 */
@Module({
    imports: [TypeOrmModule.forFeature([MenuItem])],
    controllers: [MenuController],
    providers: [MenuService],
    exports: [TypeOrmModule], // So OrderModule can inject MenuRepository
})
export class MenuModule { }
