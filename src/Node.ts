import { gl } from './gl'
import { Shader, Color } from './Shader'
import { glbLoad } from './glTF'
import { BinaryReader } from './BinaryReader'
import { Matrix4x4 } from './Matrix'

export class Node {
	texture: WebGLTexture
	uv: WebGLBuffer
	vertex: {
		id: WebGLBuffer
		count: number
	}
	shader: Shader
	color: Color
	viewport: Matrix4x4
	camera: Matrix4x4
	position: {
		translation: {
			x: number
			y: number
			z: number
		},
		rotation: {
			x: number
			y: number
			z: number
		}
		scale: {
			x: number
			y: number
			z: number
		}
	}

	constructor() {
	}

	render() {
		this.shader.setTexture(this.texture)
		this.shader.setViewport(this.viewport)
		this.shader.setCamera(this.camera)
		this.shader.setColor(this.color)
		this.shader.setVertex(this.vertex.id)
		this.shader.setUV(this.uv)
		this.shader.update()
		gl.drawArrays(gl.TRIANGLES, 0, this.vertex.count)
	}
}

export async function loadNode(name: string): Promise<Map<string, Node>> {
	const file = await glbLoad(name)
	const nodes: Map<string, Node> = new Map()
	const shader = new Shader()
	const texture = gl.createTexture()
	shader.setTexture(texture)
	const binary = new BinaryReader(file.buffers[0].uri)
	binary.setOffset(file.bufferViews[file.images[0].bufferView].byteOffset)
	const blob = new Blob([binary.readBytes(file.bufferViews[file.images[0].bufferView].byteLength)], { type: file.images[0].mimeType })
	const image = new Image()
	image.src = URL.createObjectURL(blob)
	image.onload = () => {
		gl.bindTexture(gl.TEXTURE_2D, texture)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
	}
	file.nodes.forEach((v, i) => {
		const obj = new Node()
		obj.viewport = new Matrix4x4()
		obj.color = { r: 1, g: 1, b: 1, a: 1 }
		obj.shader = shader
		obj.shader.setViewport(obj.viewport)
		obj.shader.setCamera(obj.viewport)
		obj.shader.setColor(obj.color)

		obj.texture = texture

		obj.position = {
			translation: {
				x: v.translation == void (0) ? 0 : v.translation[0],
				y: v.translation == void (0) ? 0 : v.translation[1],
				z: v.translation == void (0) ? 0 : v.translation[2],
			},
			rotation: {
				x: v.rotation == void (0) ? 0 : v.rotation[0],
				y: v.rotation == void (0) ? 0 : v.rotation[1],
				z: v.rotation == void (0) ? 0 : v.rotation[2],
			},
			scale: {
				x: v.scale == void (0) ? 0 : v.scale[0],
				y: v.scale == void (0) ? 0 : v.scale[1],
				z: v.scale == void (0) ? 0 : v.scale[2],
			}
		}

		const position = file.meshes[v.mesh].primitives[0].attributes.POSITION
		const positionBufferView = file.accessors[position].bufferView
		const texcoord = file.meshes[v.mesh].primitives[0].attributes.TEXCOORD_0
		const texcoordBufferView = file.accessors[texcoord].bufferView

		obj.vertex = {
			count: file.accessors[position].count,
			id: gl.createBuffer()
		}
		obj.shader.setVertex(obj.vertex.id)
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertex.id)
		gl.bufferData(gl.ARRAY_BUFFER, file.buffers[0].uri, gl.STATIC_DRAW,
			file.bufferViews[positionBufferView].byteOffset,
			file.bufferViews[positionBufferView].byteLength)
		obj.uv = gl.createBuffer()
		obj.shader.setUV(obj.uv)
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.uv)
		gl.bufferData(gl.ARRAY_BUFFER, file.buffers[0].uri, gl.STATIC_DRAW,
			file.bufferViews[texcoordBufferView].byteOffset,
			file.bufferViews[texcoordBufferView].byteLength)

		nodes.set(v.name, obj)

	})
	return nodes
}