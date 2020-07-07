import './style.css'
import './index.html'
import { gl, glInit, canvas } from './gl'
import { loadNode, Node } from './Node'
import { BinaryReader } from './BinaryReader'
import { glbLoad, gltfLoad } from './glTF'
import { Mat4, Vec3, getRandomInt, angleToRadiant } from './Math'
import { Camera, CameraType } from './Camera'
import { Engine, ILoop } from './Engine'
import { Circle } from './Collision'

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

enum EDirection {
	up,
	down,
	left,
	right,
}

class SnakePart {
	rotate: number
	angle: number
	rotateSpeed: number
	rotateDirection: EDirection
	id: number
	cell: number
	node: Node
	view: Mat4
	position: Vec3
	origin: Vec3
	collision: Circle

	constructor(node: Node, position: Vec3) {
		this.rotate = 0
		this.angle = 0
		this.id = 0
		this.cell = 0
		this.node = node
		this.view = new Mat4
		this.position = position
		this.origin = this.node.origin.translation
		this.position = this.position.add(this.node.origin.translation)
		this.collision = new Circle(this.position.x, this.position.y, 0.0005)
		this.rotateSpeed = 20
	}

	moveTo(n: number) {
		this.position = this.position.add(new Vec3(0, 0, 0).reversDirectionRadius(this.rotate).multiply(n))
	}

	collisionWitch(v: Vec3): boolean {
		var THRESHOLD = 0.1

		//Method 1
		var x1 = this.position.x
		for (var i = 1; i <= 11; i++) {
			x1 += 0.1
		}

		//Method 2
		var x2 = v.x * 11

		var y1 = this.position.y
		for (var i = 1; i <= 11; i++) {
			y1 += 0.1
		}

		//Method 2
		var y2 = v.y * 11

		if (Math.abs(x1 - x2) < THRESHOLD && Math.abs(y1 - y2) < THRESHOLD)
			return true

		return false
	}

	update(speed: number) {
		/*
		if (this.rotate < this.angle && this.rotateDirection == EDirection.left)
			this.angle += -speed * this.rotateSpeed
		else if (this.rotate > this.angle && this.rotateDirection == EDirection.right)
			this.angle += speed * this.rotateSpeed
		else
			
			*/
		switch (this.rotateDirection) {
			case EDirection.up:
				this.position = this.position.add(new Vec3(0, 0.01, 0))
				this.rotate = angleToRadiant(0)
				break
			case EDirection.down:
				this.position = this.position.add(new Vec3(0, -0.01, 0))
				this.rotate = angleToRadiant(180)
				break
			case EDirection.left:
				this.position = this.position.add(new Vec3(-0.01, 0, 0))
				this.rotate = angleToRadiant(-90)
				break
			case EDirection.right:
				this.position = this.position.add(new Vec3(0.01, 0, 0))
				this.rotate = angleToRadiant(90)
				break
		}
		this.collision = this.collision.moveTo(this.position)
		this.angle = this.rotate
		this.view.identity()
		this.view.translate(this.position)
		this.view.rotateZ(this.angle)
		this.node.updateInstance(this.id, this.view)
	}

	collisionTo(v: Circle): boolean {
		if (this.collision.collisionTo(v))
			return true
		return false
	}
}

window.onload = () => {
	class Game implements ILoop {
		head: SnakePart
		midle: Node
		up: Node
		tail: SnakePart
		arena: Node
		cam: Camera
		speed: number
		arenaCollision: Circle[]
		cell: number
		controlCollision: Circle
		pressKey: boolean
		direction: EDirection
		midleSnakeInstance: Mat4[]
		midleSnakeNode: SnakePart[]
		snakeSize: number
		powerUpCell: number
		stack: {
			position: Vec3
			direction: number
		}[]
		in: number

		async init() {
			const model = await loadNode('./data/snake.gltf')
			console.log(model)
			this.arena = model.get('arena')

			this.cam = new Camera('main')
			this.cam.setAsCurrent()

			const area = new Array(16 * 16)
			this.arenaCollision = new Array(16 * 16)
			for (let y = 0; y < 16; y++) {
				for (let x = 0; x < 16; x++) {
					const mat4 = new Mat4()
					let wall = -0.05
					mat4.translate(new Vec3(x * 0.21, y * 0.21, wall))
					area[(x * 16) + y] = mat4
					this.arenaCollision[(x * 16) + y] = new Circle(x * 0.21, y * 0.21, 0.0005)
					wall = 0.0
				}
			}

			this.arena.createInstance(area)
			this.speed = 0.45

			const pos = this.arenaCollision.length / 2
			this.controlCollision = new Circle(this.arenaCollision[pos].x, this.arenaCollision[pos].y, 0.1)
			window.addEventListener('keydown', (ev) => {
				if (ev.key === 'a' && this.direction !== EDirection.right && this.direction !== EDirection.left) {
					this.direction = EDirection.left
					this.stack.unshift({ position: this.head.position, direction: this.direction })

				}

				if (ev.key === 'd' && this.direction !== EDirection.left && this.direction !== EDirection.right) {
					this.direction = EDirection.right
					this.stack.unshift({ position: this.head.position, direction: this.direction })
				}


				if (ev.key === 'w' && this.direction !== EDirection.down && this.direction !== EDirection.up) {
					this.direction = EDirection.up
					this.stack.unshift({ position: this.head.position, direction: this.direction })
				}

				if (ev.key === 's' && this.direction !== EDirection.up && this.direction !== EDirection.down) {
					this.direction = EDirection.down
					this.stack.unshift({ position: this.head.position, direction: this.direction })
				}

				//console.log(this.stack[0].position)

			})
			window.addEventListener('keyup', (ev) => {
			})

			this.direction = EDirection.up
			this.pressKey = false
			this.midleSnakeInstance = new Array(50)
			this.midleSnakeNode = new Array(50)
			this.midle = model.get('midle')
			for (let i = 0; i < 1; i++) {
				this.midleSnakeInstance[i] = new Mat4
				//this.midleSnakeInstance[i].scale(new Vec3)
				this.midleSnakeNode[i] = new SnakePart(this.midle, new Vec3(this.arenaCollision[pos].x, this.arenaCollision[pos].y, 0.05))
				this.midleSnakeNode[i].id = i
				this.midleSnakeNode[i].rotateDirection = EDirection.up
			}
			this.midle.createInstance(this.midleSnakeInstance)

			this.head = new SnakePart(model.get('head'), new Vec3(this.arenaCollision[pos].x, this.arenaCollision[pos].y, 0.05))
			this.head.rotateDirection = EDirection.up
			this.tail = new SnakePart(model.get('tail'), new Vec3(this.arenaCollision[pos].x, this.arenaCollision[pos].y, 0.05))
			this.tail.rotateDirection = EDirection.up
			this.up = model.get('up')
			const random = getRandomInt(0, this.arenaCollision.length)
			this.powerUpCell = random
			this.up.position(new Vec3(this.arenaCollision[random].x, this.arenaCollision[random].y, 0.1))
			this.up.scale(new Vec3(0.05, 0.05, 0.05))
			this.cell = 0
			this.stack = new Array()
			this.snakeSize = 1
			this.in = 0.1

		}

		update(delta) {
			let speed = this.speed * delta
			this.cam.identity()
			this.cam.rotation(new Vec3(0.7, 0, 0))
			this.cam.position(new Vec3(0, 1, -2).subtract(this.head.position))

			switch (this.direction) {
				case EDirection.up:
					this.head.rotateDirection = EDirection.up
					break
				case EDirection.down:
					this.head.rotateDirection = EDirection.down
					break
				case EDirection.left:
					this.head.rotateDirection = EDirection.left
					break
				case EDirection.right:
					this.head.rotateDirection = EDirection.right
					break
			}

			this.midleSnakeNode.forEach((m) => {
				this.stack.forEach((s, i) => {
					if (m.position.equal(s.position, 0.005)) {
						m.position = s.position
						m.rotateDirection = s.direction
					}
					if (this.tail.position.equal(s.position, 0.005)) {
						this.tail.position = s.position
						this.tail.rotateDirection = s.direction
						this.stack.pop()
					}
				})

			})
			this.head.position.z = 0.05
			this.head.update(speed)
			this.midleSnakeNode.forEach((m) => {
				m.update(speed)
			})
			this.tail.update(speed)
			//console.log(this.head.position, this.midleSnakeNode[0].position)
		}

		render(delta) {
			this.arena.render()
			this.up.render()
			this.head.node.render()
			this.midle.render()
			this.tail.node.render()
		}
	}
	const engine = new Engine(new Game())
	engine.run()


	let m = 0.1


	var counter = createCounter(-1.0, 1.0, 0.01)


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