import { Controller, Get, Post, Param, Query, Req, UseGuards, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EventService } from './event.service';
import { EventType } from './entities/event.entity';
import { AdminGuard } from '../common/guards/admin.guard';

@Controller('events')
@UseGuards(AuthGuard('jwt'))
export class EventsController {
  constructor(private readonly eventService: EventService) {}

  @Post('create')
  @UseGuards(AdminGuard)
  async createEvent(
    @Body() body: {
      name: string;
      description: string;
      eventType: EventType;
      imageUrl?: string;
      missions: Array<{
        id: string;
        name: string;
        description: string;
        target: number;
        reward_gold: number;
        reward_xp: number;
        reward_item?: string;
        mission_type: string;
        game_id?: string;
      }>;
      startAt: number;
      endAt: number;
      rewards?: Record<string, any>;
    },
  ) {
    return this.eventService.createEvent(body);
  }

  @Get('active')
  async getActiveEvents() {
    return this.eventService.getActiveEvents();
  }

  @Get('upcoming')
  async getUpcomingEvents() {
    return this.eventService.getUpcomingEvents();
  }

  @Get('finished')
  async getFinishedEvents() {
    return this.eventService.getFinishedEvents();
  }

  @Get(':id')
  async getEvent(@Param('id') id: string) {
    return this.eventService.getEvent(id);
  }

  @Get(':id/progress')
  async getMyProgress(@Param('id') id: string, @Req() req: any) {
    return this.eventService.getOrCreateProgress(id, req.user.id);
  }

  @Post(':id/progress')
  @UseGuards(AdminGuard)
  async updateProgress(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: { missionType: string; increment?: number; gameId?: string },
  ) {
    return this.eventService.updateProgress(
      id,
      req.user.id,
      body.missionType,
      body.increment || 1,
      body.gameId,
    );
  }

  @Post(':id/claim')
  async claimReward(@Param('id') id: string, @Req() req: any) {
    return this.eventService.claimEventReward(id, req.user.id);
  }

  @Get(':id/leaderboard')
  async getLeaderboard(@Param('id') id: string, @Query('limit') limit?: string) {
    return this.eventService.getEventLeaderboard(id, Number(limit) || 50);
  }

  @Post(':id/activate')
  @UseGuards(AdminGuard)
  async activateEvent(@Param('id') id: string) {
    return this.eventService.activateEvent(id);
  }

  @Post(':id/finish')
  @UseGuards(AdminGuard)
  async finishEvent(@Param('id') id: string) {
    return this.eventService.finishEvent(id);
  }
}
