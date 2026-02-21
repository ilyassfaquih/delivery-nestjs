import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { MenuItem } from './entities/menu-item.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';

/**
 * Service responsible for menu item management.
 *
 * Equivalent Spring Boot: MenuService.java
 */
@Injectable()
export class MenuService {
    constructor(
        @InjectRepository(MenuItem)
        private readonly menuRepository: Repository<MenuItem>,
    ) { }

    /**
     * Returns all menu items, optionally filtered by a search query.
     *
     * Equivalent to: menuRepository.findByNameContainingIgnoreCase(query)
     *
     * NestJS/TypeORM Note:
     *   - Spring Data generates queries from method names (findByNameContainingIgnoreCase)
     *   - TypeORM uses query builder or find options (ILike for case-insensitive)
     */
    async getMenuItems(query?: string): Promise<MenuItem[]> {
        if (query && query.trim()) {
            return this.menuRepository.find({
                where: { name: ILike(`%${query}%`) },
            });
        }
        return this.menuRepository.find();
    }

    /**
     * Creates a new menu item from the given DTO.
     *
     * Equivalent to: menuItemMapper.toEntity(dto) → menuRepository.save(item)
     */
    async addMenuItem(dto: CreateMenuItemDto): Promise<MenuItem> {
        const item = this.menuRepository.create({
            name: dto.name,
            price: dto.price,
            imageUrl: dto.imageUrl,
            available: dto.available,
        });
        return this.menuRepository.save(item);
    }

    /**
     * Updates an existing menu item.
     * Throws an error if not found.
     */
    async updateMenuItem(id: number, dto: any): Promise<MenuItem> {
        const item = await this.menuRepository.findOne({ where: { id } });
        if (!item) {
            throw new Error(`Menu Item with ID ${id} not found.`);
        }

        if (dto.name !== undefined) item.name = dto.name;
        if (dto.price !== undefined) item.price = dto.price;
        if (dto.imageUrl !== undefined) item.imageUrl = dto.imageUrl;
        if (dto.available !== undefined) item.available = dto.available;

        return this.menuRepository.save(item);
    }

    /**
     * Deletes a menu item by id.
     */
    async deleteMenuItem(id: number): Promise<void> {
        const item = await this.menuRepository.findOne({ where: { id } });
        if (!item) {
            throw new Error(`Menu Item with ID ${id} not found.`);
        }
        await this.menuRepository.remove(item);
    }
}
