// grid shader

// layout是3.0的语法，提前预设好uniform的位置。以前都是getUniformLocation(xx)，返回一个值。
// 不过好像getUniformLocation也是按照你代码顺序，uniformLocation从1慢慢排的
const gridVS = `#version 300 es
    in vec3 a_position;
    layout(location=5) in float a_color;
    
    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;
    uniform mat4 uCameraMatrix;
    uniform vec3 uColor[4];
    
    out lowp vec4 color;

    void main(void){
        color = vec4(uColor[int(a_color)], 1.0);
        gl_Position =uPMatrix * uCameraMatrix * uMVMatrix * vec4(a_position, 1.0 );
    }
`;


const gridFS = `#version 300 es
    precision mediump float;

    in lowp vec4 color;
    out vec4 finalColor;
    
    void main(void){
        finalColor = color;
    }
`;







const cubeVS = `#version 300 es
    in vec4 a_position;	
    in vec2 a_uv;

    uniform mat4 uPMatrix;
    uniform mat4 uMVMatrix;
    uniform mat4 uCameraMatrix;

    out highp vec3 texCoord;  
    
    void main(void){
        texCoord = a_position.xyz;
        gl_Position = uPMatrix * uCameraMatrix * vec4(a_position.xyz, 1.0); 
    }
`;



/*
 * 作者原话。
 * Remember cube map are based on direction. So we don't really need UV
 */
const cubeFS =`#version 300 es
    precision mediump float;
    
    in highp vec3 texCoord;
    
    uniform samplerCube uDayTex;
    uniform samplerCube uNightTex;
    uniform float uTime;
    
    out vec4 finalColor;
    
    void main(void){
        // finalColor = mix(texture(uDayTex, vec3(texCoord.xy, 1.)), texture(uNightTex, vec3(texCoord.xy, 1.)), abs(sin(uTime * .0005)));
        finalColor = mix(texture(uDayTex, texCoord), texture(uNightTex, texCoord), abs(sin(uTime * .0005)));
    }
`;
