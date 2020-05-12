import { gl } from './gl'
import { Shader } from './Shader'
import { glbLoad } from './glTF'
import { BinaryReader } from './BinaryReader'
import { Matrix4x4 } from './Matrix'

export class ObjectModel {
	texture: WebGLTexture
	uv: WebGLBuffer
	vertex: {
		id: WebGLBuffer
		count: number
	}
	shader: Shader
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
		this.shader.update()
		gl.bindTexture(gl.TEXTURE_2D, this.texture)
		gl.drawArrays(gl.TRIANGLES, 0, this.vertex.count)
	}
}
