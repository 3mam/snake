import { Mat4, Vec3, ITranslate } from './Math'
import { canvas } from './gl'

export enum CameraType {
	Perspective,
	Ortho,
	None,
}

export class Camera implements ITranslate {
	private fov: number
	private type: CameraType
	private view: Mat4
	private distance: {
		near: number
		far: number
	}
	private aspect: number

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
		this.aspect = 0
	}

	setAsCurrent() {
		currentCamera = this
	}

	perspective() {
		this.aspect = canvas.width / canvas.height
		this.view.identity()
		switch (this.type) {
			case CameraType.Perspective:
				this.view.perspective(this.fov, this.aspect, this.distance.near, this.distance.far)
				break
		}
	}

	position(v: Vec3) {
		this.view.translate(v)
	}

	rotation(v: Vec3) {
		this.view.rotateX(v.x)
		this.view.rotateY(v.y)
		this.view.rotateZ(v.z)

	}

	scale(v: Vec3) {
		this.view.scale(v)
	}

	identity() {
		this.view.identity()
	}

	setFov(fov: number) {
		this.fov = fov
	}

	zoom(value: number) {
		this.view.scale(new Vec3(value, value, value))
	}

	getView(): Mat4 {
		return this.view
	}
}


export var currentCamera: Camera = new Camera('default')
