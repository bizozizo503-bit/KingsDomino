export class CreateGameDto {
  board: number[][];
  currentPlayer: number;
  turn: number;
  finished?: boolean;
}
