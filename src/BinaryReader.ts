export default class BinaryReader {
	array: Uint8Array
	position: number

	constructor(array: ArrayBuffer | Uint8Array) {
		array instanceof ArrayBuffer && (this.array = new Uint8Array(array))
		array instanceof Uint8Array && (this.array = array)
		this.position = 0
	}
	read(): number {
		return this.array[this.position++]
	}
	readBytes(size: number): Uint8Array {
		const start = this.position
		const end = this.position + size
		this.position = end
		return this.array.slice(start, end)
	}
	readUInt32(): number {
		const newPosition = this.position + 4
		const byte = this.array.slice(this.position, newPosition)
		this.position = newPosition
		return byte.reduce((p, c, i) => c << (i * 8) | p)
	}
	readString(size: number): string {
		return new TextDecoder("utf-8").decode(this.readBytes(size))
	}
} 