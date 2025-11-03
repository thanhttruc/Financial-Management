import { Controller, Get, Post, Put, HttpCode, HttpStatus, UseGuards, Request, UnauthorizedException, InternalServerErrorException, BadRequestException, Query, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GoalService } from './goal.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

/**
 * Controller xử lý các API liên quan đến Goals
 */
@ApiTags('goals')
@Controller('v1/goals')
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  /**
   * Lấy danh sách mục tiêu của user đăng nhập
   * GET /api/v1/goals
   */
  @UseGuards(AuthGuard('jwt'))
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách mục tiêu tài chính của user' })
  @ApiQuery({
    name: 'month',
    required: false,
    type: String,
    description: 'Tháng định dạng YYYY-MM (ví dụ: 2025-01) để lọc saving goal theo tháng',
    example: '2025-01',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thành công',
    schema: {
      example: {
        success: true,
        message: 'Fetched successfully',
        data: {
          savingGoal: {
            goal_id: 1,
            goal_type: 'Saving',
            target_amount: 60000000,
            target_achieved: 10000000,
            present_amount: 8000000,
            start_date: '2025-01-01',
            end_date: '2025-12-31',
          },
          expenseGoals: [
            {
              goal_id: 2,
              category: 'Food',
              target_amount: 3000000,
            },
            {
              goal_id: 3,
              category: 'Transportation',
              target_amount: 2000000,
            },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - thiếu JWT token' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getGoals(@Request() req) {
    try {
      // Kiểm tra user từ JWT token
      if (!req.user || !req.user.userId) {
        console.error('[GoalController] User not authenticated, req.user:', req.user);
        throw new UnauthorizedException({
          success: false,
          message: 'User not authenticated. Please login again.',
        });
      }

      const userId = req.user.userId;
      const month = req.query?.month as string | undefined;
      
      console.log('[GoalController] Fetching goals for userId:', userId, 'month:', month);
      
      const data = await this.goalService.getAllGoals(userId, month);

      return {
        success: true,
        message: 'Fetched successfully',
        data,
      };
    } catch (error) {
      console.error('[GoalController] Error in getGoals:', error);
      
      // Nếu đã là HTTP exception thì throw lại
      if (error instanceof UnauthorizedException || error.status === 401) {
        throw error;
      }
      
      // Các lỗi khác
      throw new InternalServerErrorException({
        success: false,
        message: 'Không thể lấy danh sách mục tiêu. Vui lòng thử lại sau.',
      });
    }
  }

  /**
   * Tạo mới một mục tiêu
   * POST /api/v1/goals
   */
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo mới một mục tiêu tài chính' })
  @ApiResponse({
    status: 201,
    description: 'Tạo mục tiêu thành công',
    schema: {
      example: {
        success: true,
        message: 'Goal created successfully',
        data: {
          goal_id: 9,
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Unauthorized - thiếu JWT token' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createGoal(@Request() req, @Body() createGoalDto: CreateGoalDto) {
    try {
      // Kiểm tra user từ JWT token
      if (!req.user || !req.user.userId) {
        console.error('[GoalController] User not authenticated, req.user:', req.user);
        throw new UnauthorizedException({
          success: false,
          message: 'User not authenticated. Please login again.',
        });
      }

      const userId = req.user.userId;
      
      console.log('[GoalController] Creating goal for userId:', userId);
      
      const result = await this.goalService.createGoal(userId, createGoalDto);

      return {
        success: true,
        message: 'Goal created successfully',
        data: result,
      };
    } catch (error) {
      console.error('[GoalController] Error in createGoal:', error);
      
      // Nếu đã là HTTP exception thì throw lại
      if (error instanceof UnauthorizedException || error.status === 401) {
        throw error;
      }
      
      if (error instanceof BadRequestException || error.status === 400) {
        throw error;
      }
      
      // Các lỗi khác
      throw new InternalServerErrorException({
        success: false,
        message: 'Không thể tạo mục tiêu. Vui lòng thử lại sau.',
      });
    }
  }

  /**
   * Lấy tổng kết tiết kiệm theo từng tháng trong năm
   * GET /api/v1/goals/summary
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('summary')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy tổng kết tiết kiệm theo từng tháng trong năm' })
  @ApiQuery({
    name: 'year',
    required: false,
    type: Number,
    description: 'Năm cần xem tổng kết (ví dụ: 2025). Mặc định là năm hiện tại.',
    example: 2025,
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy dữ liệu thành công',
    schema: {
      example: {
        success: true,
        message: 'Fetched successfully',
        data: {
          user_id: 1,
          year: 2025,
          summary: {
            this_year: [
              { month: '01', amount: 1500000 },
              { month: '02', amount: 2000000 },
              // ...
            ],
            last_year: [
              { month: '01', amount: 1200000 },
              { month: '02', amount: 1800000 },
              // ...
            ],
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - thiếu JWT token' })
  @ApiResponse({ status: 400, description: 'Bad Request - năm không hợp lệ' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getSavingsSummary(@Request() req, @Query('year') year?: number) {
    try {
      // Kiểm tra user từ JWT token
      if (!req.user || !req.user.userId) {
        console.error('[GoalController] User not authenticated, req.user:', req.user);
        throw new UnauthorizedException({
          success: false,
          message: 'User not authenticated. Please login again.',
        });
      }

      const userId = req.user.userId;
      
      // Nếu không có year, dùng năm hiện tại
      const selectedYear = year || new Date().getFullYear();
      
      console.log('[GoalController] Fetching savings summary for userId:', userId, 'year:', selectedYear);
      
      const data = await this.goalService.getSavingsSummary(userId, selectedYear);

      return {
        success: true,
        message: 'Fetched successfully',
        data,
      };
    } catch (error) {
      console.error('[GoalController] Error in getSavingsSummary:', error);
      
      // Nếu đã là HTTP exception thì throw lại
      if (error instanceof UnauthorizedException || error.status === 401) {
        throw error;
      }
      
      if (error instanceof BadRequestException || error.status === 400) {
        throw error;
      }
      
      // Các lỗi khác
      throw new InternalServerErrorException({
        success: false,
        message: 'Không thể lấy dữ liệu tổng kết tiết kiệm. Vui lòng thử lại sau.',
      });
    }
  }

  /**
   * Cập nhật mục tiêu (chỉ cập nhật target_amount và archived_amount)
   * PUT /api/v1/goals/{goalId}
   */
  @UseGuards(AuthGuard('jwt'))
  @Put(':goalId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật mục tiêu tài chính' })
  @ApiParam({
    name: 'goalId',
    type: Number,
    description: 'ID của goal cần cập nhật',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật mục tiêu thành công',
    schema: {
      example: {
        success: true,
        message: 'Goal updated successfully',
        data: {
          updated_goal: {
            goal_id: 1,
            target_amount: 70000000,
            archived_amount: 15000000,
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - dữ liệu không hợp lệ hoặc goal không tồn tại' })
  @ApiResponse({ status: 401, description: 'Unauthorized - thiếu JWT token' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateGoal(@Request() req, @Param('goalId') goalId: number, @Body() updateGoalDto: UpdateGoalDto) {
    try {
      // Kiểm tra user từ JWT token
      if (!req.user || !req.user.userId) {
        console.error('[GoalController] User not authenticated, req.user:', req.user);
        throw new UnauthorizedException({
          success: false,
          message: 'User not authenticated. Please login again.',
        });
      }

      const userId = req.user.userId;
      
      console.log('[GoalController] Updating goal for userId:', userId, 'goalId:', goalId);
      
      const result = await this.goalService.updateGoal(userId, goalId, updateGoalDto);

      return {
        success: true,
        message: 'Goal updated successfully',
        data: {
          updated_goal: result,
        },
      };
    } catch (error) {
      console.error('[GoalController] Error in updateGoal:', error);
      
      // Nếu đã là HTTP exception thì throw lại
      if (error instanceof UnauthorizedException || error.status === 401) {
        throw error;
      }
      
      if (error instanceof BadRequestException || error.status === 400) {
        throw error;
      }
      
      // Các lỗi khác
      throw new InternalServerErrorException({
        success: false,
        message: 'Không thể cập nhật mục tiêu. Vui lòng thử lại sau.',
      });
    }
  }
}

