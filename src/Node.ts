import { gl } from './gl'
import { Shader, Color, BufferData, Vec3 } from './Shader'
import { gltfLoad } from './glTF'
import { Mat4 } from './Math'
import { currentCamera } from './Camera'

export class Node {
	texture: WebGLTexture
	vertex: BufferData
	uv: BufferData
	instance: BufferData
	shader: Shader
	color: Color
	view: Mat4
	origin: Mat4

	constructor() {
		this.view = new Mat4()
		this.origin = new Mat4()
	}

	createInstance(mat4: Array<Mat4>) {
		const data = new Float32Array(mat4.length * 16)

		mat4.forEach((v, i) => {
			data.set(v.get(), i * 16)
		})

		this.instance.count = mat4.length
		gl.bindBuffer(gl.ARRAY_BUFFER, this.instance.id)
		gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
	}

	render() {
		this.shader.setTexture(this.texture)
		this.shader.setViewport(this.view)
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
		//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
		//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
		//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
		//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
		gl.generateMipmap(gl.TEXTURE_2D)
	}

	const blob = await (await (await fetch(dir + file.buffers[0].uri)).blob()).arrayBuffer()
	const model = new Uint8Array(blob)
	const buffer = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
	gl.bufferData(gl.ARRAY_BUFFER, model, gl.STATIC_DRAW)

	file.nodes.forEach((v, i) => {
		const obj = new Node()
		obj.color = { r: 1, g: 1, b: 1, a: 1 }
		obj.shader = shader
		obj.shader.setViewport(obj.view)
		obj.shader.setColor(obj.color)

		obj.texture = texture

		obj.origin.translate(
			v.translation == void (0) ? 0 : v.translation[0],
			v.translation == void (0) ? 0 : v.translation[1],
			v.translation == void (0) ? 0 : v.translation[2],
		)
		obj.origin.rotateX(v.rotation == void (0) ? 0 : v.rotation[0])
		obj.origin.rotateY(v.rotation == void (0) ? 0 : v.rotation[1])
		obj.origin.rotateZ(v.rotation == void (0) ? 0 : v.rotation[2])
		obj.origin.scale(
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