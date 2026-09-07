/* ==========================================================================
   globe.glsl.js: shaders for the interactive globe on the notes page, plus
   the reactive objects used by the builder and the mock test.

   1. globeDots   the planet drawn as a field of points, dimmed on the far
                  side so the sphere reads as a volume rather than a disc.
   2. marker      supplier pins, each with its own activation value so a
                  single country can light up without touching the others.
   3. arc         a supply route. The line draws itself in, then a bright
                  head keeps travelling along it, so the trade route looks
                  like it is carrying something rather than sitting still.
   4. slab        the four T.E.E.T blocks and the mock-test rings: a lit
                  face with a fresnel edge and a charge value that glows.
   ========================================================================== */
window.GEO = window.GEO || {};
GEO.shaders = GEO.shaders || {};

GEO.shaders.globeDots = {
  vertex: `
    uniform float uTime;
    uniform float uSize;
    uniform float uReveal;      // 0..1 build-in
    attribute float aSeed;
    varying float vFacing;
    varying float vSeed;

    void main() {
      vSeed = aSeed;

      /* Points lift off the surface slightly as the globe builds in. */
      vec3 pos = position * mix(0.55, 1.0, smoothstep(0.0, 1.0, uReveal + aSeed * 0.25));

      vec4 mv = modelViewMatrix * vec4(pos, 1.0);

      /* Dot normal is its own position on a unit sphere, so facing is just
         how much that direction points at the camera. */
      vec3 nrm = normalize(mat3(modelViewMatrix) * normalize(position));
      vFacing = clamp(dot(nrm, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);

      gl_Position = projectionMatrix * mv;
      gl_PointSize = uSize * (1.0 + vFacing * 0.9) * (24.0 / max(-mv.z, 0.6));
    }
  `,
  fragment: `
    uniform vec3  uColor;
    uniform float uOpacity;
    uniform float uTime;
    varying float vFacing;
    varying float vSeed;

    void main() {
      vec2 c = gl_PointCoord - 0.5;
      float d = length(c);
      if (d > 0.5) discard;

      /* Far side stays faintly visible so the globe feels transparent. */
      float face = mix(0.10, 1.0, pow(vFacing, 1.6));
      /* Each dot breathes on its own phase. */
      float twinkle = 0.85 + 0.15 * sin(uTime * 1.4 + vSeed * 40.0);

      float a = smoothstep(0.5, 0.1, d) * face * twinkle * uOpacity;
      gl_FragColor = vec4(uColor, a);
    }
  `
};

GEO.shaders.marker = {
  vertex: `
    uniform float uTime;
    uniform float uSize;
    attribute float aOn;        // 0 = idle, 1 = fully lit
    attribute float aSeed;
    varying float vOn;
    varying float vFacing;

    void main() {
      vOn = aOn;
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vec3 nrm = normalize(mat3(modelViewMatrix) * normalize(position));
      vFacing = clamp(dot(nrm, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);

      /* A lit marker pulses; idle markers hold still. */
      float pulse = 1.0 + aOn * 0.5 * (0.5 + 0.5 * sin(uTime * 4.0 + aSeed * 6.283));

      gl_Position = projectionMatrix * mv;
      gl_PointSize = uSize * (1.0 + aOn * 1.6) * pulse * (26.0 / max(-mv.z, 0.6));
    }
  `,
  fragment: `
    uniform vec3 uIdle;
    uniform vec3 uLit;
    varying float vOn;
    varying float vFacing;

    void main() {
      vec2 c = gl_PointCoord - 0.5;
      float d = length(c);
      if (d > 0.5) discard;

      float core = smoothstep(0.5, 0.12, d);
      float halo = smoothstep(0.5, 0.0, d) * vOn * 0.55;

      vec3 col = mix(uIdle, uLit, vOn);
      float face = mix(0.18, 1.0, pow(vFacing, 1.4));
      gl_FragColor = vec4(col, (core * face + halo) * (0.45 + vOn * 0.55));
    }
  `
};

GEO.shaders.arc = {
  /* Routes are drawn as tubes rather than 1px lines, so they read at any
     screen density. TubeGeometry lays u along the tube, which is exactly the
     0..1 position along the route that the fragment shader needs. */
  vertex: `
    varying float vT;
    void main() {
      vT = uv.x;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragment: `
    uniform vec3  uColor;
    uniform vec3  uHeadColor;
    uniform float uProgress;    // how much of the route has been drawn
    uniform float uHead;        // position of the travelling pulse
    uniform float uOpacity;
    varying float vT;

    void main() {
      /* Drawn portion of the route. */
      float drawn = step(vT, uProgress);

      /* Fade both ends so the route does not stop abruptly at the surface.
         Both smoothsteps run low-edge to high-edge: a reversed pair is
         undefined in GLSL ES and silently returns zero on most drivers. */
      float ends = smoothstep(0.0, 0.10, vT) * (1.0 - smoothstep(0.88, 1.0, vT));

      /* The cargo pulse travelling along the route. */
      float head = exp(-pow((vT - uHead) * 26.0, 2.0)) * step(vT, uProgress);

      vec3 col = mix(uColor, uHeadColor, head);
      float a = (drawn * ends * 0.72 + head * 1.0) * uOpacity;
      if (a < 0.004) discard;
      gl_FragColor = vec4(col, a);
    }
  `
};

GEO.shaders.slab = {
  vertex: `
    uniform float uTime;
    uniform float uCharge;      // 0..1 how "complete" this block is
    varying vec3  vNormalV;
    varying vec3  vViewDir;
    varying vec3  vPos;

    void main() {
      vPos = position;
      /* A charged block breathes very slightly. */
      vec3 pos = position * (1.0 + uCharge * 0.03 * sin(uTime * 2.2));
      vec4 mv = modelViewMatrix * vec4(pos, 1.0);
      vNormalV = normalize(normalMatrix * normal);
      vViewDir = normalize(-mv.xyz);
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragment: `
    uniform vec3  uColor;
    uniform float uCharge;
    uniform float uOpacity;
    uniform float uTime;
    varying vec3  vNormalV;
    varying vec3  vViewDir;
    varying vec3  vPos;

    void main() {
      float fres = pow(1.0 - clamp(dot(normalize(vNormalV), normalize(vViewDir)), 0.0, 1.0), 2.2);

      /* A band of light sweeps up a charged block. */
      float sweep = exp(-pow((vPos.y - (fract(uTime * 0.35) * 2.0 - 1.0)) * 6.0, 2.0)) * uCharge;

      /* Mostly edge light: the block reads as glass with a charge inside it
         rather than a solid slab of colour. */
      vec3 col = uColor * (0.05 + 0.24 * uCharge);
      col += uColor * fres * (0.55 + uCharge * 0.85);
      col += uColor * sweep * 0.55;

      gl_FragColor = vec4(col, uOpacity * (0.16 + fres * 0.6 + uCharge * 0.2));
    }
  `
};
