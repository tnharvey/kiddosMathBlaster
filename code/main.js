// TODO: 
// Current: 0x0 and 0x1 generate all 0s for all enemies. WHY
//branch and test fix for fall rate. Reset fall rate to zero for all on update, then set again. Currently using gravity, but with reposition of start point to top of screen, they all fall like wall.
// Next: Get All Levels working
// Settings. Add game speed (gravity speed factor) as slider or +/- buttons
// X Make the letters fall in from the top
//    - at varying speeds
//    - from more varried positions (maybe start some offscreen)
// Add objects that can collide with and damage character (add life meter or hearts/shields)
// Refactor to make responsive to screen size
// X Levels should be various multiplication tables (eventually addition, subtraction, division),
// but also have difficulty levels (L1 hint at beginning and all numbers on screen are from the same series, e.g. 5s, L2 no hint, L3 random numbers)
// Also allow for adjusting game speed (and other parameters) in setting
//  - Stored in Replit DB or browser cache)
// X Make "hint" mode that highlights the correct answer
//  - in the first 2 seconds for each round
// Make better sprites, visuals, BG, sounds, etc
// Improve scoring, including a DB that tracks high scores, progress, etc.
// Make powerup system
// Hearts/Shields to pick up
// Pegacorn:
//   - Rainbow beam (powerup bar increases with each correct answer. At full, all correct answers are captured. Beam resets for each level)
//   - Wing sweep (blast from wings blows away all wrong answers. Magic tornado appears on screen, must capture the tornado to gain 1 powerup. Powerup drops after level completion.)
//
// Spaceship:
//   - Each right answers powers up the three gravity beams. Full power captures all right answers
//   - Freeze gun stops all movement for 4 seconds
// Provide story arc or progression (level up, badges, something)
//   - Darkness is coming from the far side of the universe and it has fragmented math. Match factors with solutions to mend the fabric of reality. There are two characters:
//   - Pegacorn that shoots rainbows from its horn. (powerups can shoot things from wings as well, a spin that sweeps away the wrong answers, etc.)
//   - Captain Caputovi (latin for "egghead" :D ) flies his spaceship to defeat the darkness. Blasters to destroy bad answers, gravity beam to rejoin solutions with factors
// Add touch controls

import kaboom from "kaboom"

var PLAYER_SPEED = 480
var SPEED_FACTOR = 0.5
var GRAVITY = 30

// Build multiplication table object. Reference with multTable[n][n]
var multTable = {};
  
  for (var v = 0; v < 13; v++) {
      multTable[v] = {};
      for (var i = 0; i < 13; i++) {
          multTable[v][i] = i * v;
      }
  }

kaboom({background: [ 0, 0, 0, ],})

// loadSprite("player", "sprites/ship.png")
loadSound("hit", "https://kaboomjs.com/sounds/hit.mp3")
loadSound("shoot", "https://kaboomjs.com/sounds/shoot.mp3")
loadSound("explode", "https://kaboomjs.com/sounds/explode.mp3")

loadSprite("player", "/sprites/ship-spritesheet.png", {
	sliceX: 5,
	// Define animations
	anims: {
		"idle": {
			from: 0,
			to: 2,
			speed: 5,
			loop: true,
		},
		"turn": 3,
	},
})

var hints = false

// SCENE: TEST

scene("test", ()=> {
  var i = 0
  loop(5,()=>{
    if(i>3){
      destroyAll("testText")
    }
    add([
  		text("test"+i, { size: 80 }),
  		pos(width()/10, i*100),
  	  origin("topleft"),
  		fixed(),
      "testText"
  	])
    i=i+1
  }) 
})

// ** MENU SCENES **
// SCENE: START MENU
scene("start", () => {
  addButton("All Levels", vec2(width()/2, (height()/10)*2), () => go("battle","all"))
  addButton("Pick Level", vec2(width()/2, (height()/10)*4), () => go("levels"))
  addButton("Settings", vec2(width()/2, (height()/10)*6), () => go("settings"))
  addButton("Quit", vec2(width()/2, (height()/10)*8), () => window.close())
})

// SCENE: LEVELS MENU
scene("levels", () => {
  addButton("0", vec2(width()/2, (height()/8)*1), () => go("battle",0))
  addButton("1", vec2((width()/8)*1, (height()/8)*3), () => go("battle",1))
  addButton("2", vec2((width()/8)*3, (height()/8)*3), () => go("battle",2))
  addButton("3", vec2((width()/8)*5, (height()/8)*3), () => go("battle",3))
  addButton("4", vec2((width()/8)*7, (height()/8)*3), () => go("battle",4))
  addButton("5", vec2((width()/8)*1, (height()/8)*5), () => go("battle",5))
  addButton("6", vec2((width()/8)*3, (height()/8)*5), () => go("battle",6))
  addButton("7", vec2((width()/8)*5, (height()/8)*5), () => go("battle",7))
  addButton("8", vec2((width()/8)*7, (height()/8)*5), () => go("battle",8))
  addButton("9", vec2((width()/8)*1, (height()/8)*7), () => go("battle",9))
  addButton("10", vec2((width()/8)*3, (height()/8)*7), () => go("battle",10))
  addButton("11", vec2((width()/8)*5, (height()/8)*7), () => go("battle",11))
  addButton("12", vec2((width()/8)*7, (height()/8)*7), () => go("battle",12))
})

// SCENE: SETTINGS MENU
scene("settings", () => {
  var hintsVal = ""
  if(hints){hintsVal="On"}
  else {hintsVal="Off"}
  addButton("Hints: ", vec2(width()/2, (height()/7)*2), () => {
    hints = !hints
    if(hints){hintsVal="On"}
    else {hintsVal="Off"}
    hintStatus.text=hintsVal
  })
  var hintStatus=add([
		text(hintsVal, { size: 50 }),
		pos(width()/3*2, (height()/10)*2),
	origin("topleft"),
		fixed()
	])
  addButton("Back", vec2(width()/2, (height()/7)*5), () => go("start"))
})

// SCENE: CREDITS
scene("credits", () => {
// Built with Kaboom.js
// Developed by T. Neal Harvey
// Stars background from CKH4's codepen (modified) https://codepen.io/CKH4/pen/vNyyaL?editors=0110

})

// ** GAME SCENES **
// SCENE: BATTLE
scene("battle", (level) => {

  const levels = [0,1,2,3,4,5,6,7,8,9,10,11,12]
	const player = add([
		sprite("player"),
		area(),
    scale(1.5),
		pos(width() / 2, height() - 64),
		origin("center"),
	])
  gravity(GRAVITY*SPEED_FACTOR)
  player.play("idle")
  
  const scoreText = add([
		text(0, { size: 80 }),
		pos(width()/10, height()/10),
	origin("topleft"),
		fixed()
	])

// CONTROLS
  //mouse controls
  onUpdate(() => {
  	if (mousePos().x > player.pos.x+3) {
      player.flipX(true)
      if(player.curAnim()!=="turn"){
        player.play("turn")
      }
    }
    else if (mousePos().x < player.pos.x-3) {
      player.flipX(false)
      if(player.curAnim()!=="turn"){
        player.play("turn")
      }
    }
    else {
      if(player.curAnim()!=="idle"){
        player.play("idle")
      }
    }
    player.pos.x = mousePos().x
  })
  
  onClick(() => {
    spawnBullet(player.pos.sub(16, 0))
		spawnBullet(player.pos.add(16, 0))
		play("shoot", {
			volume: 0.3,
			detune: rand(-1200, 1200),
		})
  })
	//keyboard controls
  onKeyDown("left", () => {
		player.move(-PLAYER_SPEED, 0)
    if(player.curAnim()!=="turn"){
      player.play("turn")
     }
		if (player.pos.x < 0) {
			player.pos.x = width()
		}
	})

	onKeyDown("right", () => {
		player.move(PLAYER_SPEED, 0)
    player.flipX(true)
      if(player.curAnim()!=="turn"){
        player.play("turn")
      }
		if (player.pos.x > width()) {
			player.pos.x = 0
		}
	})

	onKeyPress("space", () => {
		spawnBullet(player.pos.sub(16, 0))
		spawnBullet(player.pos.add(16, 0))
		play("shoot", {
			volume: 0.3,
			detune: rand(-1200, 1200),
		})
	})
  onKeyPress("escape", () => {
		go("start")
	})

onKeyRelease(["left", "right"], () => {
  if(player.flipX){ player.flipX(false) }
  player.play("idle")
})

// PLAY LOOP
  // randomize list of numbers from 0 to 12
  var thisLevel = shuffleArray(levels)
  var factorA = 0
	var factorB = thisLevel[1]
  var correctAnswer = factorA * factorB;
  //cyclesCount is how many times a question has been repeated. Needs a rename.
  var cyclesCount = 0
  var currentPosition = 0
  var firstRun = true

  // specific level
  if(level >= 0 && level < 13){
    factorA = level
    loop(6,()=>{
      if (firstRun){
        add([
      		text(factorA + "x" + factorB, { size: 110 }),
      		pos(width()/2, height()/10),
      		origin("center"),
          color(180,0,0),
      		fixed(),
      		"question"
      	])
        firstRun=false
      }
      if(cyclesCount==2){
        cyclesCount=0
        if(currentPosition==11){
          go("win",scoreText.text)
        }
        else {
        currentPosition++
        factorB = thisLevel[currentPosition]
        correctAnswer=factorA*factorB
        destroyAll("question");
        add([
      		text(factorA + "x" + factorB, { size: 110 }),
      		pos(width()/2, height()/10),
      		origin("center"),
          color(180,0,0),
      		fixed(),
      		"question"
      	])
        }
      }
      generateEnemies(factorA,factorB,correctAnswer);
      cyclesCount++
    })
  }
  // all levels
  else if(level=="all"){
    loop(6,()=>{
      if (firstRun){
        add([
      		text(factorA + "x" + factorB, { size: 110 }),
      		pos(width()/2, height()/10),
      		origin("center"),
          color(180,0,0),
      		fixed(),
      		"question"
      	])
        firstRun=false
      }
      if(cyclesCount==1){
        if(currentPosition==11){
          if(factorA==12){
            go("win",scoreText.text)
          }
          factorA++
          currentPosition=0
          thisLevel = shuffleArray(levels)
        }
        else {
          currentPosition++
          factorB = thisLevel[currentPosition]
          correctAnswer=factorA*factorB
          destroyAll("question");
          add([
        		text(factorA + "x" + factorB, { size: 110 }),
        		pos(width()/2, height()/10),
        		origin("center"),
            color(180,0,0),
        		fixed(),
        		"question"
        	])
        }
        cyclesCount=0
      }
      generateEnemies(factorA,factorB,correctAnswer);
      cyclesCount++
    })
  }

	onCollide("bullet", "answer",(b, e) => {
		if(e.text==correctAnswer){
      scoreText.text = scoreText.text + 5
    }
    else {
      scoreText.text = scoreText.text - 1
    }
    destroy(b)
		destroy(e)    
		play("explode")
		addExplode(b.pos, 1, 24, 1)
	})

	onCollide("bullet", "Answer",(b, e) => {
		destroy(b)
		destroy(e)
    scoreText.text = scoreText.text + 5
		play("explode")
		addExplode(b.pos, 1, 24, 1)
  })
})

// SCENE: WIN
scene("win", (score) => {

const player =	add([
		sprite("player"),
		origin("center"),
		scale(5),
		pos(width() / 2, height() / 2),
	])
  player.play("idle")

	add([
		text(score, 24),
		origin("center"),
		pos(width() / 2, (height()/7)*2),
	])
  addButton("Menu", vec2(width()/2, (height()/7)*5), () => go("start"))
  addButton("Start Over", vec2(width()/2, (height()/7)*6), () => go("battle"))

})

// ** FUNCTIONS **

// GENERATIVE FUNCTIONS
function generateEnemies(fact1,fact2,correctAnswer) {
  var enemyVals = {factA:fact1,factB:fact2,correctAnswer:correctAnswer}
  for (var v = 0; v < 8; v++) {
    //console.log(enemyVals)
    addText("answer",enemyVals)
  }
  addText("Answer",enemyVals)
}

function addText(tag,opt) {
  var textColor = rgb(255,255,255)
  var textPos = vec2(randi(width()/10,width()-(width()/10)),randi(0,height()/100))
  if (tag=="question"||tag=="answer"||tag=="Answer"){
    //if(opt.factA in opt && opt.factB in opt){
    //console.log(opt.factA + ", " + opt.factB)  
    var textVal = multTable[randi(opt.factA,opt.factB)][randi(1,13)]
  }
  
  if(tag=="Answer" && hints){
    textColor = rgb (180,0,0)
  }
  if (tag == "question"){
    destroy(get("question"))
    add([
    		text(opt.factA + "x" + opt.factB, { size: 110 }),
    		pos(width()/2, height()/10),
    		origin("center"),
        color(180,0,0),
    		fixed(),
    		tag
    	])
  }  
  else if(tag=="answer") {
      add([
        pos(textPos),
        text(textVal, { size: 40 }),
        origin("center"),
        area(),
        body(),
        cleanup(),
        tag,
      ])
    }
    else if (tag == "Answer"){
      add([
          pos(textPos),
          text(opt.correctAnswer, { size: 40 }),
          color(textColor),
          origin("center"),
          area(),
          body(),
          cleanup(),
          "Answer",
        ])
    }
  else {
    add([
      pos(opt.pos),
      text(opt.text, { size: opt.size }),
      origin("center"),
      area(),
      cleanup(),
      textTag,
    ])
  }    
}

function spawnBullet(p) {
  const BULLET_SPEED = 1200
  
  add([
    rect(4, 16),
    area(),
    pos(p),
    origin("center"),
    color(40, 40, 255),
    outline(1),
    move(UP, BULLET_SPEED),
    cleanup(),
    "bullet",
  ])
}


// VISUAL FUNCTIONS

function addExplode(p, n, rad, size) {
  for (let i = 0; i < n; i++) {
    wait(rand(n * 0.1), () => {
      for (let i = 0; i < 2; i++) {
        add([
          pos(p.add(rand(vec2(-rad), vec2(rad)))),
          rect(4, 4),
          outline(4),
          scale(1 * size, 1 * size),
          lifespan(0.1),
          grow(rand(48, 72) * size),
          origin("center"),
        ])
      }
    })
  }
}

function grow(rate) {
  return {
    update() {
      const n = rate * dt()
      this.scale.x += n
      this.scale.y += n
    },
  }
}

// UTILITY FUNCTIONS
function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function addButton(txt, p, f) {
//text is button text, p is button position, f is button function/action
	const btn = add([
		text(txt),
		pos(p),
		area({ cursor: "pointer", }),
		scale(0.5),
		origin("center"),
	])
	btn.onClick(f)
	btn.onUpdate(() => {
		if (btn.isHovering()) {
			const t = time() * 10
			btn.color = rgb(
				wave(0, 255, t),
				wave(0, 255, t + 2),
				wave(0, 255, t + 4),
			)
			btn.scale = vec2(0.8)
		} else {
			btn.scale = vec2(0.7)
			btn.color = rgb()
		}
	})

}

go("start")