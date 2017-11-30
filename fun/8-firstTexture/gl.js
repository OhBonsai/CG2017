const ATTR_POSITION_NAME = 'a_Pos';
const ATTR_POSTION_LOC = 0;

const ATTR_NORMAL_NAME = 'a_Normal';
const ATTR_NORMAL_LOC = 1;

const ATTR_UV_NAME = 'a_Uv';
const ATTR_UV_LOC = 2;


class GlUtil{
    // Convert Hex colors to float Array
    // example: GlUtil.rgbArray('#FF0000', '#FF0000', '#FF0000')
    static rgbArray(){
        if(arguments.length === 0) return null;
        let rtn = [];

        for(let c of arguments){
            if (c.length < 6) continue;
            let p = c[0] === '#' ? 1 : 0;
            rtn.push(
                parseInt(c[p]   +c[p+1], 16) / 255.0,
                parseInt(c[p+2] +c[p+3], 16) / 255.0,
                parseInt(c[p+4] +c[p+5], 16) / 255.0
            )
        }

        return rtn
    }
}


function glInstance(el){
    let gl = document.getElementById(el).getContext("webgl2");
    if(!gl){alert("can't create webgl2 context")}

    gl.mMeshCache = [];
    gl.mTextureCache = [];
    gl.clearColor(1., 1., 1., 1.);

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

    gl.fSetSize = function(w, h){
        this.canvas.style.width = w + 'px';
        this.canvas.style.height = w + 'px';
        this.canvas.width = w;
        this.canvas.height = h;

        this.viewport(0, 0, w, h);
        return this
    };

    gl.fCreateMeshVAO = function(name, aryInd, aryVert, aryNorm, aryUV, vertLen){
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
            this.enableVertexAttribArray(ATTR_POSTION_LOC);
            this.vertexAttribPointer(ATTR_POSTION_LOC, 3, this.FLOAT, false, 0, 0);
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
            this.bindBuffer(this.ELEMENT_ARRAY_BUFFER, null);
        }

        this.bindVertexArray(null);
        this.bindBuffer(this.ARRAY_BUFFER, null);

        this.mMeshCache[name] = rtn;
        return rtn;
    };

    gl.fLoadTexture = function(name, img, doYFlip){
        let tex = this.createTexture();
        // 上下翻转，所有参数可参考https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/pixelStorei
        if(doYFlip === true) this.pixelStorei(this.UNPACK_FLIP_Y_WEBGL, true);

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
        this.mTextureCache[name] = tex;

        if(doYFlip === true) this.pixelStorei(this.UNPACK_FLIP_Y_WEBGL, false);
        return tex
    };

    gl.fFitScreen = function(wp, hp){
        return this.fSetSize(window.innerWidth * (wp || 1),window.innerHeight * (hp || 1));
    };

    return gl
}
