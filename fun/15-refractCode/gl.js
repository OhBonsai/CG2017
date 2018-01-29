const ATTR_POSITION_NAME = 'a_position';
const ATTR_POSITION_LOC = 0;

const ATTR_NORMAL_NAME = 'a_normal';
const ATTR_NORMAL_LOC = 1;

const ATTR_UV_NAME = 'a_uv';
const ATTR_UV_LOC = 2;


class glUtil {

    //Convert Hex colors to float arrays, can batch process a list into one big array.
    //example : GlUtil.rgbArray("#FF0000","00FF00","#0000FF");
    static rgbArray() {
        if (arguments.length === 0) return null;
        let rtn = [];

        for (let i = 0, c, p; i < arguments.length; i++) {
            if (arguments[i].length < 6) continue;
            c = arguments[i];		//Just an alias(copy really) of the color text, make code smaller.
            p = (c[0] === "#") ? 1 : 0;	//Determine starting position in char array to start pulling from

            rtn.push(
                parseInt(c[p] + c[p + 1], 16) / 255.0,
                parseInt(c[p + 2] + c[p + 3], 16) / 255.0,
                parseInt(c[p + 4] + c[p + 5], 16) / 255.0
            );
        }
        return rtn;
    }

}


function glInstance(el){
    let gl = document.getElementById(el).getContext("webgl2");
    if (!gl) {
        alert("can't create webgl2 context")
    }

    gl.mMeshCache = [];
    gl.mTextureCache = [];
    gl.cullFace(gl.BACK);  //背面不描画
    gl.frontFace(gl.CCW);  //默认值，逆时针是正面，CW顺时针是正面
    /* 深度测试，把一些看不见的像素点剔除掉。以下是作者的回复，觉得可以解释为什么叫depth_test，而不是depth process
       深度测试测试每个像素点的ZPosition. 当一个三角形光栅化，然后一个像素一个像素画在屏幕上，实际上每个点做了一次X/Y到屏幕X/Y的
       映射，比如有一个点Z值是-2,颜色是红色。那我们先画到屏幕上去，然后来个X,y值相同的，但是Z值是-1，颜色是黄色，如果
       我们设置深度测试函数depthFunc是小于等于即gl.depthFunc(gl.LEQUAL);。那么要剔除红色，然后来个黄色。
       同时屏幕那个点深度值从-2变成-1.
       所以，深度测试就是测试哪些点要画或者拒绝画出来，测试的根据是depth buffer。实际上一个长长的数组。

       然后为什么叫测试而不叫process（这是我深深的疑惑）,作者也给出了解答
       Test can mean to Check if something is correct or true. Process means "to do something". So you are
       Checking(testing) if the pixel is closer to the eye...
    */
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.depthFunc(gl.LEQUAL); //设置深度缓冲比较函数。low and equal 还有一些ge什么的
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); //定义像素混合函数。有点像图像处理里面的模糊度计算
    gl.clearColor(0.1, 0.1, 0.1, 1.);

    gl.fClear = function(){
        this.clear(this.COLOR_BUFFER_BIT | this.DEPTH_BUFFER_BIT);
        return this
    };

    gl.fCreateArrayBuffer = function(aryVerts, isStatic=true){
        let buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, aryVerts, isStatic ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        return buffer
    };

    gl.fSetSize = function (w, h) {
        this.canvas.style.width = w + "px";
        this.canvas.style.height = h + "px";
        this.canvas.width = w;
        this.canvas.height = h;

        this.viewport(0, 0, w, h);
        return this
    };



    gl.fCreateMeshVAO = function (name, aryInd, aryVert, aryNorm, aryUV, vertLen) {
        let rtn = {
            drawMode: this.TRIANGLES
        };

        rtn.vao = this.createVertexArray();
        this.bindVertexArray(rtn.vao);

        if(aryVert !== undefined && aryVert !== null){
            rtn.bufVertices = this.createBuffer();
            rtn.vertexComponentLen = vertLen || 3;
            rtn.vertexCount = aryVert.length / rtn.vertexComponentLen;

            this.bindBuffer(this.ARRAY_BUFFER, rtn.bufVertices);
            this.bufferData(this.ARRAY_BUFFER, new Float32Array(aryVert), this.STATIC_DRAW);
            this.enableVertexAttribArray(ATTR_POSITION_LOC);
            this.vertexAttribPointer(ATTR_POSITION_LOC, rtn.vertexComponentLen, this.FLOAT, false, 0, 0);
        }

        if(aryNorm !== undefined && aryNorm !== null){
            rtn.bufNormals = this.createBuffer();

            this.bindBuffer(this.ARRAY_BUFFER, rtn.bufNormals);
            this.bufferData(this.ARRAY_BUFFER, new Float32Array(aryNorm), this.STATIC_DRAW);
            this.enableVertexAttribArray(ATTR_NORMAL_LOC);
            this.vertexAttribPointer(ATTR_NORMAL_LOC, 3, this.FLOAT, false, 0, 0);
        }

        if(aryUV !== undefined && aryUV !== null){
            rtn.bufUVs = this.createBuffer();

            this.bindBuffer(this.ARRAY_BUFFER, rtn.bufUVs);
            this.bufferData(this.ARRAY_BUFFER, new Float32Array(aryUV), this.STATIC_DRAW);
            this.enableVertexAttribArray(ATTR_UV_LOC);
            this.vertexAttribPointer(ATTR_UV_LOC, 2, this.FLOAT, false, 0, 0);
        }

        if(aryInd !== undefined && aryInd !== null){
            rtn.bufIndex = this.createBuffer();
            rtn.indexCount = aryInd.length;
            this.bindBuffer(this.ELEMENT_ARRAY_BUFFER, rtn.bufIndex);
            this.bufferData(this.ELEMENT_ARRAY_BUFFER, new Uint16Array(aryInd), this.STATIC_DRAW);
        }

        this.bindVertexArray(null);
        this.bindBuffer(this.ARRAY_BUFFER, null);
        if(aryInd !== null && aryInd !== undefined)  {
            this.bindBuffer(this.ELEMENT_ARRAY_BUFFER,null);
        }

        this.mMeshCache[name] = rtn;
        return rtn;
    };

    gl.fLoadTexture = function(name, img, doYFlip=true){
        let tex = this.createTexture();
        // 上下翻转，所有参数可参考https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/pixelStorei
        if(doYFlip === true) this.pixelStorei(this.UNPACK_FLIP_Y_WEBGL, true);

        if(img === null){
            alert("texture image is null!");
            return
        }

        this.bindTexture(this.TEXTURE_2D, tex);

        this.texImage2D(
            this.TEXTURE_2D,    // target
            0,                  // image level. 0-n
            this.RGBA,         // image type
            this.RGBA,         // ???
            this.UNSIGNED_BYTE,// pixels A Uint8Array must be used if type is gl.UNSIGNED_BYTE
            img                // Source
        );


        //如何纹理纹素映射像素，http://blog.csdn.net/u014800094/article/details/55271784
        //其实就是一些参数，比如你把一个面膜贴在你脸上，面膜尺寸和你脸一摸一样的情况是非常少的。
        //你就拉扯或者缩紧面膜，然后面膜就把你脸全贴住了。有时候你脸会被人打肿了（相机离物体较近）那我用大面膜
        //有时候你连缩水了，那我用小面膜。而这个匹配的过程，其实是一个纹理（由纹素组成的矩阵） 映射到 一个屏幕（由
        //像素组成的矩阵）。我可以分成9个元素的3*3矩阵去分批处理，也可以1个元素一个元素分开处理。科学家们研究出了
        //与计算复杂度相关性能各异的算法，这几个函数也就只是把算法的参数提炼出来，说你用这个复杂度高。运算量大。但是在
        //绝大多数情况下是效果好的，但具体还是要看实际情况。
        this.texParameteri(
            this.TEXTURE_2D,         //target
            this.TEXTURE_MAG_FILTER, //放大过滤
            this.LINEAR              //线性滤波
        );

        this.texParameteri(
            this.TEXTURE_2D,
            this.TEXTURE_MIN_FILTER,
            this.LINEAR_MIPMAP_NEAREST
        );

        this.generateMipmap(this.TEXTURE_2D); //适配不同大小的Texture来贴图，防止失真
        this.bindTexture(this.TEXTURE_2D,null);
        this.mTextureCache[name] = tex;

        if(doYFlip === true) this.pixelStorei(this.UNPACK_FLIP_Y_WEBGL, false);
        return tex;
    };

    gl.fLoadCubeMap = function(name, imgAry){
        if(imgAry.length !== 6) return null;

        let tex = this.createTexture();
        this.bindTexture(this.TEXTURE_CUBE_MAP, tex);

        for(let i=0; i<6; i++){
            // Webgl1 的写法
            this.texImage2D(
                this.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                0,
                this.RGBA,
                this.RGBA,
                this.UNSIGNED_BYTE,
                imgAry[i]
            )
        }

        // 贴图的参数调整

        // 对待TEXTURE_CUBE_MAP的这个目标，碰到一个纹素对多个像素的时候，我们采用线性滤波的方式进行纹理映射
        this.texParameteri(this.TEXTURE_CUBE_MAP, this.TEXTURE_MAG_FILTER, this.LINEAR);	//Setup up scaling
        // 对待TEXTURE_CUBE_MAP的这个目标，碰到多个纹素对一个像素的时候，我们采用线性滤波的方式进行纹理映射
        this.texParameteri(this.TEXTURE_CUBE_MAP, this.TEXTURE_MIN_FILTER, this.LINEAR);	//Setup down scaling

        // 对待TEXTURE_CUBE_MAP的这个目标，如果X方向上的纹理坐标大于1.0。超出部分就大家挤着显示呗
        /**
         *  环绕方式                        描述
         *  GL_REPEAT                   默认方式，重复
         *  GL_MIRRORED_REPEAT          镜面重复
         *  GL_CLAMP_TO_EDGE            多了我就画，被人挡了我不管
         *  GL_CLAMP_TO_BORDER          多了我不画，当多的部分不存在
         */
        this.texParameteri(this.TEXTURE_CUBE_MAP, this.TEXTURE_WRAP_S, this.CLAMP_TO_EDGE);	//Stretch image to X position
        this.texParameteri(this.TEXTURE_CUBE_MAP, this.TEXTURE_WRAP_T, this.CLAMP_TO_EDGE);	//Stretch image to Y position
        this.texParameteri(this.TEXTURE_CUBE_MAP, this.TEXTURE_WRAP_R, this.CLAMP_TO_EDGE);	//Stretch image to Z position

        this.bindTexture(this.TEXTURE_CUBE_MAP, null);
        this.mTextureCache[name] = tex;
        return tex;

    };


    //Set the size of the canvas to fill a % of the total screen.
    gl.fFitScreen = function(wp,hp){ return this.fSetSize(
        window.innerWidth * (wp || 1.),
        window.innerHeight * (hp || 1.));
    };

    return gl
}
