import kaboom from "kaboom"

// TODO: 
// Current: now loading from multTable as function, ready to receive level data
// load initial answers, then loop to load and destroy fewer answers more slowly
// Timing isn't conducive to repeating the Q/A sequence. Adjust to change question every few seconds, increase size and spacing of answers, etc.
// make the letters fall in from the top at varying speeds to look paralax as well
// refactor to make responsive to screen size
// create initial menu to select level
// levels should be various multiplication tables (eventually addition, subtraction, division), but also have difficulty levels (L1 hint at beginning and all numbers on screen are from the same series, e.g. 5s, L2 no hint, L3 random numbers)
// Also allow for adjusting game speed (and other parameters) in setting (store in DB or browser cache)
// escape exits game to main menu
// make "hint" mode that highlights the correct answer in the first 2 seconds for each round
// make better sprites, visuals, BG, sounds, etc
// improve scoring, including a DB that tracks high scores, progress, etc.
// make powerups
// provide story arc or progression (level up, badges, something)
// add touch controls

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
loadSprite("stars", "/sprites/stars-spritesheet.png", {
	sliceX: 8,
	// Define animations
	anims: {
		"smStar": {
			from: 0,
			to: 1,
			speed: 2,
			loop: true,
		},
		"mStar": {
			from: 0,
			to: 1,
			speed: 2,
			loop: true,
		},
    "plStar": {
			from: 0,
			to: 1,
			speed: 2,
			loop: true,
		},
    "bgStar": {
			from: 0,
			to: 1,
			speed: 2,
			loop: true,
		},
	},
})
// SCENE: TEST
scene("test", () => {
  const PLAYER_SPEED = 480
  
  
})
// SCENE: BATTLE
scene("battle", () => {
	const PLAYER_SPEED = 480

	const factorA = 5
	const factorB = 2
  const levels = [0,1,2,3,4,5,6,7,8,9,10,11,12]
  
	const player = add([
		sprite("player"),
		area(),
    scale(1.5),
		pos(width() / 2, height() - 64),
		origin("center"),
	])

  player.play("idle")
  
  const scoreText = add([
		text(0, { size: 80 }),
		pos(width()/10, height()/10),
	origin("topleft"),
		fixed()
	])

  // Build multiplication table object. Reference with multTable[n][n]
  var multTable = {};
  for (var v = 0; v < 13; v++) {
      multTable[v] = {};
      for (var i = 0; i < 13; i++) {
          multTable[v][i] = i * v;
      }
  }

// CONTROLS
	onKeyDown("left", () => {
		player.move(-PLAYER_SPEED, 0)
    if(player.curAnim()!=="turn"){
      player.play("turn")
      console.log("left")
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

onKeyRelease(["left", "right"], () => {
  if(player.flipX){ player.flipX(false) }
  player.play("idle")
})

// Play Loop
  // randomize list of numbers from 0 to 12
  var thisLevel = shuffleArray(levels)
  // for each number in list, start play loop
  // on completion of play loop, loop next number in list
  // once all numbers are complete, to to win
  var correctAnswer = factorA * factorB;

  loop(4,()=>{
    generateEnemies(5,5,multTable,correctAnswer);
  })
	add([
		text(factorA + "x" + factorB, { size: 140 }),
		pos(width()/2, height()/10),
		origin("center"),
		fixed(),
		"question"
	])

	onCollide("bullet", "answer",(b, e) => {
		destroy(b)
		destroy(e)
    scoreText.text = scoreText.text - 1
		play("explode")
		addExplode(b.pos, 1, 24, 1)
	})

	onCollide("bullet", "Answer",(b, e) => {
		destroy(b)
		destroy(e)
    scoreText.text = scoreText.text + 5
		play("explode")
		addExplode(b.pos, 1, 24, 1)
    
    if(scoreText.text >= 10){
      go("win",scoreText.text)
    }
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
		pos(width() / 2, height() / 2),
	])

})

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

function generateEnemies(fact1,fact2,multTable,correctAnswer) {
  for (var v = 0; v < 8; v++) {
    var textVal = multTable[randi(fact1,fact2)][randi(1,13)];
    if(textVal == correctAnswer){
      textTag = "Answer";
    }
    else {
      textTag = "answer";
    }
    add([
      pos(randi(width()/10,width()-(width()/10)),randi(height()/10,height()-(height()/10))),
      text(textVal, { size: 40 }),
      lifespan(6),
      origin("center"),
      area(),
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
    // strings here means a tag
    "bullet",
  ])
}

function shuffleArray(arr) {
  arr.sort(() => Math.random() - 0.5);
}

go("battle")