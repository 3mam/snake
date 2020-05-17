import { Matrix4x4 } from './Matrix'

export class Camera {
	camera: Matrix4x4
	private name: string
	constructor(name: string) {
		this.camera = new Matrix4x4()
		this.name = name
	}
	setAsCurrent() {
		currentCamera = this
	}
}


export var currentCamera: Camera = new Camera('default')
