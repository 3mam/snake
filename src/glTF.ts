import BinaryReader from './BinaryReader'

const glbLoad = async (name) => {
	const data = await (await (await fetch(name)).blob()).arrayBuffer()
	const dataStream = new BinaryReader(data)

	const error = n => {
		throw n
	}

	dataStream.readUInt32() !== 0x46546C67 && error('this is not glTF file')
	dataStream.readUInt32() !== 2 && error('this file is incompatible witch glTF version 2')

	dataStream.readUInt32() //file size
	const chunkJsonSize = dataStream.readUInt32()

	const chunkType = (chunk, chunkSize) => {
		const select = {
			0x4E4F534A: () => JSON.parse(dataStream.readString(chunkSize)),
			0x004E4942: () => dataStream.readBytes(chunkSize),
			0: () => error('Something wrong with chunk type'),
		}
		return (select[chunk] || select[0])()
	}

	const jsonChunk = chunkType(dataStream.readUInt32(), chunkJsonSize)

	//n is pointer to object storage in array buffers.
	jsonChunk.buffers.forEach(n => {
		const chunkSize = dataStream.readUInt32()
		n.uri = chunkType(dataStream.readUInt32(), chunkSize)
	})
	return jsonChunk
}
export default glbLoad