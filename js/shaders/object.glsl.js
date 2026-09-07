/* ==========================================================================
   object.glsl.js — shaders for the 3D objects that sit in real space.

   1. `displaced`  A noise-displaced sphere (the hero "world"): vertex noise
                   pushes the surface along its normal; the fragment shader
                   is a fresnel rim over a two-colour ramp keyed to displacement.
   2. `points`     A depth-parallaxed particle field used behind the hero and
                   on interior pages, with soft round sprites drawn in-shader
                   (no texture fetch, so nothing extra to load).
   ========================================================================== */
window.GEO = window.GEO || {};
GEO.shaders = GEO.shaders || {};

GEO.shaders.displaced = {
  vertex: GEO.shaders.noise + `
    uniform float uTime;
    uniform float uAmp;      // displacement amplitude
    uniform float uFreq;     // noise frequency
    uniform float uHover;    // 0..1, eased pointer proximity
    varying float vDisp;
    varying vec3  vNormalV;
    varying vec3  vViewDir;

    void main() {
      /* Two octaves travelling at different rates keeps the surface from
         looking like it is simply pulsing. */
      float n1 = snoise(position * uFreq + vec3(0.0, 0.0, uTime * 0.22));
      float n2 = snoise(position * uFreq * 2.4 + vec3(uTime * 0.35));
      float d  = n1 * 0.68 + n2 * 0.32;
      vDisp = d;

      vec3 displaced = position + normal * d * uAmp * (1.0 + uHover * 0.55);

      vec4 mv = modelViewMatrix * vec4(displaced, 1.0);
      vNormalV = normalize(normalMatrix * normal);
      vViewDir = normalize(-mv.xyz);
      gl_Position = projectionMatrix * mv;
    }
  `,

  fragment: `
    uniform vec3  uColorA;
    uniform vec3  uColorB;
    uniform vec3  uRim;
    uniform float uOpacity;
    varying float vDisp;
    varying vec3  vNormalV;
    varying vec3  vViewDir;

    void main() {
      float fres = pow(1.0 - clamp(dot(normalize(vNormalV), normalize(vViewDir)), 0.0, 1.0), 2.6);
      vec3 col = mix(uColorA, uColorB, smoothstep(-0.55, 0.65, vDisp));
      col += uRim * fres * 1.15;
      gl_FragColor = vec4(col, uOpacity);
    }
  `
};

GEO.shaders.points = {
  vertex: GEO.shaders.noise + `
    uniform float uTime;
    uniform float uSize;
    uniform float uScroll;
    uniform vec2  uMouse;
    attribute float aScale;
    attribute float aSeed;
    varying float vFade;

    void main() {
      vec3 pos = position;

      /* Slow drift, each particle on its own phase. */
      pos.x += sin(uTime * 0.16 + aSeed * 6.28) * 0.35;
      pos.y += cos(uTime * 0.12 + aSeed * 4.19) * 0.35;

      /* Depth parallax: particles further back move less with scroll and
         pointer, which reads as real distance rather than a flat layer. */
      float depth = smoothstep(-14.0, 2.0, pos.z);
      pos.y += uScroll * 9.0 * depth;
      pos.xy += uMouse * 1.6 * depth;

      vec4 mv = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = uSize * aScale * (26.0 / max(-mv.z, 0.6));

      /* Fade the far field out so the horizon dissolves instead of ending. */
      vFade = smoothstep(-22.0, -4.0, mv.z) * 0.85;
    }
  `,

  fragment: `
    uniform vec3 uColor;
    varying float vFade;

    void main() {
      /* Soft round sprite generated in-shader. */
      vec2 c = gl_PointCoord - 0.5;
      float d = length(c);
      float a = smoothstep(0.5, 0.06, d) * vFade;
      if (a < 0.01) discard;
      gl_FragColor = vec4(uColor, a);
    }
  `
};
