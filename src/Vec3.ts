export default class Vec3 {
	private x: number
	private y: number
	private z: number

	constructor(x = 0, y = 0, z = 0) {
		this.x = x
		this.y = y
		this.z = z
	}

	valueX() {
		return this.x
	}

	valueY() {
		return this.y
	}

	valueZ() {
		return this.z
	}

	copy() {
		return new Vec3(this.x, this.y, this.z)
	}

	add(v: Vec3): Vec3 {
		return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z)
	}

	subtract(v: Vec3): Vec3 {
		return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z)
	}

	multiply(v: Vec3): Vec3 {
		return new Vec3(this.x * v.x, this.y * v.y, this.z * v.z)
	}

	division(v: Vec3): Vec3 {
		return new Vec3(this.x / v.x, this.y / v.y, this.z / v.z)

	}

	equal(v: Vec3, margin: number): boolean {
		const dx = this.x - v.x
		const dy = this.y - v.y
		const dz = this.z - v.z
		const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
		return distance < margin
	}

	directionAngle(angle: number): Vec3 {
		const rad = angle * Math.PI / 180
		return new Vec3(this.x + Math.sin(rad), this.y + Math.cos(rad), 0)
	}

	directionRadius(rad: number): Vec3 {
		return new Vec3(this.x + Math.sin(rad), this.y + Math.cos(rad), 0)
	}

	reversDirectionRadius(rad: number): Vec3 {
		return new Vec3(this.x - Math.sin(rad), this.y - Math.cos(rad), 0)
	}

	dot(v: Vec3): number {
		const tmp = this.multiply(v)
		return tmp.x + tmp.y + tmp.z
	}
}