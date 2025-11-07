import { Controller, Get, Post, Put, Request, UseGuards, Body, HttpCode, HttpStatus, Param, ParseIntPipe } from '@nestjs/common';
import { GoalsService } from './goal.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@Controller('api/v1/goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  /**
   * Lấy tất cả mục tiêu của user hiện tại (đã phân loại thành savingGoal và expenseGoals)
   * @param req Request object chứa thông tin user đã xác thực
   * @returns Object chứa success, message, data (savingGoal và expenseGoals)
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserGoals(@Request() req: any) {
    const userId = req.user.userId;
    const goalsData = await this.goalsService.getUserGoals(userId);

    return {
      success: true,
      message: 'Lấy danh sách mục tiêu thành công',
      data: goalsData,
    };
  }

  /**
   * Tạo mục tiêu mới
   * @param req Request object chứa thông tin user đã xác thực
   * @param createGoalDto DTO chứa thông tin mục tiêu mới
   * @returns Object chứa success, message, data (goal_id)
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createGoal(@Request() req: any, @Body() createGoalDto: CreateGoalDto) {
    const userId = req.user.userId;
    const result = await this.goalsService.createGoal(userId, createGoalDto);

    return {
      success: true,
      message: 'Goal created successfully',
      data: result,
    };
  }

  /**
   * Cập nhật mục tiêu
   * @param req Request object chứa thông tin user đã xác thực
   * @param goalId ID của mục tiêu cần cập nhật
   * @param updateGoalDto DTO chứa thông tin cập nhật (target_amount và archived_amount)
   * @returns Object chứa message và updated_goal
   */
  @Put(':goalId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateGoal(
    @Request() req: any,
    @Param('goalId', ParseIntPipe) goalId: number,
    @Body() updateGoalDto: UpdateGoalDto,
  ) {
    const userId = req.user.userId;
    const updatedGoal = await this.goalsService.updateGoal(userId, goalId, updateGoalDto);

    return {
      message: 'Goal updated successfully',
      updated_goal: updatedGoal,
    };
  }
}

