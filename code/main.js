import kaboom from "kaboom"

// TODO: 
// Current: now loading from multTable as function, ready to receive level data
// load initial answers, then loop to load and destroy fewer answers more slowly
// Timing isn't conducive to repeating the Q/A sequence. Adjust to change question every few seconds, increase size and spacing of answers, etc.
// refactor to make responsive to screen size
// create initial menu to select level
// levels should be various multiplication tables (eventually addition, subtraction, division), but also have difficulty levels (L1 hint at beginning and all numbers on screen are from the same series, e.g. 5s, L2 no hint, L3 random numbers)
// Also allow for adjusting game speed (and other parameters) in setting (store in DB or browser cache)
// escape exits game to main menu
// make "hint" mode that highlights the correct answer in the first 2 seconds for each round
// make better sprites, visuals, BG, sounds, etc
// make animated sprites
// improve scoring, including a DB that tracks high scores, progress, etc.
// make powerups
// provide story arc or progression (level up, badges, something)
// add touch controls

kaboom()

loadBean()
loadSound("hit", "https://kaboomjs.com/sounds/hit.mp3")
loadSound("shoot", "https://kaboomjs.com/sounds/shoot.mp3")
loadSound("explode", "https://kaboomjs.com/sounds/explode.mp3")

scene("battle", () => {

	const BULLET_SPEED = 1200
	const PLAYER_SPEED = 480

	const factorA = 5
	const factorB = 2
  
	const player = add([
		sprite("bean"),
		area(),
		pos(width() / 2, height() - 64),
		origin("center"),
	])

  const score = add([
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
  
	onKeyDown("left", () => {
		player.move(-PLAYER_SPEED, 0)
		if (player.pos.x < 0) {
			player.pos.x = width()
		}
	})

	onKeyDown("right", () => {
		player.move(PLAYER_SPEED, 0)
		if (player.pos.x > width()) {
			player.pos.x = 0
		}
	})

  var correctAnswer = factorA * factorB;
	//creates random numbers every n seconds
//	loop(1,() => {
//	for (let i = 0; i < 5; i++) {	
//		add([
//			pos(randi(width()/10,width()-(width()/10)),randi(height()/10,height()-(height()/10))),
//			text(randi(1,40), { size: 40 }),
//			lifespan(4),
//			origin("center"),
//			area(),
//			"answer"
//		])
//	}
//	})
  loop(4,()=>{
    generateEnemies(5,5);
  })
	add([
		text(factorA + "x" + factorB, { size: 140 }),
		pos(width()/2, height()/10),
		origin("center"),
		fixed(),
		"question"
	])

function generateEnemies(fact1,fact2) {
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
		add([
			rect(12, 48),
			area(),
			pos(p),
			origin("center"),
			color(127, 127, 255),
			outline(4),
			move(UP, BULLET_SPEED),
			cleanup(),
			// strings here means a tag
			"bullet",
		])
	}

	onKeyPress("space", () => {
		spawnBullet(player.pos.sub(16, 0))
		spawnBullet(player.pos.add(16, 0))
		play("shoot", {
			volume: 0.3,
			detune: rand(-1200, 1200),
		})
	})

	onCollide("bullet", "answer",(b, e) => {
		destroy(b)
		destroy(e)
    score.text = score.text-1
		play("explode")
		addExplode(b.pos, 1, 24, 1)
	})

	onCollide("bullet", "Answer",(b, e) => {
		destroy(b)
		destroy(e)
    score.text = score.text+5
		play("explode")
		addExplode(b.pos, 1, 24, 1)
  })
})
scene("win", ({ time, boss }) => {
	const b = burp({
		loop: true,
	})

	loop(0.5, () => {
		b.detune(rand(-1200, 1200))
	})

	add([
		sprite(boss),
		color(255, 0, 0),
		origin("center"),
		scale(8),
		pos(width() / 2, height() / 2),
	])

	add([
		text(time.toFixed(2), 24),
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

go("battle")
