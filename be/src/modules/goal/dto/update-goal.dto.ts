import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsOptional } from 'class-validator';

/**
 * DTO: Validate payload when updating a goal
 */
export class UpdateGoalDto {
  @ApiProperty({ 
    example: 70000000, 
    description: 'Số tiền mục tiêu mới (phải > 0)',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive({ message: 'target_amount must be greater than 0' })
  target_amount!: number;

  @ApiProperty({ 
    example: 15000000, 
    description: 'Số tiền đã đạt được của mục tiêu (archived amount - số tiền, không phải phần trăm)',
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  archived_amount?: number;
}

