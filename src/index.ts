import './style.css'
import './index.html'
import { gl, glInit, canvas } from './gl'
import { loadNode, Node } from './Node'
import { BinaryReader } from './BinaryReader'
import { glbLoad, gltfLoad } from './glTF'
import { Mat4, Vec3, getRandomInt } from './Math'
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
	collision: Circle

	constructor(node: Node, position: Vec3) {
		this.rotate = 0
		this.angle = 0
		this.id = 0
		this.cell = 0
		this.node = node
		this.view = new Mat4
		this.position = this.node.origin.translation.add(position)
		this.collision = new Circle(this.position.x, this.position.y, 0.005)
		this.rotateSpeed = 10
	}

	moveTo(n: number) {
		this.position = this.position.add(new Vec3(0, 0, 0).reversDirectionRadius(this.rotate).multiply(n))
	}

	update(speed: number) {
		this.position = this.position.add(new Vec3().directionRadius(this.rotate).multiply(speed))

		if (this.rotate < this.angle && this.rotateDirection == EDirection.left)
			this.angle += -speed * this.rotateSpeed
		else if (this.rotate > this.angle && this.rotateDirection == EDirection.right)
			this.angle += speed * this.rotateSpeed
		else
			this.angle = this.rotate

		this.view.identity()
		this.view.translate(this.position)
		this.view.rotateZ(this.angle)
		this.node.updateInstance(this.id, this.view)
	}

	collisionTo(v: Circle): boolean {
		if (this.collision.moveTo(this.position).collisionTo(v))
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
			cell: number
			direction: number
		}[]
		in: number

		async init() {
			const model = await loadNode('./data/snake.gltf')
			this.arena = model.get('arena')

			this.cam = new Camera('main')
			this.cam.setAsCurrent()

			const area = new Array(16 * 16)
			this.arenaCollision = new Array(16 * 16)
			for (let y = 0; y < 16; y++) {
				for (let x = 0; x < 16; x++) {
					const mat4 = new Mat4()
					let wall = 0.0
					//if (x === 0 || x === 31 || y === 0 || y === 31) wall = 0.05
					mat4.translate(new Vec3(x * 0.136, x % 2 == 0 ? y * 0.156 + 0.08 : y * 0.156, wall))
					mat4.rotateZ(90 * Math.PI / 180)
					area[(x * 16) + y] = mat4

					this.arenaCollision[(x * 16) + y] = new Circle(x * 0.136, x % 2 == 0 ? y * 0.156 + 0.08 : y * 0.156, 0.0025)

					wall = 0.0
				}
			}

			this.arena.createInstance(area)
			this.speed = 0.45

			const pos = this.arenaCollision.length / 2
			this.controlCollision = new Circle(this.arenaCollision[pos].x, this.arenaCollision[pos].y, 0.1)
			window.addEventListener('keydown', (ev) => {
				if (ev.key === 'a')
					this.direction = EDirection.left

				if (ev.key === 'd')
					this.direction = EDirection.right


			})
			window.addEventListener('keyup', (ev) => {
			})

			this.pressKey = false
			this.midleSnakeInstance = new Array(50)
			this.midleSnakeNode = new Array(50)
			this.midle = model.get('midle')
			for (let i = 0; i < 100; i++) {
				this.midleSnakeInstance[i] = new Mat4
				this.midleSnakeInstance[i].scale(new Vec3)
				this.midleSnakeNode[i] = new SnakePart(this.midle, new Vec3(this.arenaCollision[pos].x, this.arenaCollision[pos].y, 0.05))
			}

			this.midle.createInstance(this.midleSnakeInstance)

			this.head = new SnakePart(model.get('head'), new Vec3(this.arenaCollision[pos].x, this.arenaCollision[pos].y, 0.05))
			this.tail = new SnakePart(model.get('tail'), new Vec3(this.arenaCollision[pos].x, this.arenaCollision[pos].y, 0.05))
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
			this.cam.position(new Vec3(0, 0.8, -1).subtract(this.head.position))
			this.in += 0.01

			//this.cam.position(new Vec3(-4 - this.x, -4 - this.y, - 1))

			this.head.update(speed)
			this.midleSnakeNode.forEach((m) => {
				m.update(speed)
			})
			this.tail.update(speed)


			this.arenaCollision.forEach((v, i) => {
				if (this.pressKey) {
					this.pressKey = false

				}

				if (this.head.collisionTo(v) && this.cell !== i) {
					if (i === this.powerUpCell) {
						const lastNode = this.midleSnakeNode[this.snakeSize]
						lastNode.id = this.snakeSize
						lastNode.moveTo(-lastNode.node.origin.translation.y * this.snakeSize)
						this.tail.moveTo(-lastNode.node.origin.translation.y)
						this.snakeSize++
						const random = getRandomInt(0, this.arenaCollision.length)
						this.powerUpCell = random
						this.up.identity()
						this.up.position(new Vec3(this.arenaCollision[random].x, this.arenaCollision[random].y, 0.1))
						this.up.scale(new Vec3(0.05, 0.05, 0.05))
					}
					switch (this.direction) {
						case EDirection.left:
							this.head.rotateDirection = EDirection.left
							this.head.rotate += -60 * Math.PI / 180
							break
						case EDirection.right:
							this.head.rotateDirection = EDirection.right
							this.head.rotate += 60 * Math.PI / 180
							break
						case EDirection.up:
							break
					}
					this.direction = EDirection.up

					this.head.position = new Vec3(v.x, v.y, 0.05)
					this.cell = i
					this.stack.unshift({ cell: i, direction: this.head.rotate })

					//console.log(this.stack)
				}

				this.stack.forEach((o) => {
					this.midleSnakeNode.forEach((m) => {
						if (m.collisionTo(v) && o.cell === i && o.cell !== m.cell) {
							m.rotate = o.direction
							m.position = new Vec3(v.x, v.y, 0.05)
							m.cell = o.cell
							//console.log(this.midle.position)
						}
					})

					if (this.tail.collisionTo(v) && o.cell === i) {
						this.tail.rotate = o.direction
						this.tail.position = new Vec3(v.x, v.y, 0.05)
						this.stack.pop()
					}
				})
			})

			// this.head.identity()
			// this.head.position(this.headPosition)
			// this.head.rotation(new Vec3(0, 0, this.angle))

			// this.midle.identity()
			// const midle = new Mat4()
			// midle.translate(this.midle.origin.translation.add(this.headPosition))
			// midle.rotateZ(this.angle)
			// this.midle.updateInstance(0, midle)
			// this.tail.identity()
			// this.tail.position(this.tail.origin.translation.add(this.headPosition))
			// this.tail.rotation(new Vec3(0, 0, this.angle))

			// this.arenaCollision.forEach((v, i) => {
			// 	if (this.headCollision.moveTo(this.headPosition).collisionTo(v) && this.id !== i) {
			// 		this.rotate += -60 * Math.PI / 180
			// 		this.id = i
			// 		this.headPosition = new Vec3(v.x, v.y, 0.05)
			// 		//this.stack.unshift({ cell: this.id, direction: -60 * Math.PI / 180 })
			// 		//console.log(this.stack)
			// 		const test = new Mat4()
			// 		test.translateZ(0.1)
			// 		this.arena.updateInstance(i, test)
			// 	}
			// })

			// if (this.rotate < this.angle) {
			// 	this.angle += -this.speed * 10
			// } else {
			// 	this.angle = this.rotate
			// }



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