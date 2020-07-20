export class Vec3 {
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

	division(n: Vec3 | number): Vec3 {
		if (typeof n === 'number')
			return new Vec3(this.x / n, this.y / n, this.z / n)
		if (n instanceof Vec3)
			return new Vec3(this.x / n.x, this.y / n.y, this.z / n.z)

	}

	equal(n: Vec3, margin: number): boolean {
		const dx = this.x - n.x
		const dy = this.y - n.y
		const dz = this.z - n.z
		const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

		if (distance < margin) {
			return true
		}
		return false
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

	translate(v: Vec3) {
		this.tmpIdentity()
		this.tmp[12] = v.valueX()
		this.tmp[13] = v.valueY()
		this.tmp[14] = v.valueZ()

		this.multiply(this.mat, this.tmp)
	}

	translateX(x: number) {
		this.tmpIdentity()
		this.tmp[12] = x

		this.multiply(this.mat, this.tmp)
	}

	translateY(y: number) {
		this.tmpIdentity()
		this.tmp[13] = y

		this.multiply(this.mat, this.tmp)
	}

	translateZ(z: number) {
		this.tmpIdentity()
		this.tmp[14] = z

		this.multiply(this.mat, this.tmp)
	}

	position(v: Vec3) {
		this.translate(v)
	}

	scale(v: Vec3) {
		this.tmpIdentity()
		this.tmp[0] = v.valueX()
		this.tmp[5] = v.valueY()
		this.tmp[10] = v.valueZ()

		this.multiply(this.mat, this.tmp)
	}

	scaleX(x: number) {
		this.tmpIdentity()
		this.tmp[0] = x

		this.multiply(this.mat, this.tmp)
	}

	scaleY(y: number) {

		this.tmpIdentity()
		this.tmp[5] = y

		this.multiply(this.mat, this.tmp)
	}

	scaleZ(z: number) {
		this.tmpIdentity()
		this.tmp[10] = z

		this.multiply(this.mat, this.tmp)
	}

	rotateX(radian: number) {
		const c = Math.cos(radian)
		const s = Math.sin(radian)

		this.tmpIdentity()
		this.tmp[5] = c
		this.tmp[6] = -s
		this.tmp[9] = s
		this.tmp[10] = c

		this.multiply(this.mat, this.tmp)
	}

	rotateY(radian: number) {
		const c = Math.cos(radian)
		const s = Math.sin(radian)

		this.tmpIdentity()
		this.tmp[0] = c
		this.tmp[2] = s
		this.tmp[8] = -s
		this.tmp[10] = c

		this.multiply(this.mat, this.tmp)
	}

	rotateZ(radian: number) {
		const c = Math.cos(radian)
		const s = Math.sin(radian)

		this.tmpIdentity()
		this.tmp[0] = c
		this.tmp[1] = -s
		this.tmp[4] = s
		this.tmp[5] = c

		this.multiply(this.mat, this.tmp)
	}

	rotation(v: Vec3) {
		this.rotateX(v.valueX())
		this.rotateY(v.valueY())
		this.rotateZ(v.valueZ())
	}

	identity() {
		this.mat.fill(0)
		this.mat[0] = 1
		this.mat[5] = 1
		this.mat[10] = 1
		this.mat[15] = 1
	}

	private tmpIdentity() {
		this.tmp.fill(0)
		this.tmp[0] = 1
		this.tmp[5] = 1
		this.tmp[10] = 1
		this.tmp[15] = 1
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

		this.tmpIdentity()
		this.tmp[0] = f / aspect
		this.tmp[5] = f
		this.tmp[10] = (near + far) * rangeInv
		this.tmp[11] = -1
		this.tmp[14] = near * far * rangeInv * 2
		this.tmp[15] = 0

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
		const m0 = src[0] * dst[0] + src[1] * dst[4] + src[2] * dst[8] + src[3] * dst[12]
		const m1 = src[0] * dst[1] + src[1] * dst[5] + src[2] * dst[9] + src[3] * dst[13]
		const m2 = src[0] * dst[2] + src[1] * dst[6] + src[2] * dst[10] + src[3] * dst[14]
		const m3 = src[0] * dst[3] + src[1] * dst[7] + src[2] * dst[11] + src[3] * dst[15]
		const m4 = src[4] * dst[0] + src[5] * dst[4] + src[6] * dst[8] + src[7] * dst[12]
		const m5 = src[4] * dst[1] + src[5] * dst[5] + src[6] * dst[9] + src[7] * dst[13]
		const m6 = src[4] * dst[2] + src[5] * dst[6] + src[6] * dst[10] + src[7] * dst[14]
		const m7 = src[4] * dst[3] + src[5] * dst[7] + src[6] * dst[11] + src[7] * dst[15]
		const m8 = src[8] * dst[0] + src[9] * dst[4] + src[10] * dst[8] + src[11] * dst[12]
		const m9 = src[8] * dst[1] + src[9] * dst[5] + src[10] * dst[9] + src[11] * dst[13]
		const m10 = src[8] * dst[2] + src[9] * dst[6] + src[10] * dst[10] + src[11] * dst[14]
		const m11 = src[8] * dst[3] + src[9] * dst[7] + src[10] * dst[11] + src[11] * dst[15]
		const m12 = src[12] * dst[0] + src[13] * dst[4] + src[14] * dst[8] + src[15] * dst[12]
		const m13 = src[12] * dst[1] + src[13] * dst[5] + src[14] * dst[9] + src[15] * dst[13]
		const m14 = src[12] * dst[2] + src[13] * dst[6] + src[14] * dst[10] + src[15] * dst[14]
		const m15 = src[12] * dst[3] + src[13] * dst[7] + src[14] * dst[11] + src[15] * dst[15]

		this.mat[0] = m0
		this.mat[1] = m1
		this.mat[2] = m2
		this.mat[3] = m3
		this.mat[4] = m4
		this.mat[5] = m5
		this.mat[6] = m6
		this.mat[7] = m7
		this.mat[8] = m8
		this.mat[9] = m9
		this.mat[10] = m10
		this.mat[11] = m11
		this.mat[12] = m12
		this.mat[13] = m13
		this.mat[14] = m14
		this.mat[15] = m15
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

export function getRandomInt(min: number, max: number): number {
	min = Math.ceil(min)
	max = Math.floor(max)
	return Math.floor(Math.random() * (max - min)) + min
}

export function angleToRadiant(angle: number): number {
	return angle * Math.PI / 180
}