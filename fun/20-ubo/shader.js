class ShaderBuilder {
    constructor(gl, vs, fs){
        this.program = ShaderUtil.createProgram(gl, vs, fs, true);
        if(this.program !== null){
            this.gl = gl;
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
            this.gl.uniformBlockBinding(this.program, arguments[i+1], arguments[i].blockPoint);
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
            tex = this.gl.mTextureCache[arguments[i+1]];
            if(tex === undefined){
                console.log("Texture not found in cache " + arguments[i+1]);
                continue;
            }

            loc = this.gl.getUniformLocation(this.program, arguments[i]);
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
                    this.gl.uniform2fv(this.mUniformList[name].loc, new Float32Array(arguments[i+1]));
                    break;
                case "3fv":
                    this.gl.uniform3fv(this.mUniformList[name].loc, new Float32Array(arguments[i+1]));
                    break;
                case "4fv":
                    this.gl.uniform4fv(this.mUniformList[name].loc, new Float32Array(arguments[i+1]));
                    break;
                case "mat4":
                    this.gl.uniformMatrix4fv(this.mUniformList[name].loc, false, arguments[i+1]);
                    break;
                default:
                    console.log("unknown uniform type for " + name);
                    break;

            }
        }

        return this;
    }

    activate(){
        this.gl.useProgram(this.program);
        return this;
    }

    deactivate(){
        this.gl.useProgram(null);
        return this;
    }

    dispose(){
        if(this.gl.getParameter(this.gl.CURRENT_PROGRAM) === this.program){
            this.gl.useProgram(null);
        }
        this.gl.deleteProgram(this.program);
    }

    preRender(){
        this.gl.useProgram(this.program);
        if(arguments.length > 0){
            this.setUniforms.apply(this, arguments);
        }

        if(this.mTextureList.length > 0){
            let texSlot;
            for(let i=0; i<this.mTextureList.length; i++){
                texSlot = this.gl["TEXTURE" + i];
                this.gl.activeTexture(texSlot);
                this.gl.bindTexture(this.gl.TEXTURE_2D, this.mTextureList[i].tex);
                this.gl.uniform1i(this.mTextureList[i].loc, i);
            }
        }

        return this;
    }

    renderModel(model, doShaderClose){
        this.setUniforms("uMVMatrix", model.transform.getViewMatrix());
        this.gl.bindVertexArray(model.mesh.vao);

        if(model.mesh.noCulling || this.noCulling){
            this.gl.disable(this.gl.CULL_FACE);
        }

        if(model.mesh.doBlending || this.doBlending){
            this.gl.enable(this.gl.BLEND);
        }

        if(model.mesh.indexCount){
            this.gl.drawElements(model.mesh.drawMode, model.mesh.indexCount, gl.UNSIGNED_SHORT, 0);
        }else{
            this.gl.drawArrays(model.mesh.drawMode, 0, model.mesh.vertexCount);
        }

        this.gl.bindVertexArray(null);
        if(model.mesh.noCulling || this.noCulling) this.gl.enable(this.gl.CULL_FACE);
        if(model.mesh.doBlending || this.doBlending) this.gl.disable(this.gl.BLEND);

        if(doShaderClose) this.gl.useProgram(null);
        return this;

    }
}


class Shader {
    constructor(gl, vS, fS){
        this.program = ShaderUtil.createProgram(gl, vS, fS, true);

        if(this.program !== null){
            this.gl = gl;
            gl.useProgram(this.program);
            this.attribLoc = ShaderUtil.getStandardAttribLocations(gl, this.program);
            this.uniformLoc = ShaderUtil.getStandardUniformLocations(gl, this.program);
        }
    }

    activate() {
        this.gl.useProgram(this.program);
        return this;
    }

    deactivate(){
        this.gl.useProgram(null);
        return this;
    }

    setPerspective(matData) {
        this.gl.uniformMatrix4fv(this.uniformLoc.perspective, false, matData);
        return this;
    }

    setModelMatrix(matData) {
        this.gl.uniformMatrix4fv(this.uniformLoc.modelMatrix, false, matData);
        return this;
    }

    setCameraMatrix(matData) {
        this.gl.uniformMatrix4fv(this.uniformLoc.cameraMatrix, false, matData);
        return this;
    }

    dispose(){
        if(this.gl.getParameter(this.gl.CURRENT_PROGRAM) === this.program){
            this.gl.useProgram(null);
        }
        this.gl.deleteProgram(this.program);
    }

    preRender(){}

    renderModel(model){
        this.setModelMatrix(model.transform.getViewMatrix());
        this.gl.bindVertexArray(model.mesh.vao);

        if(model.mesh.noCulling) this.gl.disable(this.gl.CULL_FACE);
        if(model.mesh.doBlending) this.gl.enable(this.gl.BLEND);

        if(model.mesh.indexCount){
            this.gl.drawElements(model.mesh.drawMode, model.mesh.indexCount, gl.UNSIGNED_SHORT, 0);
        }else{
            this.gl.drawArrays(model.mesh.drawMode, 0, model.mesh.vertexCount);
        }

        this.gl.bindVertexArray(null);
        if(model.mesh.noCulling) this.gl.enable(this.gl.CULL_FACE);
        if(model.mesh.doBlending) this.gl.disable(this.gl.BLEND);
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

    constructor(gl, blockName, blockPoint, bufSize, aryCalc){
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

        this.gl = gl;
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

        this.gl.bindBuffer(this.gl.UNIFORM_BUFFER, this.buf);
        this.gl.bufferSubData(this.gl.UNIFORM_BUFFER, this.items[name].offset, data, 0, null);
        this.gl.bindBuffer(this.gl.UNIFORM_BUFFER, null);
        return this;
    }

    static create(gl, blockName, blockPoint, ary){
        let bufSize = UBO.calculate(ary);
        UBO.Cache[blockName] = new UBO(gl, blockName, blockPoint, bufSize, ary);
        UBO.debugVisualize(UBO.Cache[blockName])
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

UBO.Cache = [];