var raycaster = new THREE.Raycaster();
var mouseCoords = new THREE.Vector2();
var loader = new THREE.TextureLoader()
var camera
var controls
var meshSphere
var renderer
var scene
var plane
var cubeLeftDown
var planeGeometry
var planeMaterial

var ball = {
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    positionX: 0,
    positionY: 200,
    positionZ: 0
};

var light

function setPosition(meshObject, x, y, z){
    meshObject.position.x = x;
    meshObject.position.y = y;
    meshObject.position.z = z;
}

window.onload = function(){
    var width = window.innerWidth;
    var height = window.innerHeight;
    var canvas = this.document.getElementById('canvas');

    canvas.width = width;
    canvas.height = height;

    var gui = new dat.GUI();
    gui.add(ball, 'rotationX').min(-0.1).max(0.1).step(0.0001);
    gui.add(ball, 'rotationY').min(-0.1).max(0.1).step(0.0001);
    gui.add(ball, 'rotationZ').min(-0.1).max(0.1).step(0.0001);
    gui.add(ball, 'positionX').min(-300).max(300).step(0.01);
    gui.add(ball, 'positionY').min(-300).max(300).step(0.01);
    gui.add(ball, 'positionZ').min(-300).max(300).step(0.01);

    renderer = new THREE.WebGLRenderer({canvas: canvas});
    renderer.setClearColor(0x00000);

    //создаем перспетивную камеру
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 5000);
    camera.position.set(0, 0, 1000);
    //создаем сцену
    scene = new THREE.Scene();
    //создаем OrbitCintrols который позволяет вращать камеру используя мышь
    controls = new OrbitControls( camera, renderer.domElement );
    //устанавливаем рассеянный источник света
    light = new THREE.AmbientLight(0x555555);
    scene.add(light)
    //инициализурем танцпол
    planeGeometry = new THREE.PlaneGeometry(1000,1000,5, 5);
    planeMaterial = new THREE.MeshPhongMaterial({color: 0xffffff, vertexColors: THREE.FaceColors});
    plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = 3 * Math.PI / 2;
    plane.position.y = -140;
    scene.add(plane);
    //создаем геометрию и материал для колонок
    var spekerGeometry = new THREE.BoxGeometry(120, 85, 120);
    var spekerMaterial = new THREE.MeshPhongMaterial({
        map: loader.load(speakerSrc),
    });
    //создаем для колонок меши и раствляем их по местам
    cubeLeftDown = new THREE.Mesh(spekerGeometry, spekerMaterial);
    setPosition(cubeLeftDown, -220, -100, -150)
    var cubeLeftUp = new THREE.Mesh(spekerGeometry, spekerMaterial);
    setPosition(cubeLeftUp, -220, -15, -150)
    var cubeRightDown = new THREE.Mesh(spekerGeometry, spekerMaterial);
    setPosition(cubeRightDown, 220, -100, -150)
    var cubeRigthUp = new THREE.Mesh(spekerGeometry, spekerMaterial);
    setPosition(cubeRigthUp, 220, -15, -150)
    scene.add(cubeLeftDown);
    scene.add(cubeLeftUp);
    scene.add(cubeRightDown);
    scene.add(cubeRigthUp);
    //создаем шар
    var geometry = new THREE.SphereGeometry(100, 30, 30);
    var material = new THREE.MeshPhongMaterial({color: 0xFFFFFF, vertexColors: THREE.FaceColors});
    //делаем его разноцветным
    for(var i = 0; i < geometry.faces.length; i++){
        geometry.faces[i].color.setRGB(Math.random(), Math.random(), Math.random())
    }
    meshSphere = new THREE.Mesh(geometry, material);
    meshSphere.position.y = 200
    scene.add(meshSphere);

    animate()
    initRaycast()
}

var lasttime = 0
var deltaTime = 500
var needAnimate = false
function animate() {
	requestAnimationFrame( animate );
    //меняем параметры для шара
    meshSphere.rotation.y += ball.rotationY;
    meshSphere.rotation.x += ball.rotationX;
    meshSphere.rotation.z += ball.rotationZ;
    meshSphere.position.y = ball.positionY;
    meshSphere.position.x = ball.positionX;
    meshSphere.position.z = ball.positionZ;
    //получем время чтобы танцпол менялся через каждые 0.5 секунд
    var currentTime = new Date().getTime()
    if (needAnimate && currentTime-lasttime >= deltaTime){
        lasttime = currentTime
        //пересоздаем танцпол
        scene.remove(plane)
        planeMaterial = new THREE.MeshPhongMaterial({color: 0xffffff, vertexColors: THREE.FaceColors});
        planeGeometry = new THREE.PlaneGeometry(1000,1000,5, 5);
        //задем цвет по прямоугольникам
        for(var i = 0; i < planeGeometry.faces.length; i+=2){
            var rgb = {
                r: Math.random(),
                g: Math.random(),
                b: Math.random()
            }
            planeGeometry.faces[i].color.setRGB(rgb.r, rgb.g, rgb.b)
            planeGeometry.faces[i+1].color.setRGB(rgb.r, rgb.g, rgb.b)
        }
        plane = new THREE.Mesh(planeGeometry, planeMaterial)
        plane.rotation.x = 3 * Math.PI / 2;
        plane.position.y = -140;
        scene.add(plane)
    }
    
	controls.update();
	renderer.render( scene, camera );
}

var raycaster, mouse = { x : 0, y : 0 };

//инициализируем рейкаст для улавливания кликов мыши на сцене
function initRaycast () {
    raycaster = new THREE.Raycaster();
    renderer.domElement.addEventListener( 'click', raycast, false );
}

function raycast ( e ) {
    //поймали события нажатия на сцену, считываем параметры для мыши
    mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
    //устанавливаем чтобы рейкастер работал относительно камеры
    raycaster.setFromCamera( mouse, camera);    
    //получаем все элементы с которым пересекался луч рейкаста
    var intersects = raycaster.intersectObjects( scene.children );

    for ( var i = 0; i < intersects.length; i++ ) {
        //если мы нажали на колнку то запускаем музыку
        if (intersects[i].object.geometry.type == "BoxGeometry"){
            console.log( intersects[ i ] ); 
            needAnimate = !needAnimate
            var audio = document.getElementById("audio")
            if (needAnimate){
                audio.play()
                ball.rotationY = 0.005
                //меняем освещение на более яркое
                scene.remove(light)
                light = new THREE.AmbientLight(0xffffff);
                scene.add(light)
            } else {
                audio.pause()
                ball.rotationY = 0
                //меняем освещение на более тусклое
                scene.remove(light)
                light = new THREE.AmbientLight(0x555555);
                scene.add(light)
            }
            return
        }
    }
}

