uniform float uKa, uKd, uKs;
uniform float uShininess;
uniform float uAd, uBd;
uniform float uTol;
uniform float uNoiseAmp;
uniform float uNoiseFreq;
uniform sampler3D Noise3;

varying vec2 vST;
varying vec3 vN;
varying vec3 vL;
varying vec3 vE;
varying vec3 vMC;

const vec3 OBJECTCOLOR = vec3(0.2, 0.35, 0.4);
const vec3 ELLIPSECOLOR = vec3(0.4, 0.7, 1.0);
const vec3 SPECULARCOLOR = vec3(1., 1., 1.);

void main()
{
    // Sample noise and convert to [-1,1] range
    vec4 nv = texture3D(Noise3, uNoiseFreq * vec3(vST, 0.));
    float n = nv.r + nv.g + nv.b + nv.a;    // 1. -> 3.
    n = (n - 2.);                           // -1. -> 1.
    n *= uNoiseAmp;                         // scale by noise amplitude

    // Apply noise to texture coordinates
    vec2 st = vST;
    st.s += n;
    st.t += n;

    vec3 myColor = OBJECTCOLOR;
    
    // Calculate ellipse parameters
    float Ar = uAd/2.;
    float Br = uBd/2.;

    float numbersInS = floor(st.s / uAd);
    float numbersInT = floor(st.t / uBd);

    float sCenter = numbersInS * uAd + Ar;
    float tCenter = numbersInT * uBd + Br;

    // Calculate ellipse equation with noise-perturbed coordinates
    float ellipse = pow((st.s - sCenter)/Ar, 2.) + pow((st.t - tCenter)/Br, 2.);
    float t = smoothstep(1. - uTol, 1. + uTol, ellipse);
    myColor = mix(ELLIPSECOLOR, OBJECTCOLOR, t);

    // Lighting calculations
    vec3 Normal = normalize(vN);
    vec3 Light = normalize(vL);
    vec3 Eye = normalize(vE);

    vec3 ambient = uKa * myColor;

    float dd = max(dot(Normal, Light), 0.);
    vec3 diffuse = uKd * dd * myColor;

    float s = 0.;
    if(dd > 0.)
    {
        vec3 ref = normalize(reflect(-Light, Normal));
        float cosphi = dot(Eye, ref);
        if(cosphi > 0.)
            s = pow(max(cosphi, 0.), uShininess);
    }
    vec3 specular = uKs * s * SPECULARCOLOR;

    gl_FragColor = vec4(ambient + diffuse + specular, 1.);
}