// out variables to be interpolated in the rasterizer and sent to each fragment shader:

varying  vec3  vN;	  // normal vector
varying  vec3  vL;	  // vector from point to light
varying  vec3  vE;	  // vector from point to eye
varying  vec2  vST;	  // (s,t) texture coordinates
varying  vec3  vMC;   // model coordinates for hatching

// Uniform for twisting
uniform float uTwist;  // twist angle multiplier

// where the light is:
const vec3 LightPosition = vec3(  0., 5., 5. );

// Rotation functions for twisting
vec3
RotateX( vec3 xyz, float radians )
{
	float c = cos(radians);
	float s = sin(radians);
	vec3 newxyz = xyz;
	newxyz.yz = vec2(
		dot( xyz.yz, vec2( c,-s) ),
		dot( xyz.yz, vec2( s, c) )
	);
	return newxyz;
}

vec3
RotateY( vec3 xyz, float radians )
{
	float c = cos(radians);
	float s = sin(radians);
	vec3 newxyz = xyz;
	newxyz.xz = vec2(
		dot( xyz.xz, vec2( c,s) ),
		dot( xyz.xz, vec2(-s,c) )
	);
	return newxyz;
}

vec3
RotateZ( vec3 xyz, float radians )
{
	float c = cos(radians);
	float s = sin(radians);
	vec3 newxyz = xyz;
	newxyz.xy = vec2(
		dot( xyz.xy, vec2( c,-s) ),
		dot( xyz.xy, vec2( s, c) )
	);
	return newxyz;
}

void
main( )
{
	// Store the original vertex position for model coordinates
	vec3 originalPosition = gl_Vertex.xyz;
	vMC = originalPosition;
	
	// Store texture coordinates
	vST = gl_MultiTexCoord0.st;
	
	// Apply twisting around Y axis
	// The twist angle is proportional to the distance from the axis
	float distanceFromAxis = length(originalPosition.xz); // Distance from Y axis
	float twistAngle = uTwist * distanceFromAxis;
	
	// Apply twist transformation
	vec4 twistedVertex = gl_Vertex;
	twistedVertex.xyz = RotateY(originalPosition, twistAngle);
	
	// Calculate normal for the twisted object
	vec3 twistedNormal = gl_Normal;
	if(length(twistedNormal) > 0.0)
	{
		// Apply similar transformation to the normal
		twistedNormal = RotateY(twistedNormal, twistAngle);
		twistedNormal = normalize(twistedNormal);
	}
	

	vec4 ECposition = gl_ModelViewMatrix * vec4(twistedVertex.xyz, 1.0);
	vN = normalize(gl_NormalMatrix * twistedNormal);
	vL = LightPosition - ECposition.xyz;
	vE = vec3(0., 0., 0.) - ECposition.xyz;
	
	gl_Position = gl_ModelViewProjectionMatrix * vec4(twistedVertex.xyz, 1.0);
}