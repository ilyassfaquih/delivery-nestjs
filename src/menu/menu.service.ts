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
            available: dto.available,
        });
        return this.menuRepository.save(item);
    }
}
