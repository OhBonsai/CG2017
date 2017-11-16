const fs = `#version 300 es
    precision mediump float;
    
    uniform float u_PointSize;
    out vec4 finalColor;
    
    void main(void){
        float c = (40. - u_PointSize) / 20.0;
        finalColor = vec4(0., 0., 0., 1.);
    }
`;

const vs = `#version 300 es
    in vec3 a_Pos;
    
    uniform mediump float u_PointSize;
    uniform float u_Angle;
    
    void main(void){
        gl_PointSize = u_PointSize;
        gl_Position = vec4(
            cos(u_Angle) * 0.8 + a_Pos.x,
            sin(u_Angle) * 0.8 + a_Pos.y,
            a_Pos.z, 1.); 
    }
`;

let gl,
    gVertCnt,
    uPointSizeLoc = -1,
    uAngleLoc = 0,
    gRloop,
    size = 0,
    angle = 0,
    gPointSizeChangeRate = 3,
    gAngleChangeRage = (Math.PI / 180.) * 90;



gl = glInstance('container')
    .fClear()
    .fSetSize(400, 400);

let program = ShaderUtil.createProgram(gl, vs, fs, true);
gl.useProgram(program);

let aPosVerts = new Float32Array([
    0.0, 0.0, 0.0,
    0.5, 0.5, 0.5,
    0.5, 1.0, 0.5,]);
gVertCnt = aPosVerts.length/3;

let aPosBuffer = gl.fCreateArrayBuffer(aPosVerts);
gl.bindBuffer(gl.ARRAY_BUFFER, aPosBuffer);

let aPosLoc = gl.getAttribLocation(program, "a_Pos");
gl.enableVertexAttribArray(aPosLoc);
gl.vertexAttribPointer(aPosLoc, 3, gl.FLOAT, false, 0, 0);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

uPointSizeLoc = gl.getUniformLocation(program, "u_PointSize");
gl.uniform1f(uPointSizeLoc, 10.);

uAngleLoc = gl.getUniformLocation(program, "u_Angle");
gl.uniform1f(uAngleLoc, 0);

let onRender = function(dt){
    size += gPointSizeChangeRate * dt;
    let vSize = (Math.sin(size) * 15) + 25;
    gl.uniform1f(uPointSizeLoc, vSize);

    angle += gAngleChangeRage * dt;
    gl.uniform1f(uAngleLoc, angle);


    gl.fClear();
    gl.drawArrays(gl.POINTS, 0, 1);
};

let loop = new RenderLoop(onRender);
loop.start();

