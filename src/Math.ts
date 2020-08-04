

export function normalize(v) {
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

export function subtractVectors(a: number[], b: number[]) {
	const dst: number[] = new Array(3)
	dst[0] = a[0] - b[0]
	dst[1] = a[1] - b[1]
	dst[2] = a[2] - b[2]
	return dst
}

export function cross(a: number[], b: number[]) {
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