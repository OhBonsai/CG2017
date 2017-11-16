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




}