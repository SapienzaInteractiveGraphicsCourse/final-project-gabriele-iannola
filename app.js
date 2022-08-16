import * as THREE from './libs/three/build/three.module.js';
import { GLTFLoader } from './libs/three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from './libs/three/examples/jsm/controls/OrbitControls.js';
import { DirectionalLightHelper } from './libs/three/src/helpers/DirectionalLightHelper.js';
import { AxesHelper } from './libs/three/src/helpers/AxesHelper.js';
import { TWEEN } from './libs/three/examples/jsm/libs/tween.module.min.js'
import * as Utils from './libs/utils.js'

const DEBUG = false;
const PLAY_TIME = 30;
const WIN_SCORE = 2;
var deliveredPackages = 0;
var batteryValue = 100;

var selPoint = 0;
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
var cardBox3,cardBoxHelper;
var anchorBox3,anchorBoxHelper;
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
    holdingBox: false,
    rendered: false,
    locked: true
}

var cardboxProps = {
    size: 0.02,
    pickupDistance: 2
}

var anchorProps = {
    size: 1,
    height: 0.05,
    points: [
        new THREE.Vector3(9.5,0,10.7),
        new THREE.Vector3(2.1,0,14.4),
        new THREE.Vector3(-2.3,0,9.5),
        new THREE.Vector3(-13.5,0,9.9),
        new THREE.Vector3(13.8,0,-0.9),
        new THREE.Vector3(-14.7,0,-1.1),
        new THREE.Vector3(9.4,0,-13.8),
        new THREE.Vector3(-0.9,0,-15.8),
        new THREE.Vector3(-9.2,0,-10.5),
    ],
    lastAnchorChoice:-1,
}

var batteryStates = [
    ["./textures/battery-1.png","b1"],
    ["./textures/battery-2.png","b2"],
    ["./textures/battery-3.png","b3"],
    ["./textures/battery-4.png","b4"]
]

//creating a scene, camera and renderer

const scene = new THREE.Scene();
//scene.background = new THREE.Color(0x87ceeb)

const loader = new THREE.TextureLoader();
const texture = loader.load(
  'models/skybox/goegap_4k.jpg',
  () => {
    const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
    rt.fromEquirectangularTexture(renderer, texture);
    scene.background = rt.texture;
  });


const aspect = window.innerWidth / window.innerHeight;

const canvas = document.querySelector('#c');

const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    //alpha:true
});
renderer.setSize(window.innerWidth, window.innerHeight);


const clock = new THREE.Clock(false);



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
camera.position.set(0, 30, -cameraRadius);
//camera.position.set(-cameraRadius, 0, 0);

window.addEventListener( 'resize', resizeCanvas);

function resizeCanvas(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    //test.position.x = - window.innerWidth * 0.0027;
    //test.position.y = - window.innerHeight * 0.002;
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

//Creating an anchor point
var anchorSolid;
{
    var anchorGeometry = new THREE.BoxGeometry(anchorProps.size, anchorProps.height, anchorProps.size);
    var anchorMaterial = new THREE.MeshBasicMaterial({
        color: "#ffffff"
    })
    anchorSolid = new THREE.Mesh(anchorGeometry, anchorMaterial);
    anchorSolid.position.y = -10;    
    scene.add(anchorSolid);

    anchorBox3 = new THREE.Box3().setFromObject(anchorSolid);
    if(DEBUG){
        anchorBoxHelper = new THREE.BoxHelper(anchorSolid);
        scene.add(anchorBoxHelper);
    }
}

//Creating a box
var cardBox;
/*
{
    var cardGeometry = new THREE.BoxGeometry(cardboxProps.size, cardboxProps.size, cardboxProps.size);
    var cardMaterial = new THREE.MeshBasicMaterial({
        color: "#634e15"
    })
    cardBox = new THREE.Mesh(cardGeometry, cardMaterial);

    cardBox.position.y = -10;
    scene.add(cardBox);

    cardBox3 = new THREE.Box3().setFromObject(cardBox);

    if(DEBUG){
        cardBoxHelper = new THREE.BoxHelper(cardBox);
        scene.add(cardBoxHelper);
    }
}*/

const url4 = './models/crate/source/model.gltf'
gltfLoader.load(url4, (gltf4) => {
    cardBox = gltf4.scene;

    console.log(">>ROOT4--",Utils.dumpObject(cardBox).join('\n'));

    cardBox.scale.set(cardboxProps.size,cardboxProps.size,cardboxProps.size);

    cardBox.position.y = -10;
    scene.add(cardBox);

    cardBox3 = new THREE.Box3().setFromObject(cardBox);

    if(DEBUG){
        cardBoxHelper = new THREE.BoxHelper(cardBox);
        scene.add(cardBoxHelper);
    }
 
})


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
            if(dogProps.locked) return;
            switch (e.key.toLowerCase()) {
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

                        cardBox.scale.set(cardboxProps.size, cardboxProps.size, cardboxProps.size);
                        cardBox.position.set(group1.position.x, group1.position.y + cardboxProps.size / 2, group1.position.z);
                        cardBox3 = new THREE.Box3().setFromObject(cardBox);
                        dogProps.holdingBox = false;
                        console.log("release")

                        if(cardBox3.intersectsBox(anchorBox3)){
                            console.log("POINT")
                            deliveredPackages += 1;
                            document.getElementById("crateValue").innerHTML = deliveredPackages.toString() + "/" + WIN_SCORE.toString();
                            spawnBoxRandom();
                        } 

                    } else {

                        if (group1.position.distanceTo(cardBox.position) > cardboxProps.pickupDistance) break;

                        mainNode.getObjectByName("body").add(cardBox);
                        cardBox.position.set(-3.2, dogProps.size.y / 2.0 * 0.2, -dogProps.size.z / 2.0 * 0.5);
                        cardBox.scale.set(1 / group1Props.scalingValue * cardboxProps.size, 1 / group1Props.scalingValue * cardboxProps.size, 1 / group1Props.scalingValue * cardboxProps.size)
                        dogProps.holdingBox = true;
                        console.log("pick")
                    }

                    break;
                }

                case "g":{

                    console.log("DEBUG");
                    cardBox.position.x = 0;
                    cardBox.position.y = 0.5;
                    cardBox.position.z = 0;
                    
                    break;
                }

            }
        }
        document.onkeyup = function (e) {
            switch (e.key.toLowerCase()) {
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

    dogProps.rendered = true;

});

const url2 = './models/enviroment/scene.gltf'
var root2,mainNode2
gltfLoader.load(url2, (gltf2) => {
    root2 = gltf2.scene;

    console.log(Utils.dumpObject(root2).join('\n'));
    mainNode2 = root2.getObjectByName("RootNode");

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
    mainNode2.position.y -= 0.05;
    scene.add(mainNode2);
    /*
    houseBox3.shift();
    houseBoxHelpers.shift();*/

})

const url3 = './models/arrow/scene.gltf'
var root3,mainNode3
gltfLoader.load(url3, (gltf3) => {
    root3 = gltf3.scene;

    console.log(Utils.dumpObject(root3).join('\n'));
    mainNode3 = root3.getObjectByName("RootNode");

   
    group1.add(mainNode3);
    mainNode3.position.y += 20;
    mainNode3.scale.y = 2
    mainNode3.scale.z *= -1
 
})

var previousDogPosition = [];

var startButton = document.createElement("INPUT");
startButton.setAttribute("type","button");
startButton.value = "Start New Game";
startButton.id = "gameStartButton";
startButton.onclick = startNewGame;
document.getElementById("container").appendChild(startButton)

animate();
//clock.start();

var gameOver;

function animate() {
    requestAnimationFrame(animate);

    controls.update();

    //console.log(cardBox3)
    //console.log(">>",clock.getElapsedTime())

    gameOver = timeHandler()

    if(gameOver!=undefined){
        console.log("STOP!")
        if(!gameOver){
            alert("You win!")
            resetGame()
        }else{
            alert("You lose!")
            resetGame()
        }
    }

    if(DEBUG){
        lightHelper.update();
        cardBoxHelper.update();
        anchorBoxHelper.update();
        houseBoxHelpers.forEach(helper => {
            helper.update();
        });  
    
        
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
                group1.position.x =  previousDogPosition[0];
                group1.position.z =  previousDogPosition[1];
                dogGroup.rotation.y = previousDogPosition[2];
                break;
            }
        }

        if(DEBUG) dogBoxHelper.update();
    }
    if(dogProps.rendered) dogAnimationHandler();

    //console.log("CAMERA POS",camera.position,"\nDOG POS",mainNode.position,"\nGROUP1 POS",group1.position,"\nLIGHT POS",light.position)


    camera.updateProjectionMatrix();
    camera.lookAt(group1.position.x, group1.position.y, group1.position.z);

    if(dogProps.locked) group1.remove(mainNode3);
    dogProps.holdingBox ? 
        mainNode3.lookAt(anchorSolid.position.x, anchorSolid.position.y, anchorSolid.position.z) : 
        mainNode3.lookAt(cardBox.position.x, cardBox.position.y, cardBox.position.z)

    //mainNode3.lookAt(1,1,1);
    //TWEEN.update();

    renderer.render(scene, camera);
}

function dogAnimationHandler(){
    
    if(dogProps.inMovement) runTweenGroup.update();
    else idleTweenGroup.update();
}

function spawnBoxRandom(){
    var rx,rz;
    do{
        console.log("try");
        rx = THREE.MathUtils.randFloat(-30,30);
        rz = THREE.MathUtils.randFloat(-30,30);
        cardBox.position.set(rx,0,rz);
        cardBox3 = new THREE.Box3().setFromObject(cardBox);
    }while(checkIntersect())

    cardBox.position.y = cardboxProps.size / 2;
    //console.log(cardBox.position);

    function checkIntersect(){
        for(var i = 0;i < houseBox3.length;i++){
            if(cardBox3.intersectsBox(houseBox3[i])) {
                console.log("fail");
                return true;
            }
        }
    }
    
    console.log("box positioned at",rx,rz)

    var distance = anchorProps.points.map((point)=>cardBox.position.distanceTo(point));
    //var distanceSum = 
    var probDistribution = distance.map((x => x / (distance.reduce(((total,curr) => total + curr),0))))

    var sortedProb = probDistribution.map((x) => [probDistribution.indexOf(x),x]).sort((a,b)=>a[1] - b[1]);
    var r = Math.random();
    console.log("Probs",sortedProb);
    console.log("R",r);
    for(let i = 0; i < sortedProb.length; i++){
        if(r <= sortedProb[i][1]){
            console.log(sortedProb[i])
            if(sortedProb[i][0] == anchorProps.lastAnchorChoice){
                r -= sortedProb[i][1];
                continue;
            }
            anchorProps.lastAnchorChoice = sortedProb[i][0];
            var choice = anchorProps.points[anchorProps.lastAnchorChoice];
            anchorSolid.position.set(choice.x,choice.y,choice.z);
            anchorBox3 = new THREE.Box3().setFromObject(anchorSolid);
            break;
        }
        r -= sortedProb[i][1];
    }
    //console.log("prob",probDistribution)

    

}

function timeHandler(){
    batteryValue = Math.ceil((PLAY_TIME - clock.getElapsedTime())/PLAY_TIME * 100);
    var batteryValueObj = document.getElementById("batteryValue");
    batteryValueObj.innerHTML = batteryValue.toString() + "%";

    if(WIN_SCORE - deliveredPackages <= 0){
        console.log("GAME WIN!")
        deliveredPackages = 0;
        clock.stop();
        return 0;
    }

    if(batteryValue <= 0){
        console.log("GAME OVER")
        batteryValue = 100;
        clock.elapsedTime = 0;
        clock.stop();
        document.getElementById("batteryDiv").style.display = "none";
        document.getElementById("crateDiv").style.display = "none";
        return 1;
    } 
    else{
        var batteryStateIndex = Math.ceil(batteryValue/25) - 1 ;
        document.getElementById("batteryImage").src = batteryStates[batteryStateIndex][0];
        batteryValueObj.classList = [batteryStates[batteryStateIndex][1]]
    }

}

function startNewGame(){
    console.log("startGame!")
    deliveredPackages = 0;
    dogProps.locked = false;
    spawnBoxRandom();
    group1.add(mainNode3);
    clock.stop();
    clock.start();
    startButton.style.display = "none";
    document.getElementById("batteryDiv").style.display = "block";
    document.getElementById("crateDiv").style.display = "block";
    document.getElementById("crateValue").innerHTML = deliveredPackages.toString() + "/" + WIN_SCORE.toString();
}

function resetGame(){
    gameOver = undefined;
    startButton.style.display = "block";
    group1.position.x = 0; group1.position.z = 0;
    dogGroup.rotation.y = 0;
    dogProps.locked = true;
    dogProps.inMovement = false;

    if(dogProps.holdingBox){
        scene.add(cardBox);
        cardBox.scale.set(cardboxProps.size, cardboxProps.size, cardboxProps.size);
        cardBox.position.set(group1.position.x, group1.position.y + cardboxProps.size / 2 - 5, group1.position.z);
        cardBox3 = new THREE.Box3().setFromObject(cardBox);
        dogProps.holdingBox = false;
        console.log("release")
    }
    
}