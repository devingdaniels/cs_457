// lighting uniform variables -- these can be set once and left alone:
uniform float   uKa, uKd, uKs;	 // coefficients of each type of lighting -- make sum to 1.0
uniform vec3    uColor;		 // object color
uniform vec3    uSpecularColor;	 // light color
uniform float   uShininess;	 // specular exponent

// square-equation uniform variables -- these should be set every time Display( ) is called:
uniform float   uS0, uT0, uD;
uniform float   uTime;        // animation parameter (0-1)

// in variables from the vertex shader and interpolated in the rasterizer:
varying  vec3  vN;		   // normal vector
varying  vec3  vL;		   // vector from point to light
varying  vec3  vE;		   // vector from point to eye
varying  vec2  vST;		   // (s,t) texture coordinates

// Function to create repeating scale pattern
float scalePattern(vec2 uv, float size) {
    // Create repeating diamond/scale pattern
    vec2 tiles = mod(uv * size, 1.0);
    tiles = abs(tiles - 0.5) * 2.0;
    float pattern = 1.0 - max(tiles.x, tiles.y);
    return smoothstep(0.0, 0.15, pattern);
}

void
main( )
{
	float s = vST.s;
	float t = vST.t;
	
	// Base scale size
	float scaleSize = 10.0;
	
	// Create animated scales by shifting UV coordinates based on time
	vec2 animatedUV = vST + vec2(0.0, uTime * 0.2);
	

	float bigScales = scalePattern(animatedUV, scaleSize);
	float medScales = scalePattern(animatedUV, scaleSize * 2.0);
	float smallScales = scalePattern(animatedUV, scaleSize * 4.0);
	

	float scales = bigScales * 0.7 + medScales * 0.2 + smallScales * 0.1;
	

	float iridescence = dot(normalize(vN), normalize(vE));
	iridescence = pow(1.0 - abs(iridescence), 2.0);
	

	vec3 baseColor = uColor;
	vec3 iridColor1 = vec3(0.0, 0.5, 0.8); // Blue
	vec3 iridColor2 = vec3(0.0, 0.8, 0.4); // Green
	vec3 iridColor3 = vec3(0.8, 0.0, 0.6); // Purple
	
	// Mix colors based on time and scales
	float t1 = sin(uTime * 3.0) * 0.5 + 0.5;
	float t2 = sin(uTime * 3.0 + 2.0) * 0.5 + 0.5;
	
	vec3 shiftColor = mix(iridColor1, iridColor2, t1);
	shiftColor = mix(shiftColor, iridColor3, t2);
	

	vec3 myColor = mix(baseColor, shiftColor, scales * iridescence * 0.8);
	

	float scaleEdge = (1.0 - bigScales) * bigScales * 10.0;
	scaleEdge = smoothstep(0.0, 1.0, scaleEdge);
	

	scaleEdge *= (sin(uTime * 6.0) * 0.5 + 0.5);
	
	myColor += vec3(1.0) * scaleEdge * 0.5;

	vec3 Normal = normalize(vN);
	vec3 Light  = normalize(vL);
	vec3 Eye    = normalize(vE);

	vec3 ambient = uKa * myColor;

	float dd = max(dot(Normal, Light), 0.);
	vec3 diffuse = uKd * dd * myColor;

	float ss = 0.;
	if(dot(Normal, Light) > 0.) {
		vec3 ref = normalize(reflect(-Light, Normal));
		ss = pow(max(dot(Eye, ref), 0.), uShininess);
	}
	
	// Apply scale pattern to specular highlights
	vec3 specular = uKs * ss * uSpecularColor * (scales + 0.5);
	

	float rim = 1.0 - max(dot(Normal, Eye), 0.0);
	rim = pow(rim, 3.0);
	vec3 rimColor = shiftColor * rim * (sin(uTime * 4.0) * 0.5 + 0.5);
	
	gl_FragColor = vec4(ambient + diffuse + specular + rimColor, 1.);
}