import { BinaryReader } from './BinaryReader'

export type Scenes = {
	name: string
	nodes: number[]
}

export type Node = {
	name: string
	mesh: number
	rotation: number[]
	scale: number[]
	translation: number[]
	children: number[]
}

export type Materials = {
	doubleSided: boolean
	name: string
	pbrMetallicRoughness: object
}

export type Skins = {
	inverseBindMatrices: number
	joints: number[]
	name: string
}

export type Accessors = {
	bufferView: number
	componentType: number
	count: number
	max: number[]
	min: number[]
	type: string
}

export type BufferViews = {
	buffer: number
	byteLength: number
	byteOffset: number
}

export type Buffers = {
	byteLength: number
	uri: Uint8Array
}

export type Images = {
	bufferView: number
	mimeType: string
	name: string
	uri: string
}

export type Attributes = {
	POSITION: number
	NORMAL: number
	TANGENT: number
	TEXCOORD_0: number
	TEXCOORD_1: number
	COLOR_0: number
	JOINTS_0: number
	WEIGHTS_0: number
}

export type Primitives = {
	attributes: Attributes
	indices: number
	material: number
}

export type Meshes = {
	name: string
	primitives: Primitives[]
}

export type glTF = {
	asset: {
		generator: string
		version: string
	}
	scene: number
	scenes: Scenes
	nodes: Node[]
	materials: Materials[]
	skins: Skins[]
	accessors: Accessors[]
	bufferViews: BufferViews[]
	buffers: Buffers[]
	images: Images[]
	meshes: Meshes[]
}


export async function glbLoad(name: string): Promise<glTF> {
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

	const jsonChunk: glTF = chunkType(dataStream.readUInt32(), chunkJsonSize)
	//n is pointer to object storage in array buffers.
	jsonChunk.buffers.forEach((n: Buffers) => {
		const chunkSize = dataStream.readUInt32()
		n.uri = chunkType(dataStream.readUInt32(), chunkSize)
	})
	return jsonChunk
}

export async function gltfLoad(name: string): Promise<glTF> {
	const data = await (await fetch(name)).json()
	return <glTF>data
}