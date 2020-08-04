export default class BinaryReader {
	private array: Uint8Array
	private offset: number

	constructor(array: ArrayBuffer | Uint8Array) {
		array instanceof ArrayBuffer && (this.array = new Uint8Array(array))
		array instanceof Uint8Array && (this.array = array)
		this.offset = 0
	}

	setOffset(offset: number) {
		this.offset = offset
	}
	read(): number {
		return this.array[this.offset++]
	}
	readBytes(size: number): Uint8Array {
		const start = this.offset
		const end = this.offset + size
		this.offset = end
		return this.array.slice(start, end)
	}
	readUInt32(): number {
		const newPosition = this.offset + 4
		const byte = this.array.slice(this.offset, newPosition)
		this.offset = newPosition
		return byte.reduce((p, c, i) => c << (i * 8) | p)
	}
	readString(size: number): string {
		return new TextDecoder("utf-8").decode(this.readBytes(size))
	}
}