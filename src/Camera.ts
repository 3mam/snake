import { Mat4, Vec3 } from './Math'
import { canvas } from './gl'

export enum CameraType {
	Perspective,
	Ortho,
	None,
}

export class Camera extends Mat4 {
	private fov: number
	private type: CameraType
	private distance: {
		near: number
		far: number
	}
	private aspect: number
	private name: string

	constructor(name: string, type = CameraType.Perspective, fov = 70, near = 0.001, far = 20) {
		super()
		this.name = name
		this.fov = fov
		this.type = type
		this.distance = {
			near: near,
			far: far,
		}
		this.aspect = 0
	}

	useAsCurrent() {
		currentCamera = this
	}

	identity() {
		super.identity()
		this.aspect = canvas.width / canvas.height
		switch (this.type) {
			case CameraType.Perspective:
				this.perspective(this.fov, this.aspect, this.distance.near, this.distance.far)
				break
		}
	}

	setFov(fov: number) {
		this.fov = fov
	}

	zoom(value: number) {
		this.scale(new Vec3(value, value, value))
	}

	getView(): Mat4 {
		return this
	}
}


export var currentCamera: Camera = new Camera('default')
