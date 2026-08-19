import { Injectable } from "@nestjs/common";
import { Domino } from "./domino.interface";

@Injectable()
export class DominoService {

  createDeck(): Domino[] {
    const deck: Domino[] = [];

    for (let left = 0; left <= 6; left++) {
      for (let right = left; right <= 6; right++) {
        deck.push({
          left,
          right,
        });
      }
    }

    return deck;
  }


  shuffle(deck: Domino[]): Domino[] {
    const shuffled = [...deck];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [shuffled[i], shuffled[j]] = [
        shuffled[j],
        shuffled[i],
      ];
    }

    return shuffled;
  }


  flip(tile: Domino): Domino {
    return {
      left: tile.right,
      right: tile.left,
    };
  }


  canPlace(
    tile: Domino,
    leftEnd: number,
    rightEnd: number,
  ): boolean {

    return (
      tile.left === leftEnd ||
      tile.right === leftEnd ||
      tile.left === rightEnd ||
      tile.right === rightEnd
    );
  }


  prepareTile(
    tile: Domino,
    side: number,
  ): Domino {

    if (tile.right === side) {
      return tile;
    }

    if (tile.left === side) {
      return this.flip(tile);
    }

    return tile;
  }


  hasPlayableTile(
    hand: Domino[],
    leftEnd: number,
    rightEnd: number,
  ): boolean {

    return hand.some(tile =>
      this.canPlace(tile, leftEnd, rightEnd)
    );
  }
}