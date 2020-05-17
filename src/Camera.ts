import { Matrix4x4 } from './Matrix'

export class Camera {
	private camera: Matrix4x4
	private name: string
	constructor(name: string) {
		this.camera = new Matrix4x4()
		this.name = name
	}
	setAsDefault() {
		currentCamera = this
	}
}


export var currentCamera: Camera = new Camera('default')
