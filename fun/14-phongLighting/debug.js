class VertexDebugger{

    constructor(gl, pntSize){
        this.transform = new Transform();
        this.gl = gl;
        this.mColor = [];
        this.mVerts = [];
        this.mVertCount = 0;
        this.mVertBuffer = 0;
        this.mVertexCompLen = 4;
        this.mPointSize = pntSize;
    }

    addColor(){
        if(arguments.length === 0) return this;

        for(let i=0, c, p; i< arguments.length; i++){
            if(arguments[i].length < 6) continue;
            c = arguments[i];
            p = (c[0] === '#') ? 1 : 0;

            this.mColor.push(
                parseInt(c[p]	+c[p+1],16)	/ 255.0,
                parseInt(c[p+2]	+c[p+3],16)	/ 255.0,
                parseInt(c[p+4]	+c[p+5],16)	/ 255.0
            );
        }

        return this;
    }

    addPoint(x1, y1, z1, cIndex){
        this.mVerts.push(x1, y1, z1, cIndex || 0);
        this.mVertCount = this.mVerts.length /this.mVertexCompLen;
        return this
    }

    addMeshPoints(cIndex, mesh){
        if(mesh.aVert === undefined) return this;

        let len = mesh.aVert.length;
        for(let i=0; i< len; i+=3){
            this.mVerts.push(
                mesh.aVert[i],
                mesh.aVert[i+1],
                mesh.aVert[i+2],
                cIndex
            )
        }

        this.mVertCount = this.mVerts.length / this.mVertexCompLen;
        return this;
    }

    createShader(){
        let vShader = `#version 300 es
        layout(location=0) in vec4 a_position;
        uniform mat4 uPMatrix;
        uniform mat4 uCameraMatrix;
        uniform mat4 uMVMatrix;
        
        uniform vec3 uColorAry[6];
        uniform vec3 uCameraPos;
        uniform float uPointSize;
        
        out lowp vec4 color;
        
        void main(void){
            vec4 pos = uMVMatrix * vec4(a_position.xyz, 1.);
            color = vec4(uColorAry[ int(a_position.w) ], 1.);
            gl_PointSize = (1. - distance(uCameraPos, pos.xyz) / 10. ) * uPointSize;
            gl_Position = uPmatrx * uCameraMatrix * pos;
        }` ;

        let fShader = `#version 300 es
        precision mediump float;
        in vec4 color;
        out vec4 finalColor;
        void main(void){
            finalColor = color;
        }` ;


        this.mShader           = ShaderUtil.createProgram(this.gl , vShader, fShader, true);
        this.mUniformColor     = this.gl.getUniformLocation(this.mShader, 'uColorAry');
        this.mUniformProj      = this.gl.getUniformLocation(this.mShader, 'uPMatrix');
        this.mUniformCamera    = this.gl.getUniformLocation(this.mShader, 'uCameraMatrix');
        this.mUniformModelV    = this.gl.getUniformLocation(this.mShader, 'uMVMatrix');
        this.mUniformPointSize = this.gl.getUniformLocation(this.mShader, 'uPointSize');
        this.mUniformCameraPos = this.gl.getUniformLocation(this.mShader, 'uCameraPos');

        this.gl.useProgram(this.mShader);
        this.gl.uniform3fv(this.mUniformColor, new Float32Array(this.mColor));
        this.gl.uniform1f(this.mUniformPointSize, this.mPointSize);
        this.gl.useProgram(null);
    }

    finalize(){
        this.mVertBuffer = this.gl.fCreateArrayBuffer(new Float32Array(this.mVerts), true);
        this.createShader();
        return this;
    }

    render(camera){
        this.transform.updateMatrix();
        this.gl.useProgram(this.mShader);

        this.gl.uniformMatrix4fv(this.mUniformProj, false, camera.projectionMatrix);
        this.gl.uniformMatrix4fv(this.mUniformCamera, false, camera.viewMatrix);
        this.gl.uniformMatrix4fv(this.mUniformModelV, false, this.transform.getViewMatrix());
        this.gl.uniform3fv(this.mUniformCameraPos, new Float32Array(camera.transform.position.getArray()));

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.mVertBuffer);
        this.gl.enableVertexAttribArray(0);
        this.gl.vertexAttribPointer(0, this.mVertexCompLen, this.gl.FLOAT, false, 0, 0);

        this.gl.drawArrays(this.gl.POINTS, 0, this.mVertCount);

        this.gl.disableVertexAttribArray(0);
        this.gl.useProgram(null);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

}