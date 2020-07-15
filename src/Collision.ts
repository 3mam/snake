import { Vec3 } from './Math'

export class Circle {
	x: number
	y: number
	r: number

	constructor(x: number, y: number, r: number) {
		this.x = x
		this.y = y
		this.r = r
	}

	collisionTo(c: Circle): boolean {
		const dx = this.x - c.x
		const dy = this.y - c.y
		const distance = Math.sqrt(dx * dx + dy * dy)

		if (distance < this.r + c.r) {
			return true
		}
		return false
	}

	moveTo(v: Vec3): Circle {
		return new Circle(v.valueX(), v.valueY(), this.r)
	}
}