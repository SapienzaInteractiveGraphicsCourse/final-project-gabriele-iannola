import * as THREE from './libs/three/build/three.module.js';
import { GLTFLoader } from './libs/three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from './libs/three/examples/jsm/controls/OrbitControls.js';
import { DirectionalLightHelper } from './libs/three/src/helpers/DirectionalLightHelper.js';
import { AxesHelper } from './libs/three/src/helpers/AxesHelper.js';
import { TWEEN } from './libs/three/examples/jsm/libs/tween.module.min.js'


var gameVariables = {
    DEBUG: false,
    CHOSEN_DIFFICULTY: 0,
    DIFFICULTIES:[
        [150,5],
        [120,8],
        [90,10],
    ]
}

var deliveredPackages = 0;
var batteryValue = 100;

var gui = new dat.GUI();

var bBoxVisible = 0;
var dogJoints = {
    "leg4": 0, "move7": 0, "foot4": 0,
    "leg3": 0, "move": 0, "foot3": 0,
    "leg2": 0, "move4": 0, "move5": 0, "move6": 0,
    "leg1": 0, "move1": 0, "move2": 0, "move3": 0,
    "tail": 0, "body": 0,
    "head": 0, "up": 0, "down": 0, "tongue": 50
};

var runTweenGroup, idleTweenGroup;
var runningAnimationProperties = {
    frames: {
        frame1: {
            "leg4": 40, "move7": -30, "foot4": 30,
            "leg3": 0, "move": -30, "foot3": 30,
            "leg2": -30, "move4": -20, "move5": 20, "move6": 40,
            "leg1": 0, "move1": 0, "move2": 0, "move3": 0,

            "tail": -5, "body": 0,
            "head": 10, "up": 0, "down": 5
        },
        frame2: {
            "leg4": -60, "move7": 0, "foot4": 60,
            "leg3": 40, "move": -30, "foot3": 30,
            "leg2": -10, "move4": -20, "move5": 0, "move6": 0,
            "leg1": -30, "move1": -20, "move2": 40, "move3": 40,

            "tail": 5, "body": 5,
            "head": 0, "up": 0, "down": 10
        },
        frame3: {
            "leg4": -80, "move7": 20, "foot4": 90,
            "leg3": -60, "move": 0, "foot3": 60,
            "leg2": 60, "move4": -20, "move5": 40, "move6": 70,
            "leg1": 10, "move1": 0, "move2": 0, "move3": 0,

            "tail": -5, "body": 0,
            "head": -10, "up": 0, "down": 5
        },
        frame4: {
            "leg4": 0, "move7": -30, "foot4": 30,
            "leg3": -80, "move": 20, "foot3": 90,
            "leg2": 20, "move4": -20, "move5": 0, "move6": 0,
            "leg1": 60, "move1": -20, "move2": 40, "move3": 70,

            "tail": 5, "body": -5,
            "head": 0, "up": 0, "down": 10
        }
    },
    axes: {
        "leg4": 0, "move7": 0, "foot4": 0,
        "leg3": 0, "move": 0, "foot3": 0,
        "leg2": 0, "move4": 0, "move5": 0, "move6": 0,
        "leg1": 0, "move1": 0, "move2": 0, "move3": 0,
        "tail": 2, "body": 0,
        "head": 0, "up": 0, "down": 0
    },
    tweens: [],
    tweenSpeed: [500 / 4, 500 / 4, 500 / 4, 500 / 4]
}

var idleAnimationProperties = {
    frames: {
        frame1: {
            "leg4": 0, "move7": 0, "foot4": 0,
            "leg3": 0, "move": 0, "foot3": 0,
            "leg2": 0, "move4": 0, "move5": 0, "move6": 0,
            "leg1": 0, "move1": 0, "move2": 0, "move3": 0,
            "tail": 20, "body": 0,
            "head": 0, "up": 0, "down": 5, "tongue": 50
        },
        frame2: {
            "leg4": 0, "move7": 0, "foot4": 0,
            "leg3": 0, "move": 0, "foot3": 0,
            "leg2": 0, "move4": 0, "move5": 0, "move6": 0,
            "leg1": 0, "move1": 0, "move2": 0, "move3": 0,
            "tail": 0, "body": -3,
            "head": -3, "up": 0, "down": 8, "tongue": 100
        },
        frame3: {
            "leg4": 0, "move7": 0, "foot4": 0,
            "leg3": 0, "move": 0, "foot3": 0,
            "leg2": 0, "move4": 0, "move5": 0, "move6": 0,
            "leg1": 0, "move1": 0, "move2": 0, "move3": 0,
            "tail": -20, "body": 0,
            "head": 0, "up": 0, "down": 5, "tongue": 50
        },
        frame4: {
            "leg4": 0, "move7": 0, "foot4": 0,
            "leg3": 0, "move": 0, "foot3": 0,
            "leg2": 0, "move4": 0, "move5": 0, "move6": 0,
            "leg1": 0, "move1": 0, "move2": 0, "move3": 0,
            "tail": 0, "body": 3,
            "head": 3, "up": 0, "down": 8, "tongue": 100
        }
    },
    axes: {
        "leg4": 0, "move7": 0, "foot4": 0,
        "leg3": 0, "move": 0, "foot3": 0,
        "leg2": 0, "move4": 0, "move5": 0, "move6": 0,
        "leg1": 0, "move1": 0, "move2": 0, "move3": 0,
        "tail": 2, "body": 0,
        "head": 2, "up": 0, "down": 0, "tongue": 3
    },
    tweens: [],
    tweenSpeed: [500 / 2, 500 / 2, 500 / 2, 500 / 2]
}


var dogBoxHelper, dogBox3;
var cardBox3, cardBoxHelper;
var anchorBox3, anchorBoxHelper;
var houseBoxHelpers = [];
var houseBox3 = [];
var houseCenters = [null, null, null, null, null, null, null,
    new THREE.Vector3(14.826502929687502, 1.29999951171875, 4.340710327148437),

    new THREE.Vector3(4.224515623873705, 2.500002929687501, -16.241349621053242),

    new THREE.Vector3(15.241329711914062, 2.6015561523437505, -13.95047412109375),
    new THREE.Vector3(-5.019078857421838, 1.300001953125005, -13.177295104980466),
    new THREE.Vector3(-13.569443604034273, 2.5874274902343766, -5.73854101505352),

    new THREE.Vector3(-3.0059666748046867, 2.499998046875, 14.119145874023436),

    new THREE.Vector3(-13.508938475692084, 2.566589467773448, -13.918114012433827),

    new THREE.Vector3(14.00606677246094, 2.577151611328125, -5.333100463867188),
    new THREE.Vector3(14.056039055103856, 2.585351769531876, 12.57357834923541),

    new THREE.Vector3(-12.877217163043511, 1.2999990234375005, 6.642443009623262),
    new THREE.Vector3(-13.561354370117188, 1.2999980468750003, 14.238321655273438),
    new THREE.Vector3(6.063547424316406, 1.299998046875, 14.2446982421875),
    null,

    new THREE.Vector3(5.024515623873702, 2.500002929687501, -13.04134962105325),
    new THREE.Vector3(-6.20596667480468, 2.499998046875, 15.019145874023433),
    new THREE.Vector3(16.50606677246094, 2.577151611328125, -6.6331004638671835),
    new THREE.Vector3(11.556039055103865, 2.585351769531876, 13.373578349235407),
];

var houseSizes = [null, null, null, null, null, null, null,
    new THREE.Vector3(4.0364550781250035, 2.600000000000001, 4.08925463867188),

    new THREE.Vector3(4.204630194582437, 5.000000000000006, 4.1324650756227435),

    new THREE.Vector3(5.16795336914063, 5.203108398437502, 4.292383789062505),
    new THREE.Vector3(4.155188964843825, 2.600000000000125, 2.6994700927734367),
    new THREE.Vector3(4.2005129808451915, 5.174853027343756, 4.932226816048464),
    new THREE.Vector3(4.132896728515635, 5.000000000000001, 4.186828857421878),
    new THREE.Vector3(4.091873782453362, 5.133177509765613, 4.157498740244558),
    new THREE.Vector3(2.5138000488281294, 5.154301269531252, 4.943546142578128),
    new THREE.Vector3(2.5489535991456393, 5.170708013378246, 4.075576840596366),
    new THREE.Vector3(2.610190882538079, 2.600000000000003, 4.1747274483571815),
    new THREE.Vector3(4.1364650878906275, 2.6000000000000014, 4.0892521972656315),
    new THREE.Vector3(2.4611295166015617, 2.600000000000001, 3.999998779296874),
    null,

    new THREE.Vector3(2.5046301945824365, 5.000000000000006, 2.4324650756227424),
    new THREE.Vector3(2.332896728515634, 5.000000000000001, 2.4868288574218766),
    new THREE.Vector3(2.4138000488281293, 5.154301269531252, 2.44354614257813),
    new THREE.Vector3(2.348953599145639, 5.170708013378246, 2.4755768405963643),
];


var inc = 0, shift = 0, directionIndex = 0;
var directionsAxes = [new THREE.Vector2(0, 0), new THREE.Vector2(0, 0)];

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
        new THREE.Vector3(9.5, 0, 10.7),
        new THREE.Vector3(2.1, 0, 14.4),
        new THREE.Vector3(-2.3, 0, 9.5),
        new THREE.Vector3(-13.5, 0, 9.9),
        new THREE.Vector3(13.8, 0, -0.9),
        new THREE.Vector3(-14.7, 0, -1.1),
        new THREE.Vector3(9.4, 0, -13.8),
        new THREE.Vector3(-0.9, 0, -15.8),
        new THREE.Vector3(-9.2, 0, -10.5),
    ],
    lastAnchorChoice: -1,
}

var batteryStates = [
    ["./textures/battery-1.png", "b1"],
    ["./textures/battery-2.png", "b2"],
    ["./textures/battery-3.png", "b3"],
    ["./textures/battery-4.png", "b4"]
]


var startButton = document.createElement("INPUT");
startButton.setAttribute("type", "button");
startButton.value = "START";
startButton.id = "gameStartButton";
startButton.onclick = startNewGame;
document.getElementById("container").appendChild(startButton)

var alert = document.getElementsByClassName("alert")[0]
var gameOverText = alert.children[0];
var retryButton = document.createElement("INPUT");
retryButton.setAttribute("type", "button");
retryButton.value = "RETRY";
retryButton.classList.add("retryButton");
retryButton.onclick = resetGame;
alert.appendChild(retryButton);

var crateHelpDiv = document.getElementById("crateHelpDiv");
var crateHelpText = document.getElementsByClassName("crateHelpText")[0];

var difficultyButtons = [];
var buttonValues = ["EASY","MEDIUM","HARD"];
var buttonIds = buttonValues.map(x => x.toLowerCase())

for(let i=0;i<3;i++){
    difficultyButtons.push(document.createElement("BUTTON"));
    difficultyButtons[i].innerHTML = buttonValues[i];
    difficultyButtons[i].classList.add("difficultyButton")
    difficultyButtons[i].id = buttonIds[i];
    difficultyButtons[i].onclick = selectButton
    document.getElementById("difficultyDiv").appendChild(difficultyButtons[i])
}

difficultyButtons[0].classList.add("easy");

function selectButton(e){
    for(let i=0;i<3;i++){
        difficultyButtons[i].classList.remove(buttonIds[i])
    }
    e.target.classList.add(e.target.id)
    gameVariables.CHOSEN_DIFFICULTY = buttonIds.indexOf(e.target.id)
}

//creating a scene, camera and renderer

const scene = new THREE.Scene();
//scene.background = new THREE.Color(0x87ceeb)

const loader = new THREE.TextureLoader();
const texture = loader.load(
    'models/skybox/Perseverance_Panorama_8k-2.jpg',
    () => {
        const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
        rt.fromEquirectangularTexture(renderer, texture);
        scene.background = rt.texture;
        
    });

scene.fog = new THREE.FogExp2(0xffe2c6,0.002);
const aspect = window.innerWidth / window.innerHeight;

const canvas = document.querySelector('#c');

const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    //alpha:true
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;

renderer.setSize(window.innerWidth, window.innerHeight);

var postFolder = gui.addFolder("Fog")
postFolder.open()
postFolder.add(scene.fog,"density",0,0.005,0.0001)

const clock = new THREE.Clock(false);

var envBox3 = new THREE.Box3()
envBox3.setFromCenterAndSize(new THREE.Vector3(0,0,0),new THREE.Vector3(100,3,100))
var envBoxHelper = null;
if(gameVariables.DEBUG){
    envBoxHelper = new THREE.Box3Helper(envBox3,"#ffffff")
    scene.add(envBoxHelper);
}


var group1 = new THREE.Group();
var dogGroup = new THREE.Group();

if (gameVariables.DEBUG) {
    const axesHelperScene = new AxesHelper(5);
    scene.add(axesHelperScene);
    const axesHelperTest = new AxesHelper(5);
    group1.add(axesHelperTest);
    const gridHelper = new THREE.GridHelper(100, 100);
    scene.add(gridHelper);
}

var camera;
var cameraRadius = 60;


camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
camera.position.set(0, 30, -cameraRadius);

window.addEventListener('resize', resizeCanvas);

function resizeCanvas() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

}


const controls = new OrbitControls(camera, canvas);
if (!gameVariables.DEBUG) {

    controls.mouseButtons = { LEFT: 0 }
    controls.maxDistance = cameraRadius;
    controls.minDistance = cameraRadius;
    controls.minPolarAngle = THREE.MathUtils.degToRad(55);
    controls.maxPolarAngle = THREE.MathUtils.degToRad(65);

}

//create a light

var lightProps = {
    "ambientColor": 0xffffff,
    "ambientIntensity":0.1,
    "lightColor": 0xffffff,
    "lightIntensity": 2,
    "distance": 100,
}

var ambient = new THREE.AmbientLight(lightProps.ambientColor, lightProps.ambientIntensity)
scene.add(ambient)

const light = new THREE.DirectionalLight(lightProps.lightColor, lightProps.lightIntensity);

light.position.set(lightProps.distance, lightProps.distance, lightProps.distance);
light.castShadow = true;

//Set up shadow properties for the light
var lightShadowCastRange = 10;
light.shadow.camera.top = lightShadowCastRange;
light.shadow.camera.bottom = -lightShadowCastRange;
light.shadow.camera.left = -lightShadowCastRange;
light.shadow.camera.right = lightShadowCastRange;
light.shadow.camera.near = 0.1; // default
light.shadow.camera.far = 500; // default
light.shadow.bias = -0.0005

scene.add(light);


var ambientFolder = gui.addFolder("Ambient Light")
ambientFolder.open();

ambientFolder.add(ambient, "intensity", 0, 1, 0.1);


var lightFolder = gui.addFolder("Lights")
lightFolder.open();

lightFolder.add(light, "intensity", 0, 5, 0.5);
lightFolder.add(light.position, "x", -100, 100, 1);
lightFolder.add(light.position, "z", -100, 100, 1);

lightFolder.add(light, "castShadow")
lightFolder.add(light.shadow.camera, "near", 0.1, 0.5, 0.1);
lightFolder.add(light.shadow.camera, "far", 0, 500, 1);
lightFolder.add(light.shadow, "bias", -0.002, 0, 0.0001);

var lightHelper = null;
var lightShadowHelper = null;

if (gameVariables.DEBUG) {
    lightHelper = new DirectionalLightHelper(light);
    scene.add(lightHelper);
    lightShadowHelper = new THREE.CameraHelper(light.shadow.camera);
    scene.add(lightShadowHelper);
}


// audio Management

var audioProps = {
    "ambientVolume":0.5,
    "SFXVolume":0.5
}

const listener = new THREE.AudioListener();
camera.add( listener );

const soundAmbient = new THREE.Audio( listener );
const soundStep = new THREE.Audio( listener );
const soundPick = new THREE.Audio( listener );
const soundDrop = new THREE.Audio( listener );
const soundClick = new THREE.Audio( listener );
const soundPoint = new THREE.Audio( listener );
const soundWin = new THREE.Audio( listener );
const soundLose = new THREE.Audio( listener );

const audioLoader = new THREE.AudioLoader();


audioLoader.load( 'sounds/ambient.mp3', function( buffer ) {
	soundAmbient.setBuffer( buffer );
	soundAmbient.setLoop( true );
	soundAmbient.setVolume( audioProps.ambientVolume );	
});

audioLoader.load( 'sounds/step.mp3', function( buffer ) {
	soundStep.setBuffer( buffer );
	soundStep.setLoop( true );
    soundStep.setPlaybackRate(1.5);
	soundStep.setVolume( audioProps.SFXVolume );	
});
audioLoader.load( 'sounds/pick.mp3', function( buffer ) {
	soundPick.setBuffer( buffer );
	soundPick.setVolume( audioProps.SFXVolume );	
});

audioLoader.load( 'sounds/release.wav', function( buffer ) {
	soundDrop.setBuffer( buffer );
	soundDrop.setVolume( audioProps.SFXVolume );	
});

audioLoader.load( 'sounds/click.wav', function( buffer ) {
	soundClick.setBuffer( buffer );
	soundClick.setVolume( audioProps.SFXVolume );	
});

audioLoader.load( 'sounds/point.wav', function( buffer ) {
	soundPoint.setBuffer( buffer );
	soundPoint.setVolume( audioProps.SFXVolume );	
});

audioLoader.load( 'sounds/win.mp3', function( buffer ) {
	soundWin.setBuffer( buffer );
	soundWin.setVolume( audioProps.SFXVolume );	
});
audioLoader.load( 'sounds/lose.wav', function( buffer ) {
	soundLose.setBuffer( buffer );
	soundLose.setVolume( audioProps.SFXVolume + 0.2);	
});

var soundFolder = gui.addFolder("Audio")
soundFolder.open();
soundFolder.add(audioProps,"ambientVolume",0,1,0.1).onChange(()=>{
    soundAmbient.setVolume( audioProps.ambientVolume );
})
soundFolder.add(audioProps,"SFXVolume",0,1,0.1).onChange(()=>{
    soundStep.setVolume( audioProps.SFXVolume );
    soundPick.setVolume( audioProps.SFXVolume );
    soundDrop.setVolume( audioProps.SFXVolume );
    soundClick.setVolume( audioProps.SFXVolume );
    soundPoint.setVolume( audioProps.SFXVolume );
    soundWin.setVolume( audioProps.SFXVolume );
    soundLose.setVolume( audioProps.SFXVolume );
})


//#######################################################

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
    if (gameVariables.DEBUG) {
        anchorBoxHelper = new THREE.BoxHelper(anchorSolid);
        scene.add(anchorBoxHelper);
    }
}

//Creating a box
var cardBox;


const url4 = './models/crate/source/model.gltf'
gltfLoader.load(url4, (gltf4) => {
    cardBox = gltf4.scene;
    cardBox.traverse(function (node) {

        if (node.type === 'Mesh') {
            node.castShadow = true;
            node.receiveShadow = true;
        }

    });


    


    cardBox.scale.set(cardboxProps.size, cardboxProps.size, cardboxProps.size);

    cardBox.position.y = -10;


    scene.add(cardBox);

    cardBox3 = new THREE.Box3().setFromObject(cardBox);

    if (gameVariables.DEBUG) {
        cardBoxHelper = new THREE.BoxHelper(cardBox);
        scene.add(cardBoxHelper);
    }

})


const url = 'models/test/dog2.gltf'
var root, mainNode;
gltfLoader.load(url, (gltf) => {

    root = gltf.scene;
    root.traverse(function (node) {

        if (node.type === 'Mesh') {
            node.material = new THREE.MeshPhongMaterial({
                map: node.material.map,
                shininess: 50,
            })
            node.castShadow = true;
            node.receiveShadow = true;
        }

    });

    mainNode = root.getObjectByName("Scene");

    var dummy = {
        "shininess": 10
    }

    mainNode.traverse(function (node) {

        if (node.type === 'Mesh') {
            node.material = new THREE.MeshPhongMaterial({
                map: node.material.map,
                shininess: dummy.shininess,
            })
            node.castShadow = true;
            node.receiveShadow = true;
        }

    });

    

    lightFolder.add(dummy,"shininess",1,100,1).onChange(() => {
        mainNode.traverse(function (node) {

            if (node.type === 'Mesh') {
                node.material = new THREE.MeshPhongMaterial({
                    map: node.material.map,
                    shininess: dummy.shininess,
                })
            }
    
        });
    })

    

    computeCameraDirection();
    group1.add(camera);

    dogGroup.add(mainNode);
    group1.add(dogGroup);
    group1.scale.set(group1Props.scalingValue, group1Props.scalingValue, group1Props.scalingValue)
    scene.add(group1)

    dogBox3 = new THREE.Box3().setFromObject(dogGroup);
    dogBox3.getSize(dogProps.size);
    dogBoxHelper = new THREE.BoxHelper(dogGroup);
    if (gameVariables.DEBUG) scene.add(dogBoxHelper);


    light.target = mainNode;

    runTweenGroup = new TWEEN.Group();
    idleTweenGroup = new TWEEN.Group();

    createAnimationTweens(runTweenGroup, runningAnimationProperties);


    createAnimationTweens(idleTweenGroup, idleAnimationProperties);

    function createAnimationTweens(group, props) {
        var tween;
        var len = Object.keys(props.frames).length;

        for (let i = 0; i < len; i++) {
            tween = new TWEEN.Tween(dogJoints, group).to(Object.values(props.frames)[i],
                props.tweenSpeed[i]);
            tween.onUpdate(moveParts, props);
            if (i != 0) props.tweens[i - 1].chain(tween);
            props.tweens.push(tween);
        }
        props.tweens[len - 1].chain(props.tweens[0]);

        function moveParts() {
            Object.keys(dogJoints).forEach(part => {
                switch (props.axes[part]) {
                    case 0: {
                        mainNode.getObjectByName(part).rotation.x = THREE.MathUtils.degToRad(dogJoints[part])
                        break;
                    }
                    case 1: {
                        mainNode.getObjectByName(part).rotation.y = THREE.MathUtils.degToRad(dogJoints[part])
                        break;
                    }
                    case 2: {
                        mainNode.getObjectByName(part).rotation.z = THREE.MathUtils.degToRad(dogJoints[part])
                        break;
                    }
                    case 3: {
                        mainNode.getObjectByName(part).scale.z = THREE.MathUtils.degToRad(dogJoints[part])
                        break;
                    }
                }
            });
        }
    }

    setKeyboardControl();

    controls.addEventListener("change", computeCameraDirection);

    function setKeyboardControl() {
        document.onkeydown = function (e) {

            if (dogProps.locked) return;
            switch (e.key.toLowerCase()) {
                case "w": {

                    directionIndex = 0;
                    inc = 1
                    shift = 0
                    dogProps.inMovement = true;
                    controls.target = mainNode.position;
                    
                    break;
                }
                case "a": {

                    directionIndex = 1;
                    inc = 1
                    shift = 1 / 2;
                    dogProps.inMovement = true;
                    controls.target = mainNode.position;
                    
                    break;
                }
                case "s": {

                    directionIndex = 0;
                    inc = -1
                    shift = 1
                    dogProps.inMovement = true;
                    controls.target = mainNode.position;
                    
                    break;
                }
                case "d": {

                    directionIndex = 1;
                    inc = -1
                    shift = 3 / 2
                    dogProps.inMovement = true;
                    controls.target = mainNode.position;
                    
                    break;
                }

                //box interaction

                case "f": {
                    if (e.repeat) break;

                    if (dogProps.holdingBox) {
                        scene.add(cardBox);

                        cardBox.scale.set(cardboxProps.size, cardboxProps.size, cardboxProps.size);
                        cardBox.position.set(group1.position.x, group1.position.y + cardboxProps.size / 2, group1.position.z);
                        cardBox3 = new THREE.Box3().setFromObject(cardBox);
                        dogProps.holdingBox = false;
                        soundDrop.play();

                        if (cardBox3.intersectsBox(anchorBox3)) {
                            
                            soundPoint.play();
                            deliveredPackages += 1;
                            document.getElementById("crateValue").innerHTML = deliveredPackages.toString() + "/" + gameVariables.DIFFICULTIES[gameVariables.CHOSEN_DIFFICULTY][1].toString();
                            spawnBoxRandom();
                        }

                    } else {

                        if (group1.position.distanceTo(cardBox.position) > cardboxProps.pickupDistance) break;

                        mainNode.getObjectByName("body").add(cardBox);
                        cardBox.position.set(-3.2, dogProps.size.y / 2.0 * 0.2, -dogProps.size.z / 2.0 * 0.5);
                        cardBox.scale.set(1 / group1Props.scalingValue * cardboxProps.size, 1 / group1Props.scalingValue * cardboxProps.size, 1 / group1Props.scalingValue * cardboxProps.size)
                        dogProps.holdingBox = true;
                        soundPick.play();
                    }

                    break;
                }

                case "g": {

                    soundStep.play();
                    break;
                }

                default: {
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
        directionsAxes[1] = new THREE.Vector2(1, -cameraDirection.x / cameraDirection.y).normalize().multiplyScalar(cameraDirection.y >= 0 ? 1 : -1);

    }

    runningAnimationProperties.tweens[0].start();
    idleAnimationProperties.tweens[0].start();

    dogProps.rendered = true;

});

const url2 = './models/enviroment/scene.gltf'
var root2, mainNode2
gltfLoader.load(url2, (gltf2) => {
    root2 = gltf2.scene;

    root2.traverse(function (node) {

        if (node.type === 'Mesh') {
            if (node.name != "Plane001_02_-_Default_0") node.castShadow = true;
            node.receiveShadow = true;
        }

    });


    
    mainNode2 = root2.getObjectByName("RootNode");

    mainNode2.scale.set(0.008, 0.008, 0.008);
    gltf2.scene.updateMatrixWorld(true)
    mainNode2.children[0].scale.set(3, 3, 3);

    mainNode2.children.filter(x => /(house|Column|Stairs)/.test(x.name)).forEach((obj, ndx) => {

        houseBox3[ndx] = new THREE.Box3().setFromObject(obj);

        if (houseCenters[ndx] == null) {
            houseCenters[ndx] = new THREE.Vector3(0, 0, 0);
            houseBox3[ndx].getCenter(houseCenters[ndx]);
            houseSizes[ndx] = new THREE.Vector3(0, 0, 0);
            houseBox3[ndx].getSize(houseSizes[ndx]);
        } else {
            houseBox3[ndx].setFromCenterAndSize(houseCenters[ndx], houseSizes[ndx])
        }

        if (gameVariables.DEBUG) {

            houseBoxHelpers[ndx] = new THREE.Box3Helper(houseBox3[ndx], "#00ff00");
            scene.add(houseBoxHelpers[ndx]);
        }
    });

    var l = houseBox3.length;

    mainNode2.children.filter(x => /(020|015|013|012)$/.test(x.name)).forEach((obj, ndx) => {

        houseBox3[l + ndx] = new THREE.Box3().setFromObject(obj);

        if (houseCenters[l + ndx] == null) {
            houseCenters[l + ndx] = new THREE.Vector3(0, 0, 0);
            houseBox3[l + ndx].getCenter(houseCenters[l + ndx]);
            houseSizes[l + ndx] = new THREE.Vector3(0, 0, 0);
            houseBox3[l + ndx].getSize(houseSizes[l + ndx]);
        } else {
            houseBox3[l + ndx].setFromCenterAndSize(houseCenters[l + ndx], houseSizes[l + ndx])
        }


        
        if (gameVariables.DEBUG) {
            
            houseBoxHelpers[l + ndx] = new THREE.Box3Helper(houseBox3[l + ndx], "#00ff00");
            scene.add(houseBoxHelpers[l + ndx]);
        }
    });
    if (gameVariables.DEBUG) houseBoxHelpers[bBoxVisible].visible = true;
    mainNode2.position.y -= 0.05;

    scene.add(mainNode2);

    startButton.style.display = "block";
    document.getElementById("difficultyDiv").style.display = "block";
    
})

const url3 = './models/arrow/scene.gltf'
var root3, mainNode3
gltfLoader.load(url3, (gltf3) => {
    root3 = gltf3.scene;

    
    mainNode3 = root3.getObjectByName("RootNode");


    group1.add(mainNode3);
    mainNode3.position.y += 20;
    mainNode3.scale.y = 2
    mainNode3.scale.z *= -1

})



var previousDogPosition = [];


animate();

var gameOver;
var stop = false;

function animate() {
    
    if (stop) return;
    requestAnimationFrame(animate);

    controls.update();


    gameOver = timeHandler()

    if (gameOver != undefined) {
        
        if (!gameOver) {
            
            dogProps.inMovement = false;
            dogAnimationHandler();
            
            gameOverText.innerHTML = "YOU WIN!";
            alert.classList.add("winAlert");
            alert.classList.remove("loseAlert");
            retryButton.classList.add("winButton");
            retryButton.classList.remove("loseButton");
            alert.style.display = "block";
            soundStep.stop(); 
            soundWin.play();
        } else {
            
            dogProps.inMovement = false;
            dogAnimationHandler();
            gameOverText.innerHTML = "YOU LOSE!";
            alert.classList.add("loseAlert");
            alert.classList.remove("winAlert");
            retryButton.classList.add("loseButton");
            retryButton.classList.remove("winButton");
            alert.style.display = "block";
            soundStep.stop(); 
            soundLose.play();
        }
        stop = true
    }

    

    if (gameVariables.DEBUG) {
        lightHelper.update();
        lightShadowHelper.update();
        cardBoxHelper.update();
        anchorBoxHelper.update();
        houseBoxHelpers.forEach(helper => {
            helper.updateMatrixWorld();
        });
        envBoxHelper.updateMatrixWorld();

    }

    if (dogProps.inMovement) {

        previousDogPosition = [group1.position.x, group1.position.z, dogGroup.rotation.y];
        group1.position.x += inc * dogProps.speed * directionsAxes[directionIndex].x
        group1.position.z += inc * dogProps.speed * directionsAxes[directionIndex].y
        dogGroup.rotation.y = shift * Math.PI + Math.atan2(directionsAxes[0].x, directionsAxes[0].y);
        dogBox3 = new THREE.Box3().setFromObject(group1);
        

        if (!envBox3.containsBox(dogBox3)) {
            
            group1.position.x = previousDogPosition[0];
            group1.position.z = previousDogPosition[1];
            dogGroup.rotation.y = previousDogPosition[2];
        } 

        for (var i = 0; i < houseBox3.length; i++) {
            if (dogBox3.intersectsBox(houseBox3[i])) {
                group1.position.x = previousDogPosition[0];
                group1.position.z = previousDogPosition[1];
                dogGroup.rotation.y = previousDogPosition[2];
                break;
            }
        }

        if (gameVariables.DEBUG) dogBoxHelper.update();
    }
    if (dogProps.rendered) dogAnimationHandler();

    



    light.shadow.camera.updateProjectionMatrix();
    light.shadow.camera.lookAt(group1.position.x, group1.position.y, group1.position.z);
    camera.updateProjectionMatrix();
    camera.lookAt(group1.position.x, group1.position.y, group1.position.z);

    if (dogProps.locked) group1.remove(mainNode3);
    dogProps.holdingBox ?
        mainNode3.lookAt(anchorSolid.position.x, anchorSolid.position.y, anchorSolid.position.z) :
        mainNode3.lookAt(cardBox.position.x, cardBox.position.y, cardBox.position.z)

    

    if(dogProps.holdingBox){
        if (dogProps.holdingBox && dogBox3.intersectsBox(anchorBox3)){

            crateHelpDiv.style.display = "block";
            crateHelpText.innerHTML = "Drop package";
            
        }else{
            
            crateHelpDiv.style.display = "none";     
        }
    }else {
        if (group1.position.distanceTo(cardBox.position) <= cardboxProps.pickupDistance){

            
            crateHelpDiv.style.display = "block";
            crateHelpText.innerHTML = "Pick package";
            
        }else{
            
            crateHelpDiv.style.display = "none";     
        }
    }
    
    renderer.render(scene, camera);
}

function dogAnimationHandler() {

    if (dogProps.inMovement){
        if(!soundStep.isPlaying) soundStep.play(); 
        runTweenGroup.update();
    } 
    else{
        if(soundStep.isPlaying) soundStep.stop(); 
        idleTweenGroup.update();
    } 
}

function spawnBoxRandom() {
    var rx, rz;
    do {
        
        rx = THREE.MathUtils.randFloat(-30, 30);
        rz = THREE.MathUtils.randFloat(-30, 30);
        cardBox.position.set(rx, 0, rz);
        cardBox3 = new THREE.Box3().setFromObject(cardBox);
    } while (checkIntersect())

    cardBox.position.y = cardboxProps.size / 2;

    function checkIntersect() {
        for (var i = 0; i < houseBox3.length; i++) {
            if (cardBox3.intersectsBox(houseBox3[i])) {
                
                return true;
            }
        }
    }

    

    var distance = anchorProps.points.map((point) => cardBox.position.distanceTo(point));
    var probDistribution = distance.map((x => x / (distance.reduce(((total, curr) => total + curr), 0))))

    var sortedProb = probDistribution.map((x) => [probDistribution.indexOf(x), x]).sort((a, b) => a[1] - b[1]);
    var r = Math.random();
    
    for (let i = 0; i < sortedProb.length; i++) {
        if (r <= sortedProb[i][1]) {
            
            if (sortedProb[i][0] == anchorProps.lastAnchorChoice) {
                r -= sortedProb[i][1];
                continue;
            }
            anchorProps.lastAnchorChoice = sortedProb[i][0];
            var choice = anchorProps.points[anchorProps.lastAnchorChoice];
            anchorSolid.position.set(choice.x, choice.y, choice.z);
            anchorBox3 = new THREE.Box3().setFromObject(anchorSolid);
            break;
        }
        r -= sortedProb[i][1];
    }

}

function timeHandler() {
    batteryValue = Math.ceil((gameVariables.DIFFICULTIES[gameVariables.CHOSEN_DIFFICULTY][0] - clock.getElapsedTime()) / gameVariables.DIFFICULTIES[gameVariables.CHOSEN_DIFFICULTY][0] * 100);
    var batteryValueObj = document.getElementById("batteryValue");
    batteryValueObj.innerHTML = batteryValue.toString() + "%";

    if (gameVariables.DIFFICULTIES[gameVariables.CHOSEN_DIFFICULTY][1] - deliveredPackages <= 0) {
        
        deliveredPackages = 0;
        clock.stop();
        return 0;
    }

    if (batteryValue <= 0) {
        
        batteryValue = 100;
        clock.elapsedTime = 0;
        clock.stop();
        document.getElementById("batteryDiv").style.display = "none";
        document.getElementById("crateDiv").style.display = "none";
        return 1;
    }
    else {
        var batteryStateIndex = Math.ceil(batteryValue / 25) - 1;
        document.getElementById("batteryImage").src = batteryStates[batteryStateIndex][0];
        batteryValueObj.classList = [batteryStates[batteryStateIndex][1]]
    }

}

function startNewGame() {

    soundAmbient.play();
    soundClick.play();
    
    deliveredPackages = 0;
    dogProps.locked = false;
    spawnBoxRandom();
    group1.add(mainNode3);
    clock.stop();
    clock.start();
    startButton.style.display = "none";
    document.getElementById("difficultyDiv").style.display = "none";
    document.getElementById("batteryDiv").style.display = "block";
    document.getElementById("crateDiv").style.display = "block";
    document.getElementById("crateValue").innerHTML = deliveredPackages.toString() + "/" + gameVariables.DIFFICULTIES[gameVariables.CHOSEN_DIFFICULTY][1].toString();
    
}

function resetGame() {
    soundClick.play();
    gameOver = undefined;
    document.getElementById("batteryDiv").style.display = "none";
    document.getElementById("crateDiv").style.display = "none";
    startButton.style.display = "block";
    document.getElementById("difficultyDiv").style.display = "block";
    alert.style.display = "none";
    group1.position.x = 0; group1.position.z = 0;
    dogGroup.rotation.y = 0;
    dogProps.locked = true;
    dogProps.inMovement = false;

    if (dogProps.holdingBox) {
        scene.add(cardBox);
        cardBox.scale.set(cardboxProps.size, cardboxProps.size, cardboxProps.size);
        cardBox.position.set(group1.position.x, group1.position.y + cardboxProps.size / 2 - 5, group1.position.z);
        cardBox3 = new THREE.Box3().setFromObject(cardBox);
        dogProps.holdingBox = false;
        
    }

    stop = false;
    animate();

}

