import {
	getBox,
	getPlane,
	handleKeepPerspectiveCameraAspectRatioOnResize
} from '@utils/common/threejs';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import WebGL from 'three/examples/jsm/capabilities/WebGL';
import {
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

	constructor() {
		if (!WebGL.isWebGLAvailable()) {
			const warning = WebGL.getWebGLErrorMessage();
			alert(warning.textContent);
		}

		this.scene = new Scene();
		this.camera = new PerspectiveCamera(
			45,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		this.renderer = new WebGL1Renderer({ antialias: true });
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);

		this.boxGeometry = getBox(
			{ width: 1, height: 1, widthSegments: 1, heightSegments: 1 },
			new MeshBasicMaterial({ color: 0x00ff00 })
		);
		this.planeGeometry = getPlane(
			{ width: 5, height: 5, widthSegments: 10, heightSegments: 10 },
			new MeshBasicMaterial({ color: 0xff0000 })
		);
	}

	init() {
		const canvasHolder = document.querySelector('.canvasHolder');
		if (!canvasHolder) throw new Error('Can not find canvasHolder');

		this.camera.position.set(0, 0, 10);
		// camera.lookAt(new Vector3(0, 0, 0));

		this.scene.add(this.planeGeometry); // this.boxGeometry,

		this.renderer = new WebGL1Renderer({ antialias: true });
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setClearColor('rgb(0, 0, 0)');
		this.renderer.setSize(innerWidth, innerHeight);
		this.renderer.setPixelRatio(window.devicePixelRatio);

		canvasHolder.appendChild(this.renderer.domElement);

		handleKeepPerspectiveCameraAspectRatioOnResize({
			camera: this.camera,
			scene: this.scene,
			renderer: this.renderer
		});
		this.update(); // stats, clock
	}

	update = () => {
		this.renderer.render(this.scene, this.camera);

		this.controls.update();
		// this.stats.update();
		// this.boxGeometry.rotation.x += 0.01;
		// this.boxGeometry.rotation.y += 0.01;
		// this.boxGeometry.rotation.z += 0.01;

		// this.planeGeometry.rotation.x -= 0.01;
		// this.planeGeometry.rotation.y -= 0.01;
		// this.planeGeometry.rotation.z -= 0.01;

		requestAnimationFrame(this.update);
	};
}

const scene1 = new Scene1();
scene1.init();
