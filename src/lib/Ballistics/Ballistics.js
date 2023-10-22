import { AudioHandler } from './AudioHandler';
import { Bullet } from './Bullet';
import { mappings } from './mappings';

export class Ballistics
{
  constructor () {
    this.weapon = null;
    this.automatic = true;
    this.frames = 0;
    this.bullets = [];
    this.indexesToDelete = [];
  }

  update (game) {
    this.weapon = mappings[game.selectedWeaponIndex];
    this.setEquippedWeaponDisplayInformation();

    if (this.weapon && this.automatic && ! game.player.dead) {
      document.querySelector('#out-of-ammo').style.display = 'none';
      if (game.mouse.pressed) {
        this.handleFire(game.context, game.player);
      }
    } else {
      this.frames++;
      if (this.frames >= 60) {
        this.frames = 0;
        this.automatic = true;
      }
    }

    this.cleanupBullets(game.walls);
  }

  render () {
    for (let i = 0; i < this.bullets.length; i++) {
      this.bullets[i].render(this.weapon.bulletColor);
    }
  }

  handleFire (context, player) {
    --this.weapon.clip;
    if (this.shouldReloadWeaponAmmoClip()) {
      return;
    }

    AudioHandler.play({
      equippedWeapon: this.weapon
    }, 'fire', 1.5);

    this.registerBullets(context, player);
    this.automatic = this.weapon.automatic;

    if ( ! this.automatic) {
      setTimeout(() => {
        AudioHandler.play({
          equippedWeapon: this.weapon
        }, 'reload');
      }, 900);
    }
  }

  setEquippedWeaponDisplayInformation () {
    const { name, clip, capacity, magazines, magazinesTotal } = this.weapon;
    document.querySelector('#equipped-weapon').innerHTML = name;
    document.querySelector('#ammo-remaining').innerHTML = clip;
    document.querySelector('#ammo-capacity').innerHTML = capacity;
    document.querySelector('#magazines-remaining').innerHTML = magazines;
    document.querySelector('#magazines-total').innerHTML = magazinesTotal;
  }

  shouldReloadWeaponAmmoClip () {
    if (this.weapon.clip <= 0) {
      if (this.weapon.magazines > 0) {
        --this.weapon.magazines;
        this.weapon.clip = this.weapon.capacity;
      } else {
        this.weapon.clip = 0;
        document.querySelector('#out-of-ammo').style.display = 'inline';

        return true;
      }
    }

    return false;
  }

  registerBullets (context, player) {
    const { spread } = this.weapon;
    for (let i = spread.min; i <= spread.max; i++) {
      const bullet = new Bullet(context, player, i);
      this.bullets.push(bullet);
    }
  }

  cleanupBullets (walls) {
    this.indexesToDelete = [];
    for (let i = 0; i < this.bullets.length; i++) {
      this.bullets[i].update(walls);
      if (this.bullets[i].markToDelete) {
        this.indexesToDelete.push(i);
      }
    }

    for (let i = 0; i < this.indexesToDelete.length; i++) {
      this.bullets.splice(this.indexesToDelete[i], 1);
    }
  }
}