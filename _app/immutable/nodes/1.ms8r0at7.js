import{f as I,t as x,g as i,j as y,k as c}from"../chunks/disclose-version.Crw_ycLH.js";import{D as k,E as f,g as E,F as l,u as d,G as w,v as m,I as D,J as u,l as N,U as b,w as p,C as U,p as j,K as A,d as C}from"../chunks/runtime.CNnWIDwY.js";import{a as _}from"../chunks/render.BMEauHnT.js";import{s as F}from"../chunks/entry.HFajVZO5.js";function G(){const s=E,e=s.l.u;e&&(e.b.length&&k(()=>{g(s),l(e.b)}),f(()=>{const n=d(()=>e.m.map(w));return()=>{for(const t of n)typeof t=="function"&&t()}}),e.a.length&&f(()=>{g(s),l(e.a)}))}function g(s){if(s.l.s)for(const e of s.l.s)m(e);D(s.s)}function J(s,e,n){if(s==null)return e(void 0),u;const t=s.subscribe(e,n);return t.unsubscribe?()=>t.unsubscribe():t}function K(s,e,n){let t=n[e];const r=t===void 0;r&&(t={store:null,last_value:null,value:U(b),unsubscribe:u},n[e]=t),(r||t.store!==s)&&(t.unsubscribe(),t.store=s??null,t.unsubscribe=L(s,t.value));const a=m(t.value);return a===b?t.last_value:a}function L(s,e){return s==null?(p(e,void 0),u):J(s,n=>p(e,n))}function S(s){T(()=>{let e;for(e in s)s[e].unsubscribe()})}function T(s){N(()=>()=>d(s))}const Z=()=>{const s=F;return{page:{subscribe:s.page.subscribe},navigating:{subscribe:s.navigating.subscribe},updated:s.updated}},q={subscribe(s){return Z().page.subscribe(s)}};var z=x("<h1> </h1> <p> </p>",1);function P(s,e){j(e,!1);const n={};S(n);const t=()=>K(q,"$page",n);G();var r=z(),a=y(r),v=i(a),h=c(c(a,!0)),$=i(h);A(()=>{var o;_(v,t().status),_($,(o=t().error)==null?void 0:o.message)}),I(s,r),C()}export{P as component};