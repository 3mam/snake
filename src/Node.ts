import { gl } from './gl'
import { Shader, Color, BufferData } from './Shader'
import { glbLoad } from './glTF'
import { Mat4, Vec3 } from './Math'
import { currentCamera } from './Camera'
import { BinaryReader } from './BinaryReader'

export class Node extends Mat4 {
	texture: WebGLTexture
	vertex: BufferData
	uv: BufferData
	instance: BufferData
	shader: Shader
	color: Color
	origin: {
		translation: Vec3
		scale: Vec3
		rotate: Vec3
	}

	constructor() {
		super()
		this.origin = {
			translation: new Vec3,
			scale: new Vec3,
			rotate: new Vec3,
		}
	}

	createInstance(mat4: Mat4[]) {
		const data = new Float32Array(mat4.length * 16)

		mat4.forEach((v, i) => {
			data.set(v.get(), i * 16)
		})

		this.instance.count = mat4.length
		gl.bindBuffer(gl.ARRAY_BUFFER, this.instance.id)
		gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
	}

	updateInstance(index: number, mat4: Mat4) {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.instance.id)
		gl.bufferSubData(gl.ARRAY_BUFFER, index * 64, mat4.get())
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
	const file = await glbLoad(name)
	const nodes: Map<string, Node> = new Map()
	const shader = new Shader()
	const texture = gl.createTexture()
	const binary = new BinaryReader(file.buffers[0].uri)
	binary.setOffset(file.bufferViews[file.images[0].bufferView].byteOffset)
	const blob = new Blob([binary.readBytes(file.bufferViews[file.images[0].bufferView].byteLength)], { type: file.images[0].mimeType })

	const splitName = name.split(/(\/|\\)/)
	const tmpDir = splitName.reduce((p, c, i, a) => i !== a.length - 1 ? p + c : p)
	const dir = tmpDir === name ? '' : tmpDir

	shader.setTexture(texture)

	const image = new Image()
	image.src = URL.createObjectURL(blob)
	image.onload = () => {
		gl.bindTexture(gl.TEXTURE_2D, texture)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
		//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
		//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
		//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
		//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
		gl.generateMipmap(gl.TEXTURE_2D)
	}

	const buffer = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
	gl.bufferData(gl.ARRAY_BUFFER, file.buffers[0].uri, gl.STATIC_DRAW)

	file.nodes.forEach((v, i) => {
		const obj = new Node()
		obj.color = { r: 1, g: 1, b: 1, a: 1 }
		obj.shader = shader
		obj.shader.setViewport(obj)
		obj.shader.setColor(obj.color)

		obj.texture = texture

		obj.origin.translation = new Vec3(
			v.translation == void (0) ? 0 : v.translation[0],
			v.translation == void (0) ? 0 : v.translation[1],
			v.translation == void (0) ? 0 : v.translation[2],
		)

		obj.origin.rotate = new Vec3(
			v.rotation == void (0) ? 0 : v.rotation[0],
			v.rotation == void (0) ? 0 : v.rotation[1],
			v.rotation == void (0) ? 0 : v.rotation[2],
		)

		obj.origin.scale = new Vec3(
			v.scale == void (0) ? 1 : v.scale[0],
			v.scale == void (0) ? 1 : v.scale[1],
			v.scale == void (0) ? 1 : v.scale[2],
		)

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
		gl.bufferData(gl.ARRAY_BUFFER, new Mat4().get(), gl.STATIC_DRAW)

		obj.shader.setVertex(obj.vertex)
		obj.shader.setUV(obj.uv)

		nodes.set(v.name, obj)

	})
	return nodes
}