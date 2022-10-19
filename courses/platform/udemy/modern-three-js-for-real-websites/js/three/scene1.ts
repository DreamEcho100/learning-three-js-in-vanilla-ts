import { getDirectionalLight, getPlane } from '@utils/common/three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import WebGL from 'three/examples/jsm/capabilities/WebGL';
import {
	DoubleSide,
	MeshPhongMaterial,
	PerspectiveCamera,
	Scene,
	WebGL1Renderer
} from 'three';
import type { DirectionalLight, Mesh, PlaneGeometry } from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';

import { GUI } from 'dat.gui';

// https://gist.github.com/souporserious/b44ea5d04c38c2e7ff32cd1912a17cd0
// https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
// https://github.com/juggle/resize-observer
// const zoomEvent = new Event('zoom');
// let currentRatio = window.devicePixelRatio;

// function checkZooming() {
// 	if (currentRatio !== window.devicePixelRatio) {
// 		window.dispatchEvent(zoomEvent);
// 	}
// }

// window.addEventListener('resize', checkZooming);

// // usage
// window.addEventListener('zoom', () => {
// 	console.log('zoomed!');
// });

const initWorldState = () => ({
	mainPlane: {
		width: 25,
		height: 25,
		widthSegments: 30,
		heightSegments: 30
	}
});

class Scene1 {
	arrForOnDispose: [(() => void)[], (() => void)[], (() => void)[]];
	canvasHolder: Element; // HTMLDivElement;
	requestAnimationFrameId?: number;
	worldState!: ReturnType<typeof initWorldState>;

	camera!: PerspectiveCamera;
	controls!: OrbitControls;
	datDotGui!: GUI;
	renderer!: WebGL1Renderer;
	scene!: Scene;
	stats: Stats | undefined;

	// boxGeometry: Mesh<BoxGeometry, MeshPhongMaterial>;
	directionalFrontLight!: DirectionalLight;
	directionalBackLight!: DirectionalLight;
	mainPlaneGeometry!: Mesh<PlaneGeometry, MeshPhongMaterial>;
	areElementsInit: boolean;

	constructor() {
		if (!WebGL.isWebGLAvailable()) {
			const warning = WebGL.getWebGLErrorMessage();
			alert(warning.textContent);
		}

		const canvasHolder = document.querySelector('.canvasHolder');
		if (!canvasHolder) throw new Error('Can not find canvasHolder');

		this.arrForOnDispose = [
			[],
			[],
			[
				() => {
					this.requestAnimationFrameId &&
						cancelAnimationFrame(this.requestAnimationFrameId);
					this.disposeNode(this.scene, true);
					this.areElementsInit = false;
					this.renderer.dispose();
					this.datDotGui.destroy();
					if (this.renderer.domElement.parentElement)
						this.renderer.domElement.parentElement.removeChild(
							this.renderer.domElement
						);
					if (process.env.NODE_ENV === 'development') {
						this.stats?.end();
						if (this.stats?.domElement.parentElement)
							this.stats.domElement.parentElement.removeChild(
								this.stats.domElement
							);
					}

					const keys = [
						'worldState',
						'scene',
						'camera',
						'renderer',
						'controls',
						'datDotGui',
						'directionalFrontLight',
						'directionalBackLight',
						'mainPlaneGeometry',
						'stats'
					];

					for (const key in keys) {
						delete this[key as keyof this];
					}
				}
			]
		];
		this.canvasHolder = canvasHolder;
		this.requestAnimationFrameId;

		// this.initElements();
		this.areElementsInit = false;
	}

	initCreatingMainPlane = () => {
		// if (!this.mainPlaneGeometry)
		this.mainPlaneGeometry = getPlane(
			this.worldState.mainPlane,
			new MeshPhongMaterial({
				color: 0xff0000,
				side: DoubleSide,
				flatShading: true
			})
		);

		const planeCoordinates = this.mainPlaneGeometry.geometry.attributes.position
			.array as number[];
		// console.log('this.mainPlaneGeometry.geometry', this.mainPlaneGeometry.geometry);
		let i = 0;
		for (; i < planeCoordinates.length; i += 3) {
			planeCoordinates[i + 1] += Math.random() * 0.5;
			planeCoordinates[i + 2] += Math.random() * 1.5;
		}

		this.scene.add(this.mainPlaneGeometry);
	};

	dispose = () => {
		for (let i = 0; i < this.arrForOnDispose.length; i++) {
			const arr = this.arrForOnDispose[i];
			for (let j = 0; j < arr.length; j++) {
				const func = arr[j];
				func();
			}
		}
	};
	disposeMainPlane = () => {
		this.scene.remove(this.mainPlaneGeometry);
		console.log('this.mainPlaneGeometry', this.mainPlaneGeometry);
		// this.mainPlaneGeometry.geometry.dispose();
		this.disposeNode(this.mainPlaneGeometry);
		const key: keyof this = 'mainPlaneGeometry';
		delete this[key];
	};
	// https://stackoverflow.com/a/71755035/13961420
	disposeNode = (node: any, recursive = false) => {
		if (!node) return;

		if (recursive && node.children)
			for (const child of node.children) this.disposeNode(child, recursive);

		node.geometry && node.geometry.dispose();

		if (!node.material) return;

		const materials =
			node.material.length === undefined ? [node.material] : node.material;

		for (const material of materials) {
			for (const key in material) {
				const value = material[key];

				if (value && typeof value === 'object' && 'minFilter' in value)
					value.dispose();
			}

			material && material.dispose();
		}
	};

	init() {
		if (!this.areElementsInit) this.initElements();

		this.scene.add(this.directionalFrontLight, this.directionalBackLight); // this.boxGeometry,

		this.renderer.setClearColor('rgb(0, 0, 0)');

		this.handleKeepPerspectiveCameraAspectRatioOnResize();
		this.update();
	}
	initElements = () => {
		if (this.areElementsInit) return;

		const canvasHolder = document.querySelector('.canvasHolder');
		if (!canvasHolder) throw new Error('Can not find canvasHolder');

		this.scene = new Scene();

		this.camera = new PerspectiveCamera(
			45,
			this.getContainerAspectRatio(),
			0.1,
			1000
		);
		this.camera.position.set(0, 0, 10);
		// this.camera.lookAt(new Vector3(0, 0, 0));

		this.renderer = new WebGL1Renderer({ antialias: true });
		canvasHolder.appendChild(this.renderer.domElement);

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.enableZoom = false;

		// this.boxGeometry = getBox(
		// 	{ width: 1, height: 1, widthSegments: 1, heightSegments: 1 },
		// 	new MeshPhongMaterial({ color: 0x00ff00 })
		// );
		this.directionalFrontLight = getDirectionalLight({
			color: 0xffffff,
			intensity: 1
		});
		this.directionalFrontLight.position.set(0, 0, 15);
		this.directionalBackLight = getDirectionalLight({
			color: 0xffffff,
			intensity: 1
		});
		this.directionalBackLight.position.set(0, 0, -15);

		this.mainPlaneGeometry = getPlane(
			{ width: 5, height: 5, widthSegments: 10, heightSegments: 10 },
			new MeshPhongMaterial({
				color: 0xff0000,
				side: DoubleSide,
				flatShading: true
			})
		);
		if (process.env.NODE_ENV === 'development') {
			this.stats = Stats();
			document.body.appendChild(this.stats.dom);
		}

		this.worldState = initWorldState();
		this.initCreatingMainPlane();
		this.datDotGui = new GUI();

		const mainPlaneKeys = Object.keys(this.worldState.mainPlane);
		let i = 0;
		for (; i < mainPlaneKeys.length; i++) {
			this.datDotGui
				.add(this.worldState.mainPlane, mainPlaneKeys[i], 1, 100)
				.onChange(() => {
					this.disposeMainPlane();
					this.initCreatingMainPlane();
				});
		}

		this.areElementsInit = true;
	};

	getContainerAspectRatio = () => {
		return this.canvasHolder
			? this.canvasHolder.clientWidth / this.canvasHolder.clientHeight
			: window.innerWidth / window.innerHeight;
	};
	handleKeepPerspectiveCameraAspectRatioOnResize = () => {
		const tanFOV = Math.tan(((Math.PI / 180) * this.camera.fov) / 2);

		const onWindowResize = () => {
			const containerWidth = this.getContainerWidth();
			const containerHeight = this.getContainerHeight();
			this.camera.aspect = this.getContainerAspectRatio();

			console.log(containerHeight, containerHeight);
			// adjust the FOV
			this.camera.fov =
				(360 / Math.PI) *
				Math.atan(tanFOV * (containerHeight / containerHeight));

			this.camera.updateProjectionMatrix();
			this.camera.lookAt(this.scene.position);

			this.renderer.setSize(containerWidth, containerHeight);
			this.renderer.render(this.scene, this.camera);
			this.renderer.setPixelRatio(window.devicePixelRatio);
		};

		onWindowResize();

		window.addEventListener('resize', onWindowResize, false);

		const removeEventListenerIndex = this.arrForOnDispose[0].push(() => {
			window.removeEventListener('resize', onWindowResize, false);
		});

		return {
			removeEventListener: this.arrForOnDispose[removeEventListenerIndex]
		};
	};

	getContainerWidth = () => {
		return this.canvasHolder.clientWidth || window.innerWidth;
	};
	getContainerHeight = () => {
		return this.canvasHolder.clientHeight || window.innerHeight;
	};

	update = () => {
		this.renderer.render(this.scene, this.camera);

		this.controls.update();
		if (process.env.NODE_ENV === 'development') {
			this.stats!.update();
		}

		// this.boxGeometry.rotation.x += 0.01;
		// this.boxGeometry.rotation.y += 0.01;
		// this.boxGeometry.rotation.z += 0.01;

		// this.mainPlaneGeometry.rotation.x -= 0.01;
		// this.mainPlaneGeometry.rotation.y -= 0.01;
		// this.mainPlaneGeometry.rotation.z -= 0.01;

		this.requestAnimationFrameId = requestAnimationFrame(this.update);
	};
}

export default Scene1;

// if (process.env.NODE_ENV === 'development') {
// 	setTimeout(() => {
// 		const stats = Stats();
// 		document.body.appendChild(stats.dom);
// 		stats.update();
// 	}, 0);
// }

// window.scene1 = scene1;

/*
// https://discourse.threejs.org/t/when-to-dispose-how-to-completely-clean-up-a-three-js-scene/1549/18
console.log('dispose renderer!')
renderer.dispose()

scene.traverse(object => {
	if (!object.isMesh) return
	
	console.log('dispose geometry!')
	object.geometry.dispose()

	if (object.material.isMaterial) {
		cleanMaterial(object.material)
	} else {
		// an array of materials
		for (const material of object.material) cleanMaterial(material)
	}
})

const cleanMaterial = material => {
	console.log('dispose material!')
	material.dispose()

	// dispose textures
	for (const key of Object.keys(material)) {
		const value = material[key]
		if (value && typeof value === 'object' && 'minFilter' in value) {
			console.log('dispose texture!')
			value.dispose()
		}
	}
}
*/
