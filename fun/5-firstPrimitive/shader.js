class Shader {
    constructor(gl, vS, fS){
        this.program = ShaderUtil.createProgram(gl, vS, fS, true);

        if(this.program !== null){
            this.gl = gl;
            gl.useProgram(this.program);
            this.attribLoc = ShaderUtil.getStandardAttribLocation(gl, this.program);
            this.uniformLoc = {

            }
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

    dispose(){
        if(this.gl.getParameter(this.gl.CURRENT_PROGRAM) === this.program){
            this.gl.useProgram(null);
        }
        this.gl.deleteProgram(this.program);
    }

    preRender(){}

    renderModel(model){
        this.gl.bindVertexArray(model.mesh.vao);
        if(model.mesh.indexCount){
            this.gl.drawElements(model.mesh.drawMode, model.mesh.indexLength, gl.UNSIGNED_SHORT, 0);
        }else{
                this.gl.drawArrays(model.mesh.drawMode, 0, model.mesh.vertexCount);
        }

        this.gl.bindVertexArray(null);
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
        gl.bindAttribLocation(program, ATTR_POSTION_LOC, ATTR_POSITION_NAME);
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

    static getStandardAttribLocation(gl, program){
        return {
            position:   gl.getAttribLocation(program, ATTR_POSITION_NAME),
            normal:     gl.getAttribLocation(program, ATTR_NORMAL_NAME),
            uv:         gl.getAttribLocation(program, ATTR_UV_NAME),
        }
    }

}