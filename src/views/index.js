/*global THREE:true*/
/*global WebVR:true*/
import VRPage from '@/core/js/VRPage';

class Index extends VRPage {
	assets() {
		return {
			TEXTURE_SKYBOX: 'texture/360bg.jpg',
			AUDIO_ENV: 'audio/env.wav'
		};
	}
	start() {
		const { AUDIO_ENV, TEXTURE_SKYBOX } = this.assets;
		this.addEnvAudio(AUDIO_ENV);
		this.addPanorama(1000, TEXTURE_SKYBOX);
		this.addButton({
			index: -1,
			text: 'Goto Page1!',
			callback: () => {
				WebVR.Router.push('1');
			}
		});
		this.addButton({
			index: 1,
			text: 'Goto Page2!',
			callback: () => {
				WebVR.Router.push('2');
			}
		});
		this.addDirectLight();
	}
	loaded() {
		// play the sound
		this.envSound.play();
	}
	addPanorama(radius, path) {
		// create panorama
		const geometry = new THREE.SphereGeometry(radius, 50, 50);
		const texture = new THREE.TextureLoader().load(path);
		const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
		const panorama = new THREE.Mesh(geometry, material);
		WebVR.Scene.add(panorama);
	}
	addEnvAudio(path) {
		// instantiate audio object
		this.envSound = new THREE.Audio(WebVR.AudioListener);

		// add the audio object to the scene
		WebVR.Scene.add(this.envSound);
		// instantiate a loader
		const loader = new THREE.AudioLoader();

		// load a resource
		loader.load(
			// resource URL
			path,
			// Function when resource is loaded
			audioBuffer => {
				// set the audio object buffer to the loaded object
				this.envSound.setBuffer(audioBuffer);
				this.envSound.setLoop(true);
			}
		);
	}
	addDirectLight() {
		// create the enviromental light
		WebVR.Scene.add(new THREE.AmbientLight(0xFFFFFF));
		let light = new THREE.DirectionalLight(0xffffff, 0.3);
		light.position.set(50, 50, 50);
		light.castShadow = true;
		light.shadow.mapSize.width = 2048;
		light.shadow.mapSize.height = 512;
		light.shadow.camera.near = 100;
		light.shadow.camera.far = 1200;
		light.shadow.camera.left = -1000;
		light.shadow.camera.right = 1000;
		light.shadow.camera.top = 350;
		light.shadow.camera.bottom = -350;
		WebVR.Scene.add(light);
	}
	getTexture(text, fontSize) {
		const WIDTH = 400, HEIGHT = 300;
		let canvas = document.createElement('canvas');
		canvas.width = WIDTH, canvas.height = HEIGHT;
		let ctx = canvas.getContext('2d');
		ctx.fillStyle = '#000000';
		ctx.fillRect(0, 0, WIDTH, WIDTH);
		ctx.fillStyle = '#00aadd';
		ctx.font = `${fontSize}px Arial`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(text, WIDTH / 2, HEIGHT / 2);
		let texture = new THREE.Texture(canvas);
		texture.needsUpdate = true;
		return texture;
	}
	addButton({ text, index, fontSize = 64, callback = () => { } }) {
		const option = {
			hover: 5,
			camera: WebVR.Camera,
			radius: 25,
			angle: Math.PI / 6 * index,
			width: 10,
			height: 7.5
		};
		let hx = option.hover * Math.sin(option.angle), hz = option.hover * Math.cos(option.angle);
		let geometry = new THREE.PlaneGeometry(option.width, option.height);
		let material = new THREE.MeshBasicMaterial({ map: this.getTexture(text, 32), opacity: 0.75, transparent: true });
		let button = new THREE.Mesh(geometry, material);
		let cx = option.camera.position.x,
			cy = option.camera.position.y,
			cz = option.camera.position.z;
		let dx = option.radius * Math.sin(option.angle),
			dz = option.radius * Math.cos(option.angle);
		button.position.set(cx + dx, cy, cz - dz);
		button.rotation.y = -option.angle;

		WebVR.Scene.add(button);
		WebVR.Gazer.on(button, 'gazeEnter', m => {
			button.scale.set(1.2, 1.2, 1.2);
			WebVR.CrossHair.animate.loader.start();
		});
		WebVR.Gazer.on(button, 'gazeLeave', m => {
			button.scale.set(1, 1, 1);
			WebVR.CrossHair.animate.loader.stop();
		});
		WebVR.Gazer.on(button, 'gazeWait', m => {
			WebVR.CrossHair.animate.loader.stop();
			callback();
		});
	}
	update() {
	}
}
export default Index;