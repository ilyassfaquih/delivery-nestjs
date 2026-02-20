import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MenuService } from './menu.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

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
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    @HttpCode(HttpStatus.CREATED)
    async addMenuItem(@Body() dto: CreateMenuItemDto) {
        return this.menuService.addMenuItem(dto);
    }

    /**
     * Updates an existing menu item.
     * PUT /api/menu/:id
     */
    @Put(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    async updateMenuItem(
        @Param('id') id: string,
        @Body() dto: UpdateMenuItemDto,
    ) {
        return this.menuService.updateMenuItem(+id, dto);
    }
}
