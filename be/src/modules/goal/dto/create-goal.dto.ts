import {
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsDateString,
  Min,
  IsInt,
  ValidateIf,
  IsOptional,
} from 'class-validator';
import { GoalType } from '../entities/goal.entity';

export class CreateGoalDto {
  @IsEnum(GoalType, { message: 'Loại mục tiêu phải là Saving hoặc Expense_Limit' })
  @IsNotEmpty({ message: 'Loại mục tiêu không được để trống' })
  goal_type: GoalType;

  // Category ID - bắt buộc khi goal_type = Expense_Limit
  @ValidateIf((o) => o.goal_type === GoalType.EXPENSE_LIMIT)
  @IsInt({ message: 'Category ID phải là số nguyên' })
  @IsNotEmpty({ message: 'Danh mục không được để trống khi loại mục tiêu là Chi tiêu' })
  category_id?: number;

  @IsDateString({}, { message: 'Ngày bắt đầu không hợp lệ' })
  @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
  start_date: string;

  @IsDateString({}, { message: 'Ngày kết thúc không hợp lệ' })
  @IsNotEmpty({ message: 'Ngày kết thúc không được để trống' })
  end_date: string;

  @IsNumber({}, { message: 'Số tiền mục tiêu phải là số' })
  @Min(0.01, { message: 'Số tiền mục tiêu phải lớn hơn 0' })
  @IsNotEmpty({ message: 'Số tiền mục tiêu không được để trống' })
  target_amount: number;

  @IsNumber({}, { message: 'Số tiền đã đạt được phải là số' })
  @Min(0, { message: 'Số tiền đã đạt được phải lớn hơn hoặc bằng 0' })
  @IsOptional()
  target_archived?: number;
}

