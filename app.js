import * as THREE from './libs/three/build/three.module.js';
import { GLTFLoader } from './libs/three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from './libs/three/examples/jsm/controls/OrbitControls.js';
import { DirectionalLightHelper } from './libs/three/src/helpers/DirectionalLightHelper.js';
import { AxesHelper } from './libs/three/src/helpers/AxesHelper.js';
import { GridHelper } from './libs/three/src/helpers/GridHelper.js';
import { BoxHelper } from './libs/three/src/helpers/BoxHelper.js';
import { TWEEN } from './libs/three/examples/jsm/libs/tween.module.min.js'
import * as Utils from './libs/utils.js'

const DEBUG = true;
var alpha = 0, r = 3, index;
var dogJoints = {
    "leg4": 0, "move7": 0, "foot4": 0 ,
    "leg3": 0, "move": 0, "foot3": 0 ,
    "leg2": 0, "move4": 0, "move5":0, "move6": 0,
    "leg1": 0, "move1": 0, "move2":0, "move3": 0,
    "tail":0, "body":0,
    "head":0, "up":0, "down":0, "tongue":50
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
            "leg3": 0, "move": 0, "foot3": 0 ,
            "leg2": 0, "move4": 0, "move5":0, "move6": 0,
            "leg1": 0, "move1": 0, "move2":0, "move3": 0,
            "tail":20, "body":0,
            "head":0, "up":0, "down":5, "tongue":50
        },
        frame2: {
            "leg4": 0, "move7": 0, "foot4": 0 ,
            "leg3": 0, "move": 0, "foot3": 0 ,
            "leg2": 0, "move4": 0, "move5":0, "move6": 0,
            "leg1": 0, "move1": 0, "move2":0, "move3": 0,
            "tail":0, "body":-3,
            "head":-3, "up":0, "down":8, "tongue":100
        },
        frame3: {
            "leg4": 0, "move7": 0, "foot4": 0 ,
            "leg3": 0, "move": 0, "foot3": 0 ,
            "leg2": 0, "move4": 0, "move5":0, "move6": 0,
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

var inc = 0, shift = 0, actualDirection = new THREE.Vector2(0,0),cameraDirection, cameraTangent;

var group1Props = {
    scalingValue: 0.05
}

var dogProps = {
    inMovement: false,
    speed: 0.15,
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
var root, mainNode, dogBoundingBox;
gltfLoader.load(url, (gltf) => {

    root = gltf.scene;


    console.log(Utils.dumpObject(root).join('\n'));
    //mainNode = root.getObjectByName("GLTF_SceneRootNode");
    //mainNode = root.getObjectByName("RootNode");
    //mainNode = root.getObjectByName("blockbench_export");
    mainNode = root.getObjectByName("Scene");
    dogBoundingBox = new THREE.Box3().setFromObject(mainNode);
    dogBoundingBox.getSize(dogProps.size);

    console.log(Utils.dumpObject(mainNode.getObjectByName("Scene")).join('\n'))

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
            tween = new TWEEN.Tween(dogJoints,group).to(Object.values(props.frames)[i],
                props.tweenSpeed[i]);
            tween.onUpdate(moveParts,props);          
            if(i!=0) props.tweens[i-1].chain(tween);   
            props.tweens.push(tween);       
        }
        props.tweens[len-1].chain(props.tweens[0]);
        console.log(props);

        function moveParts() {
            Object.keys(dogJoints).forEach(part => {
                switch(props.axes[part]){
                    case 0:{
                        mainNode.getObjectByName(part).rotation.x = THREE.MathUtils.degToRad(dogJoints[part])
                        break;
                    }
                    case 1:{
                        mainNode.getObjectByName(part).rotation.y = THREE.MathUtils.degToRad(dogJoints[part])
                        break;
                    }
                    case 2:{
                        mainNode.getObjectByName(part).rotation.z = THREE.MathUtils.degToRad(dogJoints[part])
                        break;
                    }
                    case 3:{
                        mainNode.getObjectByName(part).scale.z = THREE.MathUtils.degToRad(dogJoints[part])
                        break;
                    }
                }
            });
        }
    }

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
                    
                    /*
                    group1.position.x += speed * cameraDirection.x
                    group1.position.z += speed * cameraDirection.y*/
                    actualDirection = cameraDirection;
                    inc = 1
                    shift = 0
                    controls.target = mainNode.position;
                    //console.log("forward");
                    break;
                }
                case "a": {
                    
                    dogProps.inMovement = true;
                  
                    /*
                    group1.position.x += speed * cameraTangent.x
                    group1.position.z += speed * cameraTangent.y*/
                    actualDirection = cameraTangent;
                    inc = 1
                    shift = 1/2;
                    controls.target = mainNode.position;
                    //console.log("left");
                    break;
                }
                case "s": {
                    
                    dogProps.inMovement = true;
                    
                    
                    /*
                    group1.position.x -= speed * cameraDirection.x
                    group1.position.z -= speed * cameraDirection.y*/
                    //dogGroup.rotation.y = Math.PI + Math.atan2(cameraDirection.x, cameraDirection.y);
                    actualDirection = cameraDirection;
                    inc = -1
                    shift = 1
                    controls.target = mainNode.position;
                    //console.log("back");
                    break;
                }
                case "d": {
                    dogProps.inMovement = true;
                    
                    /*
                    group1.position.x -= speed * cameraTangent.x
                    group1.position.z -= speed * cameraTangent.y
                    dogGroup.rotation.y = 3 * Math.PI / 2 + Math.atan2(cameraDirection.x, cameraDirection.y);*/
                    actualDirection = cameraTangent;
                    inc = -1
                    shift = 3/2
                    controls.target = mainNode.position;
                    //console.log("right");
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
                    inc = 0;
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

const url2 = './models/enviroment/scene.gltf'
gltfLoader.load(url2, (gltf2) => {
    var root2 = gltf2.scene;

    console.log(Utils.dumpObject(root2).join('\n'));
    var mainNode2 = root2.getObjectByName("Sketchfab_Scene");

    root2.scale.set(0.008,0.008,0.008);
    scene.add(mainNode2);
})



animate();




function animate() {
    requestAnimationFrame(animate);
    controls.update();
    lightHelper.update();
    dogBoxHelper.update();

    if(dogProps.inMovement){
        group1.position.x +=  inc *dogProps.speed * actualDirection.x
        group1.position.z +=  inc * dogProps.speed * actualDirection.y
        dogGroup.rotation.y = shift * Math.PI + Math.atan2(cameraDirection.x, cameraDirection.y);
    }
    

    dogAnimationHandler();

    //console.log("CAMERA POS",camera.position,"\nDOG POS",mainNode.position,"\nGROUP1 POS",group1.position,"\nLIGHT POS",light.position)


    camera.updateProjectionMatrix();
    camera.lookAt(group1.position.x, group1.position.y, group1.position.z);

    //TWEEN.update();

    renderer.render(scene, camera);
}

function dogAnimationHandler(){
    if(dogProps.inMovement) runTweenGroup.update();
    else idleTweenGroup.update();
}



