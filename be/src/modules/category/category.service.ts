import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /**
   * Lấy tất cả danh mục
   * @returns Danh sách tất cả categories
   */
  async findAll(): Promise<Category[]> {
    return await this.categoryRepository.find({
      order: { categoryName: 'ASC' },
    });
  }
}

