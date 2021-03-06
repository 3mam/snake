import './style.css'
import './index.html'
import Node, { loadNode } from './Node'
import { getRandomInt } from './Math'
import Mat4 from './Mat4'
import Vec3 from './Vec3'
import Camera from './Camera'
import Engine from './Engine'
import GameObject, { EDirection } from './GameObject'
import { canvasResize } from './gl'
import BoxCollision from './BoxCollision'
import Color from './Color'

class Counter {
	dir: number
	val: number
	min: number
	max: number
	constructor(min: number, max: number, step: number) {
		this.dir = -step
		this.val = min
		this.min = min
		this.max = max
	}

	count() {
		return this.val += ((this.val >= this.max || this.val <= this.min) ? this.dir = -this.dir : this.dir)
	}
}

function createCounter(min, max, step) {
	let dir = -step,
		val = min
	return function () {
		return val += ((val >= max || val <= min) ? dir = -dir : dir)
	}
}

function randomBetween(min: number, max: number) {
	return Math.random() * (max - min) + min
}

class Vec2in1D {
	private whxy: Int32Array

	constructor(width: number, height: number, x: number = 0, y: number = 0) {
		this.whxy = new Int32Array(4)
		this.whxy[0] = width
		this.whxy[1] = height
		this.whxy[2] = x
		this.whxy[3] = y
	}

	get position() {
		if (this.whxy[0] > this.whxy[2] && this.whxy[2] >= 0 && this.whxy[1] > this.whxy[3] && this.whxy[3] >= 0)
			return ((this.whxy[3] * this.whxy[0]) + this.whxy[2])
		else
			return 0
	}

	set x(value: number) {
		this.whxy[2] = value
	}

	get x() {
		return this.whxy[2]
	}

	set y(value: number) {
		this.whxy[3] = value
	}

	get y() {
		return this.whxy[3]
	}

	get print() {
		return `width:${this.whxy[0]}\nheight:${this.whxy[1]}\nx:${this.whxy[2]}\ny:${this.whxy[3]}`
	}
}

function dpadVisibleSwitch() {
	const dpad = document.getElementById('dpad').style
	dpad.visibility === 'visible'
		? dpad.visibility = 'hidden'
		: dpad.visibility = 'visible'
}

function isMobile() {
	const match = window.matchMedia
	return match ? match("(pointer:coarse)").matches : false
}

function toggleFullScreen() {
	!document.fullscreenElement
		? document.documentElement.requestFullscreen()
		: document.exitFullscreen
			? document.exitFullscreen()
			: null
}

window.onload = () => {
	class Game extends Engine {
		head: GameObject
		up: GameObject
		tail: GameObject
		arena: Node
		cam: Camera
		speed: number
		arenaSpawnPoint: Vec3[]
		direction: EDirection
		midleSnakeInstance: Mat4[]
		midleSnakeNode: GameObject[]
		snakeSize: number
		pos2D: Vec2in1D
		screenAngle: number
		wall: BoxCollision
		start: number
		pos: Vec3

		constructor() {
			super()
		}

		async init() {
			canvasResize()
			this.start = 0
			this.screenAngle = window.screen.orientation.angle
			const width = 64
			const height = 64
			this.pos2D = new Vec2in1D(width, height, width / 2, height / 2)

			window.addEventListener('fullscreenchange', (ev) => {
				dpadVisibleSwitch()
			})

			window.addEventListener('orientationchange', (ev) => {
				this.screenAngle = ev.target['screen']['orientation']['angle']
			})

			document.querySelector('#input').addEventListener('click', (ev) => {
				if (ev.target['id'] === 'fullScreen') {
					toggleFullScreen()
					this.speed = 0
					document.getElementById('end').style.visibility = 'visible'
				}

				if (ev.target['id'] === 'start') {
					isMobile() ? toggleFullScreen() : null
					document.getElementById('start').style.visibility = 'hidden'
					this.start = 22
				}

				if (ev.target['id'] === 'restart') {
					document.getElementById('end').style.visibility = 'hidden'
					this.speed = 0.9
					this.direction = EDirection.up
					this.head.changePosition(this.pos)
					this.snakeSize = 1
					this.tail.changeParent(this.midleSnakeNode[0])
					this.midleSnakeInstance.forEach(v => v.scale(new Vec3(0, 0, 0)))
					midle.createInstance(this.midleSnakeInstance)
					document.documentElement.requestFullscreen()

				}
			})

			document.querySelector('#input').addEventListener('touchstart', (ev) => {
				if (ev.target['id'] === 'left' && this.direction !== EDirection.right && this.direction !== EDirection.left) {
					this.direction = EDirection.left
				}

				if (ev.target['id'] === 'right' && this.direction !== EDirection.left && this.direction !== EDirection.right) {
					this.direction = EDirection.right
				}

				if (ev.target['id'] === 'up' && this.direction !== EDirection.down && this.direction !== EDirection.up) {
					this.direction = EDirection.up
				}

				if (ev.target['id'] === 'down' && this.direction !== EDirection.up && this.direction !== EDirection.down) {
					this.direction = EDirection.down
				}

			})

			window.addEventListener('keydown', (ev) => {
				if (ev.key === 'e') {
					console.log(document.fullscreenElement)

				}

				if (ev.key === 'a' && this.direction !== EDirection.right && this.direction !== EDirection.left) {
					this.direction = EDirection.left
				}

				if (ev.key === 'd' && this.direction !== EDirection.left && this.direction !== EDirection.right) {
					this.direction = EDirection.right
				}

				if (ev.key === 'w' && this.direction !== EDirection.down && this.direction !== EDirection.up) {
					this.direction = EDirection.up
				}

				if (ev.key === 's' && this.direction !== EDirection.up && this.direction !== EDirection.down) {
					this.direction = EDirection.down
				}

			})

			const model = await loadNode('./data/snake.glb')
			this.arena = model.get('arena')
			this.cam = new Camera('main')
			this.cam.useAsCurrent()
			this.direction = EDirection.up
			//const area = new Array(3)
			this.arenaSpawnPoint = new Array(width * height)
			for (let y = 0; y < height; y++) {
				for (let x = 0; x < width; x++) {
					const mat4 = new Mat4()
					this.pos2D.x = x
					this.pos2D.y = y
					this.arenaSpawnPoint[this.pos2D.position] = new Vec3(x * 0.06, y * 0.06, 0.0005)
				}
			}
			//this.arena.createInstance(area)
			this.arena.view.translate(new Vec3((width / 2) * 0.06, (height / 2) * 0.06, 0))
			this.speed = 0.9

			this.pos2D.x = width / 2
			this.pos2D.y = 0

			this.pos = this.arenaSpawnPoint[this.pos2D.position]
			this.pos = this.pos.add(new Vec3(0, 0, 0))

			const snakeLength = 500
			this.midleSnakeInstance = new Array(snakeLength)
			this.midleSnakeNode = new Array(snakeLength)
			this.head = new GameObject(model.get('head'), this.pos)
			let midle = model.get('midle')

			for (let i = 0; i < snakeLength; i++) {
				this.midleSnakeInstance[i] = new Mat4
				this.midleSnakeInstance[i].scale(new Vec3(0, 0, 0))

				this.midleSnakeNode[i] = new GameObject(midle, this.pos, i == 0 ? true : false, i == 0 ? this.head : this.midleSnakeNode[i - 1], i)
			}
			midle.createInstance(this.midleSnakeInstance)

			this.head.lookDirection(EDirection.up)
			this.tail = new GameObject(model.get('tail'), this.pos, true, this.midleSnakeNode[0])
			const random = getRandomInt(0, this.arenaSpawnPoint.length)
			this.up = new GameObject(model.get('up'), new Vec3(this.arenaSpawnPoint[random].valueX(), this.arenaSpawnPoint[random].valueY()))
			this.snakeSize = 1

			this.head.setColor(new Color(0, 0, 1, 0.5))
			this.midleSnakeNode[0].setColor(new Color(0, 0, 1, 0.5))
			this.tail.setColor(new Color(0, 0, 1, 0.5))
			this.up.setColor(new Color(1, 1, 1, 0.5))
			this.arena.setColor(new Color(0.2, 0.2, 0.2, 1))

			this.wall = new BoxCollision(0, 0, 3.95, 3.95)
		}

		camera(zoom: number) {


		}

		update(delta) {
			switch (this.start) {
				case 20: this.start = 21
					break
				case 21:
					return
				case 22:
					break
				default: this.start++
			}

			this.cam.identity()
			this.cam.rotateX(0.2)
			if (this.screenAngle != 0) {
				this.cam.position(new Vec3(-2.1, -0.8, -2))
				this.cam.zoom(0.74)
			} else {
				this.cam.position(new Vec3(-0.75, 0.1, -2))
				this.cam.zoom(0.39)
			}

			this.head.lookDirection(this.direction)
			this.head.move(this.speed * delta)

			this.midleSnakeNode.forEach((m, i) => {
				const parentLastState = m.callParent().lastPosition()
				m.changePosition(parentLastState.position)
				m.rotateAt(parentLastState.direction)
				this.snakeSize > i ? m.show() : m.hide()
				m.update()
				if (this.head.collisionWithObject(m, 0.03) || !this.head.collisionWithWall(this.wall)) {
					this.speed = 0
					document.getElementById('end').style.visibility = 'visible'
				}
			})

			const parentLastState = this.tail.callParent().lastPosition()
			this.tail.changePosition(parentLastState.position)
			this.tail.rotateAt(parentLastState.direction)
			this.tail.update()

			this.head.update()

			if (this.head.collisionWithObject(this.up, 0.1)) {
				const random = getRandomInt(0, this.arenaSpawnPoint.length)
				this.up.changePosition(this.arenaSpawnPoint[random])
				this.tail.changeParent(this.midleSnakeNode[this.snakeSize])
				this.snakeSize++
				window.navigator.vibrate(100)
			}

			this.up.update()

		}

		render(delta) {
			this.arena.render()
			this.up.render()
			this.head.render()
			this.midleSnakeNode[0].render()
			this.tail.render()
		}
	}

	const engine = new Game()
	engine.run()

	//gl.stencilFunc(gl.ALWAYS, 1, 0xFF)
	//gl.stencilMask(0xFF)


	//head.render()
	//midle.render()
	//tail.render()
	//gl.stencilFunc(gl.NOTEQUAL, 1, 0xFF)
	//gl.stencilMask(0x00)
	//gl.depthMask(false)




	//gl.stencilMask(0xFF)
	//gl.depthMask(true)

}