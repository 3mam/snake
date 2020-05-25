import { gl } from './gl'
import { Shader, Color, BufferData, Vec3 } from './Shader'
import { gltfLoad } from './glTF'
import { Matrix4x4 } from './Matrix'
import { currentCamera } from './Camera'

export class Node {
	texture: WebGLTexture
	vertex: BufferData
	uv: BufferData
	instance: BufferData
	shader: Shader
	color: Color
	viewport: Matrix4x4
	pivot: {
		x: number
		y: number
		z: number
	}
	position: {
		x: number
		y: number
		z: number
	}
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


	constructor() {
		this.pivot = {
			x: 0,
			y: 0,
			z: 0,
		}
	}

	createInstance(mat4: Array<Matrix4x4>) {
		const data = new Float32Array(mat4.length * 16)

		mat4.forEach((v, i) => {
			data.set(v.get(), i * 16)
		})

		console.log(mat4.length, data.length)
		this.instance.count = mat4.length
		gl.bindBuffer(gl.ARRAY_BUFFER, this.instance.id)
		gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
	}

	render() {
		this.shader.setTexture(this.texture)
		this.shader.setViewport(this)
		this.shader.setCamera(currentCamera)
		this.shader.setColor(this.color)
		this.shader.setVertex(this.vertex)
		this.shader.setUV(this.uv)
		this.shader.setInstance(this.instance)
		this.shader.update()
		gl.drawArraysInstanced(gl.TRIANGLES, 0, this.vertex.count, this.instance.count)
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
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
		//gl.generateMipmap(gl.TEXTURE_2D)
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
		obj.shader.setViewport(obj)
		obj.shader.setColor(obj.color)

		obj.texture = texture

		obj.position = {
			x: v.translation == void (0) ? 0 : v.translation[0],
			y: v.translation == void (0) ? 0 : v.translation[1],
			z: v.translation == void (0) ? 0 : v.translation[2],
		}
		obj.rotation = {
			x: v.rotation == void (0) ? 0 : v.rotation[0],
			y: v.rotation == void (0) ? 0 : v.rotation[1],
			z: v.rotation == void (0) ? 0 : v.rotation[2],
		}
		obj.scale = {
			x: v.scale == void (0) ? 1 : v.scale[0],
			y: v.scale == void (0) ? 1 : v.scale[1],
			z: v.scale == void (0) ? 1 : v.scale[2],
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
		obj.instance = {
			id: gl.createBuffer(),
			count: 1,
			offset: 0,
			size: 0,
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, obj.instance.id)
		gl.bufferData(gl.ARRAY_BUFFER, new Matrix4x4().get(), gl.STATIC_DRAW)

		obj.shader.setVertex(obj.vertex)
		obj.shader.setUV(obj.uv)

		nodes.set(v.name, obj)

	})
	return nodes
}