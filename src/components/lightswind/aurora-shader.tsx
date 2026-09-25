"use client";

import { useEffect, useRef, useState } from "react";
import { Renderer, Program, Mesh, Color, Triangle } from "ogl";
import { useTheme } from "next-themes";

interface AuroraProps {
  colorStops?: string[];
  amplitude?: number;
  blend?: number;
  speed?: number;
  theme?: "light" | "dark" | "system";
}

const VERTEX_SHADER = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;
uniform vec2 uMouse;
uniform float uIsLight;

out vec4 fragColor;

vec3 permute(vec3 x){return mod(((x*34.0)+1.0)*x,289.0);}

float snoise(vec2 v){
  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i=floor(v+dot(v,C.yy));
  vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
  vec4 x12=x0.xyxy+C.xxzz;
  x12.xy-=i1;
  i=mod(i,289.0);
  vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
  m=m*m; m=m*m;
  vec3 x=2.0*fract(p*C.www)-1.0;
  vec3 h=abs(x)-0.5;
  vec3 ox=floor(x+0.5);
  vec3 a0=x-ox;
  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
  vec3 g; g.x=a0.x*x0.x+h.x*x0.y; g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.0*dot(m,g);
}

struct ColorStop { vec3 color; float position; };
#define COLOR_RAMP(colors,factor,finalColor){ \
  int index=0; \
  for(int i=0;i<2;i++){ \
    ColorStop currentColor=colors[i]; \
    bool inBetween=currentColor.position<=factor; \
    index=int(mix(float(index),float(i),float(inBetween))); \
  } \
  ColorStop currentColor=colors[index]; \
  ColorStop nextColor=colors[index+1]; \
  float range=nextColor.position-currentColor.position; \
  float lerpFactor=(factor-currentColor.position)/range; \
  finalColor=mix(currentColor.color,nextColor.color,lerpFactor); \
}

void main(){
  vec2 uv=gl_FragCoord.xy/uResolution;
  vec2 m = uMouse / uResolution;

  ColorStop colors[3];
  colors[0]=ColorStop(uColorStops[0],0.0);
  colors[1]=ColorStop(uColorStops[1],0.5);
  colors[2]=ColorStop(uColorStops[2],1.0);

  vec3 rampColor;
  COLOR_RAMP(colors, uv.x, rampColor);

  // Apply noise to create the wave shape
  float noise = snoise(vec2(uv.x * 3.0, uTime * 0.2 + m.x * 0.5));
  float waveHeight = uv.y - (noise * 0.15 * uAmplitude);

  // Fade the wave out at the bottom
  float fade = smoothstep(0.0, 0.4, uv.y);
  waveHeight = mix(uv.y, waveHeight, fade);

  // Define the core of the aurora
  float core = 0.5;
  float intensity = smoothstep(core - uBlend, core + uBlend, waveHeight);
  
  if (uIsLight > 0.5) {
    // Light mode: Replace dark black shadow with pure white background blending
    vec3 col = mix(vec3(1.0), rampColor, intensity * 0.85);
    float alpha = smoothstep(0.01, 0.85, intensity);
    fragColor = vec4(col * alpha, alpha);
  } else {
    // Dark mode: Deep black background with glowing vibrant aurora waves
    vec3 auroraColor = intensity * rampColor;
    float auroraAlpha = intensity;
    fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
  }
}
`;

export default function AuroraShader({
  colorStops = ["#5227FF", "#7cff67", "#5227FF"],
  amplitude = 1.0,
  blend = 0.5,
  speed = 1.0,
  theme: customTheme,
}: AuroraProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const { resolvedTheme, theme: nextTheme } = useTheme();

  const [isLightMode, setIsLightMode] = useState<boolean>(() => {
    if (customTheme === "light") return true;
    if (customTheme === "dark") return false;
    if (typeof document !== "undefined") {
      if (document.documentElement.classList.contains("dark")) return false;
      if (document.documentElement.classList.contains("light")) return true;
    }
    return false;
  });

  useEffect(() => {
    const checkIsLight = () => {
      if (customTheme === "light") return true;
      if (customTheme === "dark") return false;
      if (typeof document !== "undefined") {
        if (document.documentElement.classList.contains("dark")) return false;
        if (document.documentElement.classList.contains("light")) return true;
      }
      if (resolvedTheme) return resolvedTheme === "light";
      if (nextTheme) return nextTheme === "light";
      if (typeof window !== "undefined" && window.matchMedia) {
        return !window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
      return false;
    };

    setIsLightMode(checkIsLight());

    if (typeof document !== "undefined") {
      const observer = new MutationObserver(() => {
        setIsLightMode(checkIsLight());
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
      return () => observer.disconnect();
    }
  }, [resolvedTheme, nextTheme, customTheme]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({ alpha: true, antialias: true });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const geometry = new Triangle(gl);
    if (geometry.attributes.uv) delete geometry.attributes.uv;

    const program = new Program(gl, {
      vertex: VERTEX_SHADER,
      fragment: FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: amplitude },
        uBlend: { value: blend },
        uResolution: { value: [container.offsetWidth, container.offsetHeight] },
        uColorStops: {
          value: colorStops.map((hex) => {
            const c = new Color(hex);
            return [c.r, c.g, c.b];
          }),
        },
        uMouse: { value: [0, 0] },
        uIsLight: { value: isLightMode ? 1.0 : 0.0 },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });
    container.appendChild(gl.canvas);

    const resize = () => {
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      renderer.setSize(width, height);
      program.uniforms.uResolution.value = [width, height];
    };
    window.addEventListener("resize", resize);
    resize();

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x += (e.clientX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (e.clientY - mouseRef.current.y) * 0.05;
    };
    window.addEventListener("mousemove", onMouseMove);

    let animationId: number;

    const animate = (t: number) => {
      animationId = requestAnimationFrame(animate);

      program.uniforms.uTime.value = t * 0.001 * speed;
      program.uniforms.uAmplitude.value = amplitude;
      program.uniforms.uBlend.value = blend;
      program.uniforms.uMouse.value = [mouseRef.current.x, mouseRef.current.y];
      program.uniforms.uIsLight.value = isLightMode ? 1.0 : 0.0;

      renderer.render({ scene: mesh });
    };
    animate(0);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      if (gl.canvas.parentNode === container) container.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [amplitude, blend, colorStops, speed, isLightMode]);

  return <div ref={containerRef} className="w-full h-full absolute bottom-0" />;
}
