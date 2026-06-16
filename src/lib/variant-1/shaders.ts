export const cylinderVertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec3 position;
  
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const cylinderFragment = /* glsl */ `
  precision highp float;

  uniform sampler2D tMap;
  uniform float uDarkness; // 0.0 = normal, 1.0 = fully black

  varying vec2 vUv;

  void main() {
    vec4 tex = texture2D(tMap, vUv);

    // Discard transparent gap pixels so they don't write to the depth buffer
    if (tex.a < 0.1) {
      discard;
    }

    // Darken the texture
    tex.rgb *= (1.0 - uDarkness);

    // Additional darkening for the back side of the carousel to create depth
    if (!gl_FrontFacing) {
      tex.rgb *= 0.4;
    }

    gl_FragColor = tex;
  }
`;

export const particleVertex = /* glsl */ `
  attribute vec3 position;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const particleFragment = /* glsl */ `
  precision highp float;
  uniform vec3 uColor;
  uniform float uOpacity;
  
  void main() {
    gl_FragColor = vec4(uColor, uOpacity);
  }
`;

export const yellowLineFragment = /* glsl */ `
  precision highp float;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;
  
  void main() {
    // Soft vertical fade at the top and bottom of the line
    float vertFade = smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.85, vUv.y);
    gl_FragColor = vec4(uColor, uOpacity * vertFade);
  }
`;

