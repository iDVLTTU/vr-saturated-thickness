var idv = idv || {};
idv.vr = idv.vr || {};
idv.vr.geo = idv.vr.geo || {};

idv.vr.geo.createOgallalaGeometry = function (data2D, material) {

    var meshFunction;
    var segments = 5,
        zMin = -10,
        zMax = 10;

    var zRange = zMax - zMin;
    var segmentRow = data2D.length-1;
    var segmentCol = data2D[0].length-1;

    meshFunction = function(x, y)
    {
        var myX = Math.round(x * segmentRow);
        var myY = Math.round(y * segmentCol);

        var tmpZ = data2D[myX];
        if (tmpZ == undefined) {
            debugger;
        }
        var myZ = tmpZ[myY];

        if (myZ < 0) {
            myZ = 0;
        }

        // myZ = myZ / 10;

        return new THREE.Vector3(myX, myY, myZ);
    };

    // true => sensible image tile repeat...
    var graphGeometry = new THREE.ParametricGeometry( meshFunction, segmentRow-1, segmentCol-1, false );


    ///////////////////////////////////////////////
    // calculate vertex colors based on Z values //
    ///////////////////////////////////////////////
    graphGeometry.computeBoundingBox();
    zMin = graphGeometry.boundingBox.min.z;
    zMax = graphGeometry.boundingBox.max.z;
    var yMax = graphGeometry.boundingBox.max.y;


    // graphGeometry.rotateX( - Math.PI / 2 );
    // graphGeometry.translate(0, 0, yMax);
    //
    // zRange = zMax - zMin;
    // var color, point, face, numberOfSides, vertexIndex;
    // // faces are indexed using characters
    // var faceIndices = [ 'a', 'b', 'c', 'd' ];
    // // first, assign colors to vertices as desired
    //
    // for ( var i = 0; i < graphGeometry.vertices.length; i++ )
    // {
    //     point = graphGeometry.vertices[ i ];
    //     color = new THREE.Color( 0xFF0000 );
    //
    //     if (point.z < 25) {
    //         color.setHSL( 0.1, 1, 0.5 );
    //
    //     }
    //     else if (point.z < 50) {
    //         color.setHSL(0.3, 1, 0.5 );
    //
    //     }
    //     else if (point.z < 90) {
    //         color.setHSL(0.5, 1, 0.5 );
    //
    //     }
    //     else {
    //         color.setHSL(0.7, 1, 0.5 );
    //
    //     }
    //
    //     // color.setHSL( 0.7 * (zMax - point.z) / zRange, 1, 0.5 );
    //     graphGeometry.colors[i] = color; // use this array for convenience
    // }
    // // copy the colors as necessary to the face's vertexColors array.
    // for ( var i = 0; i < graphGeometry.faces.length; i++ )
    // {
    //     face = graphGeometry.faces[ i ];
    //     numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
    //     for( var j = 0; j < numberOfSides; j++ )
    //     {
    //         vertexIndex = face[ faceIndices[ j ] ];
    //         face.vertexColors[ j ] = graphGeometry.colors[ vertexIndex ];
    //     }
    // }
    ///////////////////////
    // end vertex colors //
    ///////////////////////

    return graphGeometry;
};