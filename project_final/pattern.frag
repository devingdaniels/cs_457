// lighting uniform variables -- these can be set once and left alone:
uniform float   uKa, uKd, uKs;	 // coefficients of each type of lighting -- make sum to 1.0
uniform vec3    uColor;		 // object color
uniform vec3    uSpecularColor;	 // light color
uniform float   uShininess;	 // specular exponent

// square-equation uniform variables -- these should be set every time Display( ) is called:
uniform float   uS0, uT0, uD;

// hatching parameters
uniform float   uHatchFreq;     // frequency of hatching lines
uniform float   uHatchWidth;    // width of hatching lines

// in variables from the vertex shader and interpolated in the rasterizer:
varying  vec3  vN;		   // normal vector
varying  vec3  vL;		   // vector from point to light
varying  vec3  vE;		   // vector from point to eye
varying  vec2  vST;		   // (s,t) texture coordinates
varying  vec3  vMC;           // model coordinates


float SmoothPulse(float left, float right, float value, float tol)
{
    float t = smoothstep(left-tol, left+tol, value) - 
              smoothstep(right-tol, right+tol, value);
    return t;
}

void
main()
{
    float s = vST.s;
    float t = vST.t;

    // Determine hatching lines based on texture coordinates
    // Using the s coordinate for hatching direction
    float hatchFreq = 20.0;  // frequency of hatching lines
    float hatchWidth = 0.05; // width of hatching lines
    
    // Calculate hatching
    float smod = mod(s * hatchFreq, 1.0);
    float hatchPattern = SmoothPulse(0.0, hatchWidth, smod, 0.01);
    
    // Apply hatching to the base color
    vec3 myColor = mix(uColor, vec3(0.8 * uColor), hatchPattern);
    
    // Apply the per-fragment lighting to myColor:
    vec3 Normal = normalize(vN);
    vec3 Light  = normalize(vL);
    vec3 Eye    = normalize(vE);

    vec3 ambient = uKa * myColor;

    float dd = max(dot(Normal, Light), 0.);       // only do diffuse if the light can see the point
    vec3 diffuse = uKd * dd * myColor;

    float ss = 0.;
    if(dot(Normal, Light) > 0.)	      // only do specular if the light can see the point
    {
        vec3 ref = normalize(reflect(-Light, Normal));
        ss = pow(max(dot(Eye, ref), 0.), uShininess);
    }
    vec3 specular = uKs * ss * uSpecularColor;
    
    gl_FragColor = vec4(ambient + diffuse + specular, 1.);
}