import './style.css'
import './index.html'
import { loadNode, Node } from './Node'
import { Mat4, Vec3, getRandomInt, angleToRadiant } from './Math'
import { Camera } from './Camera'
import { Engine, ILoop } from './Engine'
import { Circle } from './Collision'
import { GameObject, EDirection } from './GameObject'

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

window.onload = () => {
	class Game implements ILoop {
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
		stack: {
			position: Vec3
			direction: number
		}[]

		async init() {

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

			const model = await loadNode('./data/snake.gltf')
			this.arena = model.get('arena')

			this.cam = new Camera('main')
			this.cam.setAsCurrent()

			const area = new Array(16 * 16)
			this.arenaSpawnPoint = new Array(16 * 16)
			for (let y = 0; y < 16; y++) {
				for (let x = 0; x < 16; x++) {
					const mat4 = new Mat4()
					let wall = -0.05
					mat4.translate(new Vec3(x * 0.21, y * 0.21, wall))
					area[(x * 16) + y] = mat4
					this.arenaSpawnPoint[(x * 16) + y] = new Vec3(x * 0.21, y * 0.21, 0.0005)
					wall = 0.0
				}
			}

			this.arena.createInstance(area)
			this.speed = 0.015

			const pos = new Vec3(this.arenaSpawnPoint[this.arenaSpawnPoint.length / 2].x, this.arenaSpawnPoint[this.arenaSpawnPoint.length / 2].y, 0.05)
			this.direction = EDirection.up
			this.midleSnakeInstance = new Array(50)
			this.midleSnakeNode = new Array(50)
			var midle = model.get('midle')

			for (let i = 0; i < 100; i++) {
				this.midleSnakeInstance[i] = new Mat4
				//this.midleSnakeInstance[i].scale(new Vec3)
				this.midleSnakeNode[i] = new GameObject(midle, pos)
				this.midleSnakeNode[i].id = i
				this.midleSnakeNode[i].rotateDirection = EDirection.up
			}
			midle.createInstance(this.midleSnakeInstance)

			this.head = new GameObject(model.get('head'), pos)
			this.head.rotateDirection = EDirection.up
			this.tail = new GameObject(model.get('tail'), pos)
			this.tail.rotateDirection = EDirection.up
			const random = getRandomInt(0, this.arenaSpawnPoint.length)
			this.up = new GameObject(model.get('up'), new Vec3(this.arenaSpawnPoint[random].x, this.arenaSpawnPoint[random].y))
			this.up.scale = new Vec3(0.05, 0.05, 0.05)
			this.stack = new Array()
			this.snakeSize = 1

		}

		update(delta) {
			let speed = this.speed// * delta
			this.cam.identity()
			this.cam.rotation(new Vec3(0.9, 0, angleToRadiant(0)))
			this.cam.position(new Vec3(0, 2, -2).subtract(this.head.position))
			/*tpp
			switch (this.direction) {
				case EDirection.up:
					this.cam.rotation(new Vec3(0.9, 0, angleToRadiant(0)))
					this.cam.position(new Vec3(0, 0.6, -0.5).subtract(this.head.position))
					break
				case EDirection.down:
					this.cam.rotation(new Vec3(0.9, 0, angleToRadiant(180)))
					this.cam.position(new Vec3(0, -0.6, -0.5).subtract(this.head.position))
					break
				case EDirection.left:
					this.cam.rotation(new Vec3(0.9, 0, angleToRadiant(90)))
					this.cam.position(new Vec3(-0.6, 0, -0.5).subtract(this.head.position))
					break
				case EDirection.right:
					this.cam.rotation(new Vec3(0.9, 0, angleToRadiant(-90)))
					this.cam.position(new Vec3(0.6, 0, -0.5).subtract(this.head.position))
					break
			}
			*/


			this.head.rotateDirection = this.direction
			if (this.head.position.equal(this.up.position, 0.1)) {
				const random = getRandomInt(0, this.arenaSpawnPoint.length)
				this.up.position = new Vec3(this.arenaSpawnPoint[random].x, this.arenaSpawnPoint[random].y)
				this.tail.multiplyPosition(this.midleSnakeNode[0].origin.y)
				Object.assign(this.midleSnakeNode[this.snakeSize].position, this.midleSnakeNode[this.snakeSize - 1].position)
				this.midleSnakeNode[this.snakeSize].rotateDirection = this.midleSnakeNode[this.snakeSize - 1].rotateDirection
				this.midleSnakeNode[this.snakeSize].multiplyPosition(this.midleSnakeNode[0].origin.y)
				this.snakeSize++
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
			this.up.update(speed)
		}

		render(delta) {
			this.arena.render()
			this.up.node.render()
			this.head.node.render()
			this.midleSnakeNode[0].node.render()
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