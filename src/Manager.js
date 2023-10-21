import { BulletFactory } from './lib/Bullet/BulletFactory';
import { Enemy } from './lib/Enemy';
import { Player } from './lib/Player';
import { LevelManager } from './lib/Scene/Levels/LevelManager';
import { Map } from './lib/Scene/Map';
import { Wall } from './lib/Wall';

export class Manager
{
  constructor() {
    this.player = null;
    this.entities = [];
    this.walls = [];
    this.enemies = [];

    this.selectedWeaponIndex = 0;
    this.bulletFactory = new BulletFactory();
    
    this.map = new Map();
  }

  run(tick) {
    requestAnimationFrame(tick);
  }

  setup() {
    this.generateMap(0)
      .createPlayer()
      .createEnemies()
      .createWalls();
  }

  onUpdate(context, camera, keyboard, mouse) {
    camera.update(this.player, this.entities);
    this.bulletFactory.update(context, this.player, this.walls, mouse, this.selectedWeaponIndex);
    for (let i = 0; i < this.entities.length; i++) {
      if (typeof this.entities[i] !== undefined
        && typeof this.entities[i].update === 'function') {
        this.entities[i].update(
          context,
          this.player,
          this.enemies,
          this.walls,
          this.bulletFactory,
          camera,
          keyboard,
          mouse
        );
      }
    }

    document.querySelector('strong#enemies-remaining')
      .innerHTML = this.enemies.length;
    
      if (this.enemies.length === 0) {
        setTimeout(() => {
          document.querySelector('.game-ended-wrapper')
            .style.display = 'flex';
        }, 1000);
      }
  }

  onRender(context, camera) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    camera.preRender(this.player);
    this.bulletFactory.render();
    for (let i = 0; i < this.entities.length; i++) {
      this.entities[i].render(context);
    }
    camera.postRender();
  }

  onResize(context, camera, width, height) {
    context.canvas.width = width;
    context.canvas.height = height;
    camera.resize();
  }

  generateMap(levelIndex = 0) {
    this.map.generate(levelIndex);
    return this;
  }

  createPlayer() {
    this.player = new Player(
      this.map.getPlayerPosition(),
      document.querySelector('.game-ended-wrapper'),
      LevelManager
    );

    this.entities.push(this.player);

    return this;
  }

  createEnemies() {
    for (let i = 0; i < this.map.getEnemyPositions().length; i++) {
      const enemy = new Enemy(
        this.map.getEnemyPositions()[i]
      );

      console.log({ enemy });

      this.entities.push(enemy);
      this.enemies.push(enemy);
    }

    return this;
  }

  createWalls() {
    for (let i = 0; i < this.map.getWallPositions().length; i++) {
      const wallPosition = this.map.getWallPositions()[i];
      const wall = new Wall(wallPosition.x, wallPosition.y);
      
      this.entities.push(wall);
      this.walls.push(wall);
    }

    return this;
  }

  createKeyboardMouseControls(keyboard, mouse) {
    document.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'w': keyboard.up = true; break;
        case 's': keyboard.down = true; break;
        case 'a': keyboard.left = true; break;
        case 'd': keyboard.right = true; break;
        case '1': this.selectedWeaponIndex = 0; break;
        case '2': this.selectedWeaponIndex = 1; break;
        case '3': this.selectedWeaponIndex = 2; break;
        case '4': this.selectedWeaponIndex = 3; break;
      }
    });
    
    document.addEventListener('keyup', (event) => {
      switch (event.key) {
        case 'w': keyboard.up = false; break;
        case 's': keyboard.down = false; break;
        case 'a': keyboard.left = false; break;
        case 'd': keyboard.right = false; break;
      }
    });
    
    document.addEventListener('mousemove', (event) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    });
    
    document.addEventListener('mousedown', (event) => {
      mouse.pressed = true;
    });
    
    document.addEventListener('mouseup', (event) => {
      mouse.pressed = false;
    });
  }
}