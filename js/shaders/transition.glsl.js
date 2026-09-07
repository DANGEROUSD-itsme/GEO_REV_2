/* ==========================================================================
   transition.glsl.js — the page-transition wipe.

   A directional, noise-warped front rather than a fade: the mask is a
   smoothstep along `uDir`, displaced by simplex noise so the leading edge
   tears rather than travelling as a straight line. Direction communicates
   travel — forward navigations sweep up, backward sweeps down.

     uProgress  0..1 front position
     uInvert    0 = cover the page, 1 = uncover it
     uDir       normalised sweep direction in UV space
     uColor     the wipe colour (near-black with an accent bloom in the edge)
   ========================================================================== */
window.GEO = window.GEO || {};
GEO.shaders = GEO.shaders || {};

GEO.shaders.transition = {
  vertex: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragment: GEO.shaders.noise + `
    varying vec2 vUv;
    uniform float uProgress;
    uniform float uInvert;
    uniform float uTime;
    uniform float uAspect;
    uniform vec2  uDir;
    uniform vec3  uColor;
    uniform vec3  uEdge;

    void main() {
      vec2 uv = vUv;

      /* Warp field — large, slow cells so the tear reads as one gesture. */
      float n = fbm(vec3(uv * vec2(uAspect, 1.0) * 2.4, uTime * 0.35));

      /* Distance along the sweep direction, 0 at the trailing corner. */
      float d = dot(uv - 0.5, normalize(uDir)) + 0.5;
      d += n * 0.34;

      /* Expand the travel range so the front fully clears at 0 and 1. */
      float edge = 0.36;
      float p = uProgress * (1.0 + edge * 2.0) - edge;

      float mask = smoothstep(p - edge, p + edge, d);
      float a = mix(1.0 - mask, mask, uInvert);

      /* A bright filament riding the leading edge. */
      float line = 1.0 - smoothstep(0.0, 0.045, abs(d - p));

      vec3 col = mix(uColor, uColor * 2.2, n * 0.5 + 0.5);
      col += uEdge * line * 0.9;

      if (a <= 0.002) discard;
      gl_FragColor = vec4(col, clamp(a + line * 0.35 * a, 0.0, 1.0));
    }
  `
};
