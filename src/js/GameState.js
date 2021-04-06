export default class GameState {

  // функция определения текущего игрока
  static getNextGamer(currentGamer) {
    if (currentGamer === 'player') {
      return 'computer';
    } else if (currentGamer === 'computer') {
      return 'player';
    } else { throw new Error("Possible gamers: player or enemy...") }
  }

  // определение текущего игрока
  static setCurrentGamer(gamer) {
    if (gamer === 'player' || gamer === 'computer') {
      return gamer;
    } else { throw new Error("Possible gamers: player or enemy...") }
  }
}