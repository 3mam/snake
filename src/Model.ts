import { gl } from './gl'
import { Shader } from './Shader'

class ObjectModel {
	position: {
		texture: WebGLTexture
		uv: WebGLBuffer
		vertex: {
			id: WebGLBuffer
			count: number
		}
		shader: Shader
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
}