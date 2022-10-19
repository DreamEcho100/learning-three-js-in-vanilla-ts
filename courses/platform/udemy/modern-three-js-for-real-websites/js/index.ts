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

class Scene1 {
	arrForOnDispose: [(() => void)[], (() => void)[], (() => void)[]];
	canvasHolder: Element; // HTMLDivElement;
	requestAnimationFrameId?: number;

	camera!: PerspectiveCamera;
	controls!: OrbitControls;
	renderer!: WebGL1Renderer;
	scene!: Scene;
	stats: Stats | undefined;

	// boxGeometry: Mesh<BoxGeometry, MeshPhongMaterial>;
	directionalLight!: DirectionalLight;
	planeGeometry!: Mesh<PlaneGeometry, MeshPhongMaterial>;
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
					this.stats?.end();
					this.disposeNode(this.scene, true);
					this.areElementsInit = false;
					this.renderer.dispose();
					if (this.renderer.domElement.parentElement)
						this.renderer.domElement.parentElement.removeChild(
							this.renderer.domElement
						);
					if (this.stats?.domElement.parentElement)
						this.stats.domElement.parentElement.removeChild(
							this.stats.domElement
						);

					const keys = [
						'scene',
						'camera',
						'renderer',
						'controls',
						'directionalLight',
						'planeGeometry',
						'stats'
					];

					for (const key in keys) {
						delete this[key as keyof this];
					}
				},
				() => {},
				() => {},
				() => {},
				() => {}
			]
		];
		this.canvasHolder = canvasHolder;
		this.requestAnimationFrameId;

		// this.initElements();
		this.areElementsInit = false;
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
		this.renderer = new WebGL1Renderer({ antialias: true });
		canvasHolder.appendChild(this.renderer.domElement);

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);

		// this.boxGeometry = getBox(
		// 	{ width: 1, height: 1, widthSegments: 1, heightSegments: 1 },
		// 	new MeshPhongMaterial({ color: 0x00ff00 })
		// );
		this.directionalLight = getDirectionalLight({
			color: 0xffffff,
			intensity: 1
		});
		this.planeGeometry = getPlane(
			{ width: 5, height: 5, widthSegments: 10, heightSegments: 10 },
			new MeshPhongMaterial({ color: 0xff0000, side: DoubleSide })
		);
		this.stats = Stats();
		if (process.env.NODE_ENV === 'development') {
			document.body.appendChild(this.stats.dom);
		}
		this.areElementsInit = true;
	};

	// https://stackoverflow.com/a/71755035/13961420
	disposeNode = (node: any, recursive = false) => {
		if (!node) return;

		console.log('node', node);

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

	dispose = () => {
		for (let i = 0; i < this.arrForOnDispose.length; i++) {
			const arr = this.arrForOnDispose[i];
			for (let j = 0; j < arr.length; j++) {
				const func = arr[j];
				func();
			}
		}
	};

	getContainerAspectRatio = () => {
		return this.canvasHolder
			? this.canvasHolder.clientWidth / this.canvasHolder.clientHeight
			: window.innerWidth / window.innerHeight;
	};

	getContainerWidth = () => {
		return this.canvasHolder.clientWidth || window.innerWidth;
	};
	getContainerHeight = () => {
		return this.canvasHolder.clientHeight || window.innerHeight;
	};

	init() {
		if (!this.areElementsInit) this.initElements();

		// this.arrForOnDispose[0].push(this.camera)

		this.camera.position.set(0, 0, 10);
		this.controls.enableZoom = false;
		// this.camera.lookAt(new Vector3(0, 0, 0));

		this.directionalLight.position.set(0, 0, 5);

		this.scene.add(this.planeGeometry, this.directionalLight); // this.boxGeometry,

		this.renderer.setClearColor('rgb(0, 0, 0)');
		// this.renderer.setSize(this.getContainerWidth(), this.getContainerHeight());
		// this.renderer.setPixelRatio(window.devicePixelRatio);

		this.handleKeepPerspectiveCameraAspectRatioOnResize();
		this.update();
	}

	update = () => {
		this.renderer.render(this.scene, this.camera);

		this.controls.update();
		if (process.env.NODE_ENV === 'development') {
			this.stats!.update();
		}

		// this.boxGeometry.rotation.x += 0.01;
		// this.boxGeometry.rotation.y += 0.01;
		// this.boxGeometry.rotation.z += 0.01;

		// this.planeGeometry.rotation.x -= 0.01;
		// this.planeGeometry.rotation.y -= 0.01;
		// this.planeGeometry.rotation.z -= 0.01;

		this.requestAnimationFrameId = requestAnimationFrame(this.update);
	};

	handleKeepPerspectiveCameraAspectRatioOnResize = () => {
		const tanFOV = Math.tan(((Math.PI / 180) * this.camera.fov) / 2);

		const onWindowResize = () => {
			const containerWidth = this.getContainerWidth();
			const containerHeight = this.getContainerHeight();
			this.camera.aspect = this.getContainerAspectRatio();

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
}

const scene1 = new Scene1();
scene1.init();

const disposeMainSceneButton = document.getElementById(
	'disposeMainScene'
) as HTMLButtonElement;
const initMainSceneButton = document.getElementById(
	'initMainScene'
) as HTMLButtonElement;

if (!disposeMainSceneButton)
	throw new Error(
		"disposeMainSceneButton doesn't exist, disposeMainSceneButton = ${disposeMainSceneButton}"
	);
if (!initMainSceneButton)
	throw new Error(
		"initMainSceneButton doesn't exist, initMainSceneButton = ${initMainSceneButton}"
	);

disposeMainSceneButton?.addEventListener('click', () => scene1.dispose());
initMainSceneButton?.addEventListener('click', () => scene1.init());

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
