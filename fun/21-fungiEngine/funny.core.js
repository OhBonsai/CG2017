/**
 * Created by bonsai on 07/02/18.
 */
var Bonsai = (function(){

    const DEG2RAD = Math.PI/180;		//Cache result, one less operation to do for each update.

    let	gl = null,
        CULLING_STATE = true,			//Global state if the feature is enabled
        BLENDING_STATE = false;			//Same---


    function Init(canvasID){
        if(Bonsai.gl != null) return Bonsai.gl;

        let canvas = document.getElementById(canvasID);
        gl = canvas.getContext("webgl2");
        if(!gl){ console.error("WebGL context is not available."); return null; }

        //...................................................
        //Setup GL, Set all the default configurations we need.
        gl.cullFace(gl.BACK);								//Back is also default
        gl.frontFace(gl.CCW);								//Dont really need to set it, its ccw by default.
        gl.enable(gl.DEPTH_TEST);							//Shouldn't use this, use something else to add depth detection
        gl.enable(gl.CULL_FACE);							//Cull back face, so only show triangles that are created clockwise
        gl.depthFunc(gl.LEQUAL);							//Near things obscure far things
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);	//Setup default alpha blending
        //gl.clearColor(1.0,1.0,1.0,1.0);	//Set clear color

        //...................................................
        //Methods
        //Reset the canvas with our set background color.	
        gl.fClear = function(){ this.clear(this.COLOR_BUFFER_BIT | this.DEPTH_BUFFER_BIT); return this; };
        gl.fClearColor = function(hex){
            let a = Util.rgbArray(hex);
            gl.clearColor(a[0],a[1],a[2],1.0);
            return this;
        }

        //Create and fill our Array buffer.
        gl.fCreateArrayBuffer = function(floatAry,isStatic,isUnbind){
            if(isStatic === undefined) isStatic = true; //So we can call this function without setting isStatic

            let buf = this.createBuffer();
            this.bindBuffer(this.ARRAY_BUFFER,buf);
            this.bufferData(this.ARRAY_BUFFER, floatAry, (isStatic)? this.STATIC_DRAW : this.DYNAMIC_DRAW );
            if(isUnbind != false) this.bindBuffer(this.ARRAY_BUFFER,null);
            return buf;
        };

        //Textures
        gl.fLoadTexture = function(name,img,doYFlip,noMips){ let tex = Bonsai.Res.Textures[name] = this.createTexture();  return this.fUpdateTexture(name,img,doYFlip,noMips); };
        gl.fUpdateTexture = function(name,img,doYFlip,noMips){
            let tex = this.mTextureCache[name];
            if(doYFlip == true) this.pixelStorei(this.UNPACK_FLIP_Y_WEBGL, true);	//Flip the texture by the Y Position, So 0,0 is bottom left corner.

            this.bindTexture(this.TEXTURE_2D, tex);														//Set text buffer for work
            this.texImage2D(this.TEXTURE_2D, 0, this.RGBA, this.RGBA, this.UNSIGNED_BYTE, img);			//Push image to GPU.

            if(noMips === undefined || noMips == false){
                this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MAG_FILTER, this.LINEAR);					//Setup up scaling
                this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MIN_FILTER, this.LINEAR_MIPMAP_NEAREST);	//Setup down scaling
                this.generateMipmap(this.TEXTURE_2D);	//Precalc different sizes of texture for better quality rendering.
            }else{
                this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MAG_FILTER, this.NEAREST);
                this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MIN_FILTER, this.NEAREST);
                this.texParameteri(this.TEXTURE_2D, this.TEXTURE_WRAP_S, this.CLAMP_TO_EDGE);
                this.texParameteri(this.TEXTURE_2D, this.TEXTURE_WRAP_T, this.CLAMP_TO_EDGE);
            }

            this.bindTexture(this.TEXTURE_2D,null);									//Unbind

            if(doYFlip == true) this.pixelStorei(this.UNPACK_FLIP_Y_WEBGL, false);	//Stop flipping textures
            return tex;
        }

        //imgAry must be 6 elements long and images placed in the right order
        //RIGHT,LEFT,TOP,BOTTOM,BACK,FRONT
        gl.fLoadCubeMap = function(name,imgAry){
            if(imgAry.length != 6) return null;

            //Cube Constants values increment, so easy to start with right and just add 1 in a loop
            //To make the code easier costs by making the imgAry coming into the function to have
            //the images sorted in the same way the constants are set.
            //	TEXTURE_CUBE_MAP_POSITIVE_X - Right	:: TEXTURE_CUBE_MAP_NEGATIVE_X - Left
            //	TEXTURE_CUBE_MAP_POSITIVE_Y - Top 	:: TEXTURE_CUBE_MAP_NEGATIVE_Y - Bottom
            //	TEXTURE_CUBE_MAP_POSITIVE_Z - Back	:: TEXTURE_CUBE_MAP_NEGATIVE_Z - Front

            let tex = this.createTexture();
            this.bindTexture(this.TEXTURE_CUBE_MAP,tex);

            //push image to specific spot in the cube map.
            for(let i=0; i < 6; i++){
                this.texImage2D(this.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, this.RGBA, this.RGBA, this.UNSIGNED_BYTE, imgAry[i]);
            }

            this.texParameteri(this.TEXTURE_CUBE_MAP, this.TEXTURE_MAG_FILTER, this.LINEAR);	//Setup up scaling
            this.texParameteri(this.TEXTURE_CUBE_MAP, this.TEXTURE_MIN_FILTER, this.LINEAR);	//Setup down scaling
            this.texParameteri(this.TEXTURE_CUBE_MAP, this.TEXTURE_WRAP_S, this.CLAMP_TO_EDGE);	//Stretch image to X position
            this.texParameteri(this.TEXTURE_CUBE_MAP, this.TEXTURE_WRAP_T, this.CLAMP_TO_EDGE);	//Stretch image to Y position
            this.texParameteri(this.TEXTURE_CUBE_MAP, this.TEXTURE_WRAP_R, this.CLAMP_TO_EDGE);	//Stretch image to Z position
            //this.generateMipmap(this.TEXTURE_CUBE_MAP);

            this.bindTexture(this.TEXTURE_CUBE_MAP,null);
            Bonsai.Res.Textures[name] = tex;
            return tex;
        };

        //...................................................
        //Setters - Getters

        //Set the size of the canvas html element and the rendering view port
        gl.fSetSize = function(w,h){
            //set the size of the canvas, on chrome we need to set it 3 ways to make it work perfectly.
            this.canvas.style.width = w + "px";
            this.canvas.style.height = h + "px";
            this.canvas.width = w;
            this.canvas.height = h;

            //when updating the canvas size, must reset the viewport of the canvas 
            //else the resolution webgl renders at will not change
            this.viewport(0,0,w,h);
            this.fWidth = w;	//Need to save Width and Height to resize viewport for WebVR
            this.fHeight = h;
            return this;
        }

        //Set the size of the canvas to fill a % of the total screen.
        gl.fFitScreen = function(wp,hp){ return this.fSetSize(window.innerWidth * (wp || 1),window.innerHeight * (hp || 1)); }

        return Bonsai.gl = gl;
    }

    class Util{
        static rgbArray(){
            if(arguments.length == 0) return null;
            let rtn = [];

            for(let i=0,c,p; i < arguments.length; i++){
                if(arguments[i].length < 6) continue;
                c = arguments[i];		//Just an alias(copy really) of the color text, make code smaller.
                p = (c[0] == "#")?1:0;	//Determine starting position in char array to start pulling from

                rtn.push(
                    parseInt(c[p]	+c[p+1],16)	/ 255.0,
                    parseInt(c[p+2]	+c[p+3],16)	/ 255.0,
                    parseInt(c[p+4]	+c[p+5],16)	/ 255.0
                );
            }
            return rtn;
        }

        //Normalize x value to x range, then normalize to lerp the z range.
        static map(x, xMin,xMax, zMin,zMax){ return (x - xMin) / (xMax - xMin) * (zMax-zMin) + zMin; }

        static clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }

        static smoothStep(edge1, edge2, val){ //https://en.wikipedia.org/wiki/Smoothstep
            let x = Math.max(0, Math.min(1, (val-edge1)/(edge2-edge1)));
            return x*x*(3-2*x);
        }

    }

    class Transform{
        constructor(){
            this.position = new Vec3(0);
            this.scale = new Vec3(1);
            this.rotation = new Quaternion();
            this.localMatrix = new Matrix4();

            this.children = [];
            this._parent = null;
        }

        forward(v){
            let tv = v || new Vec3();
            tv.set(0, 0, 1);
            Quaternion.multiVec3(tv, this.rotation, v);
            return tv
        }

        top(v){
            let tv = v || new Vec3();
            tv.set(0, 1, 0);
            Quaternion.multiVec3(tv, this.rotation, v);
            return tv
        }

        left(v){
            let tv = v || new Vec3();
            tv.set(1, 0, 0);
            Quaternion.multiVec3(tv, this.rotation, v);
            return tv
        }

        get parent() { return this._parent}

        set parent(p) {
            if(this._parent !== null){
                // this._parent.removeChild(this);
            }

            this._parent = p
        }

        setPosition(x,y,z){	this.position.set(x,y,z);	return this; }
        setScale(x,y,z){	this.scale.set(x,y,z);		return this; }

        updateMatrix(){
            //Only Update the Matrix if its needed.
            if(!this.position.isModified && !this.scale.isModified && !this.rotation.isModified) return this.localMatrix;

            //Update our local Matrix
            Matrix4.fromQuaternionTranslationScale(this.localMatrix, this.rotation, this.position, this.scale);

            //Set the modified indicator to false on all the transforms.
            this.position.isModified	= false;
            this.scale.isModified		= false;
            this.rotation.isModified	= false;
            return this.localMatrix;
        }

        addChild(c){ c.parent = this; this.children.push(c); return this; }

        removeChild(c){ return this; }
    }

    class Renderable extends Transform{
        constructor(vao, matName){
            super();
            this.vao = vao;
            this.visible = true;
            this.material = Bonsai.Res.Materials[matName];
        }
    }

    class CameraOrbit extends Transform{
        constructor(fov, near, far){
            super();
            this.ubo = Bonsai.Res.Ubo[Bonsai.UBO_TRANSFORM];
            this.projectionMatrix = new Float32Array(16);
            this.invertedLocalMatrix = new Float32Array(16);

            let ratio = gl.canvas.width / gl.canvas.height;
            Matrix4.perspective(this.projectionMatrix, fov || 45, ratio, near || 0.1, far || 100.0);
            this.ubo.update("matProjection",this.projectionMatrix); //Initialize The Transform UBO.

            //Orbit Camera will control things based on euler, its cheating but not ready for quaternions
            this.euler = new Vec3();
        }

        //Override how this transfer creates the localMatrix : Call Update, not this function in render loop.
        updateMatrix(){
            //Only Update the Matrix if its needed.
            //if(!this.position.isModified && !this.rotation.isModified && !this.euler.isModified) return this.localMatrix;

            Quaternion.setFromEuler(this.rotation,this.euler.x,this.euler.y,this.euler.z,"YXZ");
            Matrix4.fromQuaternion(this.localMatrix,this.rotation);
            this.localMatrix.resetTranslation().translate(this.position);

            //Set the modified indicator to false on all the transforms.
            this.position.isModified	= false;
            this.rotation.isModified	= false;
            this.euler.isModified		= false;
            return this.localMatrix;
        }

        //Update the Matrices and UBO.
        update(){
            if(this.position.isModified || this.scale.isModified || this.euler.isModified) this.updateMatrix();

            Matrix4.invert(this.invertedLocalMatrix,this.localMatrix);
            this.ubo.update("matCameraView",this.invertedLocalMatrix);
        }

        setEulerDegrees(x,y,z){ this.euler.set(x * DEG2RAD,y * DEG2RAD,z * DEG2RAD); return this; }
    }

    class Vec3 extends Float32Array{

        constructor(args){
            super(3);
            if (args instanceof Vec3){
                this[0] = args[0];
                this[1] = args[1];
                this[2] = args[2];
            }else{
                this[0] = this[1] = this[2] = args;
            }

            this.isModified = true;
        }


        set(x, y, z){
            this[0] = x;
            this[1] = y;
            this[2] = z;
            this.isModified = true;
            return this;
        }

        clone(){
            return new Vec3(this);
        }

        copy(v){
            this[0] = v[0];
            this[1] = v[1];
            this[2] = v[2];
            this.isModified = true;
            return this;
        }

        get x(){return this[0];} set x(val){this[0] = val; this.isModified = true}
        get y(){return this[1];} set y(val){this[1] = val; this.isModified = true}
        get z(){return this[2];} set z(val){this[2] = val; this.isModified = true}


        /*
         任何集合中，都存在加性单元x, 对集合中任意元素有y+x = y。
         */
        zero() { this[0] = this[1] = this[2] = 0.; this.isModified = true};


        /*
         负向量的集合含义是得到一个和原向量大小相等，方向相反的向量。
         */
        negative() { this[0] = -this[0]; this[1] = -this[1]; this[2] = -this[2]; this.isModified = true}

        /*
         求摸
         */
        mag(){ return Math.sqrt(this[0]*this[0] + this[1]*this[1] + this[2]*this[2]);}

        /*
         几何解释： 以标量|a|缩放向量的长度
         */
        scale(a) { this[0] *= a; this[1] *=a; this[2] *= a; this.isModified = true}


        /*
         几何解释： 3D环境中，单位向量将触到单位球
         */
        normalize() {
            let mag = this.mag();
            if( mag > 0.){
                let sqBase = 1. / sq;
                this[0] *= sqBase;
                this[1] *= sqBase;
                this[2] *= sqBase;
            }
            return this;
        }

        /*
         几何解释： 平移向量，使向量a的头连接向量b的尾，接着从a的尾向b的头画一个向量。这就是向量加法的"三角形法则"
         */
        add(v) { this[0]+=v[0]; this[1]+=v[1]; this[2]+=v[2]; this.isModified = true}


        distance(v){
            return Math.sqrt(
                (v[0] - this[0]) * (v[0] - this[0]) +
                (v[1] - this[1]) * (v[1] - this[1]) +
                (v[2] - this[2]) * (v[2] - this[2])
            )
        }

        /*
         点乘，内积
         a.b = |a||b|cos
         求向量投影时候可以用一下

         */
        multi(v) {
            return this[0] * v[0] + this[1] * v[1] + this[2] * v[2];
        }

        /*
         求两个向量的垂直向量，左手
         */
        cross(v){
            return new Vec3(
                this[0]*v[2] - this[2]*v[1],
                this[2]*v[0] - this[0]*v[2],
                this[0]*v[1] - this[1]*v[0]
            )
        }

    }

    class Quaternion extends Float32Array{
        constructor(){
            super(4);
            this[0] = this[1] = this[2] = 0;
            this[3] = 1;
            this.isModified = false;
        }
        //http://in2gpu.com/2016/03/14/opengl-fps-camera-quaternion/
        //----------------------------------------------
        //region Setter/Getters
        reset(){ this[0] = this[1] = this[2] = 0; this[3] = 1; this.isModified = false; return this; }

        rx(rad){ Quaternion.rotateX(this,this,rad); this.isModified = true; return this; }
        ry(rad){ Quaternion.rotateY(this,this,rad); this.isModified = true; return this; }
        rz(rad){ Quaternion.rotateZ(this,this,rad); this.isModified = true; return this; }

        //ex(deg){ Quaternion.rotateX(this,this,deg * DEG2RAD); this.isModified = true; return this; }
        //ey(deg){ Quaternion.rotateY(this,this,deg * DEG2RAD); this.isModified = true; return this; }
        //ez(deg){ Quaternion.rotateZ(this,this,deg * DEG2RAD); this.isModified = true; return this; }
        //endregion

        //----------------------------------------------
        //region Static Methods
        static multi(out,a,b){
            let ax = a[0], ay = a[1], az = a[2], aw = a[3],
                bx = b[0], by = b[1], bz = b[2], bw = b[3];

            out[0] = ax * bw + aw * bx + ay * bz - az * by;
            out[1] = ay * bw + aw * by + az * bx - ax * bz;
            out[2] = az * bw + aw * bz + ax * by - ay * bx;
            out[3] = aw * bw - ax * bx - ay * by - az * bz;
            return out;
        }

        static multiVec3(out,q,v){
            let ax = q[0], ay = q[1], az = q[2], aw = q[3],
                bx = v[0], by = v[1], bz = v[2];

            out[0] = ax + aw * bx + ay * bz - az * by;
            out[1] = ay + aw * by + az * bx - ax * bz;
            out[2] = az + aw * bz + ax * by - ay * bx;
            return out;
        }

        //https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/quat.js
        static rotateX(out, a, rad){
            rad *= 0.5;

            let ax = a[0], ay = a[1], az = a[2], aw = a[3],
                bx = Math.sin(rad), bw = Math.cos(rad);

            out[0] = ax * bw + aw * bx;
            out[1] = ay * bw + az * bx;
            out[2] = az * bw - ay * bx;
            out[3] = aw * bw - ax * bx;
            return out;
        }

        static rotateY(out, a, rad) {
            rad *= 0.5;

            let ax = a[0], ay = a[1], az = a[2], aw = a[3],
                by = Math.sin(rad), bw = Math.cos(rad);

            out[0] = ax * bw - az * by;
            out[1] = ay * bw + aw * by;
            out[2] = az * bw + ax * by;
            out[3] = aw * bw - ay * by;
            return out;
        }

        static rotateZ(out, a, rad){
            rad *= 0.5;

            let ax = a[0], ay = a[1], az = a[2], aw = a[3],
                bz = Math.sin(rad), bw = Math.cos(rad);

            out[0] = ax * bw + ay * bz;
            out[1] = ay * bw - ax * bz;
            out[2] = az * bw + aw * bz;
            out[3] = aw * bw - az * bz;
            return out;
        }

        //https://github.com/mrdoob/three.js/blob/dev/src/math/Quaternion.js
        static setFromEuler(out,x,y,z,order){
            let c1 = Math.cos(x/2),
                c2 = Math.cos(y/2),
                c3 = Math.cos(z/2),
                s1 = Math.sin(x/2),
                s2 = Math.sin(y/2),
                s3 = Math.sin(z/2);

            switch(order){
                case 'XYZ':
                    out[0] = s1 * c2 * c3 + c1 * s2 * s3;
                    out[1] = c1 * s2 * c3 - s1 * c2 * s3;
                    out[2] = c1 * c2 * s3 + s1 * s2 * c3;
                    out[3] = c1 * c2 * c3 - s1 * s2 * s3;
                    break;
                case 'YXZ':
                    out[0] = s1 * c2 * c3 + c1 * s2 * s3;
                    out[1] = c1 * s2 * c3 - s1 * c2 * s3;
                    out[2] = c1 * c2 * s3 - s1 * s2 * c3;
                    out[3] = c1 * c2 * c3 + s1 * s2 * s3;
                    break;
                case 'ZXY':
                    out[0] = s1 * c2 * c3 - c1 * s2 * s3;
                    out[1] = c1 * s2 * c3 + s1 * c2 * s3;
                    out[2] = c1 * c2 * s3 + s1 * s2 * c3;
                    out[3] = c1 * c2 * c3 - s1 * s2 * s3;
                    break;
                case 'ZYX':
                    out[0] = s1 * c2 * c3 - c1 * s2 * s3;
                    out[1] = c1 * s2 * c3 + s1 * c2 * s3;
                    out[2] = c1 * c2 * s3 - s1 * s2 * c3;
                    out[3] = c1 * c2 * c3 + s1 * s2 * s3;
                    break;
                case 'YZX':
                    out[0] = s1 * c2 * c3 + c1 * s2 * s3;
                    out[1] = c1 * s2 * c3 + s1 * c2 * s3;
                    out[2] = c1 * c2 * s3 - s1 * s2 * c3;
                    out[3] = c1 * c2 * c3 - s1 * s2 * s3;
                    break;
                case 'XZY':
                    out[0] = s1 * c2 * c3 - c1 * s2 * s3;
                    out[1] = c1 * s2 * c3 - s1 * c2 * s3;
                    out[2] = c1 * c2 * s3 + s1 * s2 * c3;
                    out[3] = c1 * c2 * c3 + s1 * s2 * s3;
                    break;
            }
        }
        //endregion
    }

    /*
     矩阵能描述任何线性变换。从非技术角度来说，线性变换可能"拉伸"坐标系，但不会"弯曲"或"卷折"坐标系。
     － 旋转 － 缩放 － 投影 － 镜像 － 仿射

     坦白讲，矩阵并不神秘，它只是用一种紧凑的方式表达坐标转换所需要的数学运算。进一步，用线性代数操作矩阵。
     将物体变换一个量，等同于将坐标系变化为相反的量

     投影意味着降维操作，正交投影事将某个基向量直接变成0，

     行列式，余子式，代数余子式，矩阵消元，矩阵的逆矩阵，转置矩阵，正交矩阵， 齐次矩阵

     行业式几何意义： 3D中平行六面体的体积
     逆矩阵：
     矩阵的逆的转置等于矩阵转置的逆
     AB的逆等于B逆乘A逆
     几何意义： 测消原变换的变换

     正交矩阵：
     正交矩阵与其转置矩阵的乘积为单位矩阵
     若矩阵正交，矩阵的每一行都是单位向量，矩阵所有行互相垂直

     齐次矩阵：
     为了描述平移这种加入一个齐次坐标




     */
    class Matrix4 extends Float32Array{
        constructor(){
            super(16);
            this[0] = this[5] = this[10] = this[15] = 1;
        }

        translate(v) {
            Matrix4.translate(this, v.x, v.y, v.z);
            return this;
        }

        resetTranslate(){
            this[12] = this[13] = this[14] = 0;
            return this;
        }

        reset(){
            for(let i=0; i<= 15; i++){
                this[i] = (i % 5 === 0) ? 1 : 0;
                return this
            }
        }

        static identity(out){
            for(let i=0; i<= 15; i++){
                this[i] = (i % 5 === 0) ? 1 : 0;
                return this
            }
        }

        static perspective(out, fovy, aspect, near, far){
            let f = 1.0 / Math.tan(fovy / 2),
                nf = 1 / (near - far);
            out[0] = f / aspect;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 0;
            out[5] = f;
            out[6] = 0;
            out[7] = 0;
            out[8] = 0;
            out[9] = 0;
            out[10] = (far + near) * nf;
            out[11] = -1;
            out[12] = 0;
            out[13] = 0;
            out[14] = (2 * far * near) * nf;
            out[15] = 0;
        }

        static ortho(out, left, right, bottom, top, near, far) {
            let lr = 1 / (left - right),
                bt = 1 / (bottom - top),
                nf = 1 / (near - far);
            out[0] = -2 * lr;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 0;
            out[5] = -2 * bt;
            out[6] = 0;
            out[7] = 0;
            out[8] = 0;
            out[9] = 0;
            out[10] = 2 * nf;
            out[11] = 0;
            out[12] = (left + right) * lr;
            out[13] = (top + bottom) * bt;
            out[14] = (far + near) * nf;
            out[15] = 1;
        };

        //make the rows into the columns
        static transpose(out, a){
            //If we are transposing ourselves we can skip a few steps but have to cache some values
            if (out === a) {
                let a01 = a[1], a02 = a[2], a03 = a[3], a12 = a[6], a13 = a[7], a23 = a[11];
                out[1] = a[4];
                out[2] = a[8];
                out[3] = a[12];
                out[4] = a01;
                out[6] = a[9];
                out[7] = a[13];
                out[8] = a02;
                out[9] = a12;
                out[11] = a[14];
                out[12] = a03;
                out[13] = a13;
                out[14] = a23;
            }else{
                out[0] = a[0];
                out[1] = a[4];
                out[2] = a[8];
                out[3] = a[12];
                out[4] = a[1];
                out[5] = a[5];
                out[6] = a[9];
                out[7] = a[13];
                out[8] = a[2];
                out[9] = a[6];
                out[10] = a[10];
                out[11] = a[14];
                out[12] = a[3];
                out[13] = a[7];
                out[14] = a[11];
                out[15] = a[15];
            }

            return out;
        }

        //Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
        static normalMat3(out,a){
            let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
                a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
                a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
                a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

                b00 = a00 * a11 - a01 * a10,
                b01 = a00 * a12 - a02 * a10,
                b02 = a00 * a13 - a03 * a10,
                b03 = a01 * a12 - a02 * a11,
                b04 = a01 * a13 - a03 * a11,
                b05 = a02 * a13 - a03 * a12,
                b06 = a20 * a31 - a21 * a30,
                b07 = a20 * a32 - a22 * a30,
                b08 = a20 * a33 - a23 * a30,
                b09 = a21 * a32 - a22 * a31,
                b10 = a21 * a33 - a23 * a31,
                b11 = a22 * a33 - a23 * a32,

                // Calculate the determinant
                det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

            if (!det) return null;

            det = 1.0 / det;

            out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
            out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
            out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;

            out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
            out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
            out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;

            out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
            out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
            out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
            return out;
        }

        //New function derived from fromRotationTranslation, just took out the translation stuff.
        static fromQuaternion(out, q){
            // Quaternion math
            let x = q[0], y = q[1], z = q[2], w = q[3],
                x2 = x + x,
                y2 = y + y,
                z2 = z + z,

                xx = x * x2,
                xy = x * y2,
                xz = x * z2,
                yy = y * y2,
                yz = y * z2,
                zz = z * z2,
                wx = w * x2,
                wy = w * y2,
                wz = w * z2;

            out[0] = 1 - (yy + zz);
            out[1] = xy + wz;
            out[2] = xz - wy;
            out[3] = 0;
            out[4] = xy - wz;
            out[5] = 1 - (xx + zz);
            out[6] = yz + wx;
            out[7] = 0;
            out[8] = xz + wy;
            out[9] = yz - wx;
            out[10] = 1 - (xx + yy);
            out[11] = 0;
            return out;
        }

        //https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/mat4.js
        static fromQuaternionTranslation(out, q, v){
            // Quaternion math
            let x = q[0], y = q[1], z = q[2], w = q[3],
                x2 = x + x,
                y2 = y + y,
                z2 = z + z,

                xx = x * x2,
                xy = x * y2,
                xz = x * z2,
                yy = y * y2,
                yz = y * z2,
                zz = z * z2,
                wx = w * x2,
                wy = w * y2,
                wz = w * z2;

            out[0] = 1 - (yy + zz);
            out[1] = xy + wz;
            out[2] = xz - wy;
            out[3] = 0;
            out[4] = xy - wz;
            out[5] = 1 - (xx + zz);
            out[6] = yz + wx;
            out[7] = 0;
            out[8] = xz + wy;
            out[9] = yz - wx;
            out[10] = 1 - (xx + yy);
            out[11] = 0;
            out[12] = v[0];
            out[13] = v[1];
            out[14] = v[2];
            out[15] = 1;
            return out;
        }

        static fromQuaternionTranslationScale(out, q, v, s){
            // Quaternion math
            let x = q[0], y = q[1], z = q[2], w = q[3],
                x2 = x + x,
                y2 = y + y,
                z2 = z + z,

                xx = x * x2,
                xy = x * y2,
                xz = x * z2,
                yy = y * y2,
                yz = y * z2,
                zz = z * z2,
                wx = w * x2,
                wy = w * y2,
                wz = w * z2,
                sx = s[0],
                sy = s[1],
                sz = s[2];

            out[0] = (1 - (yy + zz)) * sx;
            out[1] = (xy + wz) * sx;
            out[2] = (xz - wy) * sx;
            out[3] = 0;
            out[4] = (xy - wz) * sy;
            out[5] = (1 - (xx + zz)) * sy;
            out[6] = (yz + wx) * sy;
            out[7] = 0;
            out[8] = (xz + wy) * sz;
            out[9] = (yz - wx) * sz;
            out[10] = (1 - (xx + yy)) * sz;
            out[11] = 0;
            out[12] = v[0];
            out[13] = v[1];
            out[14] = v[2];
            out[15] = 1;

            return out;
        }

        static getTranslation(out, mat){
            out[0] = mat[12];
            out[1] = mat[13];
            out[2] = mat[14];
            return out;
        }

        static getScaling(out, mat){
            let m11 = mat[0],
                m12 = mat[1],
                m13 = mat[2],
                m21 = mat[4],
                m22 = mat[5],
                m23 = mat[6],
                m31 = mat[8],
                m32 = mat[9],
                m33 = mat[10];
            out[0] = Math.sqrt(m11 * m11 + m12 * m12 + m13 * m13);
            out[1] = Math.sqrt(m21 * m21 + m22 * m22 + m23 * m23);
            out[2] = Math.sqrt(m31 * m31 + m32 * m32 + m33 * m33);
            return out;
        }

        //Returns a quaternion representing the rotational component of a transformation matrix. If a matrix is built with
        //fromRotationTranslation, the returned quaternion will be the same as the quaternion originally supplied
        static getRotation(out, mat){
            // Algorithm taken from http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm
            let trace = mat[0] + mat[5] + mat[10],
                S = 0;

            if(trace > 0){
                S = Math.sqrt(trace + 1.0) * 2;
                out[3] = 0.25 * S;
                out[0] = (mat[6] - mat[9]) / S;
                out[1] = (mat[8] - mat[2]) / S;
                out[2] = (mat[1] - mat[4]) / S;
            }else if( (mat[0] > mat[5]) & (mat[0] > mat[10]) ){
                S = Math.sqrt(1.0 + mat[0] - mat[5] - mat[10]) * 2;
                out[3] = (mat[6] - mat[9]) / S;
                out[0] = 0.25 * S;
                out[1] = (mat[1] + mat[4]) / S;
                out[2] = (mat[8] + mat[2]) / S;
            }else if(mat[5] > mat[10]){
                S = Math.sqrt(1.0 + mat[5] - mat[0] - mat[10]) * 2;
                out[3] = (mat[8] - mat[2]) / S;
                out[0] = (mat[1] + mat[4]) / S;
                out[1] = 0.25 * S;
                out[2] = (mat[6] + mat[9]) / S;
            }else{
                S = Math.sqrt(1.0 + mat[10] - mat[0] - mat[5]) * 2;
                out[3] = (mat[1] - mat[4]) / S;
                out[0] = (mat[8] + mat[2]) / S;
                out[1] = (mat[6] + mat[9]) / S;
                out[2] = 0.25 * S;
            }
            return out;
        }

        //....................................................................
        //Static Operation

        //https://github.com/gregtatum/mdn-model-view-projection/blob/master/shared/matrices.js
        static multiplyVector(mat4, v) {
            let x = v[0], y = v[1], z = v[2], w = v[3];
            let c1r1 = mat4[ 0], c2r1 = mat4[ 1], c3r1 = mat4[ 2], c4r1 = mat4[ 3],
                c1r2 = mat4[ 4], c2r2 = mat4[ 5], c3r2 = mat4[ 6], c4r2 = mat4[ 7],
                c1r3 = mat4[ 8], c2r3 = mat4[ 9], c3r3 = mat4[10], c4r3 = mat4[11],
                c1r4 = mat4[12], c2r4 = mat4[13], c3r4 = mat4[14], c4r4 = mat4[15];

            return [
                x*c1r1 + y*c1r2 + z*c1r3 + w*c1r4,
                x*c2r1 + y*c2r2 + z*c2r3 + w*c2r4,
                x*c3r1 + y*c3r2 + z*c3r3 + w*c3r4,
                x*c4r1 + y*c4r2 + z*c4r3 + w*c4r4
            ];
        }

        //https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/vec4.js, vec4.transformMat4
        static transformVec4(out, v, m){
            out[0] = m[0] * v[0] + m[4] * v[1] + m[8]	* v[2] + m[12] * v[3];
            out[1] = m[1] * v[0] + m[5] * v[1] + m[9]	* v[2] + m[13] * v[3];
            out[2] = m[2] * v[0] + m[6] * v[1] + m[10]	* v[2] + m[14] * v[3];
            out[3] = m[3] * v[0] + m[7] * v[1] + m[11]	* v[2] + m[15] * v[3];
            return out;
        }

        //From glMatrix
        //Multiple two mat4 together
        static mult(out, a, b){
            let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
                a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
                a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
                a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

            // Cache only the current line of the second matrix
            let b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
            out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
            out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
            out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
            out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

            b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
            out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
            out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
            out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
            out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

            b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
            out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
            out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
            out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
            out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

            b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
            out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
            out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
            out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
            out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
            return out;
        }

        //....................................................................
        //Static Transformation
        static scale(out,x,y,z){
            out[0] *= x;
            out[1] *= x;
            out[2] *= x;
            out[3] *= x;
            out[4] *= y;
            out[5] *= y;
            out[6] *= y;
            out[7] *= y;
            out[8] *= z;
            out[9] *= z;
            out[10] *= z;
            out[11] *= z;
            return out;
        };

        static rotateY(out,rad) {
            let s = Math.sin(rad),
                c = Math.cos(rad),
                a00 = out[0],
                a01 = out[1],
                a02 = out[2],
                a03 = out[3],
                a20 = out[8],
                a21 = out[9],
                a22 = out[10],
                a23 = out[11];

            // Perform axis-specific matrix multiplication
            out[0] = a00 * c - a20 * s;
            out[1] = a01 * c - a21 * s;
            out[2] = a02 * c - a22 * s;
            out[3] = a03 * c - a23 * s;
            out[8] = a00 * s + a20 * c;
            out[9] = a01 * s + a21 * c;
            out[10] = a02 * s + a22 * c;
            out[11] = a03 * s + a23 * c;
            return out;
        }

        static rotateX(out,rad) {
            let s = Math.sin(rad),
                c = Math.cos(rad),
                a10 = out[4],
                a11 = out[5],
                a12 = out[6],
                a13 = out[7],
                a20 = out[8],
                a21 = out[9],
                a22 = out[10],
                a23 = out[11];

            // Perform axis-specific matrix multiplication
            out[4] = a10 * c + a20 * s;
            out[5] = a11 * c + a21 * s;
            out[6] = a12 * c + a22 * s;
            out[7] = a13 * c + a23 * s;
            out[8] = a20 * c - a10 * s;
            out[9] = a21 * c - a11 * s;
            out[10] = a22 * c - a12 * s;
            out[11] = a23 * c - a13 * s;
            return out;
        }

        static rotateZ(out,rad){
            let s = Math.sin(rad),
                c = Math.cos(rad),
                a00 = out[0],
                a01 = out[1],
                a02 = out[2],
                a03 = out[3],
                a10 = out[4],
                a11 = out[5],
                a12 = out[6],
                a13 = out[7];

            // Perform axis-specific matrix multiplication
            out[0] = a00 * c + a10 * s;
            out[1] = a01 * c + a11 * s;
            out[2] = a02 * c + a12 * s;
            out[3] = a03 * c + a13 * s;
            out[4] = a10 * c - a00 * s;
            out[5] = a11 * c - a01 * s;
            out[6] = a12 * c - a02 * s;
            out[7] = a13 * c - a03 * s;
            return out;
        }

        static rotate(out, rad, axis){
            let x = axis[0], y = axis[1], z = axis[2],
                len = Math.sqrt(x * x + y * y + z * z),
                s, c, t,
                a00, a01, a02, a03,
                a10, a11, a12, a13,
                a20, a21, a22, a23,
                b00, b01, b02,
                b10, b11, b12,
                b20, b21, b22;

            if (Math.abs(len) < 0.000001) { return null; }

            len = 1 / len;
            x *= len;
            y *= len;
            z *= len;

            s = Math.sin(rad);
            c = Math.cos(rad);
            t = 1 - c;

            a00 = out[0]; a01 = out[1]; a02 = out[2]; a03 = out[3];
            a10 = out[4]; a11 = out[5]; a12 = out[6]; a13 = out[7];
            a20 = out[8]; a21 = out[9]; a22 = out[10]; a23 = out[11];

            // Construct the elements of the rotation matrix
            b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
            b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
            b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;

            // Perform rotation-specific matrix multiplication
            out[0] = a00 * b00 + a10 * b01 + a20 * b02;
            out[1] = a01 * b00 + a11 * b01 + a21 * b02;
            out[2] = a02 * b00 + a12 * b01 + a22 * b02;
            out[3] = a03 * b00 + a13 * b01 + a23 * b02;
            out[4] = a00 * b10 + a10 * b11 + a20 * b12;
            out[5] = a01 * b10 + a11 * b11 + a21 * b12;
            out[6] = a02 * b10 + a12 * b11 + a22 * b12;
            out[7] = a03 * b10 + a13 * b11 + a23 * b12;
            out[8] = a00 * b20 + a10 * b21 + a20 * b22;
            out[9] = a01 * b20 + a11 * b21 + a21 * b22;
            out[10] = a02 * b20 + a12 * b21 + a22 * b22;
            out[11] = a03 * b20 + a13 * b21 + a23 * b22;
        }

        static invert(out,mat) {
            if(mat === undefined) mat = out; //If input isn't sent, then output is also input

            let a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3],
                a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7],
                a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11],
                a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15],

                b00 = a00 * a11 - a01 * a10,
                b01 = a00 * a12 - a02 * a10,
                b02 = a00 * a13 - a03 * a10,
                b03 = a01 * a12 - a02 * a11,
                b04 = a01 * a13 - a03 * a11,
                b05 = a02 * a13 - a03 * a12,
                b06 = a20 * a31 - a21 * a30,
                b07 = a20 * a32 - a22 * a30,
                b08 = a20 * a33 - a23 * a30,
                b09 = a21 * a32 - a22 * a31,
                b10 = a21 * a33 - a23 * a31,
                b11 = a22 * a33 - a23 * a32,

                // Calculate the determinant
                det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

            if (!det) return false;
            det = 1.0 / det;

            out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
            out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
            out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
            out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
            out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
            out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
            out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
            out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
            out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
            out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
            out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
            out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
            out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
            out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
            out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
            out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

            return true;
        }

        //https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/mat4.js  mat4.scalar.translate = function (out, a, v) {
        static translate(out,x,y,z){
            out[12] = out[0] * x + out[4] * y + out[8]	* z + out[12];
            out[13] = out[1] * x + out[5] * y + out[9]	* z + out[13];
            out[14] = out[2] * x + out[6] * y + out[10]	* z + out[14];
            out[15] = out[3] * x + out[7] * y + out[11]	* z + out[15];
        }
        //endregion
    }


    function NewShader(name, vert, frag){
        let shader = new ShaderBuilder(vert, frag);
        Bonsai.Res.Shaders[name] = shader;
        return shader;
    }

    class Material{
        static create(name, shaderName, opt){
            let m = new Material();
            m.shader = Bonsai.Res.Shaders[shaderName];

            Bonsai.Res.Materials[name] = m;
            return m
        }

        constructor(){
            this.shader = null;
            this.uniforms = [];

            this.useCulling = CULLING_STATE;
            this.useBlending = BLENDING_STATE;
            this.useModelMatrix = true;
            this.useNormalMatrix = false;

            this.drawMode = gl.TRIANGLES;
        }
    }

    class ShaderBuilder {
        constructor(gl, vs, fs){
            this.program = ShaderUtil.createProgram(gl, vs, fs, true);
            if(this.program !== null){
                gl = gl;
                gl.useProgram(this.program);
                this.mUniformList = [];
                this.mTextureList = [];

                this.noCulling = false;
                this.doBlending = false;
            }
        }

        prepareUniforms(){
            if(arguments.length % 2 !== 0) {
                console.log("prepare uniforms needs arguments to be in pairs.");
                return this;
            }

            let loc = 0;
            for (let i=0; i< arguments.length; i+=2){
                loc = gl.getUniformLocation(this.program, arguments[i]);
                if(loc != null){
                    this.mUniformList[arguments[i]] = {
                        loc: loc,
                        type: arguments[i+1]
                    }
                }
            }
            return this;
        }

        prepareUniformBlock(ubo, blockIndex){
            for(let i=0;  i<arguments.length; i+=2){
                gl.uniformBlockBinding(this.program, arguments[i+1], arguments[i].blockPoint);
            }
            return this;
        }

        prepareTextures(){
            if(arguments.length % 2 !== 0){
                console.log("prepareTextures needs arguments to be in pairs.");
                return this;
            }

            let loc = 0,
                tex = "";

            for(let i=0; i<arguments.length; i+=2){
                tex = gl.mTextureCache[arguments[i+1]];
                if(tex === undefined){
                    console.log("Texture not found in cache " + arguments[i+1]);
                    continue;
                }

                loc = gl.getUniformLocation(this.program, arguments[i]);
                if(loc != null){
                    this.mTextureList.push({
                        loc: loc,
                        tex: tex
                    })
                }
            }

            return this;
        }

        setUniforms(){
            if(arguments.length % 2 !== 0) {
                console.log("setUniforms needs arguments to be in pairs.");
                return this;
            }

            let name;
            for(let i=0; i<arguments.length; i+=2){
                name = arguments[i];
                if(this.mUniformList[name] === undefined){
                    console.log("uniform not found" + name);
                    return this;
                }

                switch (this.mUniformList[name].type){
                    case "2fv":
                        gl.uniform2fv(this.mUniformList[name].loc, new Float32Array(arguments[i+1]));
                        break;
                    case "3fv":
                        gl.uniform3fv(this.mUniformList[name].loc, new Float32Array(arguments[i+1]));
                        break;
                    case "4fv":
                        gl.uniform4fv(this.mUniformList[name].loc, new Float32Array(arguments[i+1]));
                        break;
                    case "mat4":
                        gl.uniformMatrix4fv(this.mUniformList[name].loc, false, arguments[i+1]);
                        break;
                    default:
                        console.log("unknown uniform type for " + name);
                        break;

                }
            }

            return this;
        }

        activate(){
            gl.useProgram(this.program);
            return this;
        }

        deactivate(){
            gl.useProgram(null);
            return this;
        }

        dispose(){
            if(gl.getParameter(gl.CURRENT_PROGRAM) === this.program){
                gl.useProgram(null);
            }
            gl.deleteProgram(this.program);
        }

        preRender(){
            gl.useProgram(this.program);
            if(arguments.length > 0){
                this.setUniforms.apply(this, arguments);
            }

            if(this.mTextureList.length > 0){
                let texSlot;
                for(let i=0; i<this.mTextureList.length; i++){
                    texSlot = gl["TEXTURE" + i];
                    gl.activeTexture(texSlot);
                    gl.bindTexture(gl.TEXTURE_2D, this.mTextureList[i].tex);
                    gl.uniform1i(this.mTextureList[i].loc, i);
                }
            }

            return this;
        }

        renderModel(model, doShaderClose){
            this.setUniforms("uMVMatrix", model.transform.getViewMatrix());
            gl.bindVertexArray(model.mesh.vao);

            if(model.mesh.noCulling || this.noCulling){
                gl.disable(gl.CULL_FACE);
            }

            if(model.mesh.doBlending || this.doBlending){
                gl.enable(gl.BLEND);
            }

            if(model.mesh.indexCount){
                gl.drawElements(model.mesh.drawMode, model.mesh.indexCount, gl.UNSIGNED_SHORT, 0);
            }else{
                gl.drawArrays(model.mesh.drawMode, 0, model.mesh.vertexCount);
            }

            gl.bindVertexArray(null);
            if(model.mesh.noCulling || this.noCulling) gl.enable(gl.CULL_FACE);
            if(model.mesh.doBlending || this.doBlending) gl.disable(gl.BLEND);

            if(doShaderClose) gl.useProgram(null);
            return this;

        }
    }

    class ShaderUtil {
        static createShader (gl, str, type){
            let shader = gl.createShader(type);
            gl.shaderSource(shader, str);
            gl.compileShader(shader);

            if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
                alert(gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null
            }

            return shader
        }

        static createProgram (gl, vs, fs, doValidate) {
            let vShader = ShaderUtil.createShader(gl, vs, gl.VERTEX_SHADER);
            let fShader = ShaderUtil.createShader(gl, fs, gl.FRAGMENT_SHADER);

            let program = gl.createProgram();
            gl.attachShader(program, vShader);
            gl.attachShader(program, fShader);
            gl.bindAttribLocation(program, ATTR_POSITION_LOC, ATTR_POSITION_NAME);
            gl.bindAttribLocation(program, ATTR_NORMAL_LOC, ATTR_NORMAL_NAME);
            gl.bindAttribLocation(program, ATTR_UV_LOC, ATTR_UV_NAME);



            gl.linkProgram(program);

            if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
                alert(gl.getProgramInfoLog(program));
                gl.deleteProgram(program);
                return null
            }

            if(doValidate){
                gl.validateProgram(program);
                if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)){
                    alert((gl.getProgramInfoLog(program)));
                    gl.deleteProgram(program);
                    return null
                }
            }

            return program
        }

        static getStandardAttribLocations(gl, program){
            return {
                position:   gl.getAttribLocation(program, ATTR_POSITION_NAME),
                normal:     gl.getAttribLocation(program, ATTR_NORMAL_NAME),
                uv:         gl.getAttribLocation(program, ATTR_UV_NAME),
            }
        }

        static getStandardUniformLocations(gl, program){
            return {
                perspective:   gl.getUniformLocation(program, 'uPMatrix'),
                modelMatrix:   gl.getUniformLocation(program, 'uMVMatrix'),
                cameraMatrix:  gl.getUniformLocation(program, 'uCameraMatrix'),
                mainTexture:   gl.getUniformLocation(program, 'uMainTex'),
                time:          gl.getUniformLocation(program, 'uTime')
            }
        }

    }

    class UBO {

        constructor(blockName, blockPoint, bufSize, aryCalc){
            this.items = [];
            this.keys = [];

            for(let i=0; i<aryCalc.length; i++){
                this.items[aryCalc[i].name] = {
                    offset: aryCalc[i].offset,
                    dataLen: aryCalc[i].dataLen,
                    chunkLen: aryCalc[i].chunkLen
                };

                this.keys[i] = aryCalc[i].name;
            }

            this.blockName = blockName;
            this.blockPoint = blockPoint;

            this.buf = gl.createBuffer();
            gl.bindBuffer(gl.UNIFORM_BUFFER, this.buf);
            gl.bufferData(gl.UNIFORM_BUFFER, bufSize, gl.DYNAMIC_DRAW);
            gl.bindBuffer(gl.UNIFORM_BUFFER, null);
            gl.bindBufferBase(gl.UNIFORM_BUFFER, blockPoint, this.buf);
        }

        update(name, data){
            if( !data instanceof Float32Array){
                if(Array.isArray(data)) {
                    data = new Float32Array(data);
                }else{
                    data = new Float32Array([data]);
                }
            }

            gl.bindBuffer(gl.UNIFORM_BUFFER, this.buf);
            gl.bufferSubData(gl.UNIFORM_BUFFER, this.items[name].offset, data, 0, null);
            gl.bindBuffer(gl.UNIFORM_BUFFER, null);
            return this;
        }


        static createTransformUBO(){
            return UBO.create(Bonsai.UBO_TRANSFORM,0,[ {name:"matProjection",type:"mat4"}, {name:"matCameraView",type:"mat4"} ]);
        }

        static create(blockName,blockPoint,ary){
            var bufSize = UBO.calculate(ary);
            Bonsai.Res.Ubo[blockName] = new UBO(blockName,blockPoint,bufSize,ary);
            UBO.debugVisualize(Bonsai.Res.Ubo[blockName]);
            return Bonsai.Res.Ubo[blockName];
        }

        static getSize(type){
            switch (type){
                case "mat4": return 16 * 4;
                case "mat3": return 16 * 3;
                case "vec2": return 8;
                case "f": case "i": case "b": return 4;
                case "vec3": case "vec4": return 16;
                default: return 0
            }
        }

        static calculate(ary){
            let chunk = 16,
                tSize = 0,
                offset = 0,
                size = 0;

            for(let i=0; i<ary.length; i++){
                if(!ary[i].aryLen || ary[i].aryLen === 0){
                    size = UBO.getSize(ary[i].type)
                }else{
                    size = ary[i].aryLen * 16;
                }

                tSize = chunk - size;

                if(tSize < 0 && chunk < 16){
                    offset += chunk;
                    if(i > 0){
                        ary[i-1].chunkLen += chunk;
                    }
                    chunk = 16;
                }else if(tSize < 0 && chunk === 16){
                    // Do nothing
                }else if(tSize === 0){
                    chunk = 16
                }else{
                    chunk -= size;
                }

                ary[i].offset = offset;
                ary[i].chunkLen = size;
                ary[i].dataLen = size;

                offset += size;
            }

            if(offset % 16 !== 0){
                ary[ary.length - 1].chunkLen += chunk;
                offset += chunk;
            }

            console.log("UBO Size: ", offset);
            return offset
        }

        static debugVisualize(ubo){
            let str = "",
                chunk = 0,
                tChunk = 0,
                itm = null;

            for(let i=0; i<ubo.keys.length; i++){
                itm = ubo.items[ubo.keys[i]];
                console.log(ubo.keys[i], itm);

                chunk = itm.chunkLen / 4;
                for(let x=0; x<chunk; x++){
                    str += (x==0 || x == chunk - 1) ? "|." + i + "." : "|...";
                    tChunk ++;
                    if(tChunk % 4 !== 0) str += "| ~ ";
                }
            }

            if(tChunk % 4 !== 0){
                str += "|";
            }

            console.log(str);
        }

    }


    class VAO{
        static create(out){
            out.buffers = [];
            out.id = gl.createVertexArray();
            out.isIndexed = false;
            out.count = 0;

            gl.bindVertexArray(out.id);
            return VAO
        }

        static finalize(out, name){
            gl.bindVertexArray(null);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
            Bonsai.Res.Vao[name] = out;
        }

        static emptyFloatArrayBuffer(out, name, aryCount, attrLoc, size, stride, offset, isStatic){
            let rtn = {
                buf: gl.createBuffer(),
                size: size,
                stride: stride,
                offset: offset,
                count: 0
            };

            gl.bindBuffer(gl.ARRAY_BUFFER, rtn.buf);
            // 这里第二个参数是int型， 表示定义空Buffer，Buffer长度为aryCount, 字节aryCount * 4
            gl.bufferData(gl.ARRAY_BUFFER, aryCount,
                (isStatic !== false) ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW);
            gl.enableVertexAttribArray(attrLoc);
            gl.vertexAttribPointer(attrLoc, size, gl.FLOAT, false, stride || 0, offset || 0);

            out.buffer[name] = rtn;
            return VAO
        }

        static floatArrayBuffer(out,name,aryFloat,attrLoc,size,stride,offset,isStatic,keepData){
            let rtn = {
                buf:gl.createBuffer(),
                size:size,
                stride:stride,
                offset:offset,
                count:aryFloat.length / size
            };
            if(keepData == true) rtn.data = aryFloat;
            let ary = (aryFloat instanceof Float32Array)? aryFloat : new Float32Array(aryFloat);

            gl.bindBuffer(gl.ARRAY_BUFFER, rtn.buf);
            gl.bufferData(gl.ARRAY_BUFFER, ary, (isStatic != false)? gl.STATIC_DRAW : gl.DYNAMIC_DRAW );
            gl.enableVertexAttribArray(attrLoc);
            gl.vertexAttribPointer(attrLoc,size,gl.FLOAT,false,stride || 0,offset || 0);

            out.buffers[name] = rtn;
            return VAO;
        }

        static indexBuffer(out, name, aryUInt, isStatic, keepData){
            let rtn = {
                buf: gl.createBuffer(),
                count: aryUInt.length
            };

            if(keepData === true){
                rtn.data = aryUInt
            }

            let ary = (aryUInt instanceof Uint16Array)? aryUInt : new Uint16Array(aryUInt);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rtn.buf );
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, ary, (isStatic != false)? gl.STATIC_DRAW : gl.DYNAMIC_DRAW );

            out.buffers[name] = rtn;
            out.isIndexed = true;
            out.count = aryUInt.length;

            return VAO;
        }

        static standardMesh(name,vertSize,aryVert,aryNorm,aryUV,aryInd,keepData){
            let rtn = {};
            VAO.create(rtn).floatArrayBuffer(rtn,"vert",aryVert,Bonsai.ATTR_POSITION_LOC,vertSize,0,0,true,keepData);
            rtn.count = rtn.buffers["vert"].count;

            if(aryNorm)	VAO.floatArrayBuffer(rtn,"norm",aryNorm,Bonsai.ATTR_NORM_LOC,3,0,0,true,keepData);
            if(aryUV)	VAO.floatArrayBuffer(rtn,"uv",aryUV,Bonsai.ATTR_UV_LOC,2,0,0,true,keepData);
            if(aryInd)	VAO.indexBuffer(rtn,"index",aryInd,true,keepData);

            VAO.finalize(rtn);
            return rtn;
        }
    }

    class RenderLoop{
        constructor(callback,fps){
            this.isActive		= false;	//Control the On/Off state of the render loop
            this.fps			= 0;		//Save the value of how fast the loop is going.

            this._lastFrame	= null;			//The time in Miliseconds of the last frame.
            this._callBack		= callback;	//What function to call for each frame
            this._frameCaller	= window;	//Normally we'll call window's requestAnimationFrame, but for VR we need to use its HMD reference for that call.
            this._fpsLimit		= 0;		//Limit how many frames per second the loop should do.
            this._runPtr 		= null;		//Pointer to a run function that has this class's scope attached

            this.setFPSLimit( (fps != undefined && fps > 0)?fps:0  );
        }

        stop(){ this.isActive = false; }
        start(){
            this.isActive = true;
            this._LastFrame = performance.now();
            this._frameCaller.requestAnimationFrame(this._runPtr);
            return this;
        }

        setFrameCaller(fc){ this.frameCaller = fc; return this; }
        setFPSLimit(v){
            if(v <= 0){
                this._fpsLimit = 0;
                this._runPtr = this.runFull.bind(this);
            }else{
                this._fpsLimit = 1000/v; //Calc how many milliseconds per frame in one second of time.
                this._runPtr = this.runLimit.bind(this);
            }
        }

        runLimit(){
            //Calculate Deltatime between frames and the FPS currently.
            let msCurrent	= performance.now(),
                msDelta		= (msCurrent - this._lastFrame),
                deltaTime	= msDelta / 1000.0;		//What fraction of a single second is the delta time

            if(msDelta >= this._fpsLimit){ //Now execute frame since the time has elapsed.
                this.fps		= Math.floor(1/deltaTime);
                this._lastFrame	= msCurrent;
                this._callBack(deltaTime);
            }

            if(this.isActive) this._frameCaller.requestAnimationFrame(this._runPtr);
        }

        runFull(){
            //Calculate Deltatime between frames and the FPS currently.
            let msCurrent	= performance.now(),	//Gives you the whole number of how many milliseconds since the dawn of time :)
                deltaTime	= (msCurrent - this._lastFrame) / 1000.0;	//ms between frames, Then / by 1 second to get the fraction of a second.

            //Now execute frame since the time has elapsed.
            this.fps			= Math.floor(1/deltaTime); //Time it took to generate one frame, divide 1 by that to get how many frames in one second.
            this._lastFrame		= msCurrent;
            this._callBack(deltaTime);
            if(this.isActive)	this._frameCaller.requestAnimationFrame(this._runPtr);
        }
    }

    let Renderer = (function(){
        let material = shader = null;

        return function(ary){
            for(let i=0; i < ary.length; i++){
                if(ary[i].visible == false) continue;

                //...................................
                //Check if the next materal to use is different from the last
                if(material !== ary[i].material){
                    material = ary[i].material;

                    //Multiple materials can share the same shader, if new shader, turn it on.
                    if(material.shader !== shader) shader = material.shader.activate();

                    //Turn on/off any gl features
                    if(material.useCulling != CULLING_STATE)	gl[ ( (CULLING_STATE = (!CULLING_STATE))  )?"enable":"disable" ](gl.CULL_FACE);
                    if(material.useBlending != BLENDING_STATE)	gl[ ( (BLENDING_STATE = (!BLENDING_STATE)) )?"enable":"disable" ](gl.BLEND);
                }

                //...................................
                //Prepare Buffers and Uniforms.
                gl.bindVertexArray(ary[i].vao.id);
                if(material.useModelMatrix) material.shader.setUniforms(Bonsai.UNI_MODEL_MAT_NAME,ary[i].updateMatrix());
                //(material.useNormalMatrix) 

                //...................................
                //Render !!!
                if(ary[i].vao.isIndexed)	gl.drawElements(material.drawMode, ary[i].vao.count, gl.UNSIGNED_SHORT, 0);
                else						gl.drawArrays(material.drawMode, 0, ary[i].vao.count);
            }

            //...................................
            //Cleanup
            gl.bindVertexArray(null); //After all done rendering, unbind VAO
        }
    })();

    return {
        Init: Init,
        gl: null,
        Util: Util,
        Res: {
            Textures: [],
            Videos: [],
            Images: [],
            Shaders: [],
            Ubo: [],
            Vao: [],
            Material: []
        },
        Shaders:{Material:Material, New:NewShader, Builder:ShaderBuilder, Util:ShaderUtil, VAO:VAO, UBO:UBO },
        Transform: Transform,
        Renderable: Renderable,
        CameraOrbit: CameraOrbit,
        RenderLoop: RenderLoop,
        Renderer: Renderer,


        // CONSTANTS
        ATTR_POSITION_LOC: 0,
        ATTR_NORM_LOC: 1,
        ATTR_UV_LOC: 2,

        UBO_TRANSFORM: "UBOTransform",
        UNI_MODEL_MAT_NAME: "uModalMatrix"
    }

})();