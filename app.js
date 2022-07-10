import * as THREE from './libs/three/build/three.module.js';
import {GLTFLoader} from './libs/three/examples/jsm/loaders/GLTFLoader.js';
import * as Utils from './libs/utils.js'

//creating a scene, camera and renderer

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff)

const aspect = window.innerWidth / window.innerHeight;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


var geometry = new THREE.BoxGeometry(1,1,1);
var material = new THREE.MeshBasicMaterial({
    color:"red"
})
var mesh = new THREE.Mesh(geometry,material);
scene.add(mesh);

const gltfLoader = new GLTFLoader();
const url = 'models/robot/scene.gltf';
gltfLoader.load(url, (gltf) => {
  const root = gltf.scene;
  scene.add(root);
  console.log(Utils.dumpObject(root).join('\n'));
});



var camera;

/*
height = 2;
width = aspect * height;
camera = new THREE.OrthographicCamera(-width,width,height,-height,0.1,100);*/

camera = new THREE.PerspectiveCamera(60,aspect,0.1,1000);


//create a light

{
    const lightColor = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(lightColor,intensity);
    light.position.set(-1,2,4);
    scene.add(light);
}

//move camera away
camera.position.set( 0, 300, 200 );
camera.lookAt( 0, 0, 0 );

function animate(){
    requestAnimationFrame(animate);
    
    renderer.render(scene,camera);
}

animate();