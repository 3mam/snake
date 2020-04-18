export default class BinaryReader {
	constructor(arrayBuffer) {
		this.array = new Uint8Array(arrayBuffer)
		this.position = 0
	}
	read() {
		return this.array[this.position++]
	}
	readBytes(size) {
		const start = this.position
		const end = this.position + size
		this.position = end
		return this.array.slice(start, end)
	}
	readUInt32() {
		const newPosition = this.position + 4
		const byte = this.array.slice(this.position, newPosition)
		this.position = newPosition
		return byte.reduce((p, c, i) => c << (i * 8) | p)
	}
	readString(size) {
		return String.fromCharCode.apply(String, this.readBytes(size))
	}
}