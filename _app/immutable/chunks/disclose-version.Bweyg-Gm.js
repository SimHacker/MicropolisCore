import{H as v,T as w,j as x,V as C,W as m,z as T,X as g,i as h,Y as N,Z as S}from"./runtime.DP-0YJoL.js";function j(n){console.warn("hydration_mismatch")}let a=!1;function k(n){a=n}let d=null,u;function _(n){d=n,u=n&&n[0]}function c(n){if(n.nodeType!==8)return n;var t=n;if(t.data!==v)return n;for(var e=[],i=0;(t=t.nextSibling)!==null;){if(t.nodeType===8){var r=t.data;if(r===v)i+=1;else if(r[0]===w){if(i===0)return d=e,u=e[0],t;i-=1}}e.push(t)}throw j(),x}var p,y;function D(){if(p===void 0){p=window,y=document;var n=Element.prototype;n.__click=void 0,n.__className="",n.__attributes=null,n.__e=void 0,Text.prototype.__t=void 0}}function s(){return document.createTextNode("")}function E(n){const t=n.firstChild;return a?t===null?n.appendChild(s()):c(t):t}function H(n,t){return a?c(u):n.firstChild}function b(n,t=!1){var e=n.nextSibling;if(!a)return e;var i=e.nodeType;if(i===8&&e.data===C)return b(e,t);if(t&&i!==3){var r=s(),l=m.dom;return l.unshift(r),e==null||e.before(r),r}return c(e)}function Y(n){n.textContent=""}let o;function $(){o=void 0}function z(n){let t=null,e=a;var i;if(a){for(t=d,o===void 0&&(o=document.head.firstChild);o.nodeType!==8||o.data!==v;)o=o.nextSibling;o=c(o),o=o.nextSibling}else i=document.head.appendChild(s());try{T(()=>n(i))}finally{e&&_(t)}}function f(n,t=m){var e=t.dom;return e===null?t.dom=n:(h(e)||(e=t.dom=[e]),h(n)?e.push(...n):e.push(n)),n}function A(n,t){var e=(t&N)!==0,i=(t&S)!==0,r;return()=>{if(a)return f(e?d:u),u;r||(r=g(n),e||(r=r.firstChild));var l=i?document.importNode(r,!0):r.cloneNode(!0);return f(e?[...l.childNodes]:l),l}}function F(n){if(!a)return f(s());var t=u;return t||n.before(t=s()),f(t),t}function I(){if(a)return f(d),u;var n=document.createDocumentFragment(),t=s();return n.append(t),f([t]),n}function L(n,t){a||n.before(t)}const M="5";typeof window<"u"&&(window.__svelte||(window.__svelte={v:new Set})).v.add(M);export{y as $,_ as a,d as b,Y as c,L as d,s as e,E as f,H as g,c as h,D as i,b as j,z as k,a as l,I as m,F as n,p as o,$ as r,k as s,A as t};