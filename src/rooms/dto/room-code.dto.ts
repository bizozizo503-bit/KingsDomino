import { IsString, Matches } from 'class-validator';

export class RoomCodeDto {
  @IsString()
  @Matches(/^[a-fA-F0-9]{6}$/)
  code: string;
}
