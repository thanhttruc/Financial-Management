import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsDateString, IsPositive, ValidateIf } from 'class-validator';
import { GoalType } from '../entities/goal.entity';

/**
 * DTO: Validate payload when creating a new goal
 */
export class CreateGoalDto {
  @ApiProperty({ 
    example: 'Saving', 
    description: 'Loại mục tiêu',
    enum: GoalType,
  })
  @IsEnum(GoalType, {
    message: 'goal_type must be one of: Saving, Expense_Limit',
  })
  @IsNotEmpty()
  goal_type!: GoalType;

  @ApiProperty({ 
    example: 1, 
    description: 'Category ID (chỉ bắt buộc khi goal_type = Expense_Limit)',
    required: false,
  })
  @ValidateIf((o) => o.goal_type === GoalType.EXPENSE_LIMIT)
  @IsOptional()
  @IsNumber()
  @IsPositive()
  category_id?: number | null;

  @ApiProperty({ example: '2025-05-01', description: 'Ngày bắt đầu (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  start_date!: string;

  @ApiProperty({ example: '2025-12-31', description: 'Ngày kết thúc (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  end_date!: string;

  @ApiProperty({ example: 80000000, description: 'Số tiền mục tiêu (phải > 0)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive({ message: 'target_amount must be greater than 0' })
  target_amount!: number;

  @ApiProperty({ 
    example: 80000000, 
    description: 'Số tiền đã tích lũy hiện tại (optional, default = 0)',
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  target_archived?: number;
}

