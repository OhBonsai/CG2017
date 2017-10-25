//////////////////////////////////////////////////////////////////////////////
//
//  Angel.js
//
//////////////////////////////////////////////////////////////////////////////

//----------------------------------------------------------------------------
//
//  Helper functions
//

function _argumentsToArray( args )
{
    return [].concat.apply( [], Array.prototype.slice.apply(args) );
}

//----------------------------------------------------------------------------

function radians( degrees ) {
    return degrees * Math.PI / 180.0;
}

//----------------------------------------------------------------------------
//
//  Vector Constructors
//

function vec2()
{
    var result = _argumentsToArray( arguments );

    switch ( result.length ) {
        case 0: result.push( 0.0 );
        case 1: result.push( 0.0 );
    }

    return result.splice( 0, 2 );
}

function vec3()
{
    var result = _argumentsToArray( arguments );

    switch ( result.length ) {
        case 0: result.push( 0.0 );
        case 1: result.push( 0.0 );
        case 2: result.push( 0.0 );
    }

    return result.splice( 0, 3 );
}

function vec4()
{
    var result = _argumentsToArray( arguments );

    switch ( result.length ) {
        case 0: result.push( 0.0 );
        case 1: result.push( 0.0 );
        case 2: result.push( 0.0 );
        case 3: result.push( 1.0 );
    }

    return result.splice( 0, 4 );
}

//----------------------------------------------------------------------------
//
//  Matrix Constructors
//

function mat2()
{
    var v = _argumentsToArray( arguments );

    var m = [];
    switch ( v.length ) {
        case 0:
            v[0] = 1;
        case 1:
            m = [
                vec2( v[0],  0.0 ),
                vec2(  0.0, v[0] )
            ];
            break;

        default:
            m.push( vec2(v) );  v.splice( 0, 2 );
            m.push( vec2(v) );
            break;
    }

    m.matrix = true;

    return m;
}

//----------------------------------------------------------------------------

function mat3()
{
    var v = _argumentsToArray( arguments );

    var m = [];
    switch ( v.length ) {
        case 0:
            v[0] = 1;
        case 1:
            m = [
                vec3( v[0],  0.0,  0.0 ),
                vec3(  0.0, v[0],  0.0 ),
                vec3(  0.0,  0.0, v[0] )
            ];
            break;

        default:
            m.push( vec3(v) );  v.splice( 0, 3 );
            m.push( vec3(v) );  v.splice( 0, 3 );
            m.push( vec3(v) );
            break;
    }

    m.matrix = true;

    return m;
}

//----------------------------------------------------------------------------

function mat4()
{
    var v = _argumentsToArray( arguments );

    var m = [];
    switch ( v.length ) {
        case 0:
            v[0] = 1;
        case 1:
            m = [
                vec4( v[0], 0.0,  0.0,   0.0 ),
                vec4( 0.0,  v[0], 0.0,   0.0 ),
                vec4( 0.0,  0.0,  v[0],  0.0 ),
                vec4( 0.0,  0.0,  0.0,  v[0] )
            ];
            break;

        default:
            m.push( vec4(v) );  v.splice( 0, 4 );
            m.push( vec4(v) );  v.splice( 0, 4 );
            m.push( vec4(v) );  v.splice( 0, 4 );
            m.push( vec4(v) );
            break;
    }

    m.matrix = true;

    return m;
}

//----------------------------------------------------------------------------
//
//  Generic Mathematical Operations for Vectors and Matrices
//

function equal( u, v )
{
    if ( u.length != v.length ) { return false; }

    if ( u.matrix && v.matrix ) {
        for ( var i = 0; i < u.length; ++i ) {
            if ( u[i].length != v[i].length ) { return false; }
            for ( var j = 0; j < u[i].length; ++j ) {
                if ( u[i][j] !== v[i][j] ) { return false; }
            }
        }
    }
    else if ( u.matrix && !v.matrix || !u.matrix && v.matrix ) {
        return false;
    }
    else {
        for ( var i = 0; i < u.length; ++i ) {
            if ( u[i] !== v[i] ) { return false; }
        }
    }

    return true;
}

//----------------------------------------------------------------------------

function add( u, v )
{
    var result = [];

    if ( u.matrix && v.matrix ) {
        if ( u.length != v.length ) {
            throw "add(): trying to add matrices of different dimensions";
        }

        for ( var i = 0; i < u.length; ++i ) {
            if ( u[i].length != v[i].length ) {
                throw "add(): trying to add matrices of different dimensions";
            }
            result.push( [] );
            for ( var j = 0; j < u[i].length; ++j ) {
                result[i].push( u[i][j] + v[i][j] );
            }
        }

        result.matrix = true;

        return result;
    }
    else if ( u.matrix && !v.matrix || !u.matrix && v.matrix ) {
        throw "add(): trying to add matrix and non-matrix variables";
    }
    else {
        if ( u.length != v.length ) {
            throw "add(): vectors are not the same dimension";
        }

        for ( var i = 0; i < u.length; ++i ) {
            result.push( u[i] + v[i] );
        }

        return result;
    }
}

//----------------------------------------------------------------------------

function subtract( u, v )
{
    var result = [];

    if ( u.matrix && v.matrix ) {
        if ( u.length != v.length ) {
            throw "subtract(): trying to subtract matrices" +
            " of different dimensions";
        }

        for ( var i = 0; i < u.length; ++i ) {
            if ( u[i].length != v[i].length ) {
                throw "subtract(): trying to subtact matrices" +
                " of different dimensions";
            }
            result.push( [] );
            for ( var j = 0; j < u[i].length; ++j ) {
                result[i].push( u[i][j] - v[i][j] );
            }
        }

        result.matrix = true;

        return result;
    }
    else if ( u.matrix && !v.matrix || !u.matrix && v.matrix ) {
        throw "subtact(): trying to subtact  matrix and non-matrix variables";
    }
    else {
        if ( u.length != v.length ) {
            throw "subtract(): vectors are not the same length";
        }

        for ( var i = 0; i < u.length; ++i ) {
            result.push( u[i] - v[i] );
        }

        return result;
    }
}

//----------------------------------------------------------------------------

function mult( u, v )
{
    var result = [];

    if ( u.matrix && v.matrix ) {
        if ( u.length != v.length ) {
            throw "mult(): trying to add matrices of different dimensions";
        }

        for ( var i = 0; i < u.length; ++i ) {
            if ( u[i].length != v[i].length ) {
                throw "mult(): trying to add matrices of different dimensions";
            }
        }

        for ( var i = 0; i < u.length; ++i ) {
            result.push( [] );

            for ( var j = 0; j < v.length; ++j ) {
                var sum = 0.0;
                for ( var k = 0; k < u.length; ++k ) {
                    sum += u[i][k] * v[k][j];
                }
                result[i].push( sum );
            }
        }

        result.matrix = true;

        return result;
    }

    if(u.matrix&& (u.length == v.length)) {
        for(var i = 0; i<v.length; i++) {
            var sum = 0.0;
            for(var j=0; j<v.length; j++) {
                sum += u[i][j]*v[j];
            }
            result.push(sum);
        }
        return result;
    }



    else {
        if ( u.length != v.length ) {
            throw "mult(): vectors are not the same dimension";
        }

        for ( var i = 0; i < u.length; ++i ) {
            result.push( u[i] * v[i] );
        }

        return result;
    }
}

//----------------------------------------------------------------------------
//
//  Basic Transformation Matrix Generators
//

function translate( x, y, z )
{
    if ( Array.isArray(x) && x.length == 3 ) {
        z = x[2];
        y = x[1];
        x = x[0];
    }

    var result = mat4();
    result[0][3] = x;
    result[1][3] = y;
    result[2][3] = z;

    return result;
}

//----------------------------------------------------------------------------

function rotate( angle, axis )
{
    if ( !Array.isArray(axis) ) {
        axis = [ arguments[1], arguments[2], arguments[3] ];
    }

    var v = normalize( axis );

    var x = v[0];
    var y = v[1];
    var z = v[2];

    var c = Math.cos( radians(angle) );
    var omc = 1.0 - c;
    var s = Math.sin( radians(angle) );

    var result = mat4(
        vec4( x*x*omc + c,   x*y*omc - z*s, x*z*omc + y*s, 0.0 ),
        vec4( x*y*omc + z*s, y*y*omc + c,   y*z*omc - x*s, 0.0 ),
        vec4( x*z*omc - y*s, y*z*omc + x*s, z*z*omc + c,   0.0 ),
        vec4()
    );

    return result;
}

function rotateX(theta) {
    var c = Math.cos( radians(theta) );
    var s = Math.sin( radians(theta) );
    var rx = mat4( 1.0,  0.0,  0.0, 0.0,
        0.0,  c,  s, 0.0,
        0.0, -s,  c, 0.0,
        0.0,  0.0,  0.0, 1.0 );
    return rx;
}
function rotateY(theta) {
    var c = Math.cos( radians(theta) );
    var s = Math.sin( radians(theta) );
    var ry = mat4( c, 0.0, -s, 0.0,
        0.0, 1.0,  0.0, 0.0,
        s, 0.0,  c, 0.0,
        0.0, 0.0,  0.0, 1.0 );
    return ry;
}
function rotateZ(theta) {
    var c = Math.cos( radians(theta) );
    var s = Math.sin( radians(theta) );
    var rz = mat4( c, s, 0.0, 0.0,
        -s,  c, 0.0, 0.0,
        0.0,  0.0, 1.0, 0.0,
        0.0,  0.0, 0.0, 1.0 );
    return rz;
}


//----------------------------------------------------------------------------

function scalem( x, y, z )
{
    if ( Array.isArray(x) && x.length == 3 ) {
        z = x[2];
        y = x[1];
        x = x[0];
    }

    var result = mat4();
    result[0][0] = x;
    result[1][1] = y;
    result[2][2] = z;

    return result;
}

//----------------------------------------------------------------------------
//
//  ModelView Matrix Generators
//

function lookAt( eye, at, up )
{
    if ( !Array.isArray(eye) || eye.length != 3) {
        throw "lookAt(): first parameter [eye] must be an a vec3";
    }

    if ( !Array.isArray(at) || at.length != 3) {
        throw "lookAt(): first parameter [at] must be an a vec3";
    }

    if ( !Array.isArray(up) || up.length != 3) {
        throw "lookAt(): first parameter [up] must be an a vec3";
    }

    if ( equal(eye, at) ) {
        return mat4();
    }

    var v = normalize( subtract(at, eye) );  // view direction vector
    var n = normalize( cross(v, up) );       // perpendicular vector
    var u = normalize( cross(n, v) );        // "new" up vector

    v = negate( v );

    var result = mat4(
        vec4( n, -dot(n, eye) ),
        vec4( u, -dot(u, eye) ),
        vec4( v, -dot(v, eye) ),
        vec4()
    );

    return result;
}

//----------------------------------------------------------------------------
//
//  Projection Matrix Generators
//

function ortho( left, right, bottom, top, near, far )
{
    if ( left == right ) { throw "ortho(): left and right are equal"; }
    if ( bottom == top ) { throw "ortho(): bottom and top are equal"; }
    if ( near == far )   { throw "ortho(): near and far are equal"; }

    var w = right - left;
    var h = top - bottom;
    var d = far - near;

    var result = mat4();
    result[0][0] = 2.0 / w;
    result[1][1] = 2.0 / h;
    result[2][2] = -2.0 / d;
    result[0][3] = -(left + right) / w;
    result[1][3] = -(top + bottom) / h;
    result[2][3] = -(near + far) / d;

    return result;
}

//----------------------------------------------------------------------------

function perspective( fovy, aspect, near, far )
{
    var f = 1.0 / Math.tan( radians(fovy) / 2 );
    var d = far - near;

    var result = mat4();
    result[0][0] = f / aspect;
    result[1][1] = f;
    result[2][2] = -(near + far) / d;
    result[2][3] = -2 * near * far / d;
    result[3][2] = -1;
    result[3][3] = 0.0;

    return result;
}

//----------------------------------------------------------------------------
//
//  Matrix Functions
//

function transpose( m )
{
    if ( !m.matrix ) {
        return "transpose(): trying to transpose a non-matrix";
    }

    var result = [];
    for ( var i = 0; i < m.length; ++i ) {
        result.push( [] );
        for ( var j = 0; j < m[i].length; ++j ) {
            result[i].push( m[j][i] );
        }
    }

    result.matrix = true;

    return result;
}

//----------------------------------------------------------------------------
//
//  Vector Functions
//

function dot( u, v )
{
    if ( u.length != v.length ) {
        throw "dot(): vectors are not the same dimension";
    }

    var sum = 0.0;
    for ( var i = 0; i < u.length; ++i ) {
        sum += u[i] * v[i];
    }

    return sum;
}

//----------------------------------------------------------------------------

function negate( u )
{
    var result = [];
    for ( var i = 0; i < u.length; ++i ) {
        result.push( -u[i] );
    }

    return result;
}

//----------------------------------------------------------------------------

function cross( u, v )
{
    if ( !Array.isArray(u) || u.length < 3 ) {
        throw "cross(): first argument is not a vector of at least 3";
    }

    if ( !Array.isArray(v) || v.length < 3 ) {
        throw "cross(): second argument is not a vector of at least 3";
    }

    var result = [
        u[1]*v[2] - u[2]*v[1],
        u[2]*v[0] - u[0]*v[2],
        u[0]*v[1] - u[1]*v[0]
    ];

    return result;
}

//----------------------------------------------------------------------------

function length( u )
{
    return Math.sqrt( dot(u, u) );
}

//----------------------------------------------------------------------------

function normalize( u, excludeLastComponent )
{
    if ( excludeLastComponent ) {
        var last = u.pop();
    }

    var len = length( u );

    if ( !isFinite(len) ) {
        throw "normalize: vector " + u + " has zero length";
    }

    for ( var i = 0; i < u.length; ++i ) {
        u[i] /= len;
    }

    if ( excludeLastComponent ) {
        u.push( last );
    }

    return u;
}

//----------------------------------------------------------------------------

function mix( u, v, s )
{
    if ( typeof s !== "number" ) {
        throw "mix: the last paramter " + s + " must be a number";
    }

    if ( u.length != v.length ) {
        throw "vector dimension mismatch";
    }

    var result = [];
    for ( var i = 0; i < u.length; ++i ) {
        result.push( (1.0 - s) * u[i] + s * v[i] );
    }

    return result;
}

//----------------------------------------------------------------------------
//
// Vector and Matrix functions
//

function scale( s, u )
{
    if ( !Array.isArray(u) ) {
        throw "scale: second parameter " + u + " is not a vector";
    }

    var result = [];
    for ( var i = 0; i < u.length; ++i ) {
        result.push( s * u[i] );
    }

    return result;
}

//----------------------------------------------------------------------------
//
//
//

function flatten( v )
{
    if ( v.matrix === true ) {
        v = transpose( v );
    }

    var n = v.length;
    var elemsAreArrays = false;

    if ( Array.isArray(v[0]) ) {
        elemsAreArrays = true;
        n *= v[0].length;
    }

    var floats = new Float32Array( n );

    if ( elemsAreArrays ) {
        var idx = 0;
        for ( var i = 0; i < v.length; ++i ) {
            for ( var j = 0; j < v[i].length; ++j ) {
                floats[idx++] = v[i][j];
            }
        }
    }
    else {
        for ( var i = 0; i < v.length; ++i ) {
            floats[i] = v[i];
        }
    }

    return floats;
}

//----------------------------------------------------------------------------

var sizeof = {
    'vec2' : new Float32Array( flatten(vec2()) ).byteLength,
    'vec3' : new Float32Array( flatten(vec3()) ).byteLength,
    'vec4' : new Float32Array( flatten(vec4()) ).byteLength,
    'mat2' : new Float32Array( flatten(mat2()) ).byteLength,
    'mat3' : new Float32Array( flatten(mat3()) ).byteLength,
    'mat4' : new Float32Array( flatten(mat4()) ).byteLength
};

// new functions 5/2/2015

// printing

function printm(m)
{
    if(m.length == 2)
        for(var i=0; i<m.length; i++)
            console.log(m[i][0], m[i][1]);
    else if(m.length == 3)
        for(var i=0; i<m.length; i++)
            console.log(m[i][0], m[i][1], m[i][2]);
    else if(m.length == 4)
        for(var i=0; i<m.length; i++)
            console.log(m[i][0], m[i][1], m[i][2], m[i][3]);
}
// determinants

function det2(m)
{

    return m[0][0]*m[1][1]-m[0][1]*m[1][0];

}

function det3(m)
{
    var d = m[0][0]*m[1][1]*m[2][2]
        + m[0][1]*m[1][2]*m[2][0]
        + m[0][2]*m[2][1]*m[1][0]
        - m[2][0]*m[1][1]*m[0][2]
        - m[1][0]*m[0][1]*m[2][2]
        - m[0][0]*m[1][2]*m[2][1]
    ;
    return d;
}

function det4(m)
{
    var m0 = [
        vec3(m[1][1], m[1][2], m[1][3]),
        vec3(m[2][1], m[2][2], m[2][3]),
        vec3(m[3][1], m[3][2], m[3][3])
    ];
    var m1 = [
        vec3(m[1][0], m[1][2], m[1][3]),
        vec3(m[2][0], m[2][2], m[2][3]),
        vec3(m[3][0], m[3][2], m[3][3])
    ];
    var m2 = [
        vec3(m[1][0], m[1][1], m[1][3]),
        vec3(m[2][0], m[2][1], m[2][3]),
        vec3(m[3][0], m[3][1], m[3][3])
    ];
    var m3 = [
        vec3(m[1][0], m[1][1], m[1][2]),
        vec3(m[2][0], m[2][1], m[2][2]),
        vec3(m[3][0], m[3][1], m[3][2])
    ];
    return m[0][0]*det3(m0) - m[0][1]*det3(m1)
        + m[0][2]*det3(m2) - m[0][3]*det3(m3);

}

function det(m)
{
    if(m.matrix != true) console.log("not a matrix");
    if(m.length == 2) return det2(m);
    if(m.length == 3) return det3(m);
    if(m.length == 4) return det4(m);
}

//---------------------------------------------------------

// inverses

function inverse2(m)
{
    var a = mat2();
    var d = det2(m);
    a[0][0] = m[1][1]/d;
    a[0][1] = -m[0][1]/d;
    a[1][0] = -m[1][0]/d;
    a[1][1] = m[0][0]/d;
    a.matrix = true;
    return a;
}

function inverse3(m)
{
    var a = mat3();
    var d = det3(m);

    var a00 = [
        vec2(m[1][1], m[1][2]),
        vec2(m[2][1], m[2][2])
    ];
    var a01 = [
        vec2(m[1][0], m[1][2]),
        vec2(m[2][0], m[2][2])
    ];
    var a02 = [
        vec2(m[1][0], m[1][1]),
        vec2(m[2][0], m[2][1])
    ];
    var a10 = [
        vec2(m[0][1], m[0][2]),
        vec2(m[2][1], m[2][2])
    ];
    var a11 = [
        vec2(m[0][0], m[0][2]),
        vec2(m[2][0], m[2][2])
    ];
    var a12 = [
        vec2(m[0][0], m[0][1]),
        vec2(m[2][0], m[2][1])
    ];
    var a20 = [
        vec2(m[0][1], m[0][2]),
        vec2(m[1][1], m[1][2])
    ];
    var a21 = [
        vec2(m[0][0], m[0][2]),
        vec2(m[1][0], m[1][2])
    ];
    var a22 = [
        vec2(m[0][0], m[0][1]),
        vec2(m[1][0], m[1][1])
    ];

    a[0][0] = det2(a00)/d;
    a[0][1] = -det2(a10)/d;
    a[0][2] = det2(a20)/d;
    a[1][0] = -det2(a01)/d;
    a[1][1] = det2(a11)/d;
    a[1][2] = -det2(a21)/d;
    a[2][0] = det2(a02)/d;
    a[2][1] = -det2(a12)/d;
    a[2][2] = det2(a22)/d;

    return a;

}

function inverse4(m)
{
    var a = mat4();
    var d = det4(m);

    var a00 = [
        vec3(m[1][1], m[1][2], m[1][3]),
        vec3(m[2][1], m[2][2], m[2][3]),
        vec3(m[3][1], m[3][2], m[3][3])
    ];
    var a01 = [
        vec3(m[1][0], m[1][2], m[1][3]),
        vec3(m[2][0], m[2][2], m[2][3]),
        vec3(m[3][0], m[3][2], m[3][3])
    ];
    var a02 = [
        vec3(m[1][0], m[1][1], m[1][3]),
        vec3(m[2][0], m[2][1], m[2][3]),
        vec3(m[3][0], m[3][1], m[3][3])
    ];
    var a03 = [
        vec3(m[1][0], m[1][1], m[1][2]),
        vec3(m[2][0], m[2][1], m[2][2]),
        vec3(m[3][0], m[3][1], m[3][2])
    ];
    var a10 = [
        vec3(m[0][1], m[0][2], m[0][3]),
        vec3(m[2][1], m[2][2], m[2][3]),
        vec3(m[3][1], m[3][2], m[3][3])
    ];
    var a11 = [
        vec3(m[0][0], m[0][2], m[0][3]),
        vec3(m[2][0], m[2][2], m[2][3]),
        vec3(m[3][0], m[3][2], m[3][3])
    ];
    var a12 = [
        vec3(m[0][0], m[0][1], m[0][3]),
        vec3(m[2][0], m[2][1], m[2][3]),
        vec3(m[3][0], m[3][1], m[3][3])
    ];
    var a13 = [
        vec3(m[0][0], m[0][1], m[0][2]),
        vec3(m[2][0], m[2][1], m[2][2]),
        vec3(m[3][0], m[3][1], m[3][2])
    ];
    var a20 = [
        vec3(m[0][1], m[0][2], m[0][3]),
        vec3(m[1][1], m[1][2], m[1][3]),
        vec3(m[3][1], m[3][2], m[3][3])
    ];
    var a21 = [
        vec3(m[0][0], m[0][2], m[0][3]),
        vec3(m[1][0], m[1][2], m[1][3]),
        vec3(m[3][0], m[3][2], m[3][3])
    ];
    var a22 = [
        vec3(m[0][0], m[0][1], m[0][3]),
        vec3(m[1][0], m[1][1], m[1][3]),
        vec3(m[3][0], m[3][1], m[3][3])
    ];
    var a23 = [
        vec3(m[0][0], m[0][1], m[0][2]),
        vec3(m[1][0], m[1][1], m[1][2]),
        vec3(m[3][0], m[3][1], m[3][2])
    ];

    var a30 = [
        vec3(m[0][1], m[0][2], m[0][3]),
        vec3(m[1][1], m[1][2], m[1][3]),
        vec3(m[2][1], m[2][2], m[2][3])
    ];
    var a31 = [
        vec3(m[0][0], m[0][2], m[0][3]),
        vec3(m[1][0], m[1][2], m[1][3]),
        vec3(m[2][0], m[2][2], m[2][3])
    ];
    var a32 = [
        vec3(m[0][0], m[0][1], m[0][3]),
        vec3(m[1][0], m[1][1], m[1][3]),
        vec3(m[2][0], m[2][1], m[2][3])
    ];
    var a33 = [
        vec3(m[0][0], m[0][1], m[0][2]),
        vec3(m[1][0], m[1][1], m[1][2]),
        vec3(m[2][0], m[2][1], m[2][2])
    ];



    a[0][0] = det3(a00)/d;
    a[0][1] = -det3(a10)/d;
    a[0][2] = det3(a20)/d;
    a[0][3] = -det3(a30)/d;
    a[1][0] = -det3(a01)/d;
    a[1][1] = det3(a11)/d;
    a[1][2] = -det3(a21)/d;
    a[1][3] = det3(a31)/d;
    a[2][0] = det3(a02)/d;
    a[2][1] = -det3(a12)/d;
    a[2][2] = det3(a22)/d;
    a[2][3] = -det3(a32)/d;
    a[3][0] = -det3(a03)/d;
    a[3][1] = det3(a13)/d;
    a[3][2] = -det3(a23)/d;
    a[3][3] = det3(a33)/d;

    return a;
}
function inverse(m)
{
    if(m.matrix != true) console.log("not a matrix");
    if(m.length == 2) return inverse2(m);
    if(m.length == 3) return inverse3(m);
    if(m.length == 4) return inverse4(m);
}

function normalMatrix(m, flag)
{
    var a = mat4();
    a = inverse(transpose(m));
    if(flag != true) return a;
    else {
        var b = mat3();
        for(var i=0;i<3;i++) for(var j=0; j<3; j++) b[i][j] = a[i][j];
        return b;
    }

}

/*
 * Copyright (c) 2009, Mozilla Corp
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the <organization> nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY <copyright holder> ''AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL <copyright holder> BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/*
 * Based on sample code from the OpenGL(R) ES 2.0 Programming Guide, which carriers
 * the following header:
 *
 * Book:      OpenGL(R) ES 2.0 Programming Guide
 * Authors:   Aaftab Munshi, Dan Ginsburg, Dave Shreiner
 * ISBN-10:   0321502795
 * ISBN-13:   9780321502797
 * Publisher: Addison-Wesley Professional
 * URLs:      http://safari.informit.com/9780321563835
 *            http://www.opengles-book.com
 */

//
// A simple 4x4 Matrix utility class
//

function Matrix4x4() {
    this.elements = Array(16);
    this.loadIdentity();
}

Matrix4x4.prototype = {
    scale: function (sx, sy, sz) {
        this.elements[0*4+0] *= sx;
        this.elements[0*4+1] *= sx;
        this.elements[0*4+2] *= sx;
        this.elements[0*4+3] *= sx;

        this.elements[1*4+0] *= sy;
        this.elements[1*4+1] *= sy;
        this.elements[1*4+2] *= sy;
        this.elements[1*4+3] *= sy;

        this.elements[2*4+0] *= sz;
        this.elements[2*4+1] *= sz;
        this.elements[2*4+2] *= sz;
        this.elements[2*4+3] *= sz;

        return this;
    },

    translate: function (tx, ty, tz) {
        this.elements[3*4+0] += this.elements[0*4+0] * tx + this.elements[1*4+0] * ty + this.elements[2*4+0] * tz;
        this.elements[3*4+1] += this.elements[0*4+1] * tx + this.elements[1*4+1] * ty + this.elements[2*4+1] * tz;
        this.elements[3*4+2] += this.elements[0*4+2] * tx + this.elements[1*4+2] * ty + this.elements[2*4+2] * tz;
        this.elements[3*4+3] += this.elements[0*4+3] * tx + this.elements[1*4+3] * ty + this.elements[2*4+3] * tz;

        return this;
    },

    rotate: function (angle, x, y, z) {
        var mag = Math.sqrt(x*x + y*y + z*z);
        var sinAngle = Math.sin(angle * Math.PI / 180.0);
        var cosAngle = Math.cos(angle * Math.PI / 180.0);

        if (mag > 0) {
            var xx, yy, zz, xy, yz, zx, xs, ys, zs;
            var oneMinusCos;
            var rotMat;

            x /= mag;
            y /= mag;
            z /= mag;

            xx = x * x;
            yy = y * y;
            zz = z * z;
            xy = x * y;
            yz = y * z;
            zx = z * x;
            xs = x * sinAngle;
            ys = y * sinAngle;
            zs = z * sinAngle;
            oneMinusCos = 1.0 - cosAngle;

            rotMat = new Matrix4x4();

            rotMat.elements[0*4+0] = (oneMinusCos * xx) + cosAngle;
            rotMat.elements[0*4+1] = (oneMinusCos * xy) - zs;
            rotMat.elements[0*4+2] = (oneMinusCos * zx) + ys;
            rotMat.elements[0*4+3] = 0.0;

            rotMat.elements[1*4+0] = (oneMinusCos * xy) + zs;
            rotMat.elements[1*4+1] = (oneMinusCos * yy) + cosAngle;
            rotMat.elements[1*4+2] = (oneMinusCos * yz) - xs;
            rotMat.elements[1*4+3] = 0.0;

            rotMat.elements[2*4+0] = (oneMinusCos * zx) - ys;
            rotMat.elements[2*4+1] = (oneMinusCos * yz) + xs;
            rotMat.elements[2*4+2] = (oneMinusCos * zz) + cosAngle;
            rotMat.elements[2*4+3] = 0.0;

            rotMat.elements[3*4+0] = 0.0;
            rotMat.elements[3*4+1] = 0.0;
            rotMat.elements[3*4+2] = 0.0;
            rotMat.elements[3*4+3] = 1.0;

            rotMat = rotMat.multiply(this);
            this.elements = rotMat.elements;
        }

        return this;
    },

    frustum: function (left, right, bottom, top, nearZ, farZ) {
        var deltaX = right - left;
        var deltaY = top - bottom;
        var deltaZ = farZ - nearZ;
        var frust;

        if ( (nearZ <= 0.0) || (farZ <= 0.0) ||
            (deltaX <= 0.0) || (deltaY <= 0.0) || (deltaZ <= 0.0) )
            return this;

        frust = new Matrix4x4();

        frust.elements[0*4+0] = 2.0 * nearZ / deltaX;
        frust.elements[0*4+1] = frust.elements[0*4+2] = frust.elements[0*4+3] = 0.0;

        frust.elements[1*4+1] = 2.0 * nearZ / deltaY;
        frust.elements[1*4+0] = frust.elements[1*4+2] = frust.elements[1*4+3] = 0.0;

        frust.elements[2*4+0] = (right + left) / deltaX;
        frust.elements[2*4+1] = (top + bottom) / deltaY;
        frust.elements[2*4+2] = -(nearZ + farZ) / deltaZ;
        frust.elements[2*4+3] = -1.0;

        frust.elements[3*4+2] = -2.0 * nearZ * farZ / deltaZ;
        frust.elements[3*4+0] = frust.elements[3*4+1] = frust.elements[3*4+3] = 0.0;

        frust = frust.multiply(this);
        this.elements = frust.elements;

        return this;
    },

    perspective: function (fovy, aspect, nearZ, farZ) {
        var frustumH = Math.tan(fovy / 360.0 * Math.PI) * nearZ;
        var frustumW = frustumH * aspect;

        return this.frustum(-frustumW, frustumW, -frustumH, frustumH, nearZ, farZ);
    },

    ortho: function (left, right, bottom, top, nearZ, farZ) {
        var deltaX = right - left;
        var deltaY = top - bottom;
        var deltaZ = farZ - nearZ;

        var ortho = new Matrix4x4();

        if ( (deltaX == 0.0) || (deltaY == 0.0) || (deltaZ == 0.0) )
            return this;

        ortho.elements[0*4+0] = 2.0 / deltaX;
        ortho.elements[3*4+0] = -(right + left) / deltaX;
        ortho.elements[1*4+1] = 2.0 / deltaY;
        ortho.elements[3*4+1] = -(top + bottom) / deltaY;
        ortho.elements[2*4+2] = -2.0 / deltaZ;
        ortho.elements[3*4+2] = -(nearZ + farZ) / deltaZ;

        ortho = ortho.multiply(this);
        this.elements = ortho.elements;

        return this;
    },

    multiply: function (right) {
        var tmp = new Matrix4x4();

        for (var i = 0; i < 4; i++) {
            tmp.elements[i*4+0] =
                (this.elements[i*4+0] * right.elements[0*4+0]) +
                (this.elements[i*4+1] * right.elements[1*4+0]) +
                (this.elements[i*4+2] * right.elements[2*4+0]) +
                (this.elements[i*4+3] * right.elements[3*4+0]) ;

            tmp.elements[i*4+1] =
                (this.elements[i*4+0] * right.elements[0*4+1]) +
                (this.elements[i*4+1] * right.elements[1*4+1]) +
                (this.elements[i*4+2] * right.elements[2*4+1]) +
                (this.elements[i*4+3] * right.elements[3*4+1]) ;

            tmp.elements[i*4+2] =
                (this.elements[i*4+0] * right.elements[0*4+2]) +
                (this.elements[i*4+1] * right.elements[1*4+2]) +
                (this.elements[i*4+2] * right.elements[2*4+2]) +
                (this.elements[i*4+3] * right.elements[3*4+2]) ;

            tmp.elements[i*4+3] =
                (this.elements[i*4+0] * right.elements[0*4+3]) +
                (this.elements[i*4+1] * right.elements[1*4+3]) +
                (this.elements[i*4+2] * right.elements[2*4+3]) +
                (this.elements[i*4+3] * right.elements[3*4+3]) ;
        }

        this.elements = tmp.elements;
        return this;
    },

    copy: function () {
        var tmp = new Matrix4x4();
        for (var i = 0; i < 16; i++) {
            tmp.elements[i] = this.elements[i];
        }
        return tmp;
    },

    get: function (row, col) {
        return this.elements[4*row+col];
    },

    // In-place inversion
    invert: function () {
        var tmp_0 = this.get(2,2) * this.get(3,3);
        var tmp_1 = this.get(3,2) * this.get(2,3);
        var tmp_2 = this.get(1,2) * this.get(3,3);
        var tmp_3 = this.get(3,2) * this.get(1,3);
        var tmp_4 = this.get(1,2) * this.get(2,3);
        var tmp_5 = this.get(2,2) * this.get(1,3);
        var tmp_6 = this.get(0,2) * this.get(3,3);
        var tmp_7 = this.get(3,2) * this.get(0,3);
        var tmp_8 = this.get(0,2) * this.get(2,3);
        var tmp_9 = this.get(2,2) * this.get(0,3);
        var tmp_10 = this.get(0,2) * this.get(1,3);
        var tmp_11 = this.get(1,2) * this.get(0,3);
        var tmp_12 = this.get(2,0) * this.get(3,1);
        var tmp_13 = this.get(3,0) * this.get(2,1);
        var tmp_14 = this.get(1,0) * this.get(3,1);
        var tmp_15 = this.get(3,0) * this.get(1,1);
        var tmp_16 = this.get(1,0) * this.get(2,1);
        var tmp_17 = this.get(2,0) * this.get(1,1);
        var tmp_18 = this.get(0,0) * this.get(3,1);
        var tmp_19 = this.get(3,0) * this.get(0,1);
        var tmp_20 = this.get(0,0) * this.get(2,1);
        var tmp_21 = this.get(2,0) * this.get(0,1);
        var tmp_22 = this.get(0,0) * this.get(1,1);
        var tmp_23 = this.get(1,0) * this.get(0,1);

        var t0 = ((tmp_0 * this.get(1,1) + tmp_3 * this.get(2,1) + tmp_4 * this.get(3,1)) -
        (tmp_1 * this.get(1,1) + tmp_2 * this.get(2,1) + tmp_5 * this.get(3,1)));
        var t1 = ((tmp_1 * this.get(0,1) + tmp_6 * this.get(2,1) + tmp_9 * this.get(3,1)) -
        (tmp_0 * this.get(0,1) + tmp_7 * this.get(2,1) + tmp_8 * this.get(3,1)));
        var t2 = ((tmp_2 * this.get(0,1) + tmp_7 * this.get(1,1) + tmp_10 * this.get(3,1)) -
        (tmp_3 * this.get(0,1) + tmp_6 * this.get(1,1) + tmp_11 * this.get(3,1)));
        var t3 = ((tmp_5 * this.get(0,1) + tmp_8 * this.get(1,1) + tmp_11 * this.get(2,1)) -
        (tmp_4 * this.get(0,1) + tmp_9 * this.get(1,1) + tmp_10 * this.get(2,1)));

        var d = 1.0 / (this.get(0,0) * t0 + this.get(1,0) * t1 + this.get(2,0) * t2 + this.get(3,0) * t3);

        var out_00 = d * t0;
        var out_01 = d * t1;
        var out_02 = d * t2;
        var out_03 = d * t3;

        var out_10 = d * ((tmp_1 * this.get(1,0) + tmp_2 * this.get(2,0) + tmp_5 * this.get(3,0)) -
            (tmp_0 * this.get(1,0) + tmp_3 * this.get(2,0) + tmp_4 * this.get(3,0)));
        var out_11 = d * ((tmp_0 * this.get(0,0) + tmp_7 * this.get(2,0) + tmp_8 * this.get(3,0)) -
            (tmp_1 * this.get(0,0) + tmp_6 * this.get(2,0) + tmp_9 * this.get(3,0)));
        var out_12 = d * ((tmp_3 * this.get(0,0) + tmp_6 * this.get(1,0) + tmp_11 * this.get(3,0)) -
            (tmp_2 * this.get(0,0) + tmp_7 * this.get(1,0) + tmp_10 * this.get(3,0)));
        var out_13 = d * ((tmp_4 * this.get(0,0) + tmp_9 * this.get(1,0) + tmp_10 * this.get(2,0)) -
            (tmp_5 * this.get(0,0) + tmp_8 * this.get(1,0) + tmp_11 * this.get(2,0)));

        var out_20 = d * ((tmp_12 * this.get(1,3) + tmp_15 * this.get(2,3) + tmp_16 * this.get(3,3)) -
            (tmp_13 * this.get(1,3) + tmp_14 * this.get(2,3) + tmp_17 * this.get(3,3)));
        var out_21 = d * ((tmp_13 * this.get(0,3) + tmp_18 * this.get(2,3) + tmp_21 * this.get(3,3)) -
            (tmp_12 * this.get(0,3) + tmp_19 * this.get(2,3) + tmp_20 * this.get(3,3)));
        var out_22 = d * ((tmp_14 * this.get(0,3) + tmp_19 * this.get(1,3) + tmp_22 * this.get(3,3)) -
            (tmp_15 * this.get(0,3) + tmp_18 * this.get(1,3) + tmp_23 * this.get(3,3)));
        var out_23 = d * ((tmp_17 * this.get(0,3) + tmp_20 * this.get(1,3) + tmp_23 * this.get(2,3)) -
            (tmp_16 * this.get(0,3) + tmp_21 * this.get(1,3) + tmp_22 * this.get(2,3)));

        var out_30 = d * ((tmp_14 * this.get(2,2) + tmp_17 * this.get(3,2) + tmp_13 * this.get(1,2)) -
            (tmp_16 * this.get(3,2) + tmp_12 * this.get(1,2) + tmp_15 * this.get(2,2)));
        var out_31 = d * ((tmp_20 * this.get(3,2) + tmp_12 * this.get(0,2) + tmp_19 * this.get(2,2)) -
            (tmp_18 * this.get(2,2) + tmp_21 * this.get(3,2) + tmp_13 * this.get(0,2)));
        var out_32 = d * ((tmp_18 * this.get(1,2) + tmp_23 * this.get(3,2) + tmp_15 * this.get(0,2)) -
            (tmp_22 * this.get(3,2) + tmp_14 * this.get(0,2) + tmp_19 * this.get(1,2)));
        var out_33 = d * ((tmp_22 * this.get(2,2) + tmp_16 * this.get(0,2) + tmp_21 * this.get(1,2)) -
            (tmp_20 * this.get(1,2) + tmp_23 * this.get(2,2) + tmp_17 * this.get(0,2)));

        this.elements[0*4+0] = out_00;
        this.elements[0*4+1] = out_01;
        this.elements[0*4+2] = out_02;
        this.elements[0*4+3] = out_03;
        this.elements[1*4+0] = out_10;
        this.elements[1*4+1] = out_11;
        this.elements[1*4+2] = out_12;
        this.elements[1*4+3] = out_13;
        this.elements[2*4+0] = out_20;
        this.elements[2*4+1] = out_21;
        this.elements[2*4+2] = out_22;
        this.elements[2*4+3] = out_23;
        this.elements[3*4+0] = out_30;
        this.elements[3*4+1] = out_31;
        this.elements[3*4+2] = out_32;
        this.elements[3*4+3] = out_33;
        return this;
    },

    // Returns new matrix which is the inverse of this
    inverse: function () {
        var tmp = this.copy();
        return tmp.invert();
    },

    // In-place transpose
    transpose: function () {
        var tmp = this.elements[0*4+1];
        this.elements[0*4+1] = this.elements[1*4+0];
        this.elements[1*4+0] = tmp;

        tmp = this.elements[0*4+2];
        this.elements[0*4+2] = this.elements[2*4+0];
        this.elements[2*4+0] = tmp;

        tmp = this.elements[0*4+3];
        this.elements[0*4+3] = this.elements[3*4+0];
        this.elements[3*4+0] = tmp;

        tmp = this.elements[1*4+2];
        this.elements[1*4+2] = this.elements[2*4+1];
        this.elements[2*4+1] = tmp;

        tmp = this.elements[1*4+3];
        this.elements[1*4+3] = this.elements[3*4+1];
        this.elements[3*4+1] = tmp;

        tmp = this.elements[2*4+3];
        this.elements[2*4+3] = this.elements[3*4+2];
        this.elements[3*4+2] = tmp;

        return this;
    },

    loadIdentity: function () {
        for (var i = 0; i < 16; i++)
            this.elements[i] = 0;
        this.elements[0*4+0] = 1.0;
        this.elements[1*4+1] = 1.0;
        this.elements[2*4+2] = 1.0;
        this.elements[3*4+3] = 1.0;
        return this;
    }
};
