import { IsNumber, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { HistoryAction } from '../../history/enums/history-action.entity';

export class ProcessActionDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsEnum(HistoryAction)
  action: HistoryAction;
}
