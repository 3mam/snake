import { Mat4 } from './Math'
import { gl, createShader, createProgram, canvas } from './gl'
import { CameraType, Camera } from './Camera'
import { Node } from './Node'

enum Type {
	Vertex,
	Instance,
	Uniform,
	Texture,
	Matrix,
	UV,
	Mat4,
	Float,
	Vec4,
}

type ShaderVar = {
	handle: number | WebGLUniformLocation
	type: Type
	var: any
}

export type Vec3 = {
	x: number
	y: number
	z: number
}

export type Color = {
	r: number
	g: number
	b: number
	a: number
}

export type BufferData = {
	id: WebGLBuffer
	count: number
	offset: number
	size: number
}

export class Shader {
	private program: WebGLProgram
	private varList: Map<string, ShaderVar>
	private viewport: Mat4

	constructor() {

		const vertexShaderSource = `#version 300 es
		in vec4 VERTEX;
		in mat4 INSTANCE;
		in vec2 inUV;
		out vec2 UV;
		uniform mat4 VIEWPORT;
		uniform mat4 CAMERA;
		
		void main() {
			UV = inUV;
			gl_Position = CAMERA * VIEWPORT * INSTANCE * VERTEX;
		}
		`

		const fragmentShaderSource = `#version 300 es
		precision mediump float;
		in vec2 UV;
		out vec4 outColor;
		uniform sampler2D TEXTURE;
		uniform vec4 COLOR;
		void main() {
			outColor = texture(TEXTURE, UV)*COLOR;
		}
		`
		this.viewport = new Mat4()

		const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource)
		const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource)
		this.program = createProgram(vertexShader, fragmentShader)
		this.varList = new Map()
		this.varList.set('VERTEX', { type: Type.Vertex, handle: null, var: null })
		this.varList.set('INSTANCE', { type: Type.Instance, handle: null, var: null })
		this.varList.set('inUV', { type: Type.UV, handle: null, var: null })
		this.varList.set('VIEWPORT', { type: Type.Matrix, handle: null, var: null })
		this.varList.set('CAMERA', { type: Type.Matrix, handle: null, var: null })
		this.varList.set('TEXTURE', { type: Type.Texture, handle: null, var: null })
		this.varList.set('COLOR', { type: Type.Vec4, handle: null, var: null })

		this.varList.forEach((v, k) => {
			switch (v.type) {
				case Type.Vertex:
				case Type.UV:
				case Type.Instance:
					v.handle = gl.getAttribLocation(this.program, k)
					break
				case Type.Texture:
				case Type.Matrix:
				case Type.Mat4:
				case Type.Vec4:
				case Type.Float:
					v.handle = gl.getUniformLocation(this.program, k)
					break
			}
		})
	}

	set(name: string, variable: any) {
		this.varList.get(name).var = variable
	}

	setColor(color: Color) {
		this.varList.get('COLOR').var = [color.r, color.g, color.b, color.a]
	}

	setViewport(view: Mat4) {
		this.varList.get('VIEWPORT').var = view
	}

	setCamera(cam: Camera) {
		this.varList.get('CAMERA').var = cam.view
	}

	setUV(buffer: BufferData) {
		this.varList.get('inUV').var = buffer
	}

	setVertex(buffer: BufferData) {
		this.varList.get('VERTEX').var = buffer
	}

	setTexture(id: WebGLUniformLocation) {
		this.varList.get('TEXTURE').var = id
	}

	setInstance(buffer: BufferData) {
		this.varList.get('INSTANCE').var = buffer
	}

	update() {
		gl.useProgram(this.program)
		this.varList.forEach((v) => {
			switch (v.type) {
				case Type.Vertex:
					gl.bindBuffer(gl.ARRAY_BUFFER, v.var.id)
					gl.enableVertexAttribArray(<number>v.handle)
					gl.vertexAttribPointer(<number>v.handle, 3, gl.FLOAT, false, 12, v.var.offset)
					break
				case Type.UV:
					gl.bindBuffer(gl.ARRAY_BUFFER, v.var.id)
					gl.enableVertexAttribArray(<number>v.handle)
					gl.vertexAttribPointer(<number>v.handle, 2, gl.FLOAT, false, 8, v.var.offset)
					break
				case Type.Texture:
					gl.bindTexture(gl.TEXTURE_2D, v.var)
					gl.uniform1i(v.handle, 0)
					break
				case Type.Matrix:
					gl.uniformMatrix4fv(v.handle, false, v.var.get())
					break
				case Type.Vec4:
					gl.uniform4fv(v.handle, v.var)
					break
				case Type.Float:
					gl.uniform1f(v.handle, v.var)
					break
				case Type.Instance:
					gl.bindBuffer(gl.ARRAY_BUFFER, v.var.id)
					for (let i = 0; i < 4; i++) {
						const loc = <number>v.handle + i
						const offset = i * 16
						gl.enableVertexAttribArray(loc)
						gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 64, offset)
						gl.vertexAttribDivisor(loc, 1)
					}
					break
			}
		})
	}
}