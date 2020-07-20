import { Vec3, Mat4, angleToRadiant } from './Math'
import { Node } from './Node'

export enum EDirection {
	up,
	down,
	left,
	right,
}

export class GameObject {
	private node: Node
	private view: Mat4
	private position: Vec3
	private size: Vec3
	private rotate: number
	private direction: EDirection
	private id: number
	private parent: GameObject
	private trace: {
		position: Vec3
		direction: EDirection
	}[]
	private tracePosition: {
		start: number
		end: number
		gap: number
	}

	constructor(node: Node, position: Vec3, parent: GameObject = null, id: number = 0) {
		this.node = node
		this.id = id
		this.rotate = 0
		this.trace = new Array(16)
		this.parent = parent
		this.direction = EDirection.up
		this.position = position.add(node.origin.translation)
		this.size = node.origin.scale
		this.view = new Mat4
		this.tracePosition = {
			start: 5,
			end: 0,
			gap: 5,
		}

		this.trace.fill({ position: this.position, direction: this.rotate })

	}

	lastPosition() {
		return this.trace[this.tracePosition.end]
	}

	currentPosition() {
		return this.position
	}

	changeCurrentPosition(position: Vec3) {
		this.position = position
	}

	changeParent(parent: GameObject) {
		this.parent = parent
	}

	callParent() {
		return this.parent
	}

	changeSize(size: Vec3) {
		this.size = size
	}

	lookDirection(look: EDirection) {
		this.direction = look
	}

	rotateAt(value: number) {
		this.rotate = value
	}

	resize(value: Vec3) {
		this.size = value
	}

	move(value: number) {
		switch (this.direction) {
			case EDirection.up:
				this.position = this.position.add(new Vec3(0, value, 0))
				this.rotate = angleToRadiant(0)
				break
			case EDirection.down:
				this.position = this.position.add(new Vec3(0, -value, 0))
				this.rotate = angleToRadiant(180)
				break
			case EDirection.left:
				this.position = this.position.add(new Vec3(-value, 0, 0))
				this.rotate = angleToRadiant(-90)
				break
			case EDirection.right:
				this.position = this.position.add(new Vec3(value, 0, 0))
				this.rotate = angleToRadiant(90)
				break
		}
	}

	update() {
		this.trace[this.tracePosition.start] = { position: this.position, direction: this.rotate }
		this.tracePosition.start++
		this.tracePosition.end++
		this.tracePosition.start > this.tracePosition.gap ? this.tracePosition.start = 0 : null
		this.tracePosition.end > this.tracePosition.gap ? this.tracePosition.end = 0 : null



		this.view.identity()
		this.view.translate(this.position)
		this.view.scale(this.size)
		this.view.rotateZ(this.rotate)
		this.node.updateInstance(this.id, this.view)
	}

	render() {
		this.node.render()
	}

}