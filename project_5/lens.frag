#version 120

uniform sampler2D uTexUnit;
uniform vec2 uLensCenter;
uniform float uLensRadius;
uniform float uWhirl;
uniform float uMag;
uniform int uMosaic;

varying vec3 vRefractVector;
varying vec2 vST;
varying vec3 vPosition;

void main()
{
    // Calculate distance from current fragment to lens center in texture space
    vec2 st = vST - uLensCenter;  // make (0,0) the center of the circle
    float dist = length(st);
    
    // If outside the lens radius, do normal texture lookup
    if(dist > uLensRadius)
    {
        vec3 rgb = texture2D(uTexUnit, vST).rgb;
        gl_FragColor = vec4(rgb, 1.);
    }
    else
    {
        // Magnifying
        float r = length(st);
        float rPrime = r / uMag;  // divide by magnification to zoom in
        
        // Whirling
        float theta = atan(st.t, st.s);
        float thetaPrime = theta - uWhirl * rPrime;
        
        // Restore coordinates
        st = rPrime * vec2(cos(thetaPrime), sin(thetaPrime));
        st += uLensCenter;  // move back to original position
        
        // Mosaic effect
        if(uMosaic > 1)
        {
            // Calculate block position
            float blockWidth = 1.0 / float(uMosaic);
            float s = st.s * float(uMosaic);
            float t = st.t * float(uMosaic);
            
            // Get block indices
            float blockS = floor(s);
            float blockT = floor(t);
            
            // Calculate block center
            st.s = (blockS + 0.5) * blockWidth;
            st.t = (blockT + 0.5) * blockWidth;
        }
        
        // Final texture lookup
        vec3 rgb = texture2D(uTexUnit, st).rgb;
        gl_FragColor = vec4(rgb, 1.);
    }
}