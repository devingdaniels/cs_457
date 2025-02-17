varying vec3 vRefractVector;
uniform float uR1, uR2;
uniform vec2 uLensCenter;
uniform float uLensRadius;
const float ETA = 0.66;
const vec3 EYE = vec3(0., 0., 0.);

varying vec2 vST;       
varying vec3 vPosition; 

void main()
{
    vec3 P = vec3(gl_ModelViewMatrix * gl_Vertex);
    vPosition = P; 
    vST = gl_MultiTexCoord0.st;
    
    vec3 FromEyeToPt = normalize(P - EYE);
    
    vec3 Center1 = vec3(0., 0., P.z - uR1);
    vec3 Normal1;
    if(uR1 >= 0.)
        Normal1 = normalize(P - Center1);
    else
        Normal1 = normalize(Center1 - P);
        
    vec3 v1 = refract(FromEyeToPt, Normal1, ETA);
    v1 = normalize(v1);
    
    vec3 Center2 = vec3(0., 0., P.z + uR2);
    vec3 Normal2;
    if(uR2 >= 0.)
        Normal2 = normalize(Center2 - P);
    else
        Normal2 = normalize(P - Center2);
        
    vRefractVector = refract(v1, Normal2, 1./ETA);
    gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
}