import * as THREE from './libs/three/build/three.module.js';
import { GLTFLoader } from './libs/three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from './libs/three/examples/jsm/controls/OrbitControls.js';
import { DirectionalLightHelper } from './libs/three/src/helpers/DirectionalLightHelper.js';
import { AxesHelper } from './libs/three/src/helpers/AxesHelper.js';
import { GridHelper } from './libs/three/src/helpers/GridHelper.js';
import { TWEEN } from './libs/three/examples/jsm/libs/tween.module.min.js'
import * as Utils from './libs/utils.js'

const DEBUG = false;
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


var dogBoxHelper, dogBox3;
var houseBoxHelpers = [];
var houseBox3 = [];

var inc = 0, shift = 0, directionIndex = 0;
var directionsAxes = [new THREE.Vector2(0,0),new THREE.Vector2(0,0)];
//cameraDirection, cameraTangent;

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
//scene.background = new THREE.Color(0x87ceeb)

const aspect = window.innerWidth / window.innerHeight;

const canvas = document.querySelector('#c');

const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    //alpha:true
});
renderer.setSize(window.innerWidth, window.innerHeight);

//Creating a box

var cardGeometry = new THREE.BoxGeometry(cardboxProps.size, cardboxProps.size, cardboxProps.size);
var cardMaterial = new THREE.MeshBasicMaterial({
    color: "#634e15"
})
var cardBox = new THREE.Mesh(cardGeometry, cardMaterial);
cardBox.position.z += 5;
cardBox.position.y += cardboxProps.size / 2;
scene.add(cardBox);

const loader = new THREE.TextureLoader();
const texture = loader.load(
  'models/skybox/goegap_4k.jpg',
  () => {
    const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
    rt.fromEquirectangularTexture(renderer, texture);
    scene.background = rt.texture;
  });


var group1 = new THREE.Group();
var dogGroup = new THREE.Group();

if(DEBUG){
    const axesHelperScene = new AxesHelper(5);
    scene.add(axesHelperScene);
    const axesHelperTest = new AxesHelper(5);
    group1.add(axesHelperTest);
    const gridHelper = new THREE.GridHelper(100, 100);
    scene.add(gridHelper);
}


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

window.addEventListener( 'resize', resizeCanvas);

function resizeCanvas(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}


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

const lightColor = 0xffeeee;
const intensity = 2;
const light = new THREE.DirectionalLight(lightColor, intensity);
light.position.set(20, 20, 20);

scene.add(light);

var lightHelper = null;

if(DEBUG){
    lightHelper = new DirectionalLightHelper(light);
    scene.add(lightHelper);
}


const gltfLoader = new GLTFLoader();
//const url = 'models/robotDog/source/robo_dog.gltf';
const url = 'models/test/dog2.gltf'
var root, mainNode;
gltfLoader.load(url, (gltf) => {

    root = gltf.scene;


    console.log(Utils.dumpObject(root).join('\n'));
    //mainNode = root.getObjectByName("GLTF_SceneRootNode");
    //mainNode = root.getObjectByName("RootNode");
    //mainNode = root.getObjectByName("blockbench_export");
    mainNode = root.getObjectByName("Scene");
    

    console.log(Utils.dumpObject(mainNode.getObjectByName("Scene")).join('\n'))

    computeCameraDirection();
    group1.add(camera);
    //group1.add(mainNode);
    dogGroup.add(mainNode);
    group1.add(dogGroup);
    group1.scale.set(group1Props.scalingValue, group1Props.scalingValue, group1Props.scalingValue)
    scene.add(group1)

    dogBox3 = new THREE.Box3().setFromObject(dogGroup);
    dogBox3.getSize(dogProps.size);
    //group1.add(dogBox3)
    dogBoxHelper = new THREE.BoxHelper(dogGroup);
    if(DEBUG)scene.add(dogBoxHelper);

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

            //computeCameraDirection();
            
            switch (e.key) {
                case "w": {
                    
                    
                    directionIndex = 0;
                    
                    
                    /*
                    group1.position.x += speed * cameraDirection.x
                    group1.position.z += speed * cameraDirection.y*/
                    
                    inc = 1
                    shift = 0
                    dogProps.inMovement = true;
                    controls.target = mainNode.position;
                    //console.log("forward");
                    break;
                }
                case "a": {
                    directionIndex = 1;
                    
                  
                    /*
                    group1.position.x += speed * cameraTangent.x
                    group1.position.z += speed * cameraTangent.y*/
                    
                    inc = 1
                    shift = 1/2;
                    dogProps.inMovement = true;
                    controls.target = mainNode.position;
                    //console.log("left");
                    break;
                }
                case "s": {
                    directionIndex = 0;
                    
                    
                    
                    /*
                    group1.position.x -= speed * cameraDirection.x
                    group1.position.z -= speed * cameraDirection.y*/
                    //dogGroup.rotation.y = Math.PI + Math.atan2(cameraDirection.x, cameraDirection.y);
                    
                    inc = -1
                    shift = 1
                    dogProps.inMovement = true;
                    controls.target = mainNode.position;
                    //console.log("back");
                    break;
                }
                case "d": {
                    directionIndex = 1;
                    
                    
                    /*
                    group1.position.x -= speed * cameraTangent.x
                    group1.position.z -= speed * cameraTangent.y
                    dogGroup.rotation.y = 3 * Math.PI / 2 + Math.atan2(cameraDirection.x, cameraDirection.y);*/
                    
                    inc = -1
                    shift = 3/2
                    dogProps.inMovement = true;
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
                    break;
                }
                default:
            }

        }
    }

    function computeCameraDirection(e) {

        var cameraDirection = new THREE.Vector2(mainNode.position.x - camera.position.x, mainNode.position.z - camera.position.z).normalize();
        directionsAxes[0] = cameraDirection;
        directionsAxes[1]  = new THREE.Vector2(1, -cameraDirection.x / cameraDirection.y).normalize().multiplyScalar(cameraDirection.y >= 0 ? 1 : -1);
        
    }

    //tween1.start();
    runningAnimationProperties.tweens[0].start();
    idleAnimationProperties.tweens[0].start();

    

});

const url2 = './models/enviroment/scene.gltf'
gltfLoader.load(url2, (gltf2) => {
    var root2 = gltf2.scene;

    console.log(Utils.dumpObject(root2).join('\n'));
    var mainNode2 = root2.getObjectByName("RootNode");

    mainNode2.scale.set(0.008,0.008,0.008);
    gltf2.scene.updateMatrixWorld( true )
    mainNode2.children[0].scale.set(3,3,3);
    mainNode2.children.slice(1).forEach((obj,ndx) => {
        //obj.scale.set(0.008,0.008,0.008)
        houseBox3[ndx] = new THREE.Box3().setFromObject(obj);
        //obj.scale.set(1,1,1)
        //console.log("--->",houseBox3[ndx].min,houseBox3[ndx].max);
        if(DEBUG){
            houseBoxHelpers[ndx] = new THREE.BoxHelper(obj);
            scene.add(houseBoxHelpers[ndx]);
        }
    });
    scene.add(mainNode2);
    /*
    houseBox3.shift();
    houseBoxHelpers.shift();*/

})

var arrowHelper;
var previousDogPosition = [];

animate();


function animate() {
    requestAnimationFrame(animate);

    

    controls.update();

    if(DEBUG){
        lightHelper.update();
        houseBoxHelpers.forEach(helper => {
            helper.update();
        });  
    }
    

    

    if(DEBUG){
        scene.remove(arrowHelper);
        arrowHelper = new THREE.ArrowHelper( new THREE.Vector3(directionsAxes[0].x,0,directionsAxes[0].y), group1.position, 2, 0xffff00 );
        scene.add( arrowHelper );
    }


    if(dogProps.inMovement){

        previousDogPosition = [group1.position.x,group1.position.z,dogGroup.rotation.y];
        group1.position.x +=  inc *dogProps.speed * directionsAxes[directionIndex].x
        group1.position.z +=  inc * dogProps.speed * directionsAxes[directionIndex].y
        dogGroup.rotation.y = shift * Math.PI + Math.atan2(directionsAxes[0].x, directionsAxes[0].y);
        dogBox3 = new THREE.Box3().setFromObject(group1);
        //console.log(houseBox3);

        for(var i = 0;i < houseBox3.length;i++){
            if(dogBox3.intersectsBox(houseBox3[i])) {
                console.log("c");
                console.log(previousDogPosition)
                group1.position.x =  previousDogPosition[0];
                group1.position.z =  previousDogPosition[1];
                dogGroup.rotation.y = previousDogPosition[2];
                break;
            }
        }

        if(DEBUG) dogBoxHelper.update();
    }

    

    
    
    
    

    //var test = new THREE.Vector3();

    //console.log(houseBox3[0])
    /*
    houseBox3[0].getCenter(test)
    console.log("C",test)
    houseBox3[0].getSize(test)
    console.log("S",test)
*/
    dogAnimationHandler();

    //console.log("CAMERA POS",camera.position,"\nDOG POS",mainNode.position,"\nGROUP1 POS",group1.position,"\nLIGHT POS",light.position)


    //camera.updateProjectionMatrix();
    camera.lookAt(group1.position.x, group1.position.y, group1.position.z);

    //TWEEN.update();

    renderer.render(scene, camera);
}

function dogAnimationHandler(){
    if(dogProps.inMovement) runTweenGroup.update();
    else idleTweenGroup.update();
}



