import { playerTeamAllowed, computerTeamAllowed, playerAllowedPositions, computerAllowedPositions } from './Team';
import { generateTeam, generateTeamPositions, getRandomNumber } from './generators';
import GameState from "./GameState";
import GamePlay from "./GamePlay";

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.previousCharacterIndex = Number();
    this.arrayOfPossiblePositions = Array();
    this.arrayOfPossibleAttackes = Array();
    this.playerScore = Number();

   
    this.getCharacterInfo();
    this.closeCharacterInfo();
    this.chooseCharacter();
    this.getNewGame();
    this.saveGame();
    this.loadGame();
  }


  init(newGame) {

    //Блок сейва
    let savedGame = this.stateService.load();
    if (savedGame !== null && newGame === false) {
      
      this.currentLevel = savedGame.currentLevel;
      this.drawUIWithLevels();

      // команды
      this.playerTeam = savedGame.playerTeam;
      this.computerTeam = savedGame.computerTeam;

      this.generalTeam = Array();
      Array.prototype.push.apply(this.generalTeam, this.playerTeam);
      Array.prototype.push.apply(this.generalTeam, this.computerTeam);
      this.currentGamer = GameState.setCurrentGamer(savedGame.currentGamer);
      this.gamePlay.redrawPositions(this.generalTeam);
    } else {
    
      this.currentLevel = 1;
      this.drawUIWithLevels();

      // команды
      this.playerTeam = Array();
      this.computerTeam = Array();
      this.generalTeam = Array();
      this.currentGamer = GameState.setCurrentGamer('player');

      // Отрисовка команд на начальных позициях
      this.playerTeam = generateTeamPositions(
        generateTeam(playerTeamAllowed, 1, 2), playerAllowedPositions);

      this.computerTeam = generateTeamPositions(
        generateTeam(computerTeamAllowed, 1, 2), computerAllowedPositions);

      Array.prototype.push.apply(this.generalTeam, this.playerTeam);
      Array.prototype.push.apply(this.generalTeam, this.computerTeam);
      this.gamePlay.redrawPositions(this.generalTeam);
    }
  }

  savePlayerScore() {
    let score = Number();
    for (let position of this.playerTeam) {
      score += position.character.health;
    }
    this.playerScore = this.playerScore + score;
  }

  generateNewLevel(playerCharacterCount, playerCharacterLevel, computerCharacterLevel) {
    
    this.savePlayerScore();
    this.currentLevel += 1;
    this.drawUIWithLevels();
    this.currentGamer = GameState.setCurrentGamer('player');
    let teamArray = Array();
    for (let character of this.playerTeam) {
      character.character.levelUp();
      teamArray.push(character.character);
    }
    Array.prototype.push.apply(teamArray, generateTeam(playerTeamAllowed, playerCharacterLevel, playerCharacterCount))
    this.playerTeam = generateTeamPositions(teamArray, playerAllowedPositions);

  
    this.computerTeam = generateTeamPositions(
      generateTeam(computerTeamAllowed, computerCharacterLevel, this.playerTeam.length), computerAllowedPositions);

  
    this.generalTeam = Array();
    Array.prototype.push.apply(this.generalTeam, this.playerTeam);
    Array.prototype.push.apply(this.generalTeam, this.computerTeam);
    this.gamePlay.redrawPositions(this.generalTeam);
  }

  generateNewGameLevel() {
    //Проигрыш
    if (this.playerTeam.length === 0) {
      this.init(true)
    } else if (this.computerTeam.length === 0) {

      // Победа
      if (this.currentLevel >= 4) {
        this.currentGamer = GameState.setCurrentGamer('computer');

      } else {

        // переход с 1-го уровня на 2-й
        if (this.currentLevel === 1) {
          this.generateNewLevel(1, 1, 2);

        // переход со 2-го уровня на 3-й
        } else if (this.currentLevel === 2) {
          this.generateNewLevel(2, 2, 3);

          // переход со 3-го уровня на 4-й
        } else if (this.currentLevel === 3) {
          this.generateNewLevel(2, 3, 4);
        }
      }
    }
  }

  
  drawUIWithLevels() {
    this.currentLevel === 1 ? this.gamePlay.drawUi('prairie')
      : this.currentLevel === 2 ? this.gamePlay.drawUi('desert')
      : this.currentLevel === 3 ? this.gamePlay.drawUi('arctic')
      : this.gamePlay.drawUi('mountain');
  }

 
  clearAttackParams() {
    this.arrayOfPossiblePositions = Array();
    this.arrayOfPossibleAttackes = Array();
  }

  // расчет урона 
  getDamage(attackIndex, defenceIndex) {
    let attack = Number();
    let defence = Number();
    for (const position of this.generalTeam) {
      position.position === attackIndex ? attack = position.character.attack
        : position.position === defenceIndex ? defence = position.character.defence : false;
    }
    return (attack > 0 && defence > 0) ? Math.max(attack - defence, attack * 0.9) : false;
  }

  
  getAttackParams(index, character, type) {
    let attackParams = Number();
    if (type === 'position') {
      attackParams = character.motionDistance;
    } else if (type === 'attack') {
      attackParams = character.attackDistance;
    } else { throw new Error("type should be: position, attack...") }


    if (index >= 0 && character && attackParams) {
      let attackParamsArray = Array();
      for (let val = 1; val <= attackParams; val += 1) {
        // верхняя линия
        if (index > (this.gamePlay.boardSize - 1)) {
          let topPossiblePositionIndex = index - this.gamePlay.boardSize * val;
          let topPosition = this.checkCharaterExistence(undefined, topPossiblePositionIndex, type);
          if (topPosition >= 0) { 
            attackParamsArray.push(topPosition) 
          }
        }

        // верхняя-правая диагональ
        if (index > (this.gamePlay.boardSize - 1) && ((index + 1) % this.gamePlay.boardSize) !== 0) {
          let topRightPossiblePositionIndex = index - this.gamePlay.boardSize * val + val;
          let topRightPosition = this.checkCharaterExistence(undefined, topRightPossiblePositionIndex, type);
          if (topRightPosition >= 0 && (topRightPosition % this.gamePlay.boardSize !== 0)) { 
            attackParamsArray.push(topRightPosition) 
          }
        }

        // правая линия
        if ((index + 1) % this.gamePlay.boardSize !== 0) {
          let rightPossiblePositionIndex = index + val;
          let rightPosition = this.checkCharaterExistence(undefined, rightPossiblePositionIndex, type);
          if (rightPosition >= 0 && (rightPosition % this.gamePlay.boardSize !== 0)) { 
            attackParamsArray.push(rightPosition) 
          }
        }

        // правая-нижняя диагональ
        if (index < (this.gamePlay.boardSize ** 2 - this.gamePlay.boardSize - 1)
          && ((index + 1) % this.gamePlay.boardSize) !== 0) {
          let bottomRightPossiblePositionIndex = index + this.gamePlay.boardSize * val + val;
          let bottomRightPosition = this.checkCharaterExistence(undefined, bottomRightPossiblePositionIndex, type);
          if (bottomRightPosition >= 0 && (bottomRightPosition % this.gamePlay.boardSize !== 0)) { 
            attackParamsArray.push(bottomRightPosition) 
          }
        }

        // нижняя
        if (index < (this.gamePlay.boardSize ** 2 - this.gamePlay.boardSize - 1)) {
          let bottomPossiblePositionIndex = index + this.gamePlay.boardSize * val;
          let bottomPosition = this.checkCharaterExistence(undefined, bottomPossiblePositionIndex, type);
          if (bottomPosition >= 0) { 
            attackParamsArray.push(bottomPosition) 
          }
        }

        // нижняя-левая диагональ
        if (index < (this.gamePlay.boardSize ** 2 - this.gamePlay.boardSize - 1)
          && (index % this.gamePlay.boardSize) !== 0) {
          let bottomLeftPossiblePositionIndex = index + this.gamePlay.boardSize * val - val;
          let bottomLeftPosition = this.checkCharaterExistence(undefined, bottomLeftPossiblePositionIndex, type);
          if (bottomLeftPosition >= 0 && ((bottomLeftPosition + 1) % this.gamePlay.boardSize !== 0)) { 
            attackParamsArray.push(bottomLeftPosition) 
          }
        }

        // левая линия
        if (index % this.gamePlay.boardSize !== 0) {
          let leftPossiblePositionIndex = index - val;
          let leftPosition = this.checkCharaterExistence(undefined, leftPossiblePositionIndex, type);
          if (leftPosition >= 0 && ((leftPosition + 1) % this.gamePlay.boardSize !== 0)) { 
            attackParamsArray.push(leftPosition) 
          }
        }

        // левая-верхняя диагональ
        if (index > (this.gamePlay.boardSize - 1) && (index % this.gamePlay.boardSize) !== 0) {
          let topLeftPossiblePositionIndex = index - this.gamePlay.boardSize * val - val;
          let topLeftPosition = this.checkCharaterExistence(undefined, topLeftPossiblePositionIndex, type);
          if (topLeftPosition >= 0 && topLeftPosition >= 0 && ((topLeftPosition + 1) % this.gamePlay.boardSize !== 0)) { 
            attackParamsArray.push(topLeftPosition) 
          }
        }
      }
      return attackParamsArray;
    }
  }

  
  async attackTools(character, damage) {

    function deleteCharacterFromTeam(index, team) {
      let val = 0;
      while (val < team.length) {
        if (team[val].position === index) {
          team.splice(val, 1);
        } else {
          val += 1;
        }
      }
      return team;
    }

    // нанесение урона 
    await this.gamePlay.showDamage(character, damage).then((damaged) => {
      for (let position of this.generalTeam) {
        if (position.position === character) {
          position.character.health = position.character.health - damage;

          
          if (position.character.health <= 0) {
            this.generalTeam = deleteCharacterFromTeam(position.position, this.generalTeam);
            this.playerTeam = deleteCharacterFromTeam(position.position, this.playerTeam);
            this.computerTeam = deleteCharacterFromTeam(position.position, this.computerTeam);
          }
        }
      }
      return damaged;
    });
  }

  // Логика компа
  async computerActions() {
    let computerPosition = Object();
    if (this.currentGamer === 'computer' && this.computerTeam.length > 0) {
      if (this.computerTeam.length === 1) {
        computerPosition = this.computerTeam[0];
      } else {
        computerPosition = this.computerTeam[getRandomNumber(0, (this.computerTeam.length - 1))];
      }
      for (let position of this.generalTeam) {
        if (position === computerPosition) { 
          computerPosition = position 
        }
      }

      
      this.arrayOfPossiblePositions =
        this.getAttackParams(computerPosition.position, computerPosition.character, 'position');
      this.arrayOfPossibleAttackes =
        this.getAttackParams(computerPosition.position, computerPosition.character, 'attack');

      
      if (this.arrayOfPossibleAttackes.length > 0) {
        let index = this.arrayOfPossibleAttackes[getRandomNumber(0, (this.arrayOfPossibleAttackes.length - 1))];
        let damage = this.getDamage(computerPosition.position, index);
        await this.attackTools(index, damage);

    
      } else {

        let motion = this.gamePlay.boardSize ** 2 - 1;
        for (let position of this.playerTeam) {
          for (let index of this.arrayOfPossiblePositions) {
            if (index + 1 % this.gamePlay.boardSize ** 2 === 0 || index + 2 % this.gamePlay.boardSize ** 2 === 0) {
              if (Math.abs(position.position - index) > Math.abs(position.position - motion)) {
                motion = index;
              }
            } else {
              if (Math.abs(position.position - index) < Math.abs(position.position - motion)) {
                motion = index;
              }
            }
          }
        }
        
        computerPosition.position = motion;
      }

      this.currentGamer = GameState.getNextGamer(this.currentGamer);
      this.gamePlay.redrawPositions(this.generalTeam);
      this.clearAttackParams();

      this.generateNewGameLevel();
    }
  }

  
  isIndexOnCharacterPosition(index, team) {
    for (let position of team) if (position.position === index) { return true }
    return false;
  }


  checkCharaterExistence(event = undefined, possiblePositionIndex = undefined, type = undefined, ) {
    
    if (type) {
      let possiblePositionIndexCell = this.gamePlay.cells[possiblePositionIndex];
      if (possiblePositionIndexCell) {
        if (type === 'position') {
          if (!((possiblePositionIndexCell.firstChild && possiblePositionIndexCell.firstChild.classList.contains('character'))
            || possiblePositionIndex > this.gamePlay.boardSize ** 2
            || possiblePositionIndex < 0)
          ) {
            return possiblePositionIndex;
          }
  
        } else if (type === 'attack') {
          if (this.currentGamer === 'player') {
            if (this.isIndexOnCharacterPosition(possiblePositionIndex, this.computerTeam) && possiblePositionIndex < this.gamePlay.boardSize ** 2
              && possiblePositionIndex >= 0) {
              return possiblePositionIndex;
            }
          } else {
            if (
              this.isIndexOnCharacterPosition(possiblePositionIndex, this.playerTeam) && possiblePositionIndex < this.gamePlay.boardSize ** 2
              && possiblePositionIndex >= 0) {
              return possiblePositionIndex;
            }
          }
        }
      }

    // проверка наличия персонажа в ячейке по событию
    } else {
      return (event.toElement.firstChild && event.toElement.firstChild.classList.contains('character')) || (event.toElement && event.toElement.classList.contains('character'));
    }
  }

  checkPlayersCharacter(index, calculateDistance = 'no') {
    let cellClassList = this.gamePlay.cells[index].children[0].classList;
    for (let character of this.playerTeam) {
      let cellClassListContainCharacter = cellClassList.contains(character.character.type);
      if (cellClassListContainCharacter) {
        if (calculateDistance === 'no') {
          return true;
        } else if (calculateDistance === 'yes') {
          this.arrayOfPossiblePositions = this.getAttackParams(index, character.character, 'position');
          this.arrayOfPossibleAttackes = this.getAttackParams(index, character.character, 'attack');
          return true;
        }
      }
    }
    return false;
  }

  
  chooseCharacter() {
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  async onCellClick(index) {

   
    if (this.checkCharaterExistence(event)) {

     
      if (this.checkPlayersCharacter(index, 'yes') && this.currentGamer === 'player') {
        this.gamePlay.deselectCell(this.previousCharacterIndex);
        this.gamePlay.selectCell(index);
        this.previousCharacterIndex = index;

      } else if (this.arrayOfPossibleAttackes.includes(index) && this.currentGamer === 'player') {
        let damage = this.getDamage(this.previousCharacterIndex, index);
        this.gamePlay.deselectCell(this.previousCharacterIndex);
        this.previousCharacterIndex = index;

       
        await this.attackTools(index, damage);
        this.currentGamer = GameState.getNextGamer(this.currentGamer);
        this.gamePlay.redrawPositions(this.generalTeam);
        this.clearAttackParams();

  
        await this.computerActions();

        this.generateNewGameLevel();

      } else {
        if (this.computerTeam === 0) {
          
          GamePlay.showMessage('You win');
        } else {
          
          GamePlay.showError('Computer character');
        }
      }
    } else if (this.arrayOfPossiblePositions.includes(index)) {

      
      for (let position of this.generalTeam) {
        if (position.position === this.previousCharacterIndex) {
          position.position = index;
          this.currentGamer = GameState.getNextGamer(this.currentGamer);
          this.gamePlay.deselectCell(this.previousCharacterIndex);

      
          this.gamePlay.redrawPositions(this.generalTeam);
          this.clearAttackParams();

          
          await this.computerActions();
        }
      }
    }
  }

 
  getCharacterInfo() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
  }

  setCharacterInfoTemplate(level, attack, defence, health) {
    return `🎖${level}⚔${attack}🛡${defence}❤${health}`
  }

  onCellEnter(index) {
    if (this.checkCharaterExistence(event)) {

      // описание персонажа
      for (let character of this.generalTeam) {
        if (character.position === index) {
          this.gamePlay.showCellTooltip(
            this.setCharacterInfoTemplate(character.character.level, character.character.attack, character.character.defence, character.character.health,),index)
        }
      }

      // Логика курсора
      if (this.checkPlayersCharacter(index, 'no')) {
        this.gamePlay.setCursor('pointer');
      } else {
        if (this.arrayOfPossibleAttackes.includes(index)) {
          this.gamePlay.setCursor('crosshair');
          this.gamePlay.selectCell(index, 'red');
        } else {
          this.gamePlay.setCursor('not-allowed');
        }
      }

    } else if (this.arrayOfPossiblePositions.includes(index)) {
      this.gamePlay.setCursor('pointer');
      this.gamePlay.selectCell(index, 'green');

   
    } else {
      this.gamePlay.setCursor('auto');
    }
  }

  closeCharacterInfo() {
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
    if (this.gamePlay.cells[index].classList.contains('selected-green')) {
      this.gamePlay.deselectCell(index);
    }
    if (this.gamePlay.cells[index].classList.contains('selected-red')) {
      this.gamePlay.deselectCell(index);
    }
  }

  
  getNewGame() {
    this.gamePlay.addNewGameListener(this.onNewGame.bind(this));
  }

  onNewGame() {
    this.init(true);
  }

  
  saveGame() {
    this.gamePlay.addSaveGameListener(this.onSaveGame.bind(this));
  }

  onSaveGame() {
    this.stateService.save(
    {
      'currentLevel': this.currentLevel,
      'playerScore': this.playerScore,
      'playerTeam': this.playerTeam,
      'computerTeam': this.computerTeam,
      'currentGamer': this.currentGamer,
    }
    );
  }

 
  loadGame() {
    this.gamePlay.addLoadGameListener(this.onLoadGame.bind(this));
  }

  onLoadGame() {
    this.init(false);
  }
}