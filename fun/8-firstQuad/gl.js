const ATTR_POSITION_NAME = 'a_Pos';
const ATTR_POSTION_LOC = 0;

const ATTR_NORMAL_NAME = 'a_Normal';
const ATTR_NORMAL_LOC = 1;

const ATTR_UV_NAME = 'a_Uv';
const ATTR_UV_LOC = 2;

function glInstance(el) {
    let gl = document.getElementById(el).getContext("webgl2");
    if (!gl) {
        alert("can't create webgl2 context")
    }

    gl.mMeshCache = [];
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
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.depthFunc(gl.LEQUAL); //设置深度缓冲比较函数。low and equal 还有一些ge什么的
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); //定义像素混合函数。有点像图像处理里面的模糊度计算
    gl.clearColor(1., 1., 1., 1.);

    gl.fClear = function () {
        this.clear(this.COLOR_BUFFER_BIT | this.DEPTH_BUFFER_BIT);
        return this
    };

    gl.fCreateArrayBuffer = function (aryVerts, isStatic = true) {
        let buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, aryVerts, isStatic ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        return buffer
    };

    gl.fSetSize = function (w, h) {
        this.canvas.style.width = w + 'px';
        this.canvas.style.height = w + 'px';
        this.canvas.width = w;
        this.canvas.height = h;

        this.viewport(0, 0, w, h);
        return this
    };

    gl.fCreateMeshVAO = function (name, aryInd, aryVert, aryNorm, aryUV) {
        let rtn = {
            drawMode: this.TRIANGLES
        };

        rtn.vao = this.createVertexArray();
        this.bindVertexArray(rtn.vao);

        if (aryVert !== undefined && aryVert !== null) {
            rtn.bufVertices = this.createBuffer();
            rtn.vertexComponentLen = 3;
            rtn.vertexCount = aryVert.length / rtn.vertexComponentLen;

            this.bindBuffer(this.ARRAY_BUFFER, rtn.bufVertices);
            this.bufferData(this.ARRAY_BUFFER, new Float32Array(aryVert), this.STATIC_DRAW);
            this.enableVertexAttribArray(ATTR_POSTION_LOC);
            this.vertexAttribPointer(ATTR_POSTION_LOC, 3, this.FLOAT, false, 0, 0);
        }

        if (aryNorm !== undefined && aryNorm !== null) {
            rtn.bufNormals = this.createBuffer();

            this.bindBuffer(this.ARRAY_BUFFER, rtn.bufNormals);
            this.bufferData(this.ARRAY_BUFFER, new Float32Array(aryNorm), this.STATIC_DRAW);
            this.enableVertexAttribArray(ATTR_NORMAL_LOC);
            this.vertexAttribPointer(ATTR_NORMAL_LOC, 3, this.FLOAT, false, 0, 0);
        }

        if (aryUV !== undefined && aryUV !== null) {
            rtn.bufUVs = this.createBuffer();

            this.bindBuffer(this.ARRAY_BUFFER, rtn.bufUVs);
            this.bufferData(this.ARRAY_BUFFER, new Float32Array(aryUV), this.STATIC_DRAW);
            this.enableVertexAttribArray(ATTR_UV_LOC);
            this.vertexAttribPointer(ATTR_UV_LOC, 2, this.FLOAT, false, 0, 0);
        }

        if (aryInd !== undefined && aryInd !== null) {
            rtn.bufIndex = this.createBuffer();
            rtn.indexCount = aryInd.length;
            this.bindBuffer(this.ELEMENT_ARRAY_BUFFER, rtn.bufIndex);
            this.bufferData(this.ELEMENT_ARRAY_BUFFER, new Uint16Array(aryInd), this.STATIC_DRAW);
            this.bindBuffer(this.ELEMENT_ARRAY_BUFFER, null);
        }

        this.bindVertexArray(null);
        this.bindBuffer(this.ARRAY_BUFFER, null);

        this.mMeshCache[name] = rtn;
        return rtn;
    };

    return gl
}
