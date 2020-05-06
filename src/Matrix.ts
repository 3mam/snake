export class Matrix4x4 {
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
		this.multiplyMatrices4x4(this.mat, this.tmp)
	}

	scale(x: number, y: number, z: number) {
		this.tmp.set([
			x, 0, 0, 0,
			0, y, 0, 0,
			0, 0, z, 0,
			0, 0, 0, 1,
		])
		this.multiplyMatrices4x4(this.mat, this.tmp)
	}

	rotateX(z: number) {
		const cos = Math.cos(z)
		const sin = -Math.sin(z)
		this.tmp.set([
			1, 0, 0, 0,
			0, cos, -sin, 0,
			0, sin, cos, 0,
			0, 0, 0, 1,
		])
		this.multiplyMatrices4x4(this.mat, this.tmp)
	}

	rotateY(z: number) {
		const cos = Math.cos(z)
		const sin = -Math.sin(z)
		this.tmp.set([
			cos, 0, -sin, 0,
			0, 1, 0, 0,
			sin, 0, cos, 0,
			0, 0, 0, 1,
		])
		this.multiplyMatrices4x4(this.mat, this.tmp)
	}

	rotateZ(z: number) {
		const cos = Math.cos(z)
		const sin = -Math.sin(z)
		this.tmp.set([
			cos, -sin, 0, 0,
			sin, cos, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1,
		])
		this.multiplyMatrices4x4(this.mat, this.tmp)
	}

	reset() {
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

	private multiplyMatrices4x4(dst: Float32Array, src: Float32Array) {
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