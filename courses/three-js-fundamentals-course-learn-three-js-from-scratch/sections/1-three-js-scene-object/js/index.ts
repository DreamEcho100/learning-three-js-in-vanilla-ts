import {
	BoxGeometry,
	DoubleSide,
	FogExp2,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	Vector3,
	WebGL1Renderer
} from 'three';
import type { ColorRepresentation } from 'three';

const getBox = (
	x: number,
	y: number,
	z: number,
	color?: ColorRepresentation
) => {
	const geometry = new BoxGeometry(x, y, z);
	const material = new MeshBasicMaterial({ color });
	const mesh = new Mesh(geometry, material);

	return mesh;
};

const getPlane = (
	x: number,
	y: number,
	z: number,
	color?: ColorRepresentation
) => {
	const geometry = new PlaneGeometry(x, y, z);
	const material = new MeshBasicMaterial({ color, side: DoubleSide });
	const mesh = new Mesh(geometry, material);

	return mesh;
};

const update = (
	render: WebGL1Renderer,
	scene: Scene,
	camera: PerspectiveCamera
) => {
	render.render(scene, camera);

	const plane1 = scene.getObjectByName('plane-1');
	if (plane1) {
		plane1.rotation.y += 0.01;
		plane1.rotation.z += 0.01;
	}
	// request Animation frame
	requestAnimationFrame((/* time */) => {
		// console.log('time', time);
		update(render, scene, camera);
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
	const mesh = getBox(1, 1, 1, 0x915f04);
	mesh.position.y = mesh.geometry.parameters.height * 0.5;

	// Creating more geometry objects in three js
	const plane = getPlane(20, 20, 20, 0x3f9090);
	plane.name = 'plane-1';
	plane.rotation.x = Math.PI / 2;

	scene.add(plane);
	plane.add(mesh);

	const render = new WebGL1Renderer();
	render.setSize(window.innerWidth, window.innerHeight);

	render.setClearColor(0x300090);

	document.getElementById('webgl')?.appendChild(render.domElement);
	update(render, scene, camera);
};

init();
