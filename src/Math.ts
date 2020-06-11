export interface ITranslate {
	position(pos: Vec3)
	rotation(pos: Vec3)
	scale(pos: Vec3)
	identity()
}

export class Vec3 {
	x: number
	y: number
	z: number
	constructor(x = 0, y = 0, z = 0) {
		this.x = x
		this.y = y
		this.z = z
	}

	add(n: Vec3 | number): Vec3 {
		if (typeof n === 'number')
			return new Vec3(this.x + n, this.y + n, this.z + n)
		if (n instanceof Vec3)
			return new Vec3(this.x + n.x, this.y + n.y, this.z + n.z)
	}

	subtract(n: Vec3 | number): Vec3 {
		if (typeof n === 'number')
			return new Vec3(this.x - n, this.y - n, this.z - n)
		if (n instanceof Vec3)
			return new Vec3(this.x - n.x, this.y - n.y, this.z - n.z)
	}

	multiply(n: Vec3 | number): Vec3 {
		if (typeof n === 'number')
			return new Vec3(this.x * n, this.y * n, this.z * n)
		if (n instanceof Vec3)
			return new Vec3(this.x * n.x, this.y * n.y, this.z * n.z)
	}

	directionAngle(angle: number): Vec3 {
		const rad = angle * Math.PI / 180
		return new Vec3(this.x + Math.sin(rad), this.y + Math.cos(rad), 0)
	}

	directionRadius(rad: number): Vec3 {
		return new Vec3(this.x + Math.sin(rad), this.y + Math.cos(rad), 0)
	}

	dot(v: Vec3): number {
		const tmp = this.multiply(v)
		return tmp.x + tmp.y + tmp.z
	}

	normalize(): Vec3 {
		const v = new Vec3()
		const length = Math.sqrt(this.dot(this))
		// make sure we don't divide by 0.
		if (length > 0.00001) {
			v.x = this.x / length
			v.y = this.y / length
			v.z = this.z / length
		}
		return v
	}

	slerp(end: Vec3, percent: number): Vec3 {
		const dot = this.dot(end)
		clamp(dot, -1.0, 1.0)
		const theta = Math.acos(dot) * percent
		const relativeVec = end.subtract(this).multiply(dot).normalize()
		return this.multiply(Math.cos(theta)).add(relativeVec.multiply(Math.sin(theta)))
	}
}

export class Mat4 {
	private mat: Float32Array
	private tmp: Float32Array
	constructor() {
		this.mat = new Float32Array([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1,
		])
		this.tmp = new Float32Array(16)
	}

	translate(x: number, y: number, z: number) {
		this.tmp.set([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			x, y, z, 1,
		])
		this.multiply(this.mat, this.tmp)
	}

	scale(x: number, y: number, z: number) {
		this.tmp.set([
			x, 0, 0, 0,
			0, y, 0, 0,
			0, 0, z, 0,
			0, 0, 0, 1,
		])
		this.multiply(this.mat, this.tmp)
	}

	rotateX(radian: number) {
		const c = Math.cos(radian)
		const s = Math.sin(radian)
		this.tmp.set([
			1, 0, 0, 0,
			0, c, -s, 0,
			0, s, c, 0,
			0, 0, 0, 1,
		])

		this.multiply(this.mat, this.tmp)
	}

	rotateY(radian: number) {
		const c = Math.cos(radian)
		const s = Math.sin(radian)
		this.tmp.set([
			c, 0, s, 0,
			0, 1, 0, 0,
			-s, 0, c, 0,
			0, 0, 0, 1,
		])
		this.multiply(this.mat, this.tmp)
	}

	rotateZ(radian: number) {
		const c = Math.cos(radian)
		const s = Math.sin(radian)
		this.tmp.set([
			c, -s, 0, 0,
			s, c, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1,
		])
		this.multiply(this.mat, this.tmp)
	}

	identity() {
		this.mat.set([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1,
		])
	}

	get() {
		return this.mat
	}

	set(mat4: Float32Array) {
		this.mat.set(mat4)
	}

	orthographic(left: number, right: number, bottom: number, top: number, near: number, far: number) {
		this.tmp.set([
			2 / (right - left), 0, 0, 0,
			0, 2 / (top - bottom), 0, 0,
			0, 0, 2 / (near - far), 0,
			(left + right) / (left - right), (bottom + top) / (bottom - top), (near + far) / (near - far), 1,
		])
		this.multiply(this.mat, this.tmp)
	}

	perspective(fov: number, aspect: number, near: number, far: number) {
		const angleToRadiant = fov * Math.PI / 180
		const f = Math.tan(Math.PI * 0.5 - 0.5 * angleToRadiant)
		const rangeInv = 1.0 / (near - far)
		this.tmp.set([
			f / aspect, 0, 0, 0,
			0, f, 0, 0,
			0, 0, (near + far) * rangeInv, -1,
			0, 0, near * far * rangeInv * 2, 0,
		])
		this.multiply(this.mat, this.tmp)
	}

	lookAt(cameraPosition: number[], target: number[], up: number[]) {
		const zAxis = normalize(
			subtractVectors(cameraPosition, target))
		const xAxis = normalize(cross(up, zAxis))
		const yAxis = normalize(cross(zAxis, xAxis))

		this.tmp.set([
			xAxis[0], xAxis[1], xAxis[2], 0,
			yAxis[0], yAxis[1], yAxis[2], 0,
			zAxis[0], zAxis[1], zAxis[2], 0,
			0, 0, 0, 1,
		])

		this.multiply(this.mat, this.tmp)
	}

	private multiply(dst: Float32Array, src: Float32Array) {
		this.mat.set([
			src[0] * dst[0] + src[1] * dst[4] + src[2] * dst[8] + src[3] * dst[12],
			src[0] * dst[1] + src[1] * dst[5] + src[2] * dst[9] + src[3] * dst[13],
			src[0] * dst[2] + src[1] * dst[6] + src[2] * dst[10] + src[3] * dst[14],
			src[0] * dst[3] + src[1] * dst[7] + src[2] * dst[11] + src[3] * dst[15],
			src[4] * dst[0] + src[5] * dst[4] + src[6] * dst[8] + src[7] * dst[12],
			src[4] * dst[1] + src[5] * dst[5] + src[6] * dst[9] + src[7] * dst[13],
			src[4] * dst[2] + src[5] * dst[6] + src[6] * dst[10] + src[7] * dst[14],
			src[4] * dst[3] + src[5] * dst[7] + src[6] * dst[11] + src[7] * dst[15],
			src[8] * dst[0] + src[9] * dst[4] + src[10] * dst[8] + src[11] * dst[12],
			src[8] * dst[1] + src[9] * dst[5] + src[10] * dst[9] + src[11] * dst[13],
			src[8] * dst[2] + src[9] * dst[6] + src[10] * dst[10] + src[11] * dst[14],
			src[8] * dst[3] + src[9] * dst[7] + src[10] * dst[11] + src[11] * dst[15],
			src[12] * dst[0] + src[13] * dst[4] + src[14] * dst[8] + src[15] * dst[12],
			src[12] * dst[1] + src[13] * dst[5] + src[14] * dst[9] + src[15] * dst[13],
			src[12] * dst[2] + src[13] * dst[6] + src[14] * dst[10] + src[15] * dst[14],
			src[12] * dst[3] + src[13] * dst[7] + src[14] * dst[11] + src[15] * dst[15],
		])
	}
}

function normalize(v) {
	const dst: number[] = new Array(3)
	const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
	// make sure we don't divide by 0.
	if (length > 0.00001) {
		dst[0] = v[0] / length
		dst[1] = v[1] / length
		dst[2] = v[2] / length
	}
	return dst
}

function subtractVectors(a: number[], b: number[]) {
	const dst: number[] = new Array(3)
	dst[0] = a[0] - b[0]
	dst[1] = a[1] - b[1]
	dst[2] = a[2] - b[2]
	return dst
}

function cross(a: number[], b: number[]) {
	const dst: number[] = new Array(3)
	dst[0] = a[1] * b[2] - a[2] * b[1]
	dst[1] = a[2] * b[0] - a[0] * b[2]
	dst[2] = a[0] * b[1] - a[1] * b[0]
	return dst
}

export function clamp(x: number, min: number, max: number): number {
	if (x < min)
		x = min
	else if (x > max)
		x = max
	return x
}
