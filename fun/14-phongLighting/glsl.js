const simpleVS = `#version 300 es
    in vec3 a_position;	//Making it a vec4, the w component is used as color index from uColor
    in vec3 a_norm;
    in vec2 a_uv;

    uniform mat4 uPMatrix;
    uniform mat4 uMVMatrix;
    uniform mat4 uCameraMatrix;

    out highp vec2 texCoord;  //Interpolate UV values to the fragment shader
    
    void main(void){
        texCoord = a_uv;
        gl_Position = uPMatrix * uCameraMatrix * uMVMatrix * vec4(a_position.xyz, 1.0); 
    }
`;

const simpleFS = `#version 300 es
    precision mediump float;
    
    in highp vec2 texCoord;		//What pixel to pull from the texture
    uniform sampler2D uMainTex;	//Holds the texture we loaded to the GPU
    
    out vec4 finalColor;
    void main(void){
        finalColor = texture(uMainTex,texCoord);
    }
`;
