/**
 * Created by Bonsai on 17-3-23.
 */
const vs_ray = `
uniform mat4 iModelMat;
uniform float fillVal;

varying vec3 vPos;
varying vec3 vNorm;
varying vec3 vCam;

varying vec2 vUv;



void main(){
  vUv = uv;
  vPos = position;
  vNorm = normal;

  vec3 fPos = position * fillVal;
  vCam = (iModelMat * vec4(cameraPosition, 1.)).xyz;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( fPos , 1.);
}
`;

export {vs_ray}