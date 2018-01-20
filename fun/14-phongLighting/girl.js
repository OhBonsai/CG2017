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
        /* 粗浅的理解
         * @MVMatrix： 物体相对于世界坐标系位置，用来表示自己本身的移动和旋转
         * @ProjectMatrix: 投影矩阵，近大远小。与Near, Far, ViewOfField, Aspect。具体推导较为复杂
         * @CameraMatrix: 相机矩阵，相机的up， lookup， position决定
         * @NormalMatrix: 为什么要这个，因为法线不该被投影。举个例子。在一个平面上有三个点A,B,C。法线为n。则n与平面垂直。
         * 即dot(n, B-A) = 0 且 dot(n, B-C) = 0。实际上Position是被MV矩阵乘过的。PositionInWorld = MVMat * Position
         * 所以要找到dot(N * n, MVMat(B-A)) = 0
         * 求解：
         *    be: dot(n, a) = transpose(n) * a
         *    so: dot(N * n, M * a) = transpose(N * n) * Ma = transpose(N) * transpose(n) * M * a = 0
         *    so: transpose(N) * M = I
         *    so: N = transpose(inverse(M))
         * @CameraPosition 这里要乘上一个CameraMatrix的逆矩阵，是为了让相机回到世界空间
        */




        let vs = `#version 300 es
            in vec3 a_position;
            in vec3 a_norm;
            in vec2 a_uv;
    
            uniform mat4 uPMatrix; 
            uniform mat4 uMVMatrix;
            uniform mat4 uCameraMatrix;
            uniform mat3 uNormMatrix;
            uniform vec3 uCamPos;
    
            out vec3 vPos;
            out vec3 vNorm;
            out vec3 vCamPos;
            out highp vec2 vUV;
            
            void main(void){
                //Setup some fragment vars
                vec4 pos = uMVMatrix * vec4(a_position.xyz, 1.0);	//Need Position in World Space
                vPos = pos.xyz;
                vNorm =  uNormMatrix * a_norm;						//Need Norm Scaled/Rotated correctly //
                vUV = a_uv;
                vCamPos = (inverse(uCameraMatrix) * vec4(uCamPos,1.0)).xyz; //need to Move CameraPos into World Space for Specular Calculation.
                
                //Set Final Position
                gl_Position = uPMatrix * uCameraMatrix * pos; 
            }
        `;

        let fs = `#version 300 es
            precision mediump float;
            
            uniform sampler2D uMainTex;	//Holds the texture we loaded to the GPU
            uniform vec3 uLightPos;
    
            in vec3 vPos;
            in vec3 vNorm;
            in highp vec2 vUV;
            in vec3 vCamPos;
    
            out vec4 outColor;
    
            void main(void){
                //Setup Basic Colors 
                vec4 cBase = texture(uMainTex,vUV); //vec4(1.0,0.5,0.5,1.0); 
                vec3 cLight = vec3(1.0,1.0,1.0);
    
                //...........................
                //setup ambient light
                float ambientStrength = 0.15;
                vec3 cAmbient = ambientStrength * cLight;
    
                //...........................
                //setup diffuse
                vec3 lightDir = normalize(uLightPos - vPos); //Distance between Pixel and Light Source, Normalize to make it a direction vector
    
                //Dot Product of two directions gives an angle of sort, It basicly a mapping between 0 to 90 degrees and a scale of 0 to 1
                //So the closer to 90 degrees the closer to 1 we get. In relation, the closer to 180 degrees the closer the value will be -1.
                //But we dont need the negative when dealing with light, so we cap the lowest possible value to 0 by using MAX.
                //Note, both values used in dot product needs to be normalized to get a proper range between 0 to 1.
                float diffAngle = max(dot(vNorm,lightDir),0.0);
    
                //So if the light source is 90 degrees above the pixel, then use the max light color or use a faction of the light;
                //The idea is to use the angle to determine how strong the light color should be. 90 degrees is max, 0 uses no light leaving the pixel dark.
                float diffuseStrength = 0.3;
                vec3 cDiffuse = diffAngle * cLight * diffuseStrength;	
    
                //...........................
                //setup specular 
                //NOTE : Might be easier to switch vertexPos, light and camera to local space. Can remove inverse of camera matrix in the process. For prototyping keeping things in WorldSpace.
                float specularStrength = 0.2f;	//0.15
                float specularShininess = 1.0f; //256.0
                vec3 camDir = normalize(vCamPos - vPos);	//Get the camera direction from the fragment position.
                vec3 reflectDir = reflect(-lightDir,vNorm);	//Using the normal as the 45 degree type of pivot, get the reflective direction from the light direction
    
                float spec = pow( max(dot(reflectDir,camDir),0.0) ,specularShininess);	//Now determine the angle of the reflective dir and camera, If seeing spot on (90d) then full light.
                vec3 cSpecular = specularStrength * spec * cLight;
    
                //...........................
                //Final
                vec3 finalColor = (cAmbient + cDiffuse + cSpecular) * cBase.rgb; //Combined Light Strength and apply it to the base color
                outColor = vec4(finalColor,1.0);
            }
        `;

        this.mShader      = ShaderUtil.createProgram(this.gl,vs,fs,true);
        this.mUniProj     = this.gl.getUniformLocation(this.mShader, 'uPMatrix');
        this.mUniModelV   = this.gl.getUniformLocation(this.mShader, 'uMVMatrix');
        this.mUNormalMat  = this.gl.getUniformLocation(this.mShader, 'uNormMatrix');
        this.mUniCamera   = this.gl.getUniformLocation(this.mShader, "uCameraMatrix");
        this.mUniTex      = this.gl.getUniformLocation(this.mShader, "uMainTex");
        this.mUniLightPos = this.gl.getUniformLocation(this.mShader, "uLightPos");
        this.mUniCamPos   = this.gl.getUniformLocation(this.mShader, "uCamPos");
    }

    createMesh(){
        this.mesh = ObjLoader.textToMesh("objCube",this.objFile,true);
    }

    finalize(){
        this.createShader();
        return this;
    }

    render(camera, lighter){
        this.transform.updateMatrix();
        this.gl.useProgram(this.mShader);
        this.gl.bindVertexArray(this.mesh.vao);


        this.gl.uniformMatrix4fv(this.mUniProj, false, camera.projectionMatrix);
        this.gl.uniformMatrix4fv(this.mUniCamera, false, camera.viewMatrix);
        this.gl.uniformMatrix4fv(this.mUniModelV, false, this.transform.getViewMatrix());
        this.gl.uniformMatrix3fv(this.mUNormalMat, false, this.transform.getNormalMatrix());
        this.gl.uniform3fv(this.mUniCamPos, new Float32Array(camera.transform.position.getArray()));
        this.gl.uniform3fv(this.mUniLightPos, new Float32Array(lighter.transform.position.getArray()));

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.mainTex);
        this.gl.uniform1i(this.mUniTex, 0);

        this.gl.drawElements(this.mesh.drawMode, this.mesh.indexCount, this.gl.UNSIGNED_SHORT, 0);

        this.gl.bindVertexArray(null);
        this.gl.useProgram(null);
    }

}
