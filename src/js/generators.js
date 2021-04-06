/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */

import PositionedCharacter from "./PositionedCharacter";

// генератор персонажей
export function* characterGenerator(allowedTypes, maxLevel) {
  let min = 0;
  let max = allowedTypes.length;
  let finished = false;
  while (finished === false) {
    let randomNumber = getRandomNumber(min, max);
    if ( allowedTypes[randomNumber].level <= maxLevel ) {
      finished = true;
      yield allowedTypes[randomNumber];
    }
  }
}

// генератор команды
export function generateTeam(allowedTypes, maxLevel, characterCount) {
  let characterCurrentCount = 0;
  let teamArray = [];

  function clone(obj) {
    if (null == obj || "object" != typeof obj) { return obj }
    let copy = obj.constructor();
    for (let attr in obj) { if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr] }
    return copy;
  }

  while ( characterCurrentCount < characterCount ) {
    let character = characterGenerator(allowedTypes, maxLevel).next().value;
    if (!teamArray.includes(character)) {
      teamArray.push(clone(character));
      characterCurrentCount += 1;
    }
  }
  return teamArray;
}


export function getRandomNumber(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}


export function generateTeamPositions(team, allowedPositions) {
  let positionedTeam = [];
  let usedPositions = [];
  let min = 0;
  let max = allowedPositions.length;

  
  for (let hero of team) {
    let finished = false;
    while (finished === false) {
      let randomNumber = getRandomNumber(min, max);
      if (!usedPositions.includes(randomNumber)) {
        positionedTeam.push(new PositionedCharacter(hero, allowedPositions[randomNumber]));
        usedPositions.push(randomNumber);
        finished = true;
      }
    }
  }
  return positionedTeam;
}