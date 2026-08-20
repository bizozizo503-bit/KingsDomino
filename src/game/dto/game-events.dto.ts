import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Length, Matches, Max, Min } from 'class-validator';

export class JoinRoomEventDto {
  @IsString()
  @Matches(/^[a-fA-F0-9]{6}$/)
  roomCode: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  name?: string;
}

export class StartGameEventDto {
  @IsString()
  @Matches(/^[a-fA-F0-9]{6}$/)
  roomCode: string;
}

export class LeaveRoomEventDto {
  @IsString()
  @Matches(/^[a-fA-F0-9]{6}$/)
  roomCode: string;
}

export class PlayDominoEventDto {
  @IsString()
  @Matches(/^[a-fA-F0-9]{6}$/)
  roomCode: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(6)
  tileIndex: number;
}

export class ChatEventDto {
  @IsString()
  @Matches(/^[a-fA-F0-9]{6}$/)
  roomCode: string;

  @IsString()
  @Length(1, 200)
  message: string;
}
