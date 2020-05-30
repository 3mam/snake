import { Mat4 } from './Math'

export enum CameraType {
	Perspective,
	Ortho,
	None,
}

export class Camera {
	fov: number
	type: CameraType
	view: Mat4
	distance: {
		near: number
		far: number
	}

	private name: string
	constructor(name: string, type = CameraType.Perspective, fov = 70, near = 0.001, far = 20) {
		this.name = name
		this.fov = fov
		this.type = type
		this.distance = {
			near: near,
			far: far,
		}
		this.view = new Mat4()
	}

	setAsCurrent() {
		currentCamera = this
	}
}

export var currentCamera: Camera = new Camera('default')
