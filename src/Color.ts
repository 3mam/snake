export default class Color {
	r: number
	g: number
	b: number
	a: number

	constructor(r = 1, g = 1, b = 1, a = 1) {
		this.r = r
		this.g = g
		this.b = b
		this.a = a
	}
	setRGBA(r: number, g: number, b: number, a: number) {
		this.r = r
		this.g = g
		this.b = b
		this.a = a
	}

	valueR() {
		return this.r
	}

	valueG() {
		return this.g
	}

	valueB() {
		return this.b
	}

	valueA() {
		return this.a
	}

}