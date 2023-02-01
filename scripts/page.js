// ===================== Fall 2022 EECS 493 Assignment 3 =====================
// This starter code provides a structure and helper functions for implementing
// the game functionality. It is a suggestion meant to help you, and you are not
// required to use all parts of it. You can (and should) add additional functions
// as needed or change existing functions.

// ==================================================
// ============ Page Scoped Globals Here ============
// ==================================================

// Div Handlers
let game_window;
let game_screen;
let onScreenAsteroid;
let settings;
let main_menu;
let tutorial;
let get_ready;
let game_over;

let easy_btn;
let norm_btn;
let hard_btn;

let menu_btns;
let setting_btns;

let player;

let score;

let spawnAsteroidsID;
let scoreID;
let spawnShieldID;
let checkAsteroidID;
let checkShieldID;
let movePlayerID;
let spawnPortalID;
let checkPortalID;

let onScreenPortal;
let onScreenShield;

let portal;
let shield;

let level;
let danger;
let difficulty;

let volume;

// Difficulty Helpers
let astProjectileSpeed = 3;          // easy: 1, norm: 3, hard: 5

// Game Object Helpers
let currentAsteroid = 1;
let AST_OBJECT_REFRESH_RATE = 15;
let spawn_rate = 800;

var PLAYER_MOVEMENT = 3;   // px
var PLAYER_SPEED = 90; // in px

var maxPlayerPosX; 
var maxPlayerPosY; 



// Movement Helpers
var LEFT = false;
var RIGHT = false;
var UP = false;
var DOWN = false;
var touched = false;

var isFirstTime = true;
var isShielded = false;

var collect = new Audio('src/audio/collect.mp3');
var die = new Audio('src/audio/die.mp3');
var pew = new Audio('src/audio/pew.mp3');

// ==============================================
// ============ Functional Code Here ============
// ==============================================

// Main
$(document).ready(function () {
  // ====== Startup ====== 
  game_window = $('.game-window');
  main_menu = $("#main_menu");
  menu_btns = $('#buttons');

  player = $('#player');
  maxPlayerPosX = game_window.width() - player.width();
  console.log(game_window.width() - player.width());
  maxPlayerPosY = game_window.height() - player.height();
  player.remove();


  // initialize different screens & windows and remove them from the DOM 
  game_over = $('#game_over');
  game_over.remove();

  get_ready = $('#get_ready');
  get_ready.remove();

  game_screen = $("#actual_game");
  game_screen.remove();

  tutorial = $("#tutorial_menu");
  tutorial.remove();

  set = $("#settings_menu");
  difficulty = 3;
  setting_btns = $('#set-buttons');
  $('#normal-outer').css("visibility","visible");
  set.remove();

  onScreenAsteroid = $('.curAstroid');
  onScreenPortal = $('.curPortal');
  onScreenShield = $('.curShield');

  volume = 0.5;
  adjustVolumes();

  // prevent the browser from scrolling with the arrow keys
  window.addEventListener("keydown", function(e) {
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);

  setListeners(); 

});

// TODO: ADD YOUR FUNCTIONS HERE

// // Keydown event handler
document.onkeydown = function (e) {
  if (e.key == 'ArrowLeft'){ LEFT = true;}
  if (e.key == 'ArrowRight') {RIGHT = true;}
  if (e.key == 'ArrowUp') {UP = true;}
  if (e.key == 'ArrowDown') {DOWN = true;}

  movePlayerID = setInterval(function(){
    if(LEFT || RIGHT || UP || DOWN){
      console.log("arrow pressed")
      moveSpaceShip();
    } 
  }, PLAYER_SPEED)
}

// Keyup event handler
document.onkeyup = function (e) {
  if (e.key == 'ArrowLeft') LEFT = false;
  if (e.key == 'ArrowRight') RIGHT = false;
  if (e.key == 'ArrowUp') UP = false;
  if (e.key == 'ArrowDown') DOWN = false;

  if(!LEFT || !RIGHT || !UP || !DOWN){
    console.log("arrow released");
    clearInterval(movePlayerID);
  }
}

// set all the button listeners
function setListeners(){
  $('body').on('click','#easy',function(){
    console.log("easy clicked");
    changeDiff(1);
  })

  $('body').on('click','#normal',function(){
    console.log("normal clicked");
    changeDiff(3);
  })

  $('body').on('click','#hard',function(){
    console.log("hard clicked");
    changeDiff(5);
  })

  $('body').on('click','#play',function(){
    console.log("play clicked");
    playGame();
  })

  $('body').on('click','#open-settings',function(){
    console.log("open settings clicked");
    openSettings();
  })

  $('body').on('click','#close',function(){
    console.log("close settings clicked");
    closeSettings();
  })

  $('body').on('click','#tut-start',function(){
    console.log("starting game from tutorial page");
    openGame();
  })

  $('body').on('click','#game-over-btn',function(){
    console.log("returning to main from game over");
    returnToMain();
  })
}

// function for settings btn in landing page
function openSettings(){
  console.log("open settings pressed");
  console.log("astProjectileSpeed: " + astProjectileSpeed);
  game_window.append(set);
  set.css("visibility","visible");  
  setting_btns.css("visibility","visible"); 

  var slider = document.getElementById("myRange");
  var output = document.getElementById("val");
  output.innerHTML = slider.value;
  
  slider.oninput = function() {
    output.innerHTML = this.value;
    volume = this.value / 100;
    adjustVolumes();
  }
}

function adjustVolumes(){
  pew.volume = volume;
  collect.volume = volume;
  die.volume = volume;
}
// function for close btn in settings menu
function closeSettings(){
  console.log("close settings pressed");
  set.remove();
}

// play game from landing page
function playGame(){
  if(isFirstTime){   // if first time playing, open tutorial window
    console.log("Play game pressed");
    main_menu.remove();
    game_window.append(tutorial);
    tutorial.css("visibility","visible");
    isFirstTime = false;
  }
  else{ // otherwise, go straight to the game
    menu_btns.remove();
    main_menu.remove();
    openGame();
  }
}

// start game
function openGame(){
  
  console.log("start game pressed");
  tutorial.remove();

 // open "Get Ready!" window
  game_window.append(get_ready);
  get_ready.css("visibility","visible");

  game_window.append(game_screen);
  game_screen.css("visibility","visible");


  // set intial level, score and difficulty values
  level = 1;
  score = 0;

  switch(difficulty){
    case 1:
      astProjectileSpeed = 1;
      danger = 10;
      break;
    case 3:
      astProjectileSpeed = 3;
      danger = 20;
      break;
    case 5:
      astProjectileSpeed = 5;
      danger = 30;
      break;
    default:
      break;
  }

  // display values to screen
  $('#score_num').html(score);
  $('#danger_num').html(danger);
  $('#level_num').html(level);

  // wait 3 seconds before removing "Get Ready!" window
  setTimeout(function(){
    get_ready.remove();
    startGame();
  }, 3000);

}

function startGame(){
  console.log("starting game");

  // set location of player on the sceen
  game_window.append(player);
  player.css("visibility","visible");
  player.css("top","300px");
  player.css("left","600px");

  
  onScreenAsteroid = $('.curAstroid');
  onScreenPortal = $('.curPortal');
  onScreenShield = $('.curShield')


  spawnAsteroidsID = setInterval(spawn,spawn_rate);

  scoreID = setInterval(function(){
    score += 40;
    $('#score_num').html(score);
  },500);

  checkShieldID = setInterval(
    checkShieldCollision
  ,10);

  checkPortalID = setInterval(
    checkPortalCollision,10);

  checkAsteroidID = setInterval(
    checkAsteroidCollision,70
  );
  
  spawnShieldID = setInterval(function(){
    if(!isShielded){
      spawnShield();
    }
  },15000);


  spawnPortalID = setInterval(function(){
    spawnPortal();
  },20000)

}

function endGame(){

  // stop all interval timers
  clearInterval(spawnAsteroidsID);
  clearInterval(checkShieldID);
  clearInterval(spawnShieldID);
  clearInterval(checkPortalID);
  clearInterval(spawnPortalID);

  game_screen.remove();
  player.remove();

  // remove all objects on the gamescreen
  onScreenAsteroid.empty();
  onScreenPortal.empty();
  onScreenShield.empty();

  game_window.append(game_over);
  game_over.css("visibility","visible");
  game_window.append(main_menu);
  $('#final_score').empty();
  $('#final_score').append(score);

  menu_btns.remove();

}

function returnToMain(){
  game_over.css("visibility","collapse");
  game_over.remove();
  game_window.append(menu_btns);
}

function changeDiff(diff){
  let easy_outer = $('#easy-outer');
  let norm_outer = $('#normal-outer');
  let hard_outer = $('#hard-outer');
  switch(diff){
    case 1:
      easy_outer.css('visibility','visible');
      norm_outer.css('visibility','hidden');
      hard_outer.css('visibility','hidden');
      difficulty = 1;
      spawn_rate = 1000;
      break;
    case 3:
      easy_outer.css('visibility','hidden');
      norm_outer.css('visibility','visible');
      hard_outer.css('visibility','hidden');
      difficulty = 3;
      spawn_rate = 800;
      break;
    case 5:
      easy_outer.css('visibility','hidden');
      norm_outer.css('visibility','hidden');
      hard_outer.css('visibility','visible');
      difficulty = 5;
      spawn_rate = 600;
      break;
    default:
      break;
  }
  astProjectileSpeed = difficulty;
  console.log("astProjectileSpeed: " + astProjectileSpeed);

}

function spawnPortal(){
  let x = getRandomNumber(0, 1280 - 42);
  let y = getRandomNumber(0, 720 - 42 );

  let portalString = "<img id='portal' src = 'src/port.gif'/>";
  onScreenPortal.append(portalString);
  portal = $("#portal");
  console.log("portal x: " + x + "| y: " + y);
  portal.css("top",y);
  portal.css("left",x);

  setTimeout(function(){
    onScreenPortal.empty();
  }, 5000);
  
}

function spawnShield(){
  let x = getRandomNumber(0, 1280 - 42);
  let y = getRandomNumber(0, 720 - 42);

  let shieldString = "<img id='shield' src = 'src/shield.gif'/>";
  onScreenShield.append(shieldString);
  console.log("shield x: " + x + "| y: " + y);
  shield = $('#shield');
  shield.css("top",y);
  shield.css("left",x);

  setTimeout(function(){
    onScreenShield.empty();
  },5000);
  
}

function checkPortalCollision(){
  var portalExists = onScreenPortal.is(':empty');
    if(!portalExists && isColliding(player, portal)){
      console.log("portal collision!!!!!!!!!!");
      collect.play();
      onScreenPortal.empty();
      level += 1;
      $('#level_num').html(level);
      danger += 2;
      $('#danger_num').html(danger);
      astProjectileSpeed *= 1.2;
    }
}

function checkShieldCollision(){
  var shieldExists = onScreenShield.is(':empty');
  if(!shieldExists && isColliding(player, shield)){
    console.log("shield collision!!!!!!!!!!");
    collect.play();
    onScreenShield.empty();
    player.attr("src","src/player/player_shielded.gif");
    isShielded = true;
  }
}

function checkAsteroidCollision(){
  onScreenAsteroid.find('*').each(function(){
    var ast = $(this);
    if(isColliding(ast,player)){
      console.log("asteroid collision!!!!!!!!!!");
      if(isShielded){
        pew.play();
        ast.remove();
        isShielded = false;
      }
      else{
        die.play();
        $('#dead').css("top",player.css("top"));
        $('#dead').css("left",player.css("left"));
        $('#dead').css("visibility","visible");
        player.remove();

        // stop score from increasing
        clearInterval(scoreID);

        // stop spawning asteroids
        clearInterval(spawnAsteroidsID);

        setTimeout(function(){
          $('#dead').css("visibility","hidden");
          endGame();
        },2000)
      }
    }
  })
}
function moveSpaceShip() {

  if(LEFT){
    console.log("moving left"); 
    var newPos = parseInt(player.css("left")) - PLAYER_MOVEMENT; // decrease left margin
    if (newPos < 0) {
      newPos = 0; 
    }

    if(isShielded){
      player.attr("src","src/player/player_shielded_left.gif");
    }
    else{
      player.attr("src","src/player/player_left.gif");
    }
    player.css("left", newPos); 
  }
  if(RIGHT){
    var newPos = parseInt(player.css("left")) + PLAYER_MOVEMENT; // increase left margin
    if (newPos > maxPlayerPosX) {
      newPos = maxPlayerPosX; 
    }
    if(isShielded){
      player.attr("src","src/player/player_shielded_right.gif");
    }
    else{
      player.attr("src","src/player/player_right.gif");
    }
    player.css("left", newPos); 
  }
  if(UP){
    var newPos = parseInt(player.css("top")) - PLAYER_MOVEMENT; // decrease top margin
    if (newPos < 0) {
      newPos = 0; 
    }
    if(isShielded){
      player.attr("src","src/player/player_shielded_up.gif");
    }
    else{
      player.attr("src","src/player/player_up.gif");
    }
    player.css("top", newPos); 
  }
  if(DOWN){
    console.log("moving down"); 
    var newPos = parseInt(player.css("top")) + PLAYER_MOVEMENT; // increase top margin
    if (newPos > maxPlayerPosY) {
      newPos = maxPlayerPosY; 
    }
    if(isShielded){
      player.attr("src","src/player/player_shielded_down.gif");
    }
    else{
      player.attr("src","src/player/player_down.gif");
    }
    player.css("top", newPos); 
  }
  
}

// Starter Code for randomly generating and moving an asteroid on screen
// Feel free to use and add additional methods to this class
class Asteroid {
  // constructs an Asteroid object
  constructor() {
      /*------------------------Public Member Variables------------------------*/
      // create a new Asteroid div and append it to DOM so it can be modified later
      let objectString = "<div id = 'a-" + currentAsteroid + "' class = 'curAstroid' > <img src = 'src/asteroid.png'/></div>";
      onScreenAsteroid.append(objectString);
      // select id of this Asteroid
      this.id = $('#a-' + currentAsteroid);
      currentAsteroid++; // ensure each Asteroid has its own id
      // current x, y position of this Asteroid
      this.cur_x = 0; // number of pixels from right
      this.cur_y = 0; // number of pixels from top

      /*------------------------Private Member Variables------------------------*/
      // member variables for how to move the Asteroid
      this.x_dest = 0;
      this.y_dest = 0;
      // member variables indicating when the Asteroid has reached the boarder
      this.hide_axis = 'x';
      this.hide_after = 0;
      this.sign_of_switch = 'neg';
      // spawn an Asteroid at a random location on a random side of the board
      this.#spawnAsteroid();
  }

  // Requires: called by the user
  // Modifies:
  // Effects: return true if current Asteroid has reached its destination, i.e., it should now disappear
  //          return false otherwise
  hasReachedEnd() {
      if(this.hide_axis == 'x'){
          if(this.sign_of_switch == 'pos'){
              if(this.cur_x > this.hide_after){
                  return true;
              }                    
          }
          else{
              if(this.cur_x < this.hide_after){
                  return true;
              }          
          }
      }
      else {
          if(this.sign_of_switch == 'pos'){
              if(this.cur_y > this.hide_after){
                  return true;
              }                    
          }
          else{
              if(this.cur_y < this.hide_after){
                  return true;
              }          
          }
      }
      return false;
  }

  // Requires: called by the user
  // Modifies: cur_y, cur_x
  // Effects: move this Asteroid 1 unit in its designated direction
  updatePosition() {
      // ensures all asteroids travel at current level's speed
      this.cur_y += this.y_dest * astProjectileSpeed;
      this.cur_x += this.x_dest * astProjectileSpeed;
      // update asteroid's css position
      this.id.css('top', this.cur_y);
      this.id.css('right', this.cur_x);
  }

  // Requires: this method should ONLY be called by the constructor
  // Modifies: cur_x, cur_y, x_dest, y_dest, num_ticks, hide_axis, hide_after, sign_of_switch
  // Effects: randomly determines an appropriate starting/ending location for this Asteroid
  //          all asteroids travel at the same speed
  #spawnAsteroid() {
      // REMARK: YOU DO NOT NEED TO KNOW HOW THIS METHOD'S SOURCE CODE WORKS
      let x = getRandomNumber(0, 1280);
      let y = getRandomNumber(0, 720);
      let floor = 784;
      let ceiling = -64;
      let left = 1344;
      let right = -64;
      let major_axis = Math.floor(getRandomNumber(0, 2));
      let minor_aix =  Math.floor(getRandomNumber(0, 2));
      let num_ticks;

      if(major_axis == 0 && minor_aix == 0){
          this.cur_y = floor;
          this.cur_x = x;
          let bottomOfScreen = game_screen.height();
          num_ticks = Math.floor((bottomOfScreen + 64) / astProjectileSpeed);

          this.x_dest = (game_screen.width() - x);
          this.x_dest = (this.x_dest - x)/num_ticks + getRandomNumber(-.5,.5);
          this.y_dest = -astProjectileSpeed - getRandomNumber(0, .5);
          this.hide_axis = 'y';
          this.hide_after = -64;
          this.sign_of_switch = 'neg';
      }
      if(major_axis == 0 && minor_aix == 1){
          this.cur_y = ceiling;
          this.cur_x = x;
          let bottomOfScreen = game_screen.height();
          num_ticks = Math.floor((bottomOfScreen + 64) / astProjectileSpeed);

          this.x_dest = (game_screen.width() - x);
          this.x_dest = (this.x_dest - x)/num_ticks + getRandomNumber(-.5,.5);
          this.y_dest = astProjectileSpeed + getRandomNumber(0, .5);
          this.hide_axis = 'y';
          this.hide_after = 784;
          this.sign_of_switch = 'pos';
      }
      if(major_axis == 1 && minor_aix == 0) {
          this.cur_y = y;
          this.cur_x = left;
          let bottomOfScreen = game_screen.width();
          num_ticks = Math.floor((bottomOfScreen + 64) / astProjectileSpeed);

          this.x_dest = -astProjectileSpeed - getRandomNumber(0, .5);
          this.y_dest = (game_screen.height() - y);
          this.y_dest = (this.y_dest - y)/num_ticks + getRandomNumber(-.5,.5);
          this.hide_axis = 'x';
          this.hide_after = -64;
          this.sign_of_switch = 'neg';
      }
      if(major_axis == 1 && minor_aix == 1){
          this.cur_y = y;
          this.cur_x = right;
          let bottomOfScreen = game_screen.width();
          num_ticks = Math.floor((bottomOfScreen + 64) / astProjectileSpeed);

          this.x_dest = astProjectileSpeed + getRandomNumber(0, .5);
          this.y_dest = (game_screen.height() - y);
          this.y_dest = (this.y_dest - y)/num_ticks + getRandomNumber(-.5,.5);
          this.hide_axis = 'x';
          this.hide_after = 1344;
          this.sign_of_switch = 'pos';
      }
      // show this Asteroid's initial position on screen
      this.id.css("top", this.cur_y);
      this.id.css("right", this.cur_x);
      // normalize the speed s.t. all Asteroids travel at the same speed
      let speed = Math.sqrt((this.x_dest)*(this.x_dest) + (this.y_dest)*(this.y_dest));
      this.x_dest = this.x_dest / speed;
      this.y_dest = this.y_dest / speed;
  }
}

// Spawns an asteroid travelling from one border to another
function spawn() {
  let asteroid = new Asteroid();
  setTimeout(spawn_helper(asteroid), 0);
}

function spawn_helper(asteroid) {
  let astermovement = setInterval(function () {
    // update asteroid position on screen
    asteroid.updatePosition();

    // determine whether asteroid has reached its end position, i.e., outside the game border
    if (asteroid.hasReachedEnd()) {
      asteroid.id.remove();
      clearInterval(astermovement);
    }
  }, AST_OBJECT_REFRESH_RATE);
}

//===================================================

// ==============================================
// =========== Utility Functions Here ===========
// ==============================================

// Are two elements currently colliding?
function isColliding(o1, o2) {
  return isOrWillCollide(o1, o2, 0, 0);
}

// Will two elements collide soon?
// Input: Two elements, upcoming change in position for the moving element
function willCollide(o1, o2, o1_xChange, o1_yChange) {
  return isOrWillCollide(o1, o2, o1_xChange, o1_yChange);
}

// Are two elements colliding or will they collide soon?
// Input: Two elements, upcoming change in position for the moving element
// Use example: isOrWillCollide(paradeFloat2, person, FLOAT_SPEED, 0)
function isOrWillCollide(o1, o2, o1_xChange, o1_yChange) {
  const o1D = {
    'left': o1.offset().left + o1_xChange,
    'right': o1.offset().left + o1.width() + o1_xChange,
    'top': o1.offset().top + o1_yChange,
    'bottom': o1.offset().top + o1.height() + o1_yChange
  };
  const o2D = {
    'left': o2.offset().left,
    'right': o2.offset().left + o2.width(),
    'top': o2.offset().top,
    'bottom': o2.offset().top + o2.height()
  };
  // Adapted from https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
  if (o1D.left < o2D.right &&
    o1D.right > o2D.left &&
    o1D.top < o2D.bottom &&
    o1D.bottom > o2D.top) {
    // collision detected!
    return true;
  }
  return false;
}

// Get random number between min and max integer
function getRandomNumber(min, max) {
  return (Math.random() * (max - min)) + min;
}
