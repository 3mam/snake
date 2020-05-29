import { Matrix4x4 } from './Math'

export enum CameraType {
	Perspective,
	Ortho,
	None,
}

export class Camera {
	fov: number
	type: CameraType
	distance: {
		near: number
		far: number
	}
	position: {
		x: number
		y: number
		z: number
	}
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

	private name: string
	constructor(name: string, type = CameraType.Perspective, fov = 70, near = 0.001, far = 20) {
		this.name = name
		this.fov = fov
		this.type = type
		this.distance = {
			near: near,
			far: far,
		}
		this.position = {
			x: 0.0,
			y: 0.0,
			z: 0.0,
		}
		this.rotation = {
			x: 0.0,
			y: 0.0,
			z: 0.0,
		}
		this.scale = {
			x: 1.0,
			y: 1.0,
			z: 1.0,
		}
	}

	setAsCurrent() {
		currentCamera = this
	}

	setPosition(x: number, y: number, z: number) {
		this.position.x = x
		this.position.y = y
		this.position.z = z
	}

	setRotation(x: number, y: number, z: number) {
		this.rotation.x = x
		this.rotation.y = y
		this.rotation.z = z
	}

	setScale(x: number, y: number, z: number) {
		this.scale.x = x
		this.scale.y = y
		this.scale.z = z
	}

	setFov(fov: number) {
		this.fov = fov
	}

	zoom(value: number) {
		this.scale.x = value
		this.scale.y = value
		this.scale.z = value
	}
}


export var currentCamera: Camera = new Camera('default')
