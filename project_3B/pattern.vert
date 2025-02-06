uniform float uA;   
uniform float uP;   

varying vec3 vN;
varying vec3 vL;
varying vec3 vE;
varying vec2 vST;
varying vec3 vMC;

const vec3 LightPosition = vec3(0., 5., 5.);
const float Y0 = 1.0;  // top of curtain

void main()
{
    vST = gl_MultiTexCoord0.st;
    
    // Pleating effect
    vec4 vert = gl_Vertex;
    vert.z = uA * (Y0 - vert.y) * sin(2.0 * 3.14159 * vert.x / uP);
    vMC = vert.xyz;
    
    float dzdx = uA * (Y0 - vert.y) * (2.0 * 3.14159 / uP) * cos(2.0 * 3.14159 * vert.x / uP);
    float dzdy = -uA * sin(2.0 * 3.14159 * vert.x / uP);
    vec3 Tx = vec3(1., 0., dzdx);
    vec3 Ty = vec3(0., 1., dzdy);
    vec3 normal = normalize(cross(Tx, Ty));
    
    vec4 ECposition = gl_ModelViewMatrix * vert;
    vN = normalize(gl_NormalMatrix * normal);
    vL = LightPosition - ECposition.xyz;
    vE = vec3(0., 0., 0.) - ECposition.xyz;
    
    gl_Position = gl_ModelViewProjectionMatrix * vert;
}