/**
 * Created by bonsai on 3/26/17.
 */
const vs_heart = `
 varying vec2 vUv;

 void main() {
     vUv = uv;
     gl_Position = projectionMatrix * modelViewMatrix * vec4( position.xyz, 1.0 );
 }
`;

export {vs_heart}