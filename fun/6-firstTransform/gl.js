const ATTR_POSITION_NAME = 'a_Pos';
const ATTR_POSTION_LOC = 0;

const ATTR_NORMAL_NAME = 'a_Normal';
const ATTR_NORMAL_LOC = 1;

const ATTR_UV_NAME = 'a_Uv';
const ATTR_UV_LOC = 2;

function glInstance(el){
    let gl = document.getElementById(el).getContext("webgl2");

    if(!gl){alert("can't create webgl2 context")}

    gl.mMeshCache = [];
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

    gl.fCreateMeshVAO = function(name, aryInd, aryVert, aryNorm, aryUV){
        let rtn = {
            drawMode: this.TRIANGLES
        };

        rtn.vao = this.createVertexArray();
        this.bindVertexArray(rtn.vao);

        if(aryVert !== undefined && aryVert !== null){
            rtn.bufVertices = this.createBuffer();
            rtn.vertexComponentLen = 3;
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

    return gl
}
