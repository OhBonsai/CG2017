/**
 * Created by bonsai on 3/26/17.
 */
const fs_heart = `
// Token from https://www.shadertoy.com/view/XsfGRn
varying vec2 vUv;
uniform float time;

void main(){
    vec2 p = (2.0*vUv-vec2(1.0, 1.0))/1.0;
    
    // vec3 bcol = vec3(1.0,0.8,0.7-0.07*p.y)*(1.0-0.25*length(p));
    vec3 bcol = vec3(0., 0., 0.);
    
    float tt = mod(time,1.5)/1.5;
    float ss = pow(tt,.2)*0.5 + 0.5;
    ss = 1.0 + ss*0.5*sin(tt*6.2831*3.0 + p.y*0.5)*exp(-tt*4.0);
    p *= vec2(0.5,1.5) + ss*vec2(0.5,-0.5);
    
    // shape
#if 1
    p *= 0.6;
    p.y = -0.1 - p.y*1.2 + abs(p.x)*(1.0-abs(p.x));
    float r = length(p);
	float d = 0.5;
#else
	p.y -= 0.25;
    float a = atan(p.x,p.y)/3.141593;
    float r = length(p);
    float h = abs(a);
    float d = (13.0*h - 22.0*h*h + 10.0*h*h*h)/(6.0-5.0*h);
#endif

	// color
	float s = 0.75 + 0.75*p.x;
	s *= 1.0-0.4*r;
	s = 0.3 + 0.7*s;
	s *= 0.5+0.5*pow( 1.0-clamp(r/d, 0.0, 1.0 ), 0.1 );
	vec3 hcol = vec3(1.0,0.5*r,0.3)*s;
	vec3 col = mix( bcol, hcol, smoothstep( -0.01, 0.01, d-r) );
    gl_FragColor = vec4(col,1.0);    
}
`;

const fs_3d_heart = `
// token from http://mathworld.wolfram.com/HeartSurface.html
varying vec2 vUv;
uniform float time;

float f(vec3 p) {
    vec3 pp = p * p;
    vec3 ppp = pp * p;
    float a = pp.x + 2.25 * pp.y + pp.z - 1.0;
    return a * a * a - (pp.x + 0.1125 * pp.y) * ppp.z;
}

// Bisection solver for y
float h(float x, float z) {
    float a = 0.0, b = 0.75, y = 0.5;
    for (int i = 0; i < 10; i++) {
        if (f(vec3(x, y, z)) <= 0.0)
            a = y;
        else
            b = y;
        y = (a + b) * 0.5;
    }
    return y;
}

vec3 normal(vec2 p) {
    vec3 v = vec3(p.x, h(p.x, p.y), p.y);
    vec3 vv = v * v;
    vec3 vvv = vv * v;
    float a = -1.0 + dot(vv, vec3(1, 2.25, 1));
   	a *= a;
    
  	return normalize(vec3(
        -2.0 * v.x * vvv.z +  6.0 * v.x * a,
      -0.225 * v.y * vvv.z + 13.5 * v.y * a,
      v.z * (-3.0 * vv.x * v.z - 0.3375 * vv.y * v.z + 6.0 * a)));
}

void main() {
	vec3 p = vec3((2.0 * vUv.xy - vec2(1., 1.)) / 1.0, 0.);
    
    float s = sin(time * 5.0);
    s *= s;
    s *= s;
    s *= 0.1;
    vec3 tp = p * vec3(1.0 + s, 1.0 - s, 0.0) * 2.0;
    
    vec3 c;
    if (f(tp.xzy) <= 0.0) {
        vec3 n = normal(tp.xy);
        float diffuse = dot(n, normalize(vec3(-1, 1, 1))) * 0.5 + 0.5;
        float specular = pow(max(dot(n, normalize(vec3(-1, 2, 1))), 0.0), 64.0);
        float rim = 1.0 - dot(n, vec3(0.0, 1.0, 0.0));
        c = diffuse * vec3(1.0, 0, 0) + specular * vec3(0.8) + rim * vec3(0.5);
    }
	else
        c = vec3(1.0, 0.8, 0.7 - 0.07 * p.y) * (1.0 - 0.15 * length(p));
    
	gl_FragColor = vec4(c, 1);
}
`;

export {fs_heart, fs_3d_heart}