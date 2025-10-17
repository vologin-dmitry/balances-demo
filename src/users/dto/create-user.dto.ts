import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Balance must be a valid number with up to 2 decimal places' },
  )
  @Type(() => Number)
  balance?: number;
}
