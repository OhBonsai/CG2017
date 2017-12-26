const simpleVS = `#version 300 es
    in vec4 a_position;
    in vec2 a_uv;
    
    uniform mat4 uPMatrix;
    uniform mat4 uMVMatrix;
    uniform mat4 uCameraMatrix;
    
    out highp vec2 texCoord;
    
    void main(void){
        texCoord = a_uv;
        gl_Position = uPMatrix * uCameraMatrix * uMVMatrix * vec4(a_position.xyz, 1.0);
    }
`;

const simpleFS = `#version 300 es
    precision mediump float;
    
    in highp vec2 texCoord;		
    uniform sampler2D uMainTex;	
    
    out vec4 finalColor;
    void main(void){
        // finalColor = texture(uMainTex,texCoord);
        finalColor = vec4(1., 0., 0., 1.);
    }
`;