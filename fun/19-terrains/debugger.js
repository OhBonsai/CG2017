class LineDebugger{
    constructor(gl){
        this.transform = new Transform();

        this.gl = gl;
        this.mColor = [];
        this.mVerts = [];
        this.mVertBuffer = 0;
        this.mVertCount = 0;
        this.mVertexComponentLen = 4;
    }

    addColor(){
        if(arguments.length == 0) return this;

        for(var i=0,c,p; i < arguments.length; i++){
            if(arguments[i].length < 6) continue;
            c = arguments[i];		//Just an alias(copy really) of the color text, make code smaller.
            p = (c[0] == "#")?1:0;	//Determine starting position in char array to start pulling from

            this.mColor.push(
                parseInt(c[p]	+c[p+1],16)	/ 255.0,
                parseInt(c[p+2]	+c[p+3],16)	/ 255.0,
                parseInt(c[p+4]	+c[p+5],16)	/ 255.0
            );
        }
        return this;
    }

    addLine(x1,y1,z1,x2,y2,z2,cIndex){
        this.mVerts.push(x1,y1,z1,cIndex,x2,y2,z2,cIndex);
        this.mVertCount = this.mVerts.length / this.mVertexComponentLen;
        return this;
    }

    addMeshNormal(cIndex,nLen,mesh){
        if(mesh.aVert === undefined || mesh.aNorm === undefined) return this;

        var len = mesh.aVert.length,n=0;
        for(var i=0; i < len; i+=mesh.vertexComponentLen){
            this.mVerts.push(
                mesh.aVert[i],
                mesh.aVert[i+1],
                mesh.aVert[i+2],
                cIndex,
                mesh.aVert[i] + mesh.aNorm[n] * nLen,
                mesh.aVert[i+1] + mesh.aNorm[n+1] * nLen,
                mesh.aVert[i+2] + mesh.aNorm[n+2] * nLen,
                cIndex
            );
            n+=3;
        }

        this.mVertCount = this.mVerts.length / this.mVertexComponentLen;
        return this;
    }

    createShader(){
        var vShader = '#version 300 es\n'+
            'layout(location=0) in vec4 a_position;'+
            'uniform mat4 uPMatrix;'+
            'uniform mat4 uCameraMatrix;'+
            'uniform mat4 uMVMatrix;'+
            'uniform vec3 uColorAry[6];'+
            'out lowp vec4 color;'+
            'void main(void){'+
            'color = vec4(uColorAry[ int(a_position.w) ],1.0);'+
            'gl_Position = uPMatrix * uCameraMatrix * uMVMatrix * vec4(a_position.xyz, 1.0);'+
            '}';

        var fShader = '#version 300 es\n'+
            'precision mediump float;'+
            'in vec4 color;'+
            'out vec4 finalColor;'+
            'void main(void){ finalColor = color; }';

        //........................................
        this.mShader		= ShaderUtil.createProgram(this.gl,vShader,fShader,true);
        this.mUniformColor	= this.gl.getUniformLocation(this.mShader,"uColorAry");
        this.mUniformProj	= this.gl.getUniformLocation(this.mShader,"uPMatrix");
        this.mUniformCamera	= this.gl.getUniformLocation(this.mShader,"uCameraMatrix");
        this.mUniformModelV	= this.gl.getUniformLocation(this.mShader,"uMVMatrix");

        //........................................
        //Save colors in the shader. Should only need to render once.
        this.gl.useProgram(this.mShader);
        this.gl.uniform3fv(this.mUniformColor, new Float32Array( this.mColor ));
        this.gl.useProgram(null);
    }

    finalize(){
        this.mVertBuffer = this.gl.fCreateArrayBuffer(new Float32Array(this.mVerts),true);
        this.createShader();
        return this;
    }

    render(camera){
        //Update Transform Matrix (Modal View)
        this.transform.updateMatrix();

        //Start up the Shader
        this.gl.useProgram(this.mShader);

        //Push Uniform Data
        this.gl.uniformMatrix4fv(this.mUniformProj, false, camera.projectionMatrix);
        this.gl.uniformMatrix4fv(this.mUniformCamera, false, camera.viewMatrix);
        this.gl.uniformMatrix4fv(this.mUniformModelV, false, this.transform.getViewMatrix());

        //Activate Vertice Buffer Array
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.mVertBuffer);
        this.gl.enableVertexAttribArray(0);
        this.gl.vertexAttribPointer(0,this.mVertexComponentLen,this.gl.FLOAT,false,0,0);

        //Draw
        this.gl.drawArrays(this.gl.LINES,0,this.mVertCount);

        //Cleanup
        this.gl.disableVertexAttribArray(0);
        this.gl.useProgram(null);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }
}
