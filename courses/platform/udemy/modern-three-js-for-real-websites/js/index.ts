import {
	getBox,
	getPlane
	// handleKeepPerspectiveCameraAspectRatioOnResize
} from '@utils/common/three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import WebGL from 'three/examples/jsm/capabilities/WebGL';
import {
	DoubleSide,
	MeshBasicMaterial,
	PerspectiveCamera,
	Scene,
	WebGL1Renderer
} from 'three';
import type { BoxGeometry, Mesh, PlaneGeometry } from 'three';

class Scene1 {
	camera: PerspectiveCamera;
	controls: OrbitControls;
	renderer: WebGL1Renderer;
	scene: Scene;

	boxGeometry: Mesh<BoxGeometry, MeshBasicMaterial>;
	planeGeometry: Mesh<PlaneGeometry, MeshBasicMaterial>;
	canvasHolder: Element; // HTMLDivElement;

	constructor() {
		if (!WebGL.isWebGLAvailable()) {
			const warning = WebGL.getWebGLErrorMessage();
			alert(warning.textContent);
		}

		const canvasHolder = document.querySelector('.canvasHolder');
		if (!canvasHolder) throw new Error('Can not find canvasHolder');

		this.canvasHolder = canvasHolder;

		this.scene = new Scene();
		this.camera = new PerspectiveCamera(
			45,
			this.getContainerAspectRatio(),
			0.1,
			1000
		);
		this.renderer = new WebGL1Renderer({ antialias: true });
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.enableZoom = false;

		this.boxGeometry = getBox(
			{ width: 1, height: 1, widthSegments: 1, heightSegments: 1 },
			new MeshBasicMaterial({ color: 0x00ff00 })
		);
		this.planeGeometry = getPlane(
			{ width: 5, height: 5, widthSegments: 10, heightSegments: 10 },
			new MeshBasicMaterial({ color: 0xff0000, side: DoubleSide })
		);
	}

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
		const canvasHolder = document.querySelector('.canvasHolder');
		if (!canvasHolder) throw new Error('Can not find canvasHolder');

		this.camera.position.set(0, 0, 10);
		// this.camera.lookAt(new Vector3(0, 0, 0));

		this.scene.add(this.planeGeometry, this.boxGeometry); // this.boxGeometry,

		this.renderer.setClearColor('rgb(0, 0, 0)');
		// this.renderer.setSize(this.getContainerWidth(), this.getContainerHeight());
		// this.renderer.setPixelRatio(window.devicePixelRatio);

		canvasHolder.appendChild(this.renderer.domElement);

		this.handleKeepPerspectiveCameraAspectRatioOnResize();
		this.update();
	}

	update = () => {
		this.renderer.render(this.scene, this.camera);

		this.controls.update();
		// this.stats.update();
		this.boxGeometry.rotation.x += 0.01;
		this.boxGeometry.rotation.y += 0.01;
		this.boxGeometry.rotation.z += 0.01;

		this.planeGeometry.rotation.x -= 0.01;
		this.planeGeometry.rotation.y -= 0.01;
		this.planeGeometry.rotation.z -= 0.01;

		requestAnimationFrame(this.update);
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

		return {
			removeEventListener: () =>
				window.removeEventListener('resize', onWindowResize, false)
		};
	};
}

const scene1 = new Scene1();
scene1.init();
