import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';

/**
 * REST controller for menu item management.
 * Supports listing, searching, and adding menu items.
 *
 * Equivalent Spring Boot: MenuController.java
 *
 * NestJS Note:
 *   - @RequestParam(required = false) → @Query('q') (query parameter)
 *   - Spring returns ResponseEntity<List<MenuItem>>
 *   - NestJS just returns the array (auto-serialized to JSON)
 */
@Controller('api/menu')
export class MenuController {
    constructor(private readonly menuService: MenuService) { }

    /**
     * Returns menu items. If a search query is provided, filters by name.
     * GET /api/menu?q=pizza
     */
    @Get()
    async getMenu(@Query('q') query?: string) {
        return this.menuService.getMenuItems(query);
    }

    /**
     * Adds a new menu item.
     * POST /api/menu
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async addMenuItem(@Body() dto: CreateMenuItemDto) {
        return this.menuService.addMenuItem(dto);
    }
}
