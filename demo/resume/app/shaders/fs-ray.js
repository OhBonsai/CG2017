/**
 * Created by Bonsai on 17-3-23.
 */
const fs_ray = `
uniform float time;
uniform float fillVal;

varying vec3 vPos;
varying vec3 vCam;
varying vec3 vNorm;

varying vec2 vUv;


void main(){
  vec3 ro = vPos;
  vec3 rd = normalize(vPos - vCam);
  float sideFade = (2.*abs(vUv.y -.5)/(vUv.x+.0000001)-.5) * 2.;
  float lVal = clamp((fillVal - vUv.x), 0., 1.);
  vec3 col = mix(vec3(0. ), vec3(1. ), 1.-vUv.x);

  gl_FragColor = vec4(col * pow((1.-sideFade), .5), 1);
}
`;

export {fs_ray}