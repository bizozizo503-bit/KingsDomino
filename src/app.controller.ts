import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {

  @Get()
  home() {
    return {
      message: 'KingsDomino API is running!',
      version: '1.0.0'
    };
  }

games() {
  return [
    {
      id: 1,
      name: 'KingsDomino',
      players: 4,
      status: 'available'
    }
  ];
}
}
