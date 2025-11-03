import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Goal, GoalType } from './entities/goal.entity';
import { Category } from '../category/entities/category.entity';
import { Transaction, TransactionType } from '../transaction/entities/transaction.entity';
import { Account } from '../account/entities/account.entity';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@Injectable()
export class GoalService {
  constructor(
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Lấy tất cả mục tiêu của user, có thể lọc theo tháng (YYYY-MM)
   */
  async getAllGoals(userId: number, month?: string) {
    let savingGoal: Goal | undefined;

    try {
      // Lấy tất cả goals của user
      const goals = await this.goalRepository.find({
        where: { userId },
        relations: ['category'],
        order: { createdAt: 'DESC' },
      });

      // Nếu có month, parse năm và tháng
      const [selectedYear, selectedMonth] = month
        ? month.split('-').map(Number)
        : [undefined, undefined];

      const isGoalInMonth = (goal: Goal): boolean => {
        if (!month) return true; // không lọc theo tháng nếu không có tham số

        if (!goal.startDate || !goal.endDate) return false;
        const start = new Date(goal.startDate);
        const end = new Date(goal.endDate);

        // Chuyển start và end về đầu tháng để so sánh
        const startKey = start.getFullYear() * 12 + start.getMonth();
        const endKey = end.getFullYear() * 12 + end.getMonth();
        const selectedKey = selectedYear! * 12 + (selectedMonth! - 1);

        return selectedKey >= startKey && selectedKey <= endKey;
      };

      // === LỌC SAVING GOAL ===
      const savingGoals = goals.filter(
        (goal) =>
          goal.goalType === GoalType.SAVING &&
          !goal.categoryId &&
          isGoalInMonth(goal),
      );

      savingGoal =
        savingGoals.length > 0
          ? savingGoals[0]
          : undefined;

      // === LỌC EXPENSE GOALS ===
      const expenseGoals = goals
        .filter(
          (goal) =>
            goal.goalType === GoalType.EXPENSE_LIMIT &&
            isGoalInMonth(goal),
        )
        .map((goal) => ({
          goal_id: goal.goalId,
          category: goal.category?.categoryName || 'Unknown',
          target_amount: parseFloat(goal.targetAmount.toString()),
        }));

      // === FORMAT KẾT QUẢ ===
      const savingGoalResponse = savingGoal
        ? {
            goal_id: savingGoal.goalId,
            goal_type: savingGoal.goalType,
            target_amount: parseFloat(savingGoal.targetAmount.toString()),
            target_achieved: parseFloat(
              savingGoal.targetAchieved.toString(),
            ),
            present_amount: savingGoal.presentAmount
              ? parseFloat(savingGoal.presentAmount.toString())
              : null,
            start_date: savingGoal.startDate
              ? new Date(savingGoal.startDate).toISOString().split('T')[0]
              : null,
            end_date: savingGoal.endDate
              ? new Date(savingGoal.endDate).toISOString().split('T')[0]
              : null,
          }
        : null;

      return {
        savingGoal: savingGoalResponse,
        expenseGoals,
      };
    } catch (error) {
      console.error('[GoalService] Error fetching goals:', error);
      console.error('[GoalService] savingGoal value:', savingGoal);
      throw new InternalServerErrorException({
        success: false,
        message: 'Không thể lấy danh sách mục tiêu.',
      });
    }
  }

  /**
   * Lấy tổng tiết kiệm theo từng tháng trong năm
   * Tính toán: Revenue - Expense cho mỗi tháng
   */
  async getSavingsSummary(userId: number, year: number) {
    try {
      // Validate year
      if (!year || year < 2000 || year > 2100) {
        throw new BadRequestException({
          success: false,
          message: 'Năm không hợp lệ. Vui lòng nhập năm từ 2000 đến 2100.',
        });
      }

      // Lấy tất cả accounts của user
      const accounts = await this.accountRepository.find({
        where: { userId },
      });

      if (accounts.length === 0) {
        // Nếu không có account, trả về dữ liệu rỗng
        return {
          user_id: userId,
          year,
          summary: {
            this_year: this.generateEmptyMonthlyData(),
            last_year: this.generateEmptyMonthlyData(),
          },
        };
      }

      const accountIds = accounts.map((acc) => acc.accountId);

      // Tính toán cho năm hiện tại
      const thisYearData = await this.calculateMonthlySavings(accountIds, year);

      // Tính toán cho cùng kỳ năm trước
      const lastYear = year - 1;
      const lastYearData = await this.calculateMonthlySavings(accountIds, lastYear);

      return {
        user_id: userId,
        year,
        summary: {
          this_year: thisYearData,
          last_year: lastYearData,
        },
      };
    } catch (error) {
      console.error('[GoalService] Error fetching savings summary:', error);
      
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException({
        success: false,
        message: 'Không thể lấy dữ liệu tổng kết tiết kiệm.',
      });
    }
  }

  /**
   * Tính tổng tiết kiệm theo từng tháng trong năm
   */
  private async calculateMonthlySavings(accountIds: number[], year: number) {
    const monthlyData: { month: string; amount: number }[] = [];

    // Tính toán cho từng tháng (01-12)
    for (let month = 1; month <= 12; month++) {
      const monthStr = String(month).padStart(2, '0');
      
      // Tính tổng Revenue trong tháng
      const revenueResult = await this.transactionRepository
        .createQueryBuilder('transaction')
        .select('COALESCE(SUM(transaction.amount), 0)', 'total')
        .where('transaction.accountId IN (:...accountIds)', { accountIds })
        .andWhere('transaction.type = :type', { type: TransactionType.REVENUE })
        .andWhere('YEAR(transaction.transactionDate) = :year', { year })
        .andWhere('MONTH(transaction.transactionDate) = :month', { month })
        .andWhere('transaction.deletedAt IS NULL')
        .getRawOne();

      const totalRevenue = parseFloat(revenueResult?.total || '0');

      // Tính tổng Expense trong tháng
      const expenseResult = await this.transactionRepository
        .createQueryBuilder('transaction')
        .select('COALESCE(SUM(transaction.amount), 0)', 'total')
        .where('transaction.accountId IN (:...accountIds)', { accountIds })
        .andWhere('transaction.type = :type', { type: TransactionType.EXPENSE })
        .andWhere('YEAR(transaction.transactionDate) = :year', { year })
        .andWhere('MONTH(transaction.transactionDate) = :month', { month })
        .andWhere('transaction.deletedAt IS NULL')
        .getRawOne();

      const totalExpense = parseFloat(expenseResult?.total || '0');

      // Tiết kiệm = Revenue - Expense
      const savings = totalRevenue - totalExpense;

      monthlyData.push({
        month: monthStr,
        amount: Math.max(0, savings), // Đảm bảo không âm (nếu âm thì = 0)
      });
    }

    return monthlyData;
  }

  /**
   * Tạo dữ liệu rỗng cho 12 tháng
   */
  private generateEmptyMonthlyData(): { month: string; amount: number }[] {
    return Array.from({ length: 12 }, (_, i) => ({
      month: String(i + 1).padStart(2, '0'),
      amount: 0,
    }));
  }

  /**
   * Tạo mới một mục tiêu
   * @param userId - ID của user
   * @param createGoalDto - DTO chứa thông tin mục tiêu
   * @returns ID của goal vừa tạo
   */
  async createGoal(userId: number, createGoalDto: CreateGoalDto) {
    try {
      // Validate dates
      const startDate = new Date(createGoalDto.start_date);
      const endDate = new Date(createGoalDto.end_date);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestException({
          success: false,
          message: 'Ngày không hợp lệ. Vui lòng kiểm tra lại start_date và end_date.',
        });
      }

      if (startDate >= endDate) {
        throw new BadRequestException({
          success: false,
          message: 'Ngày kết thúc phải sau ngày bắt đầu.',
        });
      }

      // Nếu là Expense_Limit, phải có category_id
      if (createGoalDto.goal_type === GoalType.EXPENSE_LIMIT) {
        if (!createGoalDto.category_id) {
          throw new BadRequestException({
            success: false,
            message: 'category_id là bắt buộc khi goal_type là Expense_Limit.',
          });
        }

        // Kiểm tra category có tồn tại không
        const category = await this.categoryRepository.findOne({
          where: { categoryId: createGoalDto.category_id },
        });

        if (!category) {
          throw new BadRequestException({
            success: false,
            message: 'Category không tồn tại.',
          });
        }
      } else {
        // Nếu là Saving, không được có category_id
        if (createGoalDto.category_id) {
          throw new BadRequestException({
            success: false,
            message: 'category_id không được phép khi goal_type là Saving.',
          });
        }
      }

      // Tạo entity mới
      const newGoal = this.goalRepository.create({
        userId,
        goalType: createGoalDto.goal_type,
        categoryId: createGoalDto.goal_type === GoalType.EXPENSE_LIMIT ? createGoalDto.category_id : null,
        startDate: startDate,
        endDate: endDate,
        targetAmount: createGoalDto.target_amount,
        targetAchieved: 0, // Mặc định là 0 khi tạo mới
        presentAmount: createGoalDto.target_archived || null, // target_archived map to presentAmount
      });

      // Lưu vào database
      const savedGoal = await this.goalRepository.save(newGoal);

      return {
        goal_id: savedGoal.goalId,
      };
    } catch (error) {
      console.error('[GoalService] Error creating goal:', error);

      // Nếu đã là HTTP exception thì throw lại
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException({
        success: false,
        message: 'Không thể tạo mục tiêu. Vui lòng thử lại sau.',
      });
    }
  }

  /**
   * Cập nhật mục tiêu (chỉ cập nhật target_amount và archived_amount)
   * @param userId - ID của user (để verify ownership)
   * @param goalId - ID của goal cần cập nhật
   * @param updateGoalDto - DTO chứa thông tin cập nhật
   * @returns Goal đã được cập nhật
   */
  async updateGoal(userId: number, goalId: number, updateGoalDto: UpdateGoalDto) {
    try {
      // Tìm goal và kiểm tra ownership
      const goal = await this.goalRepository.findOne({
        where: { goalId, userId },
      });

      if (!goal) {
        throw new BadRequestException({
          success: false,
          message: 'Goal không tồn tại hoặc bạn không có quyền chỉnh sửa.',
        });
      }

      // Validate: archived_amount không được lớn hơn target_amount
      const archivedAmount = updateGoalDto.archived_amount ?? 0;
      if (archivedAmount > updateGoalDto.target_amount) {
        throw new BadRequestException({
          success: false,
          message: 'Số tiền đã đạt được không được lớn hơn số tiền mục tiêu.',
        });
      }

      // Validate: archived_amount không được âm
      if (archivedAmount < 0) {
        throw new BadRequestException({
          success: false,
          message: 'Số tiền đã đạt được không được âm.',
        });
      }

      // Cập nhật các trường
      goal.targetAmount = updateGoalDto.target_amount;
      // archived_amount map to targetAchieved (số tiền đã đạt được)
      goal.targetAchieved = archivedAmount;
      goal.lastUpdated = new Date();

      // Lưu vào database
      const updatedGoal = await this.goalRepository.save(goal);

      return {
        goal_id: updatedGoal.goalId,
        target_amount: parseFloat(updatedGoal.targetAmount.toString()),
        archived_amount: parseFloat(updatedGoal.targetAchieved.toString()),
      };
    } catch (error) {
      console.error('[GoalService] Error updating goal:', error);

      // Nếu đã là HTTP exception thì throw lại
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException({
        success: false,
        message: 'Không thể cập nhật mục tiêu. Vui lòng thử lại sau.',
      });
    }
  }
}
