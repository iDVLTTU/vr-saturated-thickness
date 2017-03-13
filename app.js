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

        this.worldHalfWidth = this.worldWidth / 2;
        this.worldHalfDepth = this.worldDepth / 2;
        this.clock = new THREE.Clock();

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

    // controls.handleResize();
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
    // camera.position.x = 2000;
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


// idv.vr.createContourMesh = function (width, height, material, data2D) {
//
//
//
//
// };

idv.vr.createTexture = function (data2D) {
    var generateTexture = function ( data, width, height ) {
        var canvas, canvasScaled, context, image, imageData,
            level, diff, vector3, sun, shade;
        vector3 = new THREE.Vector3( 0, 0, 0 );
        sun = new THREE.Vector3( 1, 1, 1 );
        sun.normalize();
        canvas = document.createElement( 'canvas' );
        canvas.width = width;
        canvas.height = height;
        context = canvas.getContext( '2d' );
        context.fillStyle = '#000';
        context.fillRect( 0, 0, width, height );
        image = context.getImageData( 0, 0, canvas.width, canvas.height );
        imageData = image.data;
        for ( var i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++ ) {
            vector3.x = data[ j - 2 ] - data[ j + 2 ];
            vector3.y = 2;
            vector3.z = data[ j - width * 2 ] - data[ j + width * 2 ];
            vector3.normalize();
            shade = vector3.dot( sun );
            imageData[ i ] = ( 96 + shade * 128 ) * ( 0.5 + data[ j ] * 0.007 );
            imageData[ i + 1 ] = ( 32 + shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
            imageData[ i + 2 ] = ( shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
        }
        context.putImageData( image, 0, 0 );
        // Scaled 4x
        canvasScaled = document.createElement( 'canvas' );
        canvasScaled.width = width * 4;
        canvasScaled.height = height * 4;
        context = canvasScaled.getContext( '2d' );
        context.scale( 4, 4 );
        context.drawImage( canvas, 0, 0 );
        image = context.getImageData( 0, 0, canvasScaled.width, canvasScaled.height );
        imageData = image.data;
        for ( var i = 0, l = imageData.length; i < l; i += 4 ) {
            var v = ~~ ( Math.random() * 5 );
            imageData[ i ] += v;
            imageData[ i + 1 ] += v;
            imageData[ i + 2 ] += v;
        }
        context.putImageData( image, 0, 0 );
        return canvasScaled;
    };

    var wireTexture = idv.vr.texture;
    wireTexture.wrapS = wireTexture.wrapT = THREE.MirroredRepeatWrapping;
    wireTexture.repeat.set( 0.1, 0.1 );
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

        data2D = idv.vr.generateHeight(idv.vr.getWorldWidth(), idv.vr.getWorldDepth());

        // loading texture
        idv.vr.textureLoader.load('http://127.0.0.1:8080/media/brick_diffuse.jpg', function (wireTexture) {
        // idv.vr.textureLoader.load('http://127.0.0.1:8080/media/square.png', function (wireTexture) {

            idv.vr.texture  = wireTexture;

            // create renderer
            idv.vr.createRenderer();

            // update camera position
            // position
            idv.vr.setupCamera();

            // create texture
            idv.vr.createTexture(data2D);

            // create mesh

            if (!!idv.vr.getMesh()) {
                idv.vr.scene.remove( idv.vr.getMesh() );
            }

            var material = new THREE.MeshBasicMaterial( { map: wireTexture} );

            var geometry = idv.vr.geo.createCuteGeometry(material);
            idv.vr.mesh = new THREE.Mesh( geometry, material );
            idv.vr.scene.add( idv.vr.getMesh() );



            // display
            idv.vr.attachDisplay();

            window.addEventListener( 'resize', idv.vr.onWindowResize, false );
            idv.vr.animate();
        });
    });
};


idv.vr.init();
idv.vr.play();

