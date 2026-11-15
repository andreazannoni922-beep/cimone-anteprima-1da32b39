import{a as we,b as lt,c as Ve,d as We}from"./comune-CVVFGJSZ.js";var D=we(lt());var ye=we(Ve()),$e={square:[["@"],["oo","oo"],["xox","o@o","xox"],["xoox","o@@o","o@@o","xoox"],["xooox","oo@oo","o@@@o","oo@oo","xooox"],["xox","o@o","xox"],["xoox","o@@o","o@@o","xoox"],["xooox","oo@oo","o@@@o","oo@oo","xooox"]],round:[["@"],[".x.","x@x",".x."],[".xx.","x@@x","x@@x",".xx."],[".xxx.","xo@ox","x@@@x","xo@ox",".xxx."],["..xxx..",".xooox.","xoo@oox","xo@@@ox","xoo@oox",".xooox.","..xxx.."],[".xx.","x@@x","x@@x",".xx."],[".xxx.","xo@ox","x@@@x","xo@ox",".xxx."],["..xxx..",".xooox.","xoo@oox","xo@@@ox","xoo@oox",".xooox.","..xxx.."]],snowflake:[["@"],[".x.","x@x",".x."],["..x..","x.o.x",".o@o.","x.o.x","..x.."],["...x...",".x.o.x.","..ooo..","xoo@oox","..ooo..",".x.o.x.","...x..."],["....x....",".x..o..x.","..o.o.o..","...ooo...","xooo@ooox","...ooo...","..o.o.o..",".x..o..x.","....x...."],["x...x",".o.o.","..@..",".o.o.","x...x"],["x..x..x",".o.o.o.","..ooo..","xoo@oox","..ooo..",".o.o.o.","x..x..x"],["x...x...x",".o..o..o.","..o.o.o..","...ooo...","xooo@ooox","...ooo...","..o.o.o..",".o..o..o.","x...x...x"]]},se=["square","round","snowflake"],H=9,le=5,ue=8,Ye=4e3,st=[.46,.27,.15,.08,.04],He=[16,24,34,48,66],ut=[.42,.58,.76,.92,1],ct=1.4,ae=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,xt=`#version 300 es
in vec2 aCorner;
in vec4 aFlake;
uniform vec2 uGrid;
uniform vec4 uSizes;
uniform float uLargest;
flat out ivec2 vOrigin;
flat out ivec2 vCell;
flat out int vSize;
flat out float vLight;
void main() {
  int index = int(aFlake.z + 0.5);
  int slot = index % ${ue};
  int variant = index / ${ue};
  int level = slot < ${le} ? slot : slot - 3;
  float size = level == 0 ? 1.0 : (level == 1 ? uSizes.x : (level == 2 ? uSizes.y : (level == 3 ? uSizes.z : uLargest)));
  vec2 origin = floor(aFlake.xy) - floor(size * 0.5);
  origin.y = uGrid.y - origin.y - size;
  vec2 corner = origin + (aCorner * 0.5 + 0.5) * size;
  gl_Position = vec4(corner / uGrid * 2.0 - 1.0, 0.0, 1.0);
  vOrigin = ivec2(origin);
  vCell = ivec2(slot * ${H}, variant * ${H});
  vSize = int(size);
  vLight = aFlake.w;
}`,ft=`#version 300 es
precision highp float;
precision highp int;
uniform sampler2D uAtlas;
flat in ivec2 vOrigin;
flat in ivec2 vCell;
flat in int vSize;
flat in float vLight;
out vec4 outColor;
void main() {
  ivec2 local = ivec2(gl_FragCoord.xy) - vOrigin;
  if (local.x < 0 || local.y < 0 || local.x >= vSize || local.y >= vSize) discard;
  vec4 texel = texelFetch(uAtlas, vCell + local, 0);
  if (texel.r < 0.5) discard;
  outColor = vec4(vLight, texel.g * vLight, 0.0, 1.0);
}`,ht=`#version 300 es
precision highp float;
precision highp int;
uniform sampler2D uPile;
uniform float uTime;
uniform float uLight;
out vec4 outColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  ivec2 cell = ivec2(gl_FragCoord.xy);
  float height = texelFetch(uPile, ivec2(cell.x, 0), 0).r;
  float row = float(cell.y);
  if (row >= floor(height + 0.5)) discard;
  float below = floor(height + 0.5) - row;
  float crest = below <= 1.0 ? 1.0 : 0.0;
  ivec2 bayerCell = cell & 3;
  int bayerIndex = bayerCell.x + bayerCell.y * 4;
  float bayer[16] = float[16](0.0, 8.0, 2.0, 10.0, 12.0, 4.0, 14.0, 6.0, 3.0, 11.0, 1.0, 9.0, 15.0, 7.0, 13.0, 5.0);
  float threshold = (bayer[bayerIndex] + 0.5) / 16.0;
  float shade = clamp((below - 1.0) / 9.0, 0.0, 1.0) * 3.0;
  float step3 = floor(shade) + step(threshold, fract(shade));
  float body = 0.94 - step3 * 0.13;
  float glint = below <= 3.0 ? step(0.992, hash(vec2(cell) + floor(uTime * 1.1 + hash(vec2(cell.yx)) * 9.0))) : 0.0;
  float core = crest * 0.6 + glint;
  outColor = vec4(body, core, 0.0, 1.0) * uLight;
}`,dt=`#version 300 es
precision highp float;
uniform sampler2D uSource;
uniform vec2 uTexel;
uniform vec2 uTarget;
out vec4 outColor;
void main() {
  vec2 uv = gl_FragCoord.xy / uTarget;
  vec4 sum = texture(uSource, uv) * 4.0;
  sum += texture(uSource, uv - uTexel);
  sum += texture(uSource, uv + uTexel);
  sum += texture(uSource, uv + vec2(uTexel.x, -uTexel.y));
  sum += texture(uSource, uv - vec2(uTexel.x, -uTexel.y));
  outColor = sum / 8.0;
}`,mt=`#version 300 es
precision highp float;
uniform sampler2D uSource;
uniform sampler2D uBase;
uniform vec2 uTexel;
uniform vec2 uTarget;
out vec4 outColor;
void main() {
  vec2 uv = gl_FragCoord.xy / uTarget;
  vec2 h = uTexel * 0.5;
  vec4 sum = texture(uSource, uv + vec2(-h.x * 2.0, 0.0));
  sum += texture(uSource, uv + vec2(h.x * 2.0, 0.0));
  sum += texture(uSource, uv + vec2(0.0, -h.y * 2.0));
  sum += texture(uSource, uv + vec2(0.0, h.y * 2.0));
  sum += texture(uSource, uv + vec2(-h.x, h.y)) * 2.0;
  sum += texture(uSource, uv + h) * 2.0;
  sum += texture(uSource, uv + vec2(h.x, -h.y)) * 2.0;
  sum += texture(uSource, uv - h) * 2.0;
  outColor = (sum / 12.0 + texture(uBase, uv)) * 0.5;
}`,vt=`#version 300 es
precision highp float;
uniform sampler2D uSnow;
uniform sampler2D uGlowMap;
uniform vec2 uResolution;
uniform vec2 uGrid;
uniform float uPixel;
uniform vec3 uColor;
uniform float uBrightness;
uniform float uGlow;
uniform float uFade;
uniform float uOpacity;
uniform float uLightMode;
out vec4 outColor;

float smootherstep(float edge, float x) {
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  ivec2 cell = ivec2(floor(gl_FragCoord.xy / uPixel));
  vec4 snow = texelFetch(uSnow, clamp(cell, ivec2(0), ivec2(uGrid) - 1), 0);
  vec2 glow = texture(uGlowMap, gl_FragCoord.xy / (uGrid * uPixel)).rg;
  float edge = uFade * 0.5;
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);
  mask *= uOpacity;
  float body = clamp(snow.r * uBrightness, 0.0, 1.0);
  float core = clamp(snow.g * uBrightness, 0.0, 1.0);
  float halo = clamp(glow.r * uGlow * uBrightness, 0.0, 1.0);
  if (uLightMode > 0.5) {
    vec3 tint = mix(uColor, vec3(1.0), clamp(core / max(body, 0.001), 0.0, 1.0) * 0.45);
    float alpha = body * 0.95;
    vec4 color = vec4(tint * alpha, alpha);
    float soft = halo * 0.22 * (1.0 - alpha);
    color += vec4(uColor * soft, soft);
    outColor = color * mask;
  } else {
    vec3 color = uColor * (body * 0.82 + core * 0.18) + uColor * halo * 0.55;
    color = 1.0 - exp(-color * 1.6);
    color *= mask;
    outColor = vec4(color, max(color.r, max(color.g, color.b)));
  }
}`,w=(l,p,f)=>Math.min(f,Math.max(p,l)),gt=l=>{let p=l>>>0;return()=>{p=p+1831565813>>>0;let f=p;return f=Math.imul(f^f>>>15,f|1),f^=f+Math.imul(f^f>>>7,f|61),((f^f>>>14)>>>0)/4294967296}},qe=(l,p,f)=>{let T=l.createShader(p);return T?(l.shaderSource(T,f),l.compileShader(T),l.getShaderParameter(T,l.COMPILE_STATUS)?T:(l.deleteShader(T),null)):null},J=(l,p,f,T)=>{let U=qe(l,l.VERTEX_SHADER,p),C=qe(l,l.FRAGMENT_SHADER,f),g=l.createProgram();if(!U||!C||!g)return null;if(l.attachShader(g,U),l.attachShader(g,C),T.forEach((R,y)=>l.bindAttribLocation(g,y,R)),l.linkProgram(g),l.deleteShader(U),l.deleteShader(C),!l.getProgramParameter(g,l.LINK_STATUS))return l.deleteProgram(g),null;let I={},q=l.getProgramParameter(g,l.ACTIVE_UNIFORMS);for(let R=0;R<q;R++){let y=l.getActiveUniform(g,R);y&&(I[y.name]=l.getUniformLocation(g,y.name))}return{program:g,uniforms:I}},pt=()=>{let l=H*ue,p=H*se.length,f=new Uint8Array(l*p*4);return se.forEach((T,U)=>{$e[T].forEach((C,g)=>{C.forEach((I,q)=>{for(let R=0;R<I.length;R++){let y=I[R];if(y===".")continue;let $=((U*H+q)*l+g*H+R)*4;f[$]=255,f[$+1]=y==="@"?255:y==="o"?128:0,f[$+3]=255}})})}),{data:f,width:l,height:p}};function be({color:l="#ffffff",variant:p="snowflake",density:f=.5,speed:T=1,wind:U=.25,sway:C=.5,flakeSize:g=1,pixelSize:I=3,depth:q=.6,brightness:R=1,glow:y=.8,twinkle:$=.35,accumulate:Ke=!1,mouseInteraction:je=!0,intro:Qe=!0,fade:Je=0,opacity:Ze=1,lightMode:et=!1,paused:tt=!1,dpr:ot,className:_e="",...rt}){let Se=(0,D.useRef)(null),Me=(0,D.useRef)(null),ce=(0,D.useRef)(null),Fe={color:String(l),variant:Math.max(0,se.indexOf(p)),density:w(f,0,1),speed:T,wind:w(U,-2,2),sway:Math.max(0,C),flakeSize:w(g,0,2),pixelSize:Math.round(w(I,1,12)),depth:w(q,0,1),brightness:Math.max(0,R),glow:Math.max(0,y),twinkle:w($,0,1),accumulate:Ke,mouseInteraction:je,intro:Qe,fade:w(Je,0,1),opacity:w(Ze,0,1),lightMode:et,paused:tt,dpr:ot},M=(0,D.useRef)(Fe);return M.current=Fe,(0,D.useEffect)(()=>{let X=Se.current,F=Me.current,e=F?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!X||!F||!e)return;let m={flake:J(e,xt,ft,["aCorner","aFlake"]),pile:J(e,ae,ht,["aPosition"]),down:J(e,ae,dt,["aPosition"]),up:J(e,ae,mt,["aPosition"]),composite:J(e,ae,vt,["aPosition"])};if(Object.values(m).some(t=>!t))return;let xe=pt(),fe=e.createTexture();e.bindTexture(e.TEXTURE_2D,fe),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,xe.width,xe.height,0,e.RGBA,e.UNSIGNED_BYTE,xe.data),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST);let Le=e.createBuffer(),Z=e.createVertexArray();e.bindVertexArray(Z),e.bindBuffer(e.ARRAY_BUFFER,Le),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);let Pe=e.createBuffer(),he=e.createBuffer(),de=e.createVertexArray();e.bindVertexArray(de),e.bindBuffer(e.ARRAY_BUFFER,Pe),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),e.bindBuffer(e.ARRAY_BUFFER,he),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,0,0),e.vertexAttribDivisor(1,1),e.bindVertexArray(null);let z=t=>{let o={texture:e.createTexture(),framebuffer:e.createFramebuffer(),width:0,height:0};return e.bindTexture(e.TEXTURE_2D,o.texture),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),o},me=(t,o,i)=>{t.width===o&&t.height===i||(t.width=o,t.height=i,e.bindTexture(e.TEXTURE_2D,t.texture),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,o,i,0,e.RGBA,e.UNSIGNED_BYTE,null),e.bindFramebuffer(e.FRAMEBUFFER,t.framebuffer),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t.texture,0))},b=z(e.NEAREST),ee=e.createTexture();e.bindTexture(e.TEXTURE_2D,ee),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);let x=new Float32Array(0),te=0,L=[z(e.LINEAR),z(e.LINEAR),z(e.LINEAR)],G=[z(e.LINEAR),z(e.LINEAR)],N=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),oe=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,ve=new Map,it=t=>{if(ve.has(t))return ve.get(t);let o=[1,1,1];if(N){N.clearRect(0,0,1,1),N.fillStyle="#ffffff",N.fillStyle=t,N.fillRect(0,0,1,1);let[i,a,s]=N.getImageData(0,0,1,1).data;o=[i/255,a/255,s/255]}return ve.set(t,o),o},A=gt(4271),O=[],u={width:1,height:1,ratio:1,pixel:1,gridWidth:1,gridHeight:1},d={x:0,y:0,vx:0,vy:0,inside:!1,time:0},v={time:0,intro:M.current.intro&&!oe?0:1,push:0},K=new Float32Array(Ye*4),B=0,k=0,re=!0,De=(t,o)=>{let i=o.flakeSize-1,a=0,s=st.map((c,n)=>c*Math.pow(2.2,i*(n-1.5))),h=s.reduce((c,n)=>c+n,0);for(let c=0;c<le;c++)if(a+=s[c]/h,t<=a)return c;return le-1},ge=(t,o,i)=>{t.level=De(A(),o),t.x=A()*(u.width+40)-20,t.y=i?-10-A()*30:A()*u.height,t.vx=0,t.vy=He[t.level],t.phase=A()*Math.PI*2,t.rate=.6+A()*.9,t.sparkle=A()*100,t.drift=.7+A()*.6,t.alt=A()<.5,t.reveal=A(),t.levelSize=o.flakeSize},pe=t=>{let o=Math.round(w(u.width*u.height*t.density/1100,0,Ye));for(;O.length<o;){let i={};ge(i,t,!1),O.push(i)}O.length>o&&(O.length=o)},nt=(t,o)=>{let i=t.speed,a=t.wind*46,s=120,h=v.push>.001&&d.inside,c=24,n=t.accumulate&&i>0&&x.length>0;for(let r of O){r.levelSize!==t.flakeSize&&(r.level=De(A(),t),r.levelSize=t.flakeSize);let E=r.level,ie=1-t.depth*(1-(E+1)/le)*.75,Q=Math.sin(v.time*r.rate+r.phase)*t.sway*(6+E*7),Ae=(a*ie+Q)*r.drift,W=He[E]*ie*i*r.drift,Oe=1-Math.exp(-o*2.2);if(r.vx+=(Ae-r.vx)*Oe,r.vy+=(W-r.vy)*Oe,h){let P=r.x-d.x,ne=r.y-d.y,S=Math.hypot(P,ne);if(S<s&&S>.001){let _=1-S/s,Y=_*_*_*v.push*1500*o,ke=_*_*v.push*o*5;r.vx+=P/S*Y+d.vx*ke,r.vy+=ne/S*Y+d.vy*ke}}if(r.x+=r.vx*o,r.y+=r.vy*o,n){let P=Math.floor(r.x/u.pixel);if(P>=0&&P<x.length){let ne=u.height-x[P]*u.pixel;if(r.y>=ne&&x[P]>.5){let S=E;for(let _=-S;_<=S;_++){let Y=P+_;Y>=0&&Y<x.length&&(x[Y]+=(.35+E*.15)*(1-Math.abs(_)/(S+1)))}ge(r,t,!0),r.reveal=-1;continue}}}(i>=0?r.y>u.height+c:r.y<-c)&&(ge(r,t,!0),r.reveal=-1,i<0&&(r.y=u.height+10+A()*30)),r.x<-c?r.x+=u.width+c*2:r.x>u.width+c&&(r.x-=u.width+c*2)}},at=(t,o)=>{if(!x.length)return;let i=Math.max(4,u.gridHeight*.08);if(t.accumulate&&t.speed>0){let a=(.25+t.density*.9)*o*Math.min(1,t.speed);for(let s=0;s<x.length;s++){let h=.55+.45*Math.sin(s*.045+Math.sin(s*.013)*2.1)*Math.sin(s*.021+1.3);x[s]<i*h&&(x[s]+=a*(.6+.8*h))}}for(let a=0;a<2;a++){let s=a===0;for(let h=0;h<x.length-1;h++){let c=s?h:x.length-2-h,n=x[c]-x[c+1];if(Math.abs(n)>1.2){let r=(Math.abs(n)-1.2)*.5*Math.sign(n);x[c]-=r,x[c+1]+=r}}}for(let a=0;a<x.length;a++){let s=Math.max(0,x[a]-i),h=t.accumulate&&t.speed>0?s*.8:2+x[a]*.6;x[a]=Math.max(0,x[a]-h*o)}},Ee=(t,o,i,a)=>{e.bindFramebuffer(e.FRAMEBUFFER,o?o.framebuffer:null),e.viewport(0,0,i,a),e.useProgram(t.program),e.drawArrays(e.TRIANGLES,0,3)},j=(t,o,i,a)=>{e.activeTexture(e.TEXTURE0+i),e.bindTexture(e.TEXTURE_2D,a),e.uniform1i(t.uniforms[o],i)},Te=()=>{let t=M.current;me(b,u.gridWidth,u.gridHeight);let o=0,i=$e[se[t.variant]].map(n=>n.length),a=v.intro*1.75;for(let n of O){let r=n.level,E=1-t.depth*(1-ut[r]),ie=Math.pow(Math.max(0,Math.sin(v.time*.9+n.sparkle)),60)*t.twinkle,Q=n.reveal<0||v.intro>=1?1:w((a-n.y/u.height-n.reveal*.25)/.35,0,1);if(Q<=0)continue;let Ae=r>=2&&n.alt?r+3:r,W=o*4;K[W]=n.x/u.pixel,K[W+1]=n.y/u.pixel,K[W+2]=t.variant*ue+Ae,K[W+3]=Math.min(1,E*(.85+ie*.6))*Q*Q,o++}if(e.bindFramebuffer(e.FRAMEBUFFER,b.framebuffer),e.viewport(0,0,b.width,b.height),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),x.length&&x.some(n=>n>.4)){e.bindTexture(e.TEXTURE_2D,ee),te!==x.length?(te=x.length,e.texImage2D(e.TEXTURE_2D,0,e.R32F,te,1,0,e.RED,e.FLOAT,x)):e.texSubImage2D(e.TEXTURE_2D,0,0,0,te,1,e.RED,e.FLOAT,x);let n=m.pile;e.useProgram(n.program),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,ee),e.uniform1i(n.uniforms.uPile,0),e.uniform1f(n.uniforms.uTime,v.time),e.uniform1f(n.uniforms.uLight,1-t.depth*.1),e.bindVertexArray(Z),e.drawArrays(e.TRIANGLES,0,3)}if(o>0){let n=m.flake;e.useProgram(n.program),e.uniform2f(n.uniforms.uGrid,b.width,b.height),e.uniform4f(n.uniforms.uSizes,i[1],i[2],i[3],0),e.uniform1f(n.uniforms.uLargest,i[4]),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,fe),e.uniform1i(n.uniforms.uAtlas,0),e.enable(e.BLEND),e.blendEquation(e.MAX),e.bindVertexArray(de),e.bindBuffer(e.ARRAY_BUFFER,he),e.bufferData(e.ARRAY_BUFFER,K.subarray(0,o*4),e.DYNAMIC_DRAW),e.drawArraysInstanced(e.TRIANGLE_STRIP,0,4,o),e.blendEquation(e.FUNC_ADD),e.disable(e.BLEND)}e.bindVertexArray(Z);let s=b;for(let n=0;n<L.length;n++){let r=L[n];me(r,Math.max(1,Math.ceil(s.width/2)),Math.max(1,Math.ceil(s.height/2))),e.useProgram(m.down.program),e.uniform2f(m.down.uniforms.uTexel,1/s.width,1/s.height),e.uniform2f(m.down.uniforms.uTarget,r.width,r.height),j(m.down,"uSource",0,s.texture),Ee(m.down,r,r.width,r.height),s=r}for(let n=G.length-1;n>=0;n--){let r=n===G.length-1?L[L.length-1]:G[n+1],E=G[n];me(E,L[n].width,L[n].height),e.useProgram(m.up.program),e.uniform2f(m.up.uniforms.uTexel,1/r.width,1/r.height),e.uniform2f(m.up.uniforms.uTarget,E.width,E.height),j(m.up,"uSource",0,r.texture),j(m.up,"uBase",1,L[n].texture),Ee(m.up,E,E.width,E.height)}let h=m.composite,c=h.uniforms;e.useProgram(h.program),e.uniform2f(c.uResolution,F.width,F.height),e.uniform2f(c.uGrid,b.width,b.height),e.uniform1f(c.uPixel,u.pixel*u.ratio),e.uniform3fv(c.uColor,it(t.color)),e.uniform1f(c.uBrightness,t.brightness),e.uniform1f(c.uGlow,t.glow),e.uniform1f(c.uFade,t.fade),e.uniform1f(c.uOpacity,t.opacity),e.uniform1f(c.uLightMode,t.lightMode?1:0),j(h,"uSnow",0,b.texture),j(h,"uGlowMap",1,G[0].texture),Ee(h,null,F.width,F.height)},Ue=t=>{if(B=0,!re||document.hidden)return;let o=M.current,i=k?Math.min(.05,(t-k)/1e3):1/60;k=t;let a=!o.paused&&!oe;!o.intro||oe?v.intro=1:v.intro<1&&(v.intro=Math.min(1,v.intro+i/ct));let s=o.mouseInteraction&&d.inside&&!oe?1:0;v.push+=(s-v.push)*(1-Math.exp(-i*(s?6:3))),d.vx*=Math.exp(-i*6),d.vy*=Math.exp(-i*6),pe(o),a&&(v.time+=i,nt(o,i),at(o,i)),Te(),a||Math.abs(s-v.push)>.001?B=requestAnimationFrame(Ue):k=0},V=()=>{!B&&re&&!document.hidden&&(B=requestAnimationFrame(Ue))},Re=()=>{let t=M.current,o=Math.max(1,X.clientWidth),i=Math.max(1,X.clientHeight),a=Math.min(t.dpr||window.devicePixelRatio||1,2);u.width=o,u.height=i,u.ratio=a,u.pixel=Math.max(1,Math.round(t.pixelSize*a))/a,F.width=Math.max(1,Math.round(o*a)),F.height=Math.max(1,Math.round(i*a)),u.gridWidth=Math.max(1,Math.ceil(o/u.pixel)),u.gridHeight=Math.max(1,Math.ceil(i/u.pixel)),x.length!==u.gridWidth&&(x=new Float32Array(u.gridWidth)),pe(t),B||Te(),V()},Ce=t=>{let o=X.getBoundingClientRect(),i=t.clientX-o.left,a=t.clientY-o.top,s=performance.now();if(d.inside&&d.time){let h=Math.max(1,s-d.time)/1e3;d.vx=w((i-d.x)/h,-3e3,3e3),d.vy=w((a-d.y)/h,-3e3,3e3)}d.x=i,d.y=a,d.time=s,d.inside=i>=0&&a>=0&&i<=o.width&&a<=o.height,V()},Ie=()=>{d.inside=!1,V()},Be=()=>{k=0,V()},Xe=new ResizeObserver(Re);Xe.observe(X);let ze=new IntersectionObserver(t=>{re=t.some(o=>o.isIntersecting),re&&(k=0,V())});ze.observe(X),window.addEventListener("pointermove",Ce,{passive:!0}),document.documentElement.addEventListener("pointerleave",Ie),document.addEventListener("visibilitychange",Be),Re();let Ge=M.current.pixelSize,Ne=M.current.dpr;return ce.current=()=>{let t=M.current;if(t.pixelSize!==Ge||t.dpr!==Ne){Ge=t.pixelSize,Ne=t.dpr,Re();return}pe(t),B||Te(),V()},()=>{cancelAnimationFrame(B),ce.current=null,Xe.disconnect(),ze.disconnect(),window.removeEventListener("pointermove",Ce),document.documentElement.removeEventListener("pointerleave",Ie),document.removeEventListener("visibilitychange",Be);for(let t of[b,...L,...G])e.deleteTexture(t.texture),e.deleteFramebuffer(t.framebuffer);for(let t of Object.values(m))e.deleteProgram(t.program);e.deleteTexture(fe),e.deleteTexture(ee),e.deleteBuffer(Le),e.deleteBuffer(Pe),e.deleteBuffer(he),e.deleteVertexArray(Z),e.deleteVertexArray(de),e.getExtension("WEBGL_lose_context")?.loseContext()}},[]),(0,D.useEffect)(()=>{ce.current?.()}),(0,ye.jsx)("div",{ref:Se,className:`pixel-snow-container${_e?` ${_e}`:""}`,...rt,children:(0,ye.jsx)("canvas",{ref:Me,className:"pixel-snow-canvas","aria-hidden":"true"})})}var bt=We(be);export{bt as monta};
