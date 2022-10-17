import {
	AdditiveBlending,
	BufferAttribute,
	BufferGeometry,
	Clock,
	DoubleSide,
	MeshBasicMaterial,
	PerspectiveCamera,
	Points,
	PointsMaterial,
	Scene,
	TextureLoader,
	Vector3,
	WebGL1Renderer
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import WebGL from 'three/examples/jsm/capabilities/WebGL';

import { getPlane } from '../../utils';

const update = (props: {
	render: WebGL1Renderer;
	scene: Scene;
	camera: PerspectiveCamera;
	controls: OrbitControls;
	stats: Stats;
	clock: Clock;
}) => {
	props.render.render(props.scene, props.camera);

	props.controls.update();
	props.stats.update();

	requestAnimationFrame(() => {
		update(props);
	});
};

const init = () => {
	const scene = new Scene();

	const camera = new PerspectiveCamera(
		45,
		window.innerWidth / window.innerHeight,
		1,
		1000
	);
	camera.position.set(0, 0, 40);
	camera.lookAt(new Vector3(0, 0, 0));

	// The director

	// Creating more geometry objects in three js
	const plane = getPlane(
		{ width: 20, height: 20 },
		new MeshBasicMaterial({
			color: 0x3f9090,
			side: DoubleSide
		}),
		(plane) => {
			plane.name = 'plane-1';
			plane.rotation.x = Math.PI * 0.6;
			plane.rotation.y = Math.PI * 0;
			plane.rotation.z = Math.PI * -0.1;
		}
	);


	const particleGeoVertices: number[] = []; 
	const particleGeoVertices32 = new Float32Array(3000); 
	const particleGeo = new BufferGeometry(); 

	const particleMaterial = new PointsMaterial({
		color: 'rgb(255, 255, 255)',
		size: 1,
		map: new TextureLoader().load('/img/particle.jpg'),
		transparent: true,
		blending: AdditiveBlending,
		depthWrite: false
	});
	const particleCount = 1000;
	const particleDistance = 30;

	let i = 0;
	for (; i < particleCount; i++) {
		particleGeoVertices.push(
			(Math.random() - 0.5) * particleDistance,
			(Math.random() - 0.5) * particleDistance,
			(Math.random() - 0.5) * particleDistance
		);
	}
	particleGeoVertices32.set(particleGeoVertices);

	particleGeo.setAttribute(
		'position',
		new BufferAttribute(particleGeoVertices32, 3)
	);

	const particleSystem = new Points(particleGeo, particleMaterial);

	scene.add(particleSystem);
	scene.add(plane);

	const canvas = document.getElementById('webgl');
	if (!canvas) throw new Error('Can not find canvas');

	const render = new WebGL1Renderer({
		canvas,
		antialias: true
	});
	render.setSize(window.innerWidth, window.innerHeight);
	render.shadowMap.enabled = true;

	render.setClearColor('rgb(0, 0, 0)');

	const controls = new OrbitControls(camera, render.domElement);
	const stats = Stats();
	const clock = new Clock();

	document.body.appendChild(render.domElement);
	document.body.appendChild(stats.dom);
	if (WebGL.isWebGLAvailable()) {
		// Initiate function or other initializations here
		update({ render, scene, camera, controls, stats, clock });
		// animate();
	} else {
		const warning = WebGL.getWebGLErrorMessage();
		alert(warning.textContent);
		// document.getElementById( 'container' ).appendChild( warning );
	}
};

init();
