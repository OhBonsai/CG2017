/**
 * Created by bonsai on 12/01/18.
 */
class Girl{

    constructor(gl, objFile){
        this.gl = gl;
        this.objFile = objFile;
        this.transform = new Transform();
        this.mainTex = -1;
        this.createMesh();
    }

    setTexture(eid){
        this.mainTex = gl.fLoadTexture("tex001", document.getElementById(eid), false);
        return this;
    }

    createShader(){
        let vs = `#version 300 es
            in vec3 a_position;	//Making it a vec4, the w component is used as color index from uColor
            in vec3 a_norm;
            in vec2 a_uv;
        
            uniform mat4 uPMatrix;
            uniform mat4 uMVMatrix;
            uniform mat4 uCameraMatrix;
        
            out highp vec2 texCoord;  //Interpolate UV values to the fragment shader
            
            void main(void){
                texCoord = a_uv;
                gl_Position = uPMatrix * uCameraMatrix * uMVMatrix * vec4(a_position.xyz, 1.0); 
            }
        `;

        let fs = `#version 300 es
            precision mediump float;
            
            in highp vec2 texCoord;		//What pixel to pull from the texture
            uniform sampler2D uMainTex;	//Holds the texture we loaded to the GPU
            
            out vec4 finalColor;
            void main(void){
                finalColor = texture(uMainTex,texCoord);
            }
        `;

        this.mShader    = ShaderUtil.createProgram(this.gl,vs,fs,true);
        this.mUniProj   = this.gl.getUniformLocation(this.mShader, 'uPMatrix');
        this.mUniModelV = this.gl.getUniformLocation(this.mShader, 'uMVMatrix');
        this.mUniCamera = this.gl.getUniformLocation(this.mShader, "uCameraMatrix");
        this.mUniTex	= this.gl.getUniformLocation(this.mShader, "uMainTex");


    }

    createMesh(){
        this.mesh = ObjLoader.textToMesh("objCube",this.objFile,true);
    }

    finalize(){
        this.createShader();
        return this;
    }

    render(camera){
        this.transform.updateMatrix();
        this.gl.useProgram(this.mShader);
        this.gl.bindVertexArray(this.mesh.vao);


        this.gl.uniformMatrix4fv(this.mUniProj, false, camera.projectionMatrix);
        this.gl.uniformMatrix4fv(this.mUniCamera, false, camera.viewMatrix);
        this.gl.uniformMatrix4fv(this.mUniModelV, false, this.transform.getViewMatrix());

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.mainTex);
        this.gl.uniform1i(this.mUniTex, 0);

        this.gl.drawElements(this.mesh.drawMode, this.mesh.indexCount, this.gl.UNSIGNED_SHORT, 0);

        this.gl.bindVertexArray(null);
        this.gl.useProgram(null);
    }

}
