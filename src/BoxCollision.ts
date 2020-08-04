import Vec3 from './Vec3'

export default class Box {
	x: number
	y: number
	width: number
	height: number
	constructor(x: number, y: number, width: number, height: number) {
		this.x = x
		this.y = y
		this.width = width
		this.height = height
	}

	collisionToVec3(v: Vec3) {
		return (this.x < v.valueX() + 0.1 &&
			this.x + this.width > v.valueX() &&
			this.y < v.valueY() + 0.1 &&
			this.y + this.height > v.valueY())
	}
}