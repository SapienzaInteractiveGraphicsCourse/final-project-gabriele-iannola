import * as THREE from './libs/three/build/three.module.js';
import {GLTFLoader} from './libs/three/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from './libs/three/examples/jsm/controls/OrbitControls.js';
import {DirectionalLightHelper} from './libs/three/src/helpers/DirectionalLightHelper.js';
import { AxesHelper } from './libs/three/src/helpers/AxesHelper.js';
import { GridHelper } from './libs/three/src/helpers/GridHelper.js';
import { TWEEN } from './libs/three/examples/jsm/libs/tween.module.min.js'
import * as Utils from './libs/utils.js'


var alpha = 0, r = 3, index;
var position = { x : 0, y: -Math.PI/2, z: 0 };
var target = { x : 0, y: Math.PI/2, z: 0 };

var cameraDirection, cameraTangent;


//creating a scene, camera and renderer

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x666666)

const aspect = window.innerWidth / window.innerHeight;

const renderer = new THREE.WebGLRenderer({
    antialias: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);
const canvas = renderer.domElement
document.body.appendChild(canvas);
var geometry = new THREE.BoxGeometry(1,1,1);
var material = new THREE.MeshPhongMaterial({
    color:"red"
})
var mesh = new THREE.Mesh(geometry,material);

var group1 = new THREE.Group();

const axesHelperScene = new AxesHelper( 5 );
scene.add( axesHelperScene );
const axesHelperTest = new AxesHelper( 5 );
group1.add( axesHelperTest );

const gridHelper = new THREE.GridHelper( 100, 100 );
scene.add( gridHelper );

//scene.add(mesh);
//console.log(mesh)


var camera;
var cameraRadius = 50;

/*
height = 2;
width = aspect * height;
camera = new THREE.OrthographicCamera(-width,width,height,-height,0.1,100);*/

camera = new THREE.PerspectiveCamera(60,aspect,0.1,1000);
camera.position.set(0, 30, -cameraRadius);

const controls = new OrbitControls( camera, canvas );
controls.mouseButtons = {LEFT:0}
controls.maxDistance = cameraRadius;
controls.minDistance = cameraRadius;
controls.minPolarAngle = THREE.MathUtils.degToRad(45);
controls.maxPolarAngle = THREE.MathUtils.degToRad(45);


//create a light

scene.add(new THREE.AmbientLight(0xffffff,0.3))

const lightColor = 0xffffff;
const intensity = 1;
const light = new THREE.DirectionalLight(lightColor,intensity);
light.position.set(3,3,3);


const lightHelper = new DirectionalLightHelper( light);

scene.add(light);
scene.add( lightHelper );

const gltfLoader = new GLTFLoader();
const url = 'models/robotDog/source/robo_dog.gltf';
var root, mainNode, nodes = [];
gltfLoader.load(url, (gltf) => {
    root = gltf.scene;
    console.log(root)
    console.log(Utils.dumpObject(root).join('\n'));
    //mainNode = root.getObjectByName("GLTF_SceneRootNode");
    //mainNode = root.getObjectByName("RootNode");
    mainNode = root.getObjectByName("blockbench_export");
    console.log(mainNode.position)
    nodeNames(mainNode);
    console.log(nodes);

    function nodeNames(obj){
        if(obj.children.lenght == 0) return;
        obj.children.forEach((child,ndx) => {
            if(child.type == "Object3D"){
                nodes.push(child.name);
            } 
            nodeNames(child);
        });
    }

    // set the camera to frame the box
    /*
    const box = new THREE.Box3().setFromObject(mainNode);
    const boxSize = box.getSize(new THREE.Vector3()).length();
    const boxCenter = box.getCenter(new THREE.Vector3());
    
    frameArea(boxSize * 1.2, boxSize, boxCenter, camera);*/

    //move camera away

    computeCameraDirection();
    group1.add(camera);
    group1.add(mainNode);
    scene.add(group1)

    light.target = mainNode;
    //scene.add(root);

    var tween = new TWEEN.Tween(position).to(target, 5000);

    tween.onUpdate(function(){
        mainNode.rotation.x = position.x;
        mainNode.rotation.y = position.y;
        mainNode.rotation.z = position.z;
    });

    tween.delay(1000);
    tween.repeatDelay(0);
    tween.easing(TWEEN.Easing.Elastic.InOut);
    tween.repeat(Infinity);
    tween.yoyo(true);

    setKeyboardControl();

    controls.addEventListener("change",computeCameraDirection);
    //setMouseControl();

    function setKeyboardControl(){
        document.onkeydown = function(e){
            var speed = 1;
            console.log("DIFF",cameraDirection,cameraTangent,cameraDirection.dot(cameraTangent));

            switch(e.key){
                case "w":{
                    group1.position.x += speed * cameraDirection.x
                    group1.position.z += speed * cameraDirection.y
                    mainNode.rotation.y = Math.atan2(cameraDirection.x,cameraDirection.y);
                    controls.target = mainNode.position;
                    //console.log("forward");
                    break;
                } 
                case "a":{
                    group1.position.x += speed * cameraTangent.x
                    group1.position.z += speed * cameraTangent.y
                    mainNode.rotation.y = Math.PI/2 + Math.atan2(cameraDirection.x,cameraDirection.y);     
                    controls.target = mainNode.position;
                    //console.log("left");
                    break;
                } 
                case "s":{
                    group1.position.x -= speed * cameraDirection.x
                    group1.position.z -= speed * cameraDirection.y
                    mainNode.rotation.y = Math.PI + Math.atan2(cameraDirection.x,cameraDirection.y);
                    controls.target = mainNode.position;
                    //console.log("back");
                    break;
                } 
                case "d":{
                    //TO-DO trying using group1 = main + camera, and moving it
                    group1.position.x -= speed * cameraTangent.x
                    group1.position.z -= speed * cameraTangent.y
                    mainNode.rotation.y = 3 * Math.PI/2 + Math.atan2(cameraDirection.x,cameraDirection.y);
                    controls.target = mainNode.position;
                    //console.log("right"); 
                    break;
                } 
            }
        }
        document.onkeyup = function(e){
            console.log("stop");
        }
    }

    function computeCameraDirection(e){

        cameraDirection = new THREE.Vector2(mainNode.position.x - camera.position.x, mainNode.position.z - camera.position.z).normalize();
        cameraTangent = new THREE.Vector2(1,-cameraDirection.x/cameraDirection.y).normalize();
        console.log("DIFF",cameraDirection,cameraTangent,cameraDirection.dot(cameraTangent));
        
    }
        

    //tween.start();
        
});





index = Math.floor(Math.random() * nodes.length);


animate();


function animate(){
    requestAnimationFrame(animate);
    controls.update();
    lightHelper.update();

    //console.log("CAMERA POS",camera.position,"\nDOG POS",mainNode.position,"\nGROUP1 POS",group1.position,"\nLIGHT POS",light.position)
    

    //light rotation around target
    //alpha += 0.05;
    //light.position.x = (r * Math.sin(alpha));
    //light.position.y = 1;
    //light.position.z = (r * Math.cos(alpha));

    //part.position.x += 0.01;
    
    //console.log(index);
    //mainNode.getObjectByName(nodes[index]).rotation.z += 0.01;
    //mainNode.getObjectByName("bone2").rotation.z += 0.01;
    //root.position.x += 0.1;

    camera.updateProjectionMatrix();
    camera.lookAt(group1.position.x,group1.position.y,group1.position.z);

    TWEEN.update();

    renderer.render(scene,camera);
}

/*
function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
    const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
    
    // compute a unit vector that points in the direction the camera is now
    // from the center of the box
    const direction = (new THREE.Vector3()).subVectors(camera.position, boxCenter).normalize();
    
    // move the camera to a position distance units way from the center
    // in whatever direction the camera was from the center already
    camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));
    
    
    // pick some near and far values for the frustum that
    // will contain the box.
    camera.near = boxSize / 100;
    camera.far = boxSize * 100;
    
    camera.updateProjectionMatrix();
    
    // point the camera to look at the center of the box
    camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
    }*/


