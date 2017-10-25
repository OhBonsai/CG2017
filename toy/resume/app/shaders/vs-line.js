/**
 * Created by Bonsai on 17-3-23.
 */
const vs_line = `
uniform float thickness;
attribute float lineMiter;
attribute vec2 lineNormal;


void main() {
    vec3 pointPos = position.xyz + vec3(lineNormal*thickness/2.0*lineMiter, 0.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pointPos, 1.0);
}
`;

const vs_dash_line = `
uniform float thickness;
attribute float lineMiter;
attribute vec2 lineNormal;
attribute float lineDistance;
varying float lineU;

void main() {
    lineU = lineDistance;
    vec3 pointPos = position.xyz + vec3(lineNormal * thickness/2.0 * lineMiter, 0.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4( pointPos, 1.0);
}
`;

export {vs_line, vs_dash_line}