import { Controller, Get, UseGuards } from '@nestjs/common';
import { CategoriesService } from './category.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/v1/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * Lấy danh sách tất cả categories
   * @returns Object chứa success, message, data (danh sách categories)
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllCategories() {
    const categories = await this.categoriesService.findAll();

    return {
      success: true,
      message: 'Lấy danh sách danh mục thành công',
      data: categories,
    };
  }
}

