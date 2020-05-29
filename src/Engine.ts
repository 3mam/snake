import { gl, glInit } from './gl'

export interface ILoop {
	init(): void
	update(step: number): void
	render(delta: number): void
}

export class Engine {
	private loop
	constructor(loop: ILoop) {
		this.loop = loop
		glInit('#glCanvas')
		gl.enable(gl.DEPTH_TEST)
		gl.enable(gl.STENCIL_TEST)
		gl.enable(gl.BLEND)
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
		gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE)
	}

	async run() {
		await this.loop.init()
		let delta = 0
		let now = 0
		let last = 0
		let step = (1 / 60) //* 5

		const loop = () => {
			now = performance.now()
			delta = delta + Math.min(1, (now - last) / 1000)
			gl.clearColor(0.0, 0.5, 0.0, 1.0)
			gl.clearStencil(0)
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT)

			gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)

			while (delta > step) {
				delta = delta - step
				this.loop.update(step)
			}
			this.loop.render(delta)
			last = now
			requestAnimationFrame(loop)
		}
		requestAnimationFrame(loop)
	}
}