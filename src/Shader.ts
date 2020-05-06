function createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
	const shader = gl.createShader(type)
	gl.shaderSource(shader, source)
	gl.compileShader(shader)
	const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
	if (success) {
		return shader
	}
	console.log(gl.getShaderInfoLog(shader))
	gl.deleteShader(shader)
}

function createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
	const program = gl.createProgram()
	gl.attachShader(program, vertexShader)
	gl.attachShader(program, fragmentShader)
	gl.linkProgram(program)
	const success = gl.getProgramParameter(program, gl.LINK_STATUS)
	if (success) {
		return program
	}
	console.log(gl.getProgramInfoLog(program))
	gl.deleteProgram(program)
}

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
	private gl: WebGL2RenderingContext

	constructor(gl: WebGL2RenderingContext) {
		this.gl = gl
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

		const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
		const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
		this.program = createProgram(gl, vertexShader, fragmentShader)
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
					v.handle = this.gl.getAttribLocation(this.program, k)
					break
				case Type.Texture:
				case Type.Matrix:
				case Type.Mat4:
				case Type.Vec4:
				case Type.Float:
					v.handle = this.gl.getUniformLocation(this.program, k)
					break
			}
		})
	}

	set(name: string, variable: any): void {
		this.varList.get(name).variable = variable
	}

	get(name: string): any {
		return this.varList.get(name).variable
	}

	update(): void {
		this.gl.useProgram(this.program)
		this.varList.forEach((v) => {
			switch (v.type) {
				case Type.Vertex:
					this.gl.bindBuffer(this.gl.ARRAY_BUFFER, v.variable)
					this.gl.enableVertexAttribArray(<number>v.handle)
					this.gl.vertexAttribPointer(<number>v.handle, 3, this.gl.FLOAT, false, 0, 0)
					break
				case Type.UV:
					this.gl.bindBuffer(this.gl.ARRAY_BUFFER, v.variable)
					this.gl.enableVertexAttribArray(<number>v.handle)
					this.gl.vertexAttribPointer(<number>v.handle, 2, this.gl.FLOAT, false, 0, 0)
					break
				case Type.Texture:
					this.gl.bindTexture(this.gl.TEXTURE_2D, v.variable)
					this.gl.uniform1i(v.handle, 0)
					break
				case Type.Matrix:
					this.gl.uniformMatrix4fv(v.handle, false, v.variable.get())
					v.variable.reset()
					break
				case Type.Vec4:
					this.gl.uniform4fv(v.handle, v.variable)
					break
				case Type.Float:
					this.gl.uniform1f(v.handle, v.variable)
					break
			}
		})
	}
}