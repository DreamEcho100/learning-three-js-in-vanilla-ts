import WebGL from 'three/examples/jsm/capabilities/WebGL';
import {
	Clock,
	DoubleSide,
	FogExp2,
	MeshBasicMaterial,
	PerspectiveCamera,
	Scene,
	Vector3,
	WebGL1Renderer
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';

import {
	getBox,
	getPlane,
	handleKeepPerspectiveCameraAspectRatioOnResize
} from '../../utils';

const update = (props: {
	renderer: WebGL1Renderer;
	scene: Scene;
	camera: PerspectiveCamera;
	controls: OrbitControls;
	stats: Stats;
	clock: Clock;
}) => {
	props.renderer.render(props.scene, props.camera);

	props.controls.update();
	props.stats.update();

	const plane1 = props.scene.getObjectByName('plane-1');
	if (plane1) {
		plane1.rotation.y += 0.01;
		plane1.rotation.z += 0.01;
	}
	// request Animation frame
	requestAnimationFrame(() => {
		update(props);
	});
};

const init = () => {
	const scene = new Scene();
	scene.fog = new FogExp2(0xffffff, 0.2);

	const camera = new PerspectiveCamera(
		45,
		window.innerWidth / window.innerHeight,
		1,
		1000
	);
	camera.position.set(0, 1, 5);
	camera.lookAt(new Vector3(0, 0, 0));

	// The director

	// Populating the Scene in three js
	const mesh = getBox(
		{ width: 1, height: 1, widthSegments: 1 },
		new MeshBasicMaterial({ color: 0x915f04 })
	);
	mesh.position.y = mesh.geometry.parameters.height * 0.5;

	// Creating more geometry objects in three js
	const plane = getPlane(
		{ width: 20, height: 20, widthSegments: 20 },
		new MeshBasicMaterial({
			color: 0x3f9090,
			side: DoubleSide
		})
	);
	plane.name = 'plane-1';
	plane.rotation.x = Math.PI / 2;

	scene.add(plane);
	plane.add(mesh);

	const renderer = new WebGL1Renderer();
	renderer.setSize(window.innerWidth, window.innerHeight);

	renderer.setClearColor(0x300090);

	document.getElementById('webgl')?.appendChild(renderer.domElement);

	const clock = new Clock();
	const stats = Stats();
	const controls = new OrbitControls(camera, renderer.domElement);

	if (WebGL.isWebGLAvailable()) {
		handleKeepPerspectiveCameraAspectRatioOnResize({ camera, scene, renderer });
		update({ renderer, scene, camera, controls, stats, clock });
	} else {
		const warning = WebGL.getWebGLErrorMessage();
		alert(warning.textContent);
	}
};

init();
