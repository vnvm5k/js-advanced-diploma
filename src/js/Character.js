export default class Character {

  constructor(name, level, type = 'generic', attack, defence, attackDistance, motionDistance) {
    const heroes = [
      'Bowerman',  
      'Swordsman',  
      'Magician',   
      'Daemon',     
      'Undead',     
      'Zombie',     
    ]

    this.health = 100;
    this.level = level;
    this.attack = attack;
    this.defence = defence;
    this.attackDistance = attackDistance;
    this.motionDistance = motionDistance;

    if ( new.target.name === 'Character' ) { throw new Error("You can't create class Character") }
  }

  levelUp() {
    if (this.health > 0) {
      if (this.level < 4) { 
        this.level += 1; 
      }
      this.attack = Math.max(this.attack, this.attack * (1.8 - this.health) / 100);
      this.defence = Math.max(this.defence, this.defence * (1.8 - this.health) / 100);
      if (this.health < 20) { 
        this.health += 80 
      } else { 
        this.health = 100 
      }
    } else {
      throw new Error("Персонаж мертв")
    }
  }
}


export class Bowerman extends Character {
  constructor(level) {
    super('Bowerman', level, 'Bowerman', 25, 25, 2, 2);
  }
}

export class Swordsman extends Character {
  constructor(level) {
    super('Swordsman', level, 'Swordsman', 40, 10, 1, 4);
  }
}


export class Magician extends Character{
  constructor(level) {
    super('Magician', level, 'Magician', 10, 40, 4, 1);
  }
}


export class Daemon extends Character{
  constructor(level) {
    super('Daemon', level, 'Daemon', 10, 40, 4, 1);
  }
}


export class Undead extends Character{
  constructor(level) {
    super('Undead', level, 'Undead', 25, 25, 1, 4);
  }
}


export class Zombie extends Character{
  constructor(level) {
    super('Zombie', level, 'Zombie', 40, 10, 2, 2);
  }
}