const fs = `#version 300 es
    precision mediump float;
    
    out vec4 finalColor;
    
    void main(void){
        finalColor = vec4(0., 0., 0., 1.);
    }
`;

const vs = `#version 300 es
    in vec3 a_Pos;
    uniform float u_PointSize;
    
    void main(void){
        gl_PointSize = u_PointSize;
        gl_Position = vec4(a_Pos, 1.); 
    }
`;

let gl,
    gVertCnt = 0,
    uPointSizeLoc = -1,
    uAngle = 0,
    gRloop;



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

let time = 0;
let onRender = function(dt){
    time+=dt;
    let size = (Math.sin(time) * 10.) + 30.;
    gl.uniform1f(uPointSizeLoc, size);
    gl.fClear();
    gl.drawArrays(gl.POINTS, 0, 1);
};

let loop = new RenderLoop(onRender);
loop.start();

