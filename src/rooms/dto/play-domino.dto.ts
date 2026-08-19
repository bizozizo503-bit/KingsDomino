import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class PlayDominoDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(6)
  tileIndex: number;
}
