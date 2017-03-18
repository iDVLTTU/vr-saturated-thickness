if ( ! Detector.webgl ) {
    Detector.addGetWebGLMessage();
    document.getElementById( 'container' ).innerHTML = "";
}

var idv = idv || {};
idv.vr = idv.vr || {};

idv.vr.init = function(){
        this.container = document.getElementById( 'container' );
        this.worldWidth = 256;
        this.worldDepth = 256;

        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer();
        this.mesh = null;
        this.textureLoader = new THREE.TextureLoader();


    return this;
};

idv.vr.getTexture = function () {
  return this.texture;
};

idv.vr.getMesh = function () {
    return this.mesh;
};

idv.vr.getWorldWidth = function () {
  return this.worldWidth;
};

idv.vr.getWorldDepth = function () {
    return this.worldDepth;
};

idv.vr.onWindowResize = function () {
    idv.vr.camera.aspect = window.innerWidth / window.innerHeight;
    idv.vr.camera.updateProjectionMatrix();
    idv.vr.renderer.setSize( window.innerWidth, window.innerHeight );
};

idv.vr.setupCamera = function (data2D) {
    // CAMERA
    var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
    var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
    this.camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
    this.scene.add(this.camera);
    this.camera.position.set(1000,1000,1000);
    // debugger;
    this.camera.lookAt(new THREE.Vector3(0,0,0)); // origin
    //
    this.controls = new THREE.OrbitControls( this.camera );
    // orbit control
    this.controls.userPanSpeed = 100;

    this.scene.add( new THREE.AxisHelper(1500) );

    var ambientLight = new THREE.AmbientLight(0x0c0c0c);
    this.scene.add(ambientLight);

};

idv.vr.render = function () {
    this.controls.update();
    this.renderer.render( this.scene, this.camera );
};

idv.vr.animate = function() {
    requestAnimationFrame(idv.vr.animate);
    idv.vr.render();
    idv.vr.stats.update();
};

idv.vr.generateHeight = function (width, height) {
    var size = width * height,
        data = new Uint8Array( size ),
        perlin = new ImprovedNoise(),
        quality = 1,
        z = Math.random() * 100
        ;

    for ( var j = 0; j < 4; j ++ ) {
        for ( var i = 0; i < size; i ++ ) {
            var x = i % width, y = ~~ ( i / width );
            data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );
        }
        quality *= 5;
    }

    return data;
};

idv.vr.attachStats = function () {
    this.stats = new Stats();
    this.container.appendChild( this.stats.dom );
};


idv.vr.createTexture = function (data2D) {


    var wireTexture = idv.vr.texture;
    wireTexture.wrapS = wireTexture.wrapT = THREE.MirroredRepeatWrapping;
    wireTexture.repeat.set( 40, 40 );
    // MirroredRepeatWrapping

};

idv.vr.createRenderer = function () {
    // renderer
    // RENDERER
    // this.renderer.setClearColor( 0xbfd1e5 );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize(window.innerWidth, window.innerHeight );


    this.renderer.setClearColor( 0x888888, 1 );

    // // LIGHT
    // var light = new THREE.PointLight(0xffffff);
    // light.position.set(0,250,0);
    // scene.add(light);
};

idv.vr.attachDisplay = function () {

    // display
    this.container.innerHTML = "";
    this.container.appendChild( this.renderer.domElement );
    idv.vr.attachStats();
};


idv.vr.play = function () {
    d3.csv("data/ascii_2013all.optimized-2-2.csv", function(error, pixelData) {

        var pointId = 0;
        var col = 0;
        var index = 0;
        var data2D = [];

        for (var i=0;i<pixelData.length - 19;i++){ // rows loop
            var currentRow=[];
            col = 0; // reset for column value
            for (var key in pixelData[i]){ // columns loop
                var cellValue = pixelData[i][key];
                currentRow.push(cellValue);
                col ++;
                index ++;
                if (cellValue > -9999) {
                    pointId ++; // current point id
                }
            }

            data2D.push(currentRow);
        }

        // loading texture
        // idv.vr.textureLoader.load('http://127.0.0.1:8080/media/brick_diffuse.jpg', function (wireTexture) {
            idv.vr.textureLoader.load('http://127.0.0.1:8080/media/square.png', function (wireTexture) {

            idv.vr.texture  = wireTexture;

            // create renderer
            idv.vr.createRenderer();

            // update camera position
            // position
            idv.vr.setupCamera();

            // create texture
            idv.vr.createTexture(data2D);


            // SKYBOX
            var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
            var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
            var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
            idv.vr.scene.add(skyBox);

            // create mesh
            if (!!idv.vr.getMesh()) {
                idv.vr.scene.remove( idv.vr.getMesh() );
            }

            var material = new THREE.MeshBasicMaterial( { map: wireTexture, vertexColors: THREE.VertexColors,  side:THREE.DoubleSide,  wireframe: false, overdraw: true  } );
            // var material = new THREE.MeshBasicMaterial( { map: wireTexture } );

            var geometry = idv.vr.geo.createGraphGeometry(data2D, material);
            // var geometry = idv.vr.geo.createCuteGeometry(material);
            // var geometry = idv.vr.geo.createMyCuteGeometry(material);
            idv.vr.mesh = new THREE.Mesh( geometry, material );
            idv.vr.scene.add( idv.vr.getMesh() );



            // display
            idv.vr.attachDisplay();


            // var gridXZ = new THREE.GridHelper(100, 10);
            var gridXZ = new THREE.GridHelper(1000, 10, new THREE.Color(0x006600), new THREE.Color(0x006600));
            gridXZ.position.set( 100, -400, 100 );
            idv.vr.scene.add(gridXZ);

            var gridXY = new THREE.GridHelper(1000, 10, new THREE.Color(0x000066), new THREE.Color(0x000066));
            gridXY.position.set( 100, 100, -400 );
            gridXY.rotation.x = Math.PI/2;
            idv.vr.scene.add(gridXY);


            var gridYZ = new THREE.GridHelper(1000, 10, new THREE.Color(0x660000), new THREE.Color(0x660000));
            gridYZ.position.set( -400, 100, 100 );
            gridYZ.rotation.z = Math.PI/2;
            idv.vr.scene.add(gridYZ);

            window.addEventListener( 'resize', idv.vr.onWindowResize, false );
            idv.vr.animate();
        });
    });
};


idv.vr.init();
idv.vr.play();

