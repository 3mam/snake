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
	constructor(node: Node, position: Vec3, parent: GameObject = null, id: number = 0) {
		this.node = node
		this.id = id
		this.rotate = 0
		this.trace = new Array()
		this.parent = parent
		this.direction = EDirection.up
		this.position = position.add(node.origin.translation)
		this.size = node.origin.scale
		this.view = new Mat4
		for (let i = 0; i < 5; i++) {
			this.trace.unshift({ position: this.position, direction: this.rotate })
		}
	}

	lastPosition() {
		return this.trace.pop()
	}

	currentPosition() {
		return this.position
	}

	changeCurrentPosition(position: Vec3) {
		this.position = position
	}

	callParent() {
		return this.parent
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
		this.trace.unshift({ position: this.position, direction: this.rotate })
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