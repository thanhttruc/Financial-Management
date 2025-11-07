import { Injectable, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goal, GoalType } from './entities/goal.entity';
import { Category } from '../category/entities/category.entity';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

export interface SavingGoalResponse {
  goal_id: number;
  goal_type: string;
  target_amount: number;
  target_achieved: number;
  present_amount: number | null;
  start_date: string;
  end_date: string;
}

export interface ExpenseGoalResponse {
  goal_id: number;
  category: string;
  target_amount: number;
}

export interface UserGoalsResponse {
  savingGoal: SavingGoalResponse | null;
  expenseGoals: ExpenseGoalResponse[];
}

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /**
   * Format date thành YYYY-MM-DD
   * Xử lý cả Date object và string từ MySQL
   */
  private formatDate(date: Date | string): string {
    if (!date) {
      return '';
    }
    if (typeof date === 'string') {
      // Nếu là string, kiểm tra format và trả về
      const dateStr = date.split('T')[0]; // Loại bỏ phần time nếu có
      return dateStr;
    }
    // Nếu là Date object
    return date.toISOString().split('T')[0];
  }

  /**
   * Lấy tất cả mục tiêu của user và phân loại thành savingGoal và expenseGoals
   * Chỉ lấy các goal có start_date trong tháng hiện tại
   * @param userId ID của user (từ token đã xác thực)
   * @returns Object chứa savingGoal (null nếu không có) và expenseGoals (mảng rỗng nếu không có)
   */
  async getUserGoals(userId: number): Promise<UserGoalsResponse> {
    try {
      // Lấy tháng hiện tại (format: YYYY-MM)
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      // 1. Truy vấn bảng Goals để lấy tất cả mục tiêu của userId có start_date trong tháng hiện tại
      // Sử dụng QueryBuilder với leftJoin để load category ngay cả khi category_id là null
      const goals = await this.goalRepository
        .createQueryBuilder('goal')
        .leftJoinAndSelect('goal.category', 'category')
        .where('goal.userId = :userId', { userId })
        .andWhere('DATE_FORMAT(goal.startDate, "%Y-%m") = :currentMonth', { currentMonth })
        .orderBy('goal.createdAt', 'DESC')
        .getMany();

      // 2. Phân loại và định dạng dữ liệu
      let savingGoal: SavingGoalResponse | null = null;
      const expenseGoals: ExpenseGoalResponse[] = [];

      for (const goal of goals) {
        if (goal.goalType === GoalType.SAVING) {
          // Chỉ lấy saving goal đầu tiên (mới nhất)
          if (!savingGoal) {
            savingGoal = {
              goal_id: goal.goalId,
              goal_type: goal.goalType,
              target_amount: Number(goal.targetAmount) || 0,
              target_achieved: Number(goal.targetAchieved) || 0,
              present_amount: goal.presentAmount ? Number(goal.presentAmount) : null,
              start_date: this.formatDate(goal.startDate),
              end_date: this.formatDate(goal.endDate),
            };
          }
        } else if (goal.goalType === GoalType.EXPENSE_LIMIT) {
          // Lấy category name từ quan hệ
          // Nếu không có category trong relation, sử dụng 'Others' làm mặc định
          const categoryName = goal.category?.categoryName || 'Others';

          expenseGoals.push({
            goal_id: goal.goalId,
            category: categoryName,
            target_amount: Number(goal.targetAmount) || 0,
          });
        }
      }

      // 3. Trả về JSON theo Response mẫu
      return {
        savingGoal,
        expenseGoals,
      };
    } catch (error) {
      console.error('Error in getUserGoals:', error);
      throw error;
    }
  }

  /**
   * Tạo mục tiêu mới
   * @param userId ID của user (từ token đã xác thực)
   * @param goalData Dữ liệu mục tiêu cần tạo
   * @returns Object chứa goal_id
   */
  async createGoal(userId: number, goalData: CreateGoalDto): Promise<{ goal_id: number }> {
    try {
      // 1. Validation: Kiểm tra target_amount phải là số dương (đã được validate trong DTO)
      // Validation: Kiểm tra start_date phải trước end_date
      const startDate = new Date(goalData.start_date);
      const endDate = new Date(goalData.end_date);

      if (startDate >= endDate) {
        throw new BadRequestException('Ngày bắt đầu phải trước ngày kết thúc');
      }

      // Validation: Nếu goal_type là Expense_Limit, kiểm tra category_id không được null (đã được validate trong DTO)

      // 2. Kiểm tra trùng lặp: Nếu là mục tiêu chi tiêu (Expense_Limit), kiểm tra xem mục tiêu cho category_id đó đã tồn tại chưa
      if (goalData.goal_type === GoalType.EXPENSE_LIMIT && goalData.category_id) {
        const existingGoal = await this.goalRepository.findOne({
          where: {
            userId,
            goalType: GoalType.EXPENSE_LIMIT,
            categoryId: goalData.category_id,
          },
        });

        if (existingGoal) {
          throw new ConflictException('Mục tiêu chi tiêu cho danh mục này đã tồn tại');
        }
      }

      // 3. Kiểm tra category_id có tồn tại trong DB không (nếu được cung cấp)
      if (goalData.category_id) {
        const category = await this.categoryRepository.findOne({
          where: { categoryId: goalData.category_id },
        });

        if (!category) {
          throw new BadRequestException('Danh mục không tồn tại');
        }
      }

      // 4. Gán user_id và lưu bản ghi vào DB
      const newGoal = this.goalRepository.create({
        userId,
        goalType: goalData.goal_type,
        categoryId: goalData.category_id || null,
        startDate: startDate,
        endDate: endDate,
        targetAmount: goalData.target_amount,
        targetAchieved: goalData.target_archived || 0,
      });

      const savedGoal = await this.goalRepository.save(newGoal);

      // 5. Trả về JSON theo Response mẫu
      return {
        goal_id: savedGoal.goalId,
      };
    } catch (error) {
      // Nếu là ConflictException hoặc BadRequestException, throw lại
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error in createGoal:', error);
      throw error;
    }
  }

  /**
   * Cập nhật mục tiêu
   * @param userId ID của user (từ token đã xác thực)
   * @param goalId ID của mục tiêu cần cập nhật
   * @param updateData Dữ liệu cập nhật (target_amount và archived_amount)
   * @returns Object chứa updated_goal
   */
  async updateGoal(
    userId: number,
    goalId: number,
    updateData: UpdateGoalDto,
  ): Promise<{
    goal_id: number;
    target_amount: number;
    archived_amount: number;
  }> {
    try {
      // 1. Kiểm tra quyền sở hữu: Xác minh goalId thuộc về userId từ token
      const goal = await this.goalRepository.findOne({
        where: { goalId },
      });

      if (!goal) {
        throw new NotFoundException('Mục tiêu không tồn tại');
      }

      if (goal.userId !== userId) {
        throw new NotFoundException('Mục tiêu không tồn tại');
      }

      // 2. Validation: Đảm bảo target_amount và archived_amount là số dương
      if (updateData.target_amount <= 0) {
        throw new BadRequestException('Số tiền mục tiêu phải là số dương');
      }

      if (updateData.archived_amount < 0) {
        throw new BadRequestException('Số tiền đã đạt được phải lớn hơn hoặc bằng 0');
      }

      // Validation: archived_amount KHÔNG ĐƯỢC LỚN HƠN target_amount
      if (updateData.archived_amount > updateData.target_amount) {
        throw new BadRequestException('Số tiền đã đạt được không được lớn hơn số tiền mục tiêu');
      }

      // 3. Cập nhật bản ghi Goals
      goal.targetAmount = updateData.target_amount;
      goal.targetAchieved = updateData.archived_amount;
      goal.lastUpdated = new Date();

      const updatedGoal = await this.goalRepository.save(goal);

      // 4. Trả về JSON theo Response mẫu
      return {
        goal_id: updatedGoal.goalId,
        target_amount: Number(updatedGoal.targetAmount),
        archived_amount: Number(updatedGoal.targetAchieved),
      };
    } catch (error) {
      // Nếu là NotFoundException hoặc BadRequestException, throw lại
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error in updateGoal:', error);
      throw error;
    }
  }
}

