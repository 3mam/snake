import { Matrix4x4 } from './Matrix'
import { gl, createShader, createProgram } from './gl'

enum Type {
	Vertex,
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
	variable: any
}

export class Shader {
	private program: WebGLProgram
	private varList: Map<string, ShaderVar>


	constructor() {

		const vertexShaderSource = `#version 300 es
		in vec4 VERTEX;
		in vec2 inUV;
		out vec2 UV;
		uniform mat4 MATRIX;
		
		void main() {
			UV = inUV;
			gl_Position = MATRIX * VERTEX;
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

		const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource)
		const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource)
		this.program = createProgram(vertexShader, fragmentShader)
		this.varList = new Map()
		this.varList.set('VERTEX', { type: Type.Vertex, handle: null, variable: null })
		this.varList.set('inUV', { type: Type.UV, handle: null, variable: null })
		this.varList.set('MATRIX', { type: Type.Matrix, handle: null, variable: null })
		this.varList.set('TEXTURE', { type: Type.Texture, handle: null, variable: null })
		this.varList.set('COLOR', { type: Type.Vec4, handle: null, variable: null })

		this.varList.forEach((v, k) => {
			switch (v.type) {
				case Type.Vertex:
				case Type.UV:
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
		this.varList.get(name).variable = variable
	}

	setColor(rgba: Float32Array) {
		this.varList.get('COLOR').variable = rgba
	}

	setMatrix(mat: Matrix4x4) {
		this.varList.get('MATRIX').variable = mat
	}

	setUV(id: WebGLBuffer) {
		this.varList.get('inUV').variable = id
	}

	setVertex(id: WebGLBuffer) {
		this.varList.get('VERTEX').variable = id
	}

	setTexture(id: WebGLUniformLocation) {
		this.varList.get('TEXTURE').variable = id
	}

	update() {
		gl.useProgram(this.program)
		this.varList.forEach((v) => {
			switch (v.type) {
				case Type.Vertex:
					gl.bindBuffer(gl.ARRAY_BUFFER, v.variable)
					gl.enableVertexAttribArray(<number>v.handle)
					gl.vertexAttribPointer(<number>v.handle, 3, gl.FLOAT, false, 0, 0)
					break
				case Type.UV:
					gl.bindBuffer(gl.ARRAY_BUFFER, v.variable)
					gl.enableVertexAttribArray(<number>v.handle)
					gl.vertexAttribPointer(<number>v.handle, 2, gl.FLOAT, false, 0, 0)
					break
				case Type.Texture:
					gl.bindTexture(gl.TEXTURE_2D, v.variable)
					gl.uniform1i(v.handle, 0)
					break
				case Type.Matrix:
					gl.uniformMatrix4fv(v.handle, false, v.variable.get())
					v.variable.reset()
					break
				case Type.Vec4:
					gl.uniform4fv(v.handle, v.variable)
					break
				case Type.Float:
					gl.uniform1f(v.handle, v.variable)
					break
			}
		})
	}
}