// import Noise from 'noisejs';

import { gui } from '@utils/common/gui';

import WebGL from 'three/examples/jsm/capabilities/WebGL';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import {
	AmbientLight,
	Clock,
	CubeTextureLoader,
	DoubleSide,
	Group,
	Mesh,
	MeshStandardMaterial,
	PerspectiveCamera,
	RGBFormat,
	Scene,
	SpotLight,
	TextureLoader,
	Vector3,
	WebGL1Renderer
} from 'three';
import type { ColorRepresentation } from 'three';

import {
	getMaterial,
	getSpotLight,
	handleKeepPerspectiveCameraAspectRatioOnResize
} from '@utils/common/threejs';

enum EGetMaterialBase {
	basic = 'basic',
	lambert = 'lambert',
	phong = 'phong',
	standard = 'standard'
}

const isMeshMaterialStandard = (mesh: any): mesh is MeshStandardMaterial => {
	if (mesh instanceof MeshStandardMaterial) return true;
	return false;
};

const spotLightHandler = (light: SpotLight) => {
	light.castShadow = true;
	light.penumbra = 0.5;

	light.shadow.mapSize.width = 2048;
	light.shadow.mapSize.height = 2048;
	light.shadow.bias = 0.001;
	return light;
};

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

	// const sceneCameraGroup = props.scene.getObjectByName(
	// 	'sceneCameraGroup'
	// ) as Group;

	// sceneCameraGroup.rotateY(Math.PI * 0.0005);

	// const timeElapsed = props.clock.getElapsedTime();

	// request Animation frame
	requestAnimationFrame(() => {
		update(props);
	});
};

const init = () => {
	const scene = new Scene();

	const bgImgsBasePath = '/img/SwedishRoyalCastle/';
	const bgImgsFormat = '.jpg';

	const bgImgsUrl = ['px', 'nx', 'py', 'ny', 'pz', 'nz'].map(
		(item) => bgImgsBasePath + item + bgImgsFormat
	);
	const reflectionCube = new CubeTextureLoader().load(bgImgsUrl);
	reflectionCube.format = RGBFormat;
	scene.background = reflectionCube;

	const textureLoader = new TextureLoader();
	// Load external geometry
	const OBGGeometryLoader = new OBJLoader();

	OBGGeometryLoader.load('/3d/Glider Flying/FFGLOBJ.obj', (OBGObject) => {
		const colorMap = textureLoader.load('/3d/Glider Flying/FLFRTS.JPG'); // FFGLOBJ.mtl
		const bumpMap = textureLoader.load('/3d/Glider Flying/FLFRTS.JPG'); // FFGLOBJ.mtl
		const OBGObjectMaterial = getMaterial(EGetMaterialBase.standard, {
			color: 'rgb(255, 255, 255)',
			side: DoubleSide,
			wireframe: true
		});

		if (isMeshMaterialStandard(OBGObjectMaterial))
			OBGObject.traverse((child) => {
				// if (child.name === 'Plane')
				// child.visible = true;

				// if (child.name === 'Infinite') {
				if (child instanceof Mesh && child.isMesh && child.material.map) {
					child.material.map = OBGObjectMaterial;
					child.geometry.computeVertexNormals();
					child.material.map.needsUpdate = true;

					// access other properties of material
					child.customDepthMaterial = OBGObjectMaterial;
					child.customDistanceMaterial = OBGObjectMaterial;
					OBGObjectMaterial.roughness = 0.875;
					OBGObjectMaterial.map = colorMap;
					OBGObjectMaterial.bumpMap = bumpMap;
					OBGObjectMaterial.roughnessMap = bumpMap;
					OBGObjectMaterial.metalness = 0;
					OBGObjectMaterial.bumpScale = 0.175;
				}
				// }
			});

		OBGObject.scale.x = 20;
		OBGObject.scale.y = 20;
		OBGObject.scale.z = 20;
		OBGObject.scale.set(20, 20, 20);
		OBGObject.position.set(0, -2, 0);
		OBGObject.rotation.set(Math.PI * 0.5, -Math.PI, -Math.PI * 0.5);
		scene.add(OBGObject);
	});

	const lightLeft = spotLightHandler(
		getSpotLight({ color: 'rgb(255, 220, 180)', intensity: 1 })
	);
	const lightRight = spotLightHandler(
		getSpotLight({ color: 'rgb(255, 220, 180)', intensity: 1 })
	);
	const lightBottom = spotLightHandler(
		getSpotLight({ color: 'rgb(255, 220, 180)', intensity: 0.33 })
	);

	lightLeft.position.set(-5, 2, -4);
	lightRight.position.set(5, 2, -4);
	lightBottom.position.set(5, 2, -4);
	{
		const lightLeftFolder = gui.addFolder({
			title: 'Light Left'
		});
		lightLeftFolder.addInput(lightLeft, 'intensity', {
			min: 0,
			max: 10,
			step: 0.1
		});
		lightLeftFolder.addInput(lightLeft.position, 'x', {
			min: -5,
			max: 15,
			step: 0.1
		});
		lightLeftFolder.addInput(lightLeft.position, 'y', {
			min: -5,
			max: 15,
			step: 0.1
		});
		lightLeftFolder.addInput(lightLeft.position, 'z', {
			min: -5,
			max: 15,
			step: 0.1
		});
	}
	{
		const lightRightFolder = gui.addFolder({
			title: 'Light Right',
			expanded: false
		});
		lightRightFolder.addInput(lightRight, 'intensity', {
			min: 0,
			max: 10,
			step: 0.1
		});
		lightRightFolder.addInput(lightRight.position, 'x', {
			min: -5,
			max: 15,
			step: 0.1
		});
		lightRightFolder.addInput(lightRight.position, 'y', {
			min: -5,
			max: 15,
			step: 0.1
		});
		lightRightFolder.addInput(lightRight.position, 'z', {
			min: -5,
			max: 15,
			step: 0.1
		});
	}
	{
		const lightBottomFolder = gui.addFolder({
			title: 'Light Bottom',
			expanded: false
		});
		lightBottomFolder.addInput(lightBottom, 'intensity', {
			min: 0,
			max: 10,
			step: 0.1
		});
		lightBottomFolder.addInput(lightBottom.position, 'x', {
			min: -5,
			max: 15,
			step: 0.1
		});
		lightBottomFolder.addInput(lightBottom.position, 'y', {
			min: -5,
			max: 15,
			step: 0.1
		});
		lightBottomFolder.addInput(lightBottom.position, 'z', {
			min: -5,
			max: 15,
			step: 0.1
		});
	}

	const getAmbientLight = (color: ColorRepresentation, intensity: number) => {
		const light = new AmbientLight(color, intensity);

		return light;
	};

	const ambientLight = getAmbientLight(0xb2b1a5, 0.5);
	ambientLight.intensity = 0.4;
	// scene.add(ambientLight);

	// scene.add(sphere);
	scene.add(lightLeft);
	scene.add(lightRight);
	scene.add(lightBottom);

	const cameraGroup = new Group();
	const camera = new PerspectiveCamera(
		45,
		window.innerWidth / window.innerHeight,
		1,
		1000
	);

	camera.position.set(0, 40, 400);
	camera.lookAt(new Vector3(0, 0, 0));
	cameraGroup.add(camera);
	cameraGroup.name = 'sceneCameraGroup';
	scene.add(cameraGroup);

	const canvas = document.getElementById('webgl');
	if (!canvas) throw new Error('Can not find canvas');

	const renderer = new WebGL1Renderer({
		canvas,
		antialias: true
	});
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;

	renderer.setClearColor('rgb(0, 0, 0)');

	const controls = new OrbitControls(camera, renderer.domElement);
	const stats = Stats();
	const clock = new Clock();

	document.body.appendChild(renderer.domElement);
	document.body.appendChild(stats.dom);
	if (WebGL.isWebGLAvailable()) {
		handleKeepPerspectiveCameraAspectRatioOnResize({ camera, scene, renderer });
		update({ renderer, scene, camera, controls, stats, clock });
	} else {
		const warning = WebGL.getWebGLErrorMessage();
		alert(warning.textContent);
	}
};

init();
