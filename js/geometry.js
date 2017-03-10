var idv = idv || {};
idv.vr = idv.vr || {};
idv.vr.geo = idv.vr.geo || {};


idv.vr.geo.createCuteGeometry = function () {
    var vertices = [
        new THREE.Vector3(1,3,1),
        new THREE.Vector3(1,3,-1),
        new THREE.Vector3(1,-1,1),
        new THREE.Vector3(1,-1,-1),
        new THREE.Vector3(-1,3,-1),
        new THREE.Vector3(-1,3,1),
        new THREE.Vector3(-1,-1,-1),
        new THREE.Vector3(-1,-1,1)
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
    // copy the colors as necessary to the face's vertexColors array.
    for ( var i = 0; i < geometry.faces.length; i++ )
    {
        face = geometry.faces[ i ];
        numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
        for( var j = 0; j < numberOfSides; j++ )
        {
            vertexIndex = face[ faceIndices[ j ] ];
            face.vertexColors[ j ] = geometry.colors[ vertexIndex ];
        }
    }

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