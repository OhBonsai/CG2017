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


let gl = glInstance('container')
    .fClear()
    .fSetSize(400, 400);


let fShader = ShaderUtil.createShader(gl, fs, gl.FRAGMENT_SHADER);
let vShader = ShaderUtil.createShader(gl, vs, gl.VERTEX_SHADER);
let program = ShaderUtil.createProgram(gl, vShader, fShader, true);
gl.useProgram(program);

let aPosVerts = new Float32Array([
    0.0, 0.0, 0.0,
    0.5, 0.5, 0.5,
    0.5, 1.0, 0.5,]);
let aPosBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, aPosBuffer);
gl.bufferData(gl.ARRAY_BUFFER, aPosVerts, gl.STATIC_DRAW);

let aPosLoc = gl.getAttribLocation(program, "a_Pos");
gl.enableVertexAttribArray(aPosLoc);
gl.vertexAttribPointer(aPosLoc, 3, gl.FLOAT, false, 0, 0);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

let uPointSizeLoc = gl.getUniformLocation(program, "u_PointSize");
gl.uniform1f(uPointSizeLoc, 10.);

gl.drawArrays(gl.POINTS, 1, 1);

setTimeout(function(){
    gl.drawArrays(gl.LINE_STRIP, 0, 2);
}, 1000);

setTimeout(function(){
    gl.drawArrays(gl.TRIANGLE_STRIP, 0 ,3);
}, 2000);