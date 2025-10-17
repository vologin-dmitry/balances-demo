import { Controller, Get, Query } from '@nestjs/common';
import { HistoryService } from './history.service';
import { HistoryQueryDto } from './dto/history-query.dto';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  async getHistory(@Query() query?: HistoryQueryDto) {
    return this.historyService.getHistory(query);
  }
}
