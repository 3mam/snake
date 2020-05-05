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

export enum VarType {
	Int,
	Float,
	Vec2,
	Vec3,
	Vec4,
	Mat3,
	Mat4,
}

enum LocationType {
	Vertex,
	Uniform,
	Texture,
}

type Variable = {
	value: any
	type: VarType
}

type ShaderVar = {
	handle?: number | WebGLUniformLocation
	type: LocationType
	variable: Variable
}

export class Shader {
	program: WebGLProgram
	varList: Map<string, ShaderVar>
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
		this.varList.set('VERTEX', { type: LocationType.Vertex, variable: { value: null, type: VarType.Vec3 } })
		this.varList.set('inUV', { type: LocationType.Vertex, variable: { value: null, type: VarType.Vec2 } })
		this.varList.set('MATRIX', { type: LocationType.Uniform, variable: { value: null, type: VarType.Mat4 } })
		this.varList.set('TEXTURE', { type: LocationType.Texture, variable: { value: null, type: VarType.Vec2 } })
		this.varList.set('COLOR', { type: LocationType.Uniform, variable: { value: null, type: VarType.Vec4 } })

		this.varList.forEach((v, k) => {
			v.type === LocationType.Vertex && (v.handle = this.gl.getAttribLocation(this.program, k))
			v.type === LocationType.Uniform && (v.handle = this.gl.getUniformLocation(this.program, k))
			v.type === LocationType.Texture && (v.handle = this.gl.getUniformLocation(this.program, k))
		})
	}
	update() {
		this.gl.useProgram(this.program)
		this.varList.forEach((v, k) => {
			switch (v.type) {
				case LocationType.Vertex:
					this.gl.bindBuffer(this.gl.ARRAY_BUFFER, v.variable.value)
					this.gl.enableVertexAttribArray(<number>v.handle)
					this.gl.vertexAttribPointer(<number>v.handle, v.variable.type === VarType.Vec2 ? 2 : 3, this.gl.FLOAT, false, 0, 0)
					break
				case LocationType.Texture:
					this.gl.bindTexture(this.gl.TEXTURE_2D, v.variable.value)
					this.gl.uniform1i(v.handle, 0)
					break
				case LocationType.Uniform:
					switch (v.variable.type) {
						case VarType.Mat4:
							this.gl.uniformMatrix4fv(v.handle, false, v.variable.value)
							break
						case VarType.Vec4:
							this.gl.uniform4fv(v.handle, v.variable.value)
							break
						default:
							break
					}
					break
				default:
					break
			}
		})
	}
}