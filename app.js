import * as THREE from './libs/three/build/three.module.js';
import { GLTFLoader } from './libs/three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from './libs/three/examples/jsm/controls/OrbitControls.js';
import { DirectionalLightHelper } from './libs/three/src/helpers/DirectionalLightHelper.js';
import { AxesHelper } from './libs/three/src/helpers/AxesHelper.js';
import { GridHelper } from './libs/three/src/helpers/GridHelper.js';
import { BoxHelper } from './libs/three/src/helpers/BoxHelper.js';
import { TWEEN } from './libs/three/examples/jsm/libs/tween.module.min.js'
import * as Utils from './libs/utils.js'

const DEBUG = false;
var alpha = 0, r = 3, index;
var position = {
    "leg4": 0, "move7": 0, "foot4": 0 ,
    "leg3": 0, "move": 0, "foot3": 0 ,
    "leg2": 0, "move4": 0, "move5":0, "move6": 0,
    "leg1": 0, "move1": 0, "move2":0, "move3": 0,
    "tail":0, "body":0,
    "head":0, "up":0, "down":0, "tongue":10
};

var runTweenGroup,idleTweenGroup;
var runningAnimationProperties = {
    frames: {
        frame1: {
            "leg4": 40, "move7": -30, "foot4": 30,
            "leg3": 0, "move": -30, "foot3": 30,
            "leg2": -30, "move4": -20, "move5":20, "move6": 40,
            "leg1": 0, "move1": 0, "move2":0, "move3": 0,
            
            "tail":-5, "body":0,
            "head":10,"up":0, "down":5
        },
        frame2: {
            "leg4": -60, "move7": 0, "foot4": 60,
            "leg3": 40, "move": -30, "foot3": 30,
            "leg2": -10, "move4": -20, "move5":0, "move6": 0,
            "leg1": -30, "move1": -20, "move2":40, "move3": 40,
            
            "tail": 5, "body":5,
            "head":0, "up":0, "down":10
        },
        frame3: {
            "leg4": -80, "move7": 20, "foot4": 90,
            "leg3": -60, "move": 0, "foot3": 60,
            "leg2": 60, "move4": -20, "move5":40, "move6": 70,
            "leg1": 10, "move1": 0, "move2":0, "move3": 0,
            
            "tail":-5, "body":0,
            "head":-10,"up":0, "down":5
        },
        frame4: {
            "leg4": 0, "move7": -30, "foot4": 30,
            "leg3": -80, "move": 20, "foot3": 90,
            "leg2": 20, "move4": -20, "move5":0, "move6": 0,
            "leg1": 60, "move1": -20, "move2":40, "move3": 70,
            
            "tail": 5, "body":-5,
            "head":0,"up":0, "down":10
        }
    },
    axes:{
        "leg4": 0, "move7": 0, "foot4": 0 ,
        "leg3": 0, "move": 0, "foot3": 0 ,
        "leg2": 0, "move4": 0, "move5":0, "move6": 0,
        "leg1": 0, "move1": 0, "move2":0, "move3": 0,
        "tail":2,"body":0,
        "head":0, "up":0,"down":0
    },
    tweens: [],
    tweenSpeed: [500/4,500/4,500/4,500/4]
}

var idleAnimationProperties = {
    frames: {
        frame1: {
            "leg4": 0, "move7": 0, "foot4": 0 ,
            "leg3": -40, "move": -10, "foot3": 0 ,
            "leg2": 0, "move4": 0, "move5":0, "move6": 0,
            "leg1": 0, "move1": 0, "move2":0, "move3": 0,
            "tail":20, "body":0,
            "head":0, "up":0, "down":5, "tongue":50
        },
        frame2: {
            "leg4": 0, "move7": 0, "foot4": 0 ,
            "leg3": 0, "move": -5, "foot3": 0 ,
            "leg2": 0, "move4": 0, "move5":0, "move6": 0,
            "leg1": 0, "move1": 0, "move2":0, "move3": 0,
            "tail":0, "body":-3,
            "head":-3, "up":0, "down":8, "tongue":100
        },
        frame3: {
            "leg4": 0, "move7": 0, "foot4": 0 ,
            "leg3": 0, "move": 0, "foot3": 0 ,
            "leg2": 20, "move4": 0, "move5":0, "move6": 0,
            "leg1": 0, "move1": 0, "move2":0, "move3": 0,
            "tail":-20, "body":0,
            "head":0, "up":0, "down":5, "tongue":50
        },
        frame4: {
            "leg4": 0, "move7": 0, "foot4": 0 ,
            "leg3": 0, "move": 0, "foot3": 0 ,
            "leg2": 0, "move4": 0, "move5":0, "move6": 0,
            "leg1": 0, "move1": 0, "move2":0, "move3": 0,
            "tail":0, "body":3,
            "head":3, "up":0, "down":8, "tongue":100
        }
    },
    axes:{
        "leg4": 0, "move7": 0, "foot4": 0 ,
        "leg3": 0, "move": 0, "foot3": 0 ,
        "leg2": 0, "move4": 0, "move5":0, "move6": 0,
        "leg1": 0, "move1": 0, "move2":0, "move3": 0,
        "tail":2,"body":0,
        "head":2, "up":0,"down":0,"tongue":3
    },
    tweens: [],
    tweenSpeed: [500/2,500/2,500/2,500/2]
}


var dogBoxHelper;

var cameraDirection, cameraTangent;

var group1Props = {
    scalingValue: 0.05
}

var dogProps = {
    inMovement: false,
    speed: 0.1,
    size: new THREE.Vector3(),
    holdingBox: false
}

var cardboxProps = {
    size: 0.3,
    pickupDistance: 2
}

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

//Creating a box

var cardGeometry = new THREE.BoxGeometry(cardboxProps.size, cardboxProps.size, cardboxProps.size);
var cardMaterial = new THREE.MeshBasicMaterial({
    color: "#634e15"
})
var cardBox = new THREE.Mesh(cardGeometry, cardMaterial);
cardBox.position.z += 5;
cardBox.position.y += cardboxProps.size / 2;
scene.add(cardBox);


var group1 = new THREE.Group();
var dogGroup = new THREE.Group();
const axesHelperScene = new AxesHelper(5);
scene.add(axesHelperScene);
const axesHelperTest = new AxesHelper(5);
group1.add(axesHelperTest);

const gridHelper = new THREE.GridHelper(100, 100);
scene.add(gridHelper);

//scene.add(mesh);
//console.log(mesh)


var camera;
var cameraRadius = 60;

/*
height = 2;
width = aspect * height;
camera = new THREE.OrthographicCamera(-width,width,height,-height,0.1,100);*/

camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
//camera.position.set(0, 30, -cameraRadius);
camera.position.set(-cameraRadius, 0, 0);

const controls = new OrbitControls(camera, canvas);
if (!DEBUG) {
    controls.mouseButtons = { LEFT: 0 }
    controls.maxDistance = cameraRadius;
    controls.minDistance = cameraRadius;
    controls.minPolarAngle = THREE.MathUtils.degToRad(20);
    controls.maxPolarAngle = THREE.MathUtils.degToRad(70);
}



//create a light

scene.add(new THREE.AmbientLight(0xffffff, 0.3))

const lightColor = 0xffffff;
const intensity = 1;
const light = new THREE.DirectionalLight(lightColor, intensity);
light.position.set(3, 3, 3);


const lightHelper = new DirectionalLightHelper(light);

scene.add(light);
scene.add(lightHelper);

const gltfLoader = new GLTFLoader();
//const url = 'models/robotDog/source/robo_dog.gltf';
const url = 'models/test/dog2.gltf'
var root, mainNode, dogBoundingBox, nodes = [];
gltfLoader.load(url, (gltf) => {

    root = gltf.scene;


    console.log(Utils.dumpObject(root).join('\n'));
    //mainNode = root.getObjectByName("GLTF_SceneRootNode");
    //mainNode = root.getObjectByName("RootNode");
    //mainNode = root.getObjectByName("blockbench_export");
    mainNode = root.getObjectByName("Scene");
    dogBoundingBox = new THREE.Box3().setFromObject(mainNode);
    dogBoundingBox.getSize(dogProps.size);

    console.log(Utils.dumpObject(root.getObjectByName("leg4")).join('\n'))
    console.log(mainNode.position)
    nodeNames(root.getObjectByName("leg4"));
    console.log("NODES", nodes);

    function nodeNames(obj) {
        if (obj.children.lenght == 0) return;
        obj.children.forEach((child, ndx) => {
            if (child.type == "Object3D") {
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
    //group1.add(mainNode);
    dogGroup.add(mainNode);
    group1.add(dogGroup);
    group1.scale.set(group1Props.scalingValue, group1Props.scalingValue, group1Props.scalingValue)
    scene.add(group1)

    dogBoxHelper = new BoxHelper(mainNode, 0xffff00);
    scene.add(dogBoxHelper);

    //light.target = mainNode;
    //scene.add(root);

    runTweenGroup = new TWEEN.Group();
    idleTweenGroup = new TWEEN.Group();

    createAnimationTweens(runTweenGroup,runningAnimationProperties);
    createAnimationTweens(idleTweenGroup,idleAnimationProperties);

    function createAnimationTweens(group,props){
        var tween;
        var len = Object.keys(props.frames).length;
        
        for(let i=0;i<len;i++){
            tween = new TWEEN.Tween(position,group).to(Object.values(props.frames)[i],
                props.tweenSpeed[i]);
            tween.onUpdate(moveParts,props);          
            if(i!=0) props.tweens[i-1].chain(tween);   
            props.tweens.push(tween);       
        }
        props.tweens[len-1].chain(props.tweens[0]);
        console.log(props);

        function moveParts() {
            Object.keys(position).forEach(part => {
                switch(props.axes[part]){
                    case 0:{
                        mainNode.getObjectByName(part).rotation.x = THREE.MathUtils.degToRad(position[part])
                        break;
                    }
                    case 1:{
                        mainNode.getObjectByName(part).rotation.y = THREE.MathUtils.degToRad(position[part])
                        break;
                    }
                    case 2:{
                        mainNode.getObjectByName(part).rotation.z = THREE.MathUtils.degToRad(position[part])
                        break;
                    }
                    case 3:{
                        mainNode.getObjectByName(part).scale.z = THREE.MathUtils.degToRad(position[part])
                        break;
                    }
                }
            });
        }
    }

    /*
    tween1 = new TWEEN.Tween(position,runTweenGroup).to(runningAnimationProperties.frames.frame1, 500/4);
    tween2 = new TWEEN.Tween(position,runTweenGroup).to(runningAnimationProperties.frames.frame2, 500/4);
    tween3 = new TWEEN.Tween(position,runTweenGroup).to(runningAnimationProperties.frames.frame3, 500/4);
    tween4 = new TWEEN.Tween(position,runTweenGroup).to(runningAnimationProperties.frames.frame4, 500/4);

    tween1.onUpdate(moveParts);
    //runningAnimationProperties.tweens.push(tween1);
    tween2.onUpdate(moveParts);
    tween3.onUpdate(moveParts);
    tween4.onUpdate(moveParts);
    */

    

    //moveParts();

    //tween1.delay(1000);
    //tween1.repeatDelay(0);
    //tween.easing(TWEEN.Easing.Linear.None);
    /*
    tween1.chain(tween2);
    tween2.chain(tween3);
    tween3.chain(tween4);
    tween4.chain(tween1);
    */
    //tween2.easing(TWEEN.Easing.Back.In);
    //tween.repeat(Infinity);
    //tween.yoyo(true);

    setKeyboardControl();

    controls.addEventListener("change", computeCameraDirection);
    //setMouseControl();

    function setKeyboardControl() {
        document.onkeydown = function (e) {

            //console.log("DIFF",cameraDirection,cameraTangent,cameraDirection.dot(cameraTangent));
            //console.log(e);
            switch (e.key) {
                case "w": {
                    dogProps.inMovement = true;
                    var speed = dogProps.speed;

                    group1.position.x += speed * cameraDirection.x
                    group1.position.z += speed * cameraDirection.y
                    dogGroup.rotation.y = Math.atan2(cameraDirection.x, cameraDirection.y);
                    controls.target = mainNode.position;
                    console.log("forward");
                    break;
                }
                case "a": {
                    
                    dogProps.inMovement = true;
                     
                    var speed = dogProps.speed;

                    group1.position.x += speed * cameraTangent.x
                    group1.position.z += speed * cameraTangent.y
                    dogGroup.rotation.y = Math.PI / 2 + Math.atan2(cameraDirection.x, cameraDirection.y);
                    controls.target = mainNode.position;
                    console.log("left");
                    break;
                }
                case "s": {
                    
                    dogProps.inMovement = true;
                    
                    var speed = dogProps.speed;

                    group1.position.x -= speed * cameraDirection.x
                    group1.position.z -= speed * cameraDirection.y
                    dogGroup.rotation.y = Math.PI + Math.atan2(cameraDirection.x, cameraDirection.y);
                    controls.target = mainNode.position;
                    console.log("back");
                    break;
                }
                case "d": {
                    dogProps.inMovement = true;
                    var speed = dogProps.speed;

                    group1.position.x -= speed * cameraTangent.x
                    group1.position.z -= speed * cameraTangent.y
                    dogGroup.rotation.y = 3 * Math.PI / 2 + Math.atan2(cameraDirection.x, cameraDirection.y);
                    controls.target = mainNode.position;
                    console.log("right");
                    break;
                }

                //box interaction

                case "f": {
                    if (e.repeat) break;

                    if (dogProps.holdingBox) {
                        scene.add(cardBox);
                        console.log(group1.position);

                        cardBox.scale.set(1, 1, 1);
                        cardBox.position.set(group1.position.x, group1.position.y + cardboxProps.size / 2, group1.position.z);
                        console.log(cardBox.scale)
                        dogProps.holdingBox = false;
                        console.log("release")
                    } else {

                        if (group1.position.distanceTo(cardBox.position) > cardboxProps.pickupDistance) break;

                        mainNode.getObjectByName("body").add(cardBox);
                        cardBox.position.set(0, dogProps.size.y / 2.0 * 0.5, -dogProps.size.z / 2.0 * 0.2);
                        cardBox.scale.set(1 / group1Props.scalingValue, 1 / group1Props.scalingValue, 1 / group1Props.scalingValue)
                        dogProps.holdingBox = true;
                        console.log("pick")
                    }

                    break;
                }
            }
        }
        document.onkeyup = function (e) {
            switch (e.key) {
                case "w": case "a": case "s": case "d": {
                    dogProps.inMovement = false;
                    console.log("stop");
                    break;
                }
                default:
            }

        }
    }

    function computeCameraDirection(e) {

        cameraDirection = new THREE.Vector2(mainNode.position.x - camera.position.x, mainNode.position.z - camera.position.z).normalize();
        cameraTangent = new THREE.Vector2(1, -cameraDirection.x / cameraDirection.y).normalize().multiplyScalar(cameraDirection.y >= 0 ? 1 : -1);
        //console.log("DIFF",cameraDirection,cameraTangent,cameraDirection.dot(cameraTangent));

    }

    const axesHelperPart = new AxesHelper(5);
    mainNode.getObjectByName("leg4").add(axesHelperPart);


    //tween1.start();
    runningAnimationProperties.tweens[0].start();
    idleAnimationProperties.tweens[0].start();
});



animate();




function animate() {
    requestAnimationFrame(animate);
    controls.update();
    lightHelper.update();
    dogBoxHelper.update();

    dogAnimationHandler();

    //console.log("CAMERA POS",camera.position,"\nDOG POS",mainNode.position,"\nGROUP1 POS",group1.position,"\nLIGHT POS",light.position)
    //console.log(dogProps)

    //light rotation around target
    //alpha += 0.05;
    //light.position.x = (r * Math.sin(alpha));
    //light.position.y = 1;
    //light.position.z = (r * Math.cos(alpha));

    //part.position.x += 0.01;

    //console.log(index);
    //mainNode.getObjectByName(nodes[index]).rotation.z += 0.01;

    /*
    
    mainNode.getObjectByName("move6").rotation.x = THREE.MathUtils.degToRad(50);
    */

    
    //mainNode.getObjectByName("body").rotation.z = THREE.MathUtils.degToRad(5)
    //root.position.x += 0.1;


    camera.updateProjectionMatrix();
    camera.lookAt(group1.position.x, group1.position.y, group1.position.z);

    //TWEEN.update();

    renderer.render(scene, camera);
}

function dogAnimationHandler(){
    if(dogProps.inMovement) runTweenGroup.update();
    else idleTweenGroup.update();
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


