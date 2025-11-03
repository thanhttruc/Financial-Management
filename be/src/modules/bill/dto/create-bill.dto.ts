import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUrl, MaxLength } from 'class-validator';

/**
 * DTO: Validate payload when creating a new bill
 */
export class CreateBillDto {
  @ApiProperty({ example: 1, required: false, description: 'User ID (optional, taken from JWT if available)' })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiProperty({ example: 'Netflix Premium Subscription' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  itemDescription!: string;

  @ApiProperty({ example: 'https://cdn.netflix.com/logo.png', required: false })
  @IsOptional()
  @IsString()
  @IsUrl({ require_protocol: true }, { message: 'logoUrl must be a valid URL' })
  @MaxLength(255)
  logoUrl?: string | null;

  @ApiProperty({ example: '2025-11-15', description: 'Due date in YYYY-MM-DD' })
  @IsDateString()
  dueDate!: string;

  @ApiProperty({ example: '2025-10-15', required: false, description: 'Last charge date in YYYY-MM-DD' })
  @IsOptional()
  @IsDateString()
  lastChargeDate?: string | null;

  @ApiProperty({ example: 250.0 })
  @IsNumber()
  @IsPositive()
  amount!: number;
}


