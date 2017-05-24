/**
 * Created by Bonsai on 17-3-23.
 */
const fs_gem = ` 
uniform float time;
uniform sampler2D t_iri;
uniform sampler2D t_text;
uniform sampler2D t_audio;

varying vec3 vPos;
varying vec3 vCam;
varying vec3 vNorm;

varying vec2 vUv;

uniform float breakingVal;
uniform float bwVal;


const float MAX_TRACE_DISTANCE = 2.0;             // max trace distance
const float INTERSECTION_PRECISION = 0.01;        // precision of the intersection
const int NUM_OF_TRACE_STEPS = 100;
const float PI = 3.14159;


// import noise from 'glsl-noise/simplex/3d';
// Taken from https://www.shadertoy.com/view/4ts3z2
float tri(in float x) {
    return abs(fract(x)-.5);
}

vec3 tri3(in vec3 p) {
    return vec3(tri(p.z+tri(p.y*1.)), tri(p.z+tri(p.x*1.)), tri(p.y+tri(p.x*1.)));
}

float triNoise3D(in vec3 p, in float spd) {
    float z=1.4;
    float rz = 0.;
    vec3 bp = p;
    for(float i=0.; i<=3.; i++){
        vec3 dg = tri3(bp*2.);
        p += (dg+time*.1*spd);
        bp *= 1.8;
        z *= 1.5;
        p *= 1.2;
        rz+= (tri(p.z+tri(p.x+tri(p.y))))/z;
        bp += 0.14;
    }
  return rz;
}

float noiseFunction( vec3 pos ){
  return triNoise3D( pos * 1.1 , 1. );
}



vec3 hsv(float h, float s, float v)
{
    return mix( vec3( 1.0 ), clamp(
        (abs(fract(h + vec3( 3.0, 2.0, 1.0 ) / 3.0 ) * 6.0 - 3.0 ) - 1.0 ),
        0.0,
        1.0), s) * v;
}


void main(){
  vec3 ro = vPos;
  vec3 rd = normalize(vPos-vCam);

  vec3 col = vec3(0. );
  vec3 lightPos = vCam + vec3(1. , 1. ,0.);
  vec3 lightDir = normalize(lightPos - ro);
  vec3 refl = reflect(lightDir, vNorm);

  float match = dot(refl, rd );
  for(int i=0; i<5; i++){
    vec3 pos = ro + .04 * rd * float(i);
    float den = noiseFunction( pos );
    vec3 rainbow = hsv(den * 3. , .7 , 1.);
    vec3 dark = vec3(den * den * den * 10.);
    col += mix(rainbow, dark, bwVal);
  }
  col /= 4.;
  col += vec3(1., .6 ,.2) * pow(match, 20.);
  gl_FragColor = vec4(col, 1);
}
`;

export {fs_gem}

