import { Vec3, Mat4, angleToRadiant } from './Math'
import { Node } from './Node'

export enum EDirection {
	up,
	down,
	left,
	right,
}

export class GameObject {
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
	scale: Vec3

	constructor(node: Node, position: Vec3) {
		this.rotate = 0
		this.angle = 0
		this.id = 0
		this.cell = 0
		this.node = node
		this.view = new Mat4
		this.scale = this.node.origin.scale
		this.origin = this.node.origin.translation
		this.position = position
		this.position = this.position.add(this.node.origin.translation)
		this.rotateSpeed = 20
	}

	moveTo(n: number) {
		this.position = this.position.add(new Vec3(0, 0, 0).reversDirectionRadius(this.rotate).multiply(n))
	}
	multiplyPosition(value: number) {
		switch (this.rotateDirection) {
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
	update(speed: number) {
		/*
		if (this.rotate < this.angle && this.rotateDirection == EDirection.left)
			this.angle += -speed * this.rotateSpeed
		else if (this.rotate > this.angle && this.rotateDirection == EDirection.right)
			this.angle += speed * this.rotateSpeed
		else
			
			*/
		this.multiplyPosition(speed)
		this.angle = this.rotate
		this.view.identity()
		this.view.translate(this.position)
		this.view.scale(this.scale)
		this.view.rotateZ(this.angle)
		this.node.updateInstance(this.id, this.view)
	}

}