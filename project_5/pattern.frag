uniform sampler2D uTexUnit;
varying vec2 vST;

void main()
{
    gl_FragColor = texture2D(uTexUnit, vST);
}