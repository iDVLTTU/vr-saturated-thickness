var idv = idv || {};
idv.vr = idv.vr || {};
idv.vr.geo = idv.vr.geo || {};


idv.vr.geo.createCuteGeometry = function (material) {
    var vertices = [
        new THREE.Vector3(100,300,100),
        new THREE.Vector3(100,300,-100),
        new THREE.Vector3(100,-100,100),
        new THREE.Vector3(100,-100,-100),
        new THREE.Vector3(-100,300,-100),
        new THREE.Vector3(-100,300,100),
        new THREE.Vector3(-100,-100,-100),
        new THREE.Vector3(-100,-100,100)
    ];

    var faces = [
        new THREE.Face3(0,2,1),
        new THREE.Face3(2,3,1),
        new THREE.Face3(4,6,5),
        new THREE.Face3(6,7,5),
        new THREE.Face3(4,5,1),
        new THREE.Face3(5,0,1),
        new THREE.Face3(7,6,2),
        new THREE.Face3(6,3,2),
        new THREE.Face3(5,7,0),
        new THREE.Face3(7,2,0),
        new THREE.Face3(1,3,4),
        new THREE.Face3(3,6,4)
    ];


    var geometry = new THREE.Geometry();
    geometry.vertices = vertices;
    geometry.faces = faces;
    geometry.computeBoundingBox();
    geometry.computeFaceNormals();
    geometry.computeBoundingSphere();

    geometry.rotateX( - Math.PI / 2 );


    var zMin = geometry.boundingBox.min.z;
    var zMax = geometry.boundingBox.max.z;
    var zRange = zMax - zMin;
    var color, point, face, numberOfSides, vertexIndex;
    // faces are indexed using characters
    var faceIndices = [ 'a', 'b', 'c', 'd' ];
    // first, assign colors to vertices as desired
    for ( var i = 0; i < geometry.vertices.length; i++ )
    {
        point = geometry.vertices[ i ];
        color = new THREE.Color( 0x0000ff );
        color.setHSL( 0.7 * (zMax - point.z) / zRange, 1, 0.5 );
        geometry.colors[i] = color; // use this array for convenience
    }

    var colors = [];
    colors.push(new THREE.Color(0xFF0000));
    colors.push(new THREE.Color(0x00FF00));
    colors.push(new THREE.Color(0x0000FF));
    // copy the colors as necessary to the face's vertexColors array.
    for ( var i = 0; i < geometry.faces.length; i++ )
    {
        face = geometry.faces[ i ];
        numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
        for( var j = 0; j < numberOfSides; j++ )
        {
            vertexIndex = face[ faceIndices[ j ] ];
            // face.vertexColors[ j ] = geometry.colors[ vertexIndex ];
            face.vertexColors[ j ] = colors[j%3];
        }
    }

    // mapping UV to support custom texture
    var bricks = [new THREE.Vector2(0, .666), new THREE.Vector2(.5, .666), new THREE.Vector2(.5, 1), new THREE.Vector2(0, 1)];
    var clouds = [new THREE.Vector2(.5, .666), new THREE.Vector2(1, .666), new THREE.Vector2(1, 1), new THREE.Vector2(.5, 1)];
    var crate = [new THREE.Vector2(0, .333), new THREE.Vector2(.5, .333), new THREE.Vector2(.5, .666), new THREE.Vector2(0, .666)];
    var stone = [new THREE.Vector2(.5, .333), new THREE.Vector2(1, .333), new THREE.Vector2(1, .666), new THREE.Vector2(.5, .666)];
    var water = [new THREE.Vector2(0, 0), new THREE.Vector2(.5, 0), new THREE.Vector2(.5, .333), new THREE.Vector2(0, .333)];
    var wood = [new THREE.Vector2(.5, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, .333), new THREE.Vector2(.5, .333)];

    geometry.faceVertexUvs[0] = [];

    geometry.faceVertexUvs[0][0] = [ bricks[0], bricks[1], bricks[3] ];
    geometry.faceVertexUvs[0][1] = [ bricks[1], bricks[2], bricks[3] ];

    geometry.faceVertexUvs[0][2] = [ clouds[0], clouds[1], clouds[3] ];
    geometry.faceVertexUvs[0][3] = [ clouds[1], clouds[2], clouds[3] ];

    geometry.faceVertexUvs[0][4] = [ crate[0], crate[1], crate[3] ];
    geometry.faceVertexUvs[0][5] = [ crate[1], crate[2], crate[3] ];

    geometry.faceVertexUvs[0][6] = [ stone[0], stone[1], stone[3] ];
    geometry.faceVertexUvs[0][7] = [ stone[1], stone[2], stone[3] ];

    geometry.faceVertexUvs[0][8] = [ water[0], water[1], water[3] ];
    geometry.faceVertexUvs[0][9] = [ water[1], water[2], water[3] ];

    geometry.faceVertexUvs[0][10] = [ wood[0], wood[1], wood[3] ];
    geometry.faceVertexUvs[0][11] = [ wood[1], wood[2], wood[3] ];

    geometry.uvsNeedUpdate = true;


    return geometry;
};




idv.vr.createTerrainGeometry = function () {
    var geometry = new THREE.PlaneBufferGeometry( 7500, 7500, worldWidth - 1, worldDepth - 1 );
    // geometry.rotateX( - Math.PI / 2 );

    var generateHeight = function ( width, height ) {
        var size = width * height,
            data = new Uint8Array( size ),
            perlin = new ImprovedNoise(), quality = 1, z = Math.random() * 100;
        var x, y;
        for ( var j = 0; j < 4; j ++ ) {
            for ( var i = 0; i < size; i ++ ) {
                x = i % width;
                y = ~~ ( i / width );
                data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );
            }
            quality *= 5;
        }

        return data;
    };

    var data = generateHeight( worldWidth, worldDepth );

    var vertices = geometry.attributes.position.array;
    for ( var i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
        vertices[ j + 1 ] = data[ i ] * 10;
    }

    return geometry;


};

idv.vr.createGraphGeometry = function () {

    var zFuncText = "x^2 - y^2";
    var zFunc = Parser.parse(zFuncText).toJSFunction( ['x','y'] );

// parameters for the equations
    var a = 0.01, b = 0.01, c = 0.01, d = 0.01;

    var meshFunction;
    var segments = 20,
        xMin = -10, xMax = 10, xRange = xMax - xMin,
        yMin = -10, yMax = 10, yRange = yMax - yMin,
        zMin = -10, zMax = 10, zRange = zMax - zMin;

    xRange = xMax - xMin;
    yRange = yMax - yMin;
    zFunc = Parser.parse(zFuncText).toJSFunction( ['x','y'] );
    meshFunction = function(x, y)
    {
        x = xRange * x + xMin;
        y = yRange * y + yMin;
        var z = zFunc(x,y); //= Math.cos(x) * Math.sqrt(y);
        if ( isNaN(z) )
            return new THREE.Vector3(0,0,0); // TODO: better fix
        else
            return new THREE.Vector3(x, y, z);
    };

    // true => sensible image tile repeat...
    var graphGeometry = new THREE.ParametricGeometry( meshFunction, segments, segments, true );

    ///////////////////////////////////////////////
    // calculate vertex colors based on Z values //
    ///////////////////////////////////////////////
    graphGeometry.computeBoundingBox();
    zMin = graphGeometry.boundingBox.min.z;
    zMax = graphGeometry.boundingBox.max.z;
    zRange = zMax - zMin;
    var color, point, face, numberOfSides, vertexIndex;
    // faces are indexed using characters
    var faceIndices = [ 'a', 'b', 'c', 'd' ];
    // first, assign colors to vertices as desired
    for ( var i = 0; i < graphGeometry.vertices.length; i++ )
    {
        point = graphGeometry.vertices[ i ];
        color = new THREE.Color( 0x0000ff );
        color.setHSL( 0.7 * (zMax - point.z) / zRange, 1, 0.5 );
        graphGeometry.colors[i] = color; // use this array for convenience
    }
    // copy the colors as necessary to the face's vertexColors array.
    for ( var i = 0; i < graphGeometry.faces.length; i++ )
    {
        face = graphGeometry.faces[ i ];
        numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
        for( var j = 0; j < numberOfSides; j++ )
        {
            vertexIndex = face[ faceIndices[ j ] ];
            face.vertexColors[ j ] = graphGeometry.colors[ vertexIndex ];
        }
    }
    ///////////////////////
    // end vertex colors //
    ///////////////////////
    var graphMesh = new THREE.Mesh( graphGeometry, material );
    graphMesh.doubleSided = true;

    return graphMesh;
};