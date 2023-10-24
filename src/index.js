import { Manager } from './lib/Manager';
import { trackWASD } from './util';
import './css/main.css';

// Create a new game manager and setup a new game
const manager = new Manager(document.querySelector('canvas#main').getContext('2d'));
manager.setup({
  level: 1
});

// Add resize event listeners
const onResize = () => manager.onResize(window.innerWidth, window.innerHeight);
window.addEventListener('resize', onResize);
onResize();

// Add game control listeners
manager.createKeyboardMouseControls();

// Run the game loop
manager.loop();

// Track WASD for UI
trackWASD();