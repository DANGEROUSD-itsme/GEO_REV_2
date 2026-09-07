/* ==========================================================================
   background.glsl.js — the persistent atmospheric field behind every page.

   Driven continuously by scroll POSITION and scroll VELOCITY, plus a lazy
   pointer offset, so the backdrop behaves like one physical system across the
   whole document rather than restarting per section.

   Uniforms
     uTime       seconds
     uScroll     0..1 document progress
     uVelocity   signed, smoothed scroll velocity (~-1..1)
     uMouse      pointer in -1..1, eased
     uAspect     viewport aspect
     uMix        0..1 palette blend, cross-faded per section by scene.js
     uColorA/B/C base, mid and accent colours
     uIntensity  global dimmer (drops on low-power tiers)
   ========================================================================== */
window.GEO = window.GEO || {};
GEO.shaders = GEO.shaders || {};

GEO.shaders.background = {
  vertex: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragment: GEO.shaders.noise + `
    varying vec2 vUv;
    uniform float uTime;
    uniform float uScroll;
    uniform float uVelocity;
    uniform vec2  uMouse;
    uniform float uAspect;
    uniform float uMix;
    uniform vec3  uColorA;
    uniform vec3  uColorB;
    uniform vec3  uColorC;
    uniform float uIntensity;

    void main() {
      vec2 uv = vUv;
      vec2 p = (uv - 0.5) * vec2(uAspect, 1.0);

      float t = uTime * 0.055;

      /* The field drifts with the pointer and travels with the page. */
      vec2 q = p * 1.3;
      q += uMouse * 0.10;
      q.y -= uScroll * 1.15;

      /* Scroll velocity stretches the field vertically — fast scrolling
         smears the noise, slow scrolling lets it settle. */
      q.y *= 1.0 + abs(uVelocity) * 0.35;

      float f = fbm(vec3(q, t));
      f += uVelocity * 0.18 * snoise(vec3(q * 2.1, t * 1.4));

      float m = smoothstep(-0.62, 0.88, f);

      vec3 col = mix(uColorA, uColorB, m);
      col = mix(col, uColorC, smoothstep(0.52, 1.0, m) * (0.28 + 0.45 * uMix));

      /* Radial falloff keeps the centre calm so body copy stays readable. */
      float d = length(p * vec2(0.82, 1.0));
      col *= 1.0 - smoothstep(0.10, 1.25, d) * 0.62;

      /* A faint horizon band that travels as the document scrolls. */
      float band = exp(-pow((uv.y - (0.78 - uScroll * 0.62)) * 6.5, 2.0));
      col += uColorC * band * 0.11;

      /* Very low-amplitude dither to stop banding in the dark gradients. */
      float dither = fract(sin(dot(uv * 1024.0, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
      col += dither * 0.006;

      gl_FragColor = vec4(col * uIntensity, 1.0);
    }
  `
};
