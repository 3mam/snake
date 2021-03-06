import { angleToRadiant } from './Math'
import Mat4 from './Mat4'
import Vec3 from './Vec3'
import Node from './Node'
import BoxCollision from './BoxCollision'
import Color, { IColor } from './Color'

export enum EDirection {
	up,
	down,
	left,
	right,
}

export default class GameObject implements IColor {
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
	private visible: boolean

	constructor(node: Node, position: Vec3, visible: boolean = true, parent: GameObject = null, id: number = 0) {
		this.node = node
		this.id = id
		this.rotate = 0
		this.trace = new Array(16)
		this.parent = parent
		this.direction = EDirection.up
		this.position = position.add(node.origin.translation)
		this.size = node.origin.scale
		this.view = new Mat4
		this.visible = visible
		this.tracePosition = {
			start: 8,
			end: 0,
			gap: 8,
		}

		this.trace.fill({ position: this.position.add(new Vec3(1, 1, 1)), direction: this.rotate })
	}

	setColor(c: Color) {
		this.node.setColor(c)
	}

	collisionWithObject(o: GameObject, margin: number): boolean {
		if (o.visible && this.visible) {
			if (this.position.equal(o.position, margin)) {
				return true
			}
		}
		return false
	}

	collisionWithWall(wall: BoxCollision): boolean {
		return this.visible ? wall.collisionToVec3(this.position) : false
	}

	show() {
		this.visible = true
	}

	hide() {
		this.visible = false
	}

	lastPosition() {
		return this.trace[this.tracePosition.end]
	}

	currentPosition() {
		return this.position
	}

	changePosition(position: Vec3) {
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

		if (this.visible) {
			this.view.identity()
			this.view.translate(this.position)
			this.view.scale(this.size)
			this.view.rotateZ(this.rotate)
			this.node.updateInstance(this.id, this.view)
		}
	}

	render() {
		if (this.visible) {
			this.node.render()
		}
	}
}