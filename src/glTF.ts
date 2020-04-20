import BinaryReader from './BinaryReader'

type Scenes = {
	name: string
	nodes: Array<number>
}

type Node = {
	name: string
	rotation: Array<number>
	scale: Array<number>
	translation: Array<number>
}

type Children = {
	children: Array<number>
	name: string
	rotation: Array<number>
	scale: Array<number>
	translation: Array<number>
}

type Materials = {
	doubleSided: boolean
	name: string
	pbrMetallicRoughness: object
}

type Skins = {
	inverseBindMatrices: number
	joints: Array<number>
	name: string
}

type Accessors = {
	bufferView: number
	componentType: number
	count: number
	max: Array<number>
	min: Array<number>
	type: string
}

type BufferViews = {
	buffer: number
	byteLength: number
	byteOffset: number
}

type Buffers = {
	byteLength: number
	uri: Uint8Array
}

type glTF = {
	asset: {
		generator: string
		version: string
	}
	scene: number
	scenes: Scenes
	nodes: Array<Node | Children>
	materials: Array<Materials>
	skins: Array<Skins>
	accessors: Array<Accessors>
	bufferViews: Array<BufferViews>
	buffers: Array<Buffers>
}


export default async function glbLoad(name: string) {
	const data = await (await (await fetch(name)).blob()).arrayBuffer()
	const dataStream = new BinaryReader(data)

	const error = (n: string): never => {
		throw n
	}

	dataStream.readUInt32() !== 0x46546C67 && error('this is not glTF file')
	dataStream.readUInt32() !== 2 && error('this file is incompatible witch glTF version 2')

	dataStream.readUInt32() //file size
	const chunkJsonSize = dataStream.readUInt32()

	const chunkType = (chunk: number, chunkSize: number): any => {
		switch (chunk) {
			case 0x4E4F534A: return <glTF>JSON.parse(dataStream.readString(chunkSize))
			case 0x004E4942: return dataStream.readBytes(chunkSize)
			default: error('Something wrong with chunk type')
		}
	}

	const jsonChunk = chunkType(dataStream.readUInt32(), chunkJsonSize)

	//n is pointer to object storage in array buffers.
	jsonChunk.buffers.forEach((n: Buffers) => {
		const chunkSize = dataStream.readUInt32()
		n.uri = chunkType(dataStream.readUInt32(), chunkSize)
	})
	console.log(jsonChunk)
	return jsonChunk
}