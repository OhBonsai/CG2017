const quadVS = `#version 300 es
    in vec3 a_position;
    in vec2 a_uv;
     
    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;
    uniform mat4 uCameraMatrix;
    
    out highp vec2 texCoord;
    

    void main(void){
        texCoord = a_uv;
        gl_Position =uPMatrix * uCameraMatrix * uMVMatrix * vec4(a_position, 1.0 );
    }
`;

const quadFS = `#version 300 es
    precision mediump float;

    in highp vec2 texCoord;
    
    uniform sampler2D uMainTex;
    out vec4 finalColor;
    
    void main(void){
        finalColor = texture(uMainTex, vec2(texCoord.s, texCoord.t));
    }
`;


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
    in vec3 a_normal;
    in vec2 a_uv;
    
    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;
    uniform mat4 uCameraMatrix;
    uniform vec3 uColor[6];
    uniform float uTime;
    
    out lowp vec4 color;
    out highp vec2 texCoord;
    
    vec3 wrap(vec3 p){
        return p + 0.5 * abs(cos(uTime*0.003 + p.y*2.0 + p.x*2.0 + p.z)) * a_normal;
    }
    
    void main(void){
        texCoord = a_uv;
        color = vec4(uColor[int(a_position.w)], 1.0);
        gl_Position =uPMatrix * uCameraMatrix * uMVMatrix * vec4(wrap(a_position.xyz), 1.0 );
    }
`;



const cubeFS =`#version 300 es
    precision mediump float;
    
    in lowp vec4 color;
    in highp vec2 texCoord;
    
    uniform sampler2D uMainTex;
    
    out vec4 finalColor;
    
    void main(void){
        finalColor = mix(color, texture(uMainTex, texCoord), 0.8f);
    }
`;



const testVS = `#version 300 es
    in vec4 a_position;
    
    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;
    uniform mat4 uCameraMatrix;
    
    void main(void){
        gl_Position =uPMatrix * uCameraMatrix * uMVMatrix * vec4(a_position.xyz, 1.0 );
    }
`;



const testFS =`#version 300 es
    precision mediump float;
    
    out vec4 finalColor;
    
    void main(void){
        finalColor = vec4(0.,0.,0.,1.);
    }
`;


