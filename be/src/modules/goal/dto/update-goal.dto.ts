import { IsNumber, Min, IsNotEmpty } from 'class-validator';

export class UpdateGoalDto {
  @IsNumber({}, { message: 'Số tiền mục tiêu phải là số' })
  @Min(0.01, { message: 'Số tiền mục tiêu phải lớn hơn 0' })
  @IsNotEmpty({ message: 'Số tiền mục tiêu không được để trống' })
  target_amount: number;

  @IsNumber({}, { message: 'Số tiền đã đạt được phải là số' })
  @Min(0, { message: 'Số tiền đã đạt được phải lớn hơn hoặc bằng 0' })
  @IsNotEmpty({ message: 'Số tiền đã đạt được không được để trống' })
  archived_amount: number;
}

