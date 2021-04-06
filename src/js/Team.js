import { Bowerman, Daemon, Magician, Swordsman, Undead, Zombie } from "./Character";
import GamePlay from "./GamePlay";

class Team {
  constructor() {
    this.members = new Set();
  }

  add(...characters) {
    this.members = new Set([...this.members, ...characters]);
  }

  get() {
    return Array.from(this.members);
  }

  [Symbol.iterator]() {
    const team = this.get()
    const last = team.length;
    let current = 0;
    return {
      next() {
        if ( current < last ) {
          const value = team[current];
          current += 1;
          return { done: false, value: value, };
        } else {
          return { done: true, };
        }
      },
    };
  }
}

// Команда
function generateCharacters(type, minLevel, maxLevel) {
  let allowedTeam = new Team()
  if (type === 'player') {
    for (let level = minLevel; level < maxLevel + 1; level += 1) {
      allowedTeam.add(new Bowerman(level));
      allowedTeam.add(new Swordsman(level));
      allowedTeam.add(new Magician(level));
    }
  } else if (type === 'computer') {
    for (let level = minLevel; level < maxLevel + 1; level += 1) {
      allowedTeam.add(new Daemon(level));
      allowedTeam.add(new Undead(level));
      allowedTeam.add(new Zombie(level));
    }
  }
  return allowedTeam.get();
}

const playerTeamAllowed = generateCharacters('player', 1, 4);
const computerTeamAllowed = generateCharacters('computer', 1, 4);

// Позиции команд 
function generateAllowedPositions(type, boardSize) {
  let allowedPositions = [];
  let boarSizeSquare = boardSize ** 2;
  if (type === 'player') {
    for (let position = 0; position < boarSizeSquare; position += boardSize) {
      allowedPositions.push(position);
      allowedPositions.push(position + 1);
    }
  } else if (type === 'computer') {
    for (let position = 0; position < boarSizeSquare - 7; position += boardSize) {
      allowedPositions.push(position + boardSize - 1);
      allowedPositions.push(position + boardSize - 2);
    }
  }
  return allowedPositions;
}

const playerAllowedPositions = generateAllowedPositions('player', (new GamePlay()).boardSize);
const computerAllowedPositions = generateAllowedPositions('computer', (new GamePlay()).boardSize);

export { playerTeamAllowed, computerTeamAllowed, playerAllowedPositions, computerAllowedPositions };