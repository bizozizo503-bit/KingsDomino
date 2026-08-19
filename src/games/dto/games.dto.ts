import { IsString, IsOptional, IsArray, IsObject, Matches } from 'class-validator';

export class JoinMatchmakingDto {
  @IsString()
  gameId: string;
}

export class LeaveMatchmakingDto {
  @IsString()
  gameId: string;
}

export class CreateGameSessionDto {
  @IsString()
  gameId: string;

  @IsOptional()
  @IsString()
  roomCode?: string;

  @IsArray()
  playerIds: string[];

  @IsOptional()
  @IsObject()
  playerNames?: Record<string, string>;

  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}

export class GameMoveDto {
  @IsString()
  sessionId: string;

  @IsString()
  action: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}

export class ResignDto {
  @IsString()
  sessionId: string;
}
