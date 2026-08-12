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
}
