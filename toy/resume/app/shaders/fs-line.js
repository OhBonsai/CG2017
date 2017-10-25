/**
 * Created by Bonsai on 17-3-23.
 */
const fs_line = `
uniform vec3 diffuse;
uniform float opacity;

void main(){
    gl_FragColor = vec4(diffuse, opacity);
}
`;

const fs_dash_line = `
varying float lineU;

uniform float opacity;
uniform vec3 diffuse;
uniform float dashSteps;
uniform float dashSmooth;
uniform float dashDistance;

void main() {
    float lineUMod = mod(lineU, 1.0/dashSteps) * dashSteps;
    float dash = smoothstep(dashDistance, dashDistance+dashSmooth, length(lineUMod-0.5));
    gl_FragColor = vec4(diffuse * vec3(dash), opacity * dash);
}
`;

export {fs_line, fs_dash_line}