import { gl } from './gl'
import { Shader, Color, BufferData } from './Shader'
import { gltfLoad } from './glTF'
import { Matrix4x4 } from './Matrix'
import { currentCamera } from './Camera'

export class Node {
	texture: WebGLTexture
	vertex: BufferData
	uv: BufferData
	shader: Shader
	color: Color
	viewport: Matrix4x4
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
		this.shader.setCamera(currentCamera)
		this.shader.setColor(this.color)
		this.shader.setVertex(this.vertex)
		this.shader.setUV(this.uv)
		this.shader.update()
		gl.drawArrays(gl.TRIANGLES, 0, this.vertex.count)
	}
}

export async function loadNode(name: string): Promise<Map<string, Node>> {
	const file = await gltfLoad(name)
	const nodes: Map<string, Node> = new Map()
	const shader = new Shader()
	const texture = gl.createTexture()
	const splitName = name.split(/(\/|\\)/)
	const tmpDir = splitName.reduce((p, c, i, a) => i !== a.length - 1 ? p + c : p)
	const dir = tmpDir === name ? '' : tmpDir

	shader.setTexture(texture)

	const image = new Image()
	image.src = dir + file.images[0].uri
	image.onload = () => {
		gl.bindTexture(gl.TEXTURE_2D, texture)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
	}

	const blob = await (await (await fetch(dir + file.buffers[0].uri)).blob()).arrayBuffer()
	const model = new Uint8Array(blob)
	const buffer = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
	gl.bufferData(gl.ARRAY_BUFFER, model, gl.STATIC_DRAW)

	file.nodes.forEach((v, i) => {
		const obj = new Node()
		obj.viewport = new Matrix4x4()
		obj.color = { r: 1, g: 1, b: 1, a: 1 }
		obj.shader = shader
		obj.shader.setViewport(obj.viewport)
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
			id: buffer,
			count: file.accessors[position].count,
			offset: file.bufferViews[positionBufferView].byteOffset,
			size: file.bufferViews[positionBufferView].byteLength,
		}
		obj.uv = {
			id: buffer,
			count: file.accessors[texcoord].count,
			offset: file.bufferViews[texcoordBufferView].byteOffset,
			size: file.bufferViews[texcoordBufferView].byteLength,
		}
		obj.shader.setVertex(obj.vertex)
		obj.shader.setUV(obj.uv)

		nodes.set(v.name, obj)

	})
	return nodes
}