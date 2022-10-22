import { getDirectionalLight, getPlane } from '@utils/common/three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import WebGL from 'three/examples/jsm/capabilities/WebGL';
import {
	BufferAttribute,
	BufferGeometry,
	DoubleSide,
	Float32BufferAttribute,
	MeshPhongMaterial,
	PerspectiveCamera,
	Points,
	PointsMaterial,
	Raycaster,
	Scene,
	Vector3,
	WebGL1Renderer
} from 'three';
import type { DirectionalLight, Mesh, PlaneGeometry } from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';

import { GUI } from 'dat.gui';

import gsap from 'gsap';

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
// });

const initWorldState = () => ({
	mainPlane: {
		// width: 25,
		// height: 25,
		// widthSegments: 30,
		// heightSegments: 30
		width: 400,
		height: 400,
		widthSegments: 50,
		heightSegments: 50
	}
});

interface IContainerProps {
	bottom: number;
	height: number;
	left: number;
	right: number;
	top: number;
	width: number;
	x: number;
	y: number;
	mouseCoors: {
		x?: number;
		y?: number;
	};
}

class Scene1 {
	arrForOnDispose: [(() => void)[], (() => void)[], (() => void)[]];
	areElementsInit: boolean;
	camera: PerspectiveCamera;
	canvasHolder: HTMLDivElement; // HTMLDivElement;
	frame: number;
	mainPlaneGeometryProps: {
		randomValues: number[];
		originalPosition: number[];
	};
	rayCaster: Raycaster;
	renderer!: WebGL1Renderer;
	requestAnimationFrameId?: number;
	scene: Scene;
	stats?: Stats;

	containerProps!: IContainerProps;
	containerIntersectionObserver!: IntersectionObserver;
	worldState!: ReturnType<typeof initWorldState>;
	controls!: OrbitControls;
	datDotGui!: GUI;
	directionalFrontLight!: DirectionalLight;
	directionalBackLight!: DirectionalLight;
	mainPlaneGeometry!: Mesh<PlaneGeometry, MeshPhongMaterial>;
	stars!: Points<BufferGeometry, PointsMaterial>;

	constructor() {
		if (!WebGL.isWebGLAvailable()) {
			const warning = WebGL.getWebGLErrorMessage();
			alert(warning.textContent);
		}

		const canvasHolder = document.querySelector(
			'.canvasHolder'
		) as HTMLDivElement;
		if (!canvasHolder) throw new Error('Can not find canvasHolder');

		this.arrForOnDispose = [
			[],
			[],
			[
				() => {
					this.containerIntersectionObserver.unobserve(this.canvasHolder);
					this.containerIntersectionObserver.disconnect();

					this.requestAnimationFrameId &&
						cancelAnimationFrame(this.requestAnimationFrameId);
					this.disposeMainPlane();
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
					document.removeEventListener('scroll', this.handleScroll);
					this.canvasHolder.removeEventListener(
						'mousemove',
						this.trackContainerMousePosition
					);
					this.canvasHolder.removeEventListener(
						'mouseleave',
						this.handleContainerMouseLeave
					);

					this.mainPlaneGeometryProps.randomValues = [];
					this.mainPlaneGeometryProps.originalPosition = [];

					const keys = [
						'worldState',
						'containerIntersectionObserver',
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
		this.camera = new PerspectiveCamera(
			45,
			this.getContainerAspectRatio(),
			0.1,
			1000
		);
		this.mainPlaneGeometryProps = {
			randomValues: [],
			originalPosition: []
		};

		this.rayCaster = new Raycaster();
		this.renderer = new WebGL1Renderer({ antialias: true });
		this.requestAnimationFrameId;
		this.scene = new Scene();
		this.frame = 0;

		this.areElementsInit = false;
	}

	handleContainerIntersectionObserver = (
		entries: IntersectionObserverEntry[]
		// observer: IntersectionObserver
	) => {
		const entry = entries[0];
		if (!entry.isIntersecting && this.requestAnimationFrameId) {
			document.removeEventListener('scroll', this.handleScroll);
			cancelAnimationFrame(this.requestAnimationFrameId);
			delete this.requestAnimationFrameId;
		} else if (entry.isIntersecting && !this.requestAnimationFrameId) {
			this.initScrollHandler();
			this.requestAnimationFrameId = this.update();
		}
	};

	initScrollHandler = () => {
		document.removeEventListener('scroll', this.handleScroll);
		document.addEventListener('scroll', this.handleScroll);
	};

	initCreatingMainPlane = () => {
		this.mainPlaneGeometry = getPlane(
			this.worldState.mainPlane,
			new MeshPhongMaterial({
				// color: 0xff0000,
				vertexColors: true,
				side: DoubleSide,
				flatShading: true
			})
		);

		const planeCoordinates = this.mainPlaneGeometry.geometry.attributes.position
			.array as number[];
		const randomValues = [];
		const colors = [];
		let i = 0;
		for (; i < planeCoordinates.length; i += 3) {
			planeCoordinates[i] += (Math.random() - 0.5) * 3;
			planeCoordinates[i + 1] += (Math.random() - 0.5) * 3;
			planeCoordinates[i + 2] += (Math.random() - 0.5) * 3;

			colors.push(0.19, 0, 0.4);

			randomValues.push(
				Math.random() * Math.PI * 2,
				Math.random() * Math.PI * 2,
				Math.random() * Math.PI * 2
			);
		}

		this.mainPlaneGeometry.geometry.setAttribute(
			'color',
			new BufferAttribute(new Float32Array(colors), 3)
		);

		this.mainPlaneGeometryProps.randomValues = randomValues;
		this.mainPlaneGeometryProps.originalPosition = [
			...(this.mainPlaneGeometry.geometry.attributes.position.array as number[])
		];

		this.scene.add(this.mainPlaneGeometry);
	};

	dispose = () => {
		let i = 0;
		let j: number;
		for (; i < this.arrForOnDispose.length; i++) {
			const arr = this.arrForOnDispose[i];
			j = 0;
			for (; j < arr.length; j++) {
				const func = arr[j];
				func();
			}
		}
	};
	disposeMainPlane = () => {
		this.scene.remove(this.mainPlaneGeometry);
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

	updateContainerBoundingRect = () => {
		const boundingClientRect = this.getContainerBoundingClientRect();
		let key: keyof typeof boundingClientRect;
		for (key in boundingClientRect) {
			// if (key in boundingClientRect && key in this.containerProps)
			this.containerProps[key] = boundingClientRect[key];
		}
	};
	trackContainerMousePosition = (event: MouseEvent) => {
		event.stopPropagation();
		this.containerProps.mouseCoors.x =
			(event.clientX / this.containerProps.width) * 2 - 1;
		this.containerProps.mouseCoors.y =
			-((event.clientY - this.containerProps.y) / this.containerProps.height) *
				2 +
			1;
		// this.containerProps.mouseCoors.x =
		// 	(event.clientX / this.containerProps.width) * 2 - 1;
		// this.containerProps.mouseCoors.y =
		// 	-(event.clientY / this.containerProps.height) * 2 + 1;
	};
	handleContainerMouseLeave = () => {
		this.containerProps.mouseCoors.x = undefined;
		this.containerProps.mouseCoors.y = undefined;
	};

	init() {
		if (!this.areElementsInit) this.initElements();

		this.renderer.setClearColor('rgb(0, 0, 0)');

		this.handleKeepPerspectiveCameraAspectRatioOnResize();
		this.requestAnimationFrameId = this.update();
	}
	initElements = () => {
		if (this.areElementsInit) return;

		this.canvasHolder = document.querySelector(
			'.canvasHolder'
		) as HTMLDivElement;
		if (!this.canvasHolder) throw new Error('Can not find canvasHolder');
		this.containerIntersectionObserver = new IntersectionObserver(
			this.handleContainerIntersectionObserver
		);
		this.frame = 0;

		this.containerIntersectionObserver.observe(this.canvasHolder);

		this.containerProps = {
			mouseCoors: {
				x: undefined,
				y: undefined
			},
			...this.getContainerBoundingClientRect()
		};
		this.canvasHolder.addEventListener(
			'mousemove',
			this.trackContainerMousePosition
		);
		this.canvasHolder.addEventListener(
			'mouseleave',
			this.handleContainerMouseLeave
		);

		this.camera.position.set(0, 0, 150);
		this.camera.lookAt(new Vector3(0, 0, 0));

		this.canvasHolder.appendChild(this.renderer.domElement);

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		// this.controls.enableZoom = false;
		// this.controls.enableRotate = false;

		this.directionalFrontLight = getDirectionalLight({
			color: 0xffffff,
			intensity: 1
		});
		this.directionalFrontLight.position.set(0, -1, 1);
		this.directionalBackLight = getDirectionalLight({
			color: 0xffffff,
			intensity: 1
		});
		this.directionalBackLight.position.set(0, 1, -1);
		this.scene.add(this.directionalFrontLight, this.directionalBackLight);

		if (process.env.NODE_ENV === 'development') {
			this.stats = Stats();
			document.body.appendChild(this.stats.dom);
		}

		this.worldState = initWorldState();
		this.disposeMainPlane();
		this.initCreatingMainPlane();
		this.datDotGui = new GUI();

		['width', 'height'].map((item) =>
			this.datDotGui
				.add(this.worldState.mainPlane, item, 1, 500)
				.onChange(() => {
					this.disposeMainPlane();
					this.initCreatingMainPlane();
				})
		);

		['widthSegments', 'heightSegments'].map((item) =>
			this.datDotGui
				.add(this.worldState.mainPlane, item, 1, 100)
				.onChange(() => {
					this.disposeMainPlane();
					this.initCreatingMainPlane();
				})
		);

		const starsGeometry = new BufferGeometry();
		const starsMaterial = new PointsMaterial({ color: 0xffffff });

		const starsVertices = [];
		let i = 0;
		for (; i < 10000; i++) {
			starsVertices.push(
				(Math.random() - 0.5) * 4000,
				(Math.random() - 0.5) * 4000,
				(Math.random() - 0.5) * 4000
			);
		}

		starsGeometry.setAttribute(
			'position',
			new Float32BufferAttribute(starsVertices, 3)
		);
		this.stars = new Points(starsGeometry, starsMaterial);
		this.scene.add(this.stars);

		this.initScrollHandler();

		this.areElementsInit = true;
	};

	getContainerAspectRatio = () => {
		return this.canvasHolder
			? this.canvasHolder.clientWidth / this.canvasHolder.clientHeight
			: window.innerWidth / window.innerHeight;
	};
	getContainerBoundingClientRect = () => {
		const boundingClientRect = this.canvasHolder.getBoundingClientRect();
		return {
			bottom: boundingClientRect.bottom,
			height: boundingClientRect.height,
			left: boundingClientRect.left,
			right: boundingClientRect.right,
			top: boundingClientRect.top,
			width: boundingClientRect.width,
			x: boundingClientRect.x,
			y: boundingClientRect.y
		};
	};
	getContainerHeight = () => {
		return this.canvasHolder.clientHeight || window.innerHeight;
	};
	getContainerWidth = () => {
		return this.canvasHolder.clientWidth || window.innerWidth;
	};

	handleKeepPerspectiveCameraAspectRatioOnResize = () => {
		const tanFOV = Math.tan(((Math.PI / 180) * this.camera.fov) / 2);

		const onWindowResize = () => {
			this.updateContainerBoundingRect();

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

	handleScroll = (event: Event) => {
		event.stopPropagation();
		if (!this.areElementsInit) return;

		this.containerProps = {
			...this.containerProps,
			...this.getContainerBoundingClientRect()
		};
	};

	update = () => {
		this.renderer.render(this.scene, this.camera);

		// if (this.controls.enabled) this.controls.update();
		if (process.env.NODE_ENV === 'development') {
			this.stats!.update();
		}

		this.frame += 0.01;

		this.stars.rotation.x += 0.0005;
		// this.stars.rotation.z += 0.0005;
		// this.stars.rotation.y += 0.0005;

		const mainPlaneGeometryPositionArr = this.mainPlaneGeometry.geometry
			.attributes.position.array as number[];
		let i = 0;
		for (; i < mainPlaneGeometryPositionArr.length; i += 3) {
			// x
			mainPlaneGeometryPositionArr[i] =
				this.mainPlaneGeometryProps.originalPosition[i] +
				Math.cos(this.frame + this.mainPlaneGeometryProps.randomValues[i]) *
					0.75;

			// y
			mainPlaneGeometryPositionArr[i + 1] =
				this.mainPlaneGeometryProps.originalPosition[i + 1] +
				Math.sin(this.frame + this.mainPlaneGeometryProps.randomValues[i + 1]) *
					0.75;
		}

		this.mainPlaneGeometry.geometry.attributes.position.needsUpdate = true;

		if (this.containerProps.mouseCoors.x && this.containerProps.mouseCoors.y) {
			this.rayCaster.setFromCamera(
				this.containerProps.mouseCoors as { x: number; y: number },
				this.camera
			);
			const rayCasterIntersectMainPlane = this.rayCaster.intersectObject(
				this.mainPlaneGeometry
			) as any[];

			if (rayCasterIntersectMainPlane.length > 0) {
				const { color } =
					rayCasterIntersectMainPlane[0].object.geometry.attributes;

				// vertex 1
				color.setX(rayCasterIntersectMainPlane[0].face.a, 0.1);
				color.setY(rayCasterIntersectMainPlane[0].face.a, 0.5);
				color.setZ(rayCasterIntersectMainPlane[0].face.a, 1);

				// vertex 2
				color.setX(rayCasterIntersectMainPlane[0].face.b, 0.1);
				color.setY(rayCasterIntersectMainPlane[0].face.b, 0.5);
				color.setZ(rayCasterIntersectMainPlane[0].face.b, 1);

				// vertex 3
				color.setX(rayCasterIntersectMainPlane[0].face.c, 0.1);
				color.setY(rayCasterIntersectMainPlane[0].face.c, 0.5);
				color.setZ(rayCasterIntersectMainPlane[0].face.c, 1);

				rayCasterIntersectMainPlane[0].object.geometry.attributes.color.needsUpdate =
					true;

				const initialColor = {
					r: 0.19,
					g: 0,
					b: 0.4
				};
				const hoverColor = {
					r: 0.5,
					g: 0.1,
					b: 1
				};

				gsap.to(hoverColor, {
					r: initialColor.r,
					g: initialColor.g,
					b: initialColor.b,
					duration: 1,
					onUpdate: () => {
						if (!color) return;
						// vertex 1
						color.setX(rayCasterIntersectMainPlane[0].face.a, hoverColor.r);
						color.setY(rayCasterIntersectMainPlane[0].face.a, hoverColor.g);
						color.setZ(rayCasterIntersectMainPlane[0].face.a, hoverColor.b);

						// vertex 2
						color.setX(rayCasterIntersectMainPlane[0].face.b, hoverColor.r);
						color.setY(rayCasterIntersectMainPlane[0].face.b, hoverColor.g);
						color.setZ(rayCasterIntersectMainPlane[0].face.b, hoverColor.b);

						// vertex 3
						color.setX(rayCasterIntersectMainPlane[0].face.c, hoverColor.r);
						color.setY(rayCasterIntersectMainPlane[0].face.c, hoverColor.g);
						color.setZ(rayCasterIntersectMainPlane[0].face.c, hoverColor.b);

						color.needsUpdate = true;

						// rayCasterIntersectMainPlane[0].object.geometry.attributes.color.needsUpdate =
						// 	true;
					}
				});
			}
		}

		return (this.requestAnimationFrameId = requestAnimationFrame(this.update));
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
renderer.dispose()

scene.traverse(object => {
	if (!object.isMesh) return
	
	object.geometry.dispose()

	if (object.material.isMaterial) {
		cleanMaterial(object.material)
	} else {
		// an array of materials
		for (const material of object.material) cleanMaterial(material)
	}
})

const cleanMaterial = material => {
	material.dispose()

	// dispose textures
	for (const key of Object.keys(material)) {
		const value = material[key]
		if (value && typeof value === 'object' && 'minFilter' in value) {
			value.dispose()
		}
	}
}
*/

/*
[
    {
        "distance": 10.574072631780638,
        "point": {
            "x": 3.6255526227763744,
            "y": -0.9217506668075532,
            "z": 0.10976461807447713
        },
        "object": {
            "metadata": {
                "version": 4.5,
                "type": "Object",
                "generator": "Object3D.toJSON"
            },
            "geometries": [
                {
                    "uuid": "116c5149-e742-4a70-bcff-9be73774e18b",
                    "type": "PlaneGeometry",
                    "width": 25,
                    "height": 25,
                    "widthSegments": 30,
                    "heightSegments": 30
                }
            ],
            "materials": [
                {
                    "uuid": "4453b321-2f63-4ced-8e3f-620b58bdfd4a",
                    "type": "MeshPhongMaterial",
                    "color": 16711680,
                    "emissive": 0,
                    "specular": 1118481,
                    "shininess": 30,
                    "reflectivity": 1,
                    "refractionRatio": 0.98,
                    "side": 2,
                    "depthFunc": 3,
                    "depthTest": true,
                    "depthWrite": true,
                    "colorWrite": true,
                    "stencilWrite": false,
                    "stencilWriteMask": 255,
                    "stencilFunc": 519,
                    "stencilRef": 0,
                    "stencilFuncMask": 255,
                    "stencilFail": 7680,
                    "stencilZFail": 7680,
                    "stencilZPass": 7680,
                    "flatShading": true
                }
            ],
            "object": {
                "uuid": "c53aeb0e-30f0-429d-9ce5-1d5db6f4899b",
                "type": "Mesh",
                "layers": 1,
                "matrix": [
                    1,
                    0,
                    0,
                    0,
                    0,
                    1,
                    0,
                    0,
                    0,
                    0,
                    1,
                    0,
                    0,
                    0,
                    0,
                    1
                ],
                "geometry": "116c5149-e742-4a70-bcff-9be73774e18b",
                "material": "4453b321-2f63-4ced-8e3f-620b58bdfd4a"
            }
        },
        "uv": {
            "x": 0.6450221110112866,
            "y": 0.4495582499623072
        },
        "face": {
            "a": 515,
            "b": 546,
            "c": 516,
            "normal": {
                "x": 0.41815307252028244,
                "y": -0.3975455318041362,
                "z": 0.8167653017142772
            },
            "materialIndex": 0
        },
        "faceIndex": 998
    }
]
*/
