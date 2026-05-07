import{A as e,S as t,a as n,d as r,i,j as a,s as o,t as s,u as c}from"./jsx-runtime-x8UQqO9v.js";import{t as l}from"./CollectionProvider-_VX3TCpF.js";var u=s(),d=()=>[{rel:`preconnect`,href:`https://fonts.googleapis.com`},{rel:`preconnect`,href:`https://fonts.gstatic.com`,crossOrigin:`anonymous`},{rel:`stylesheet`,href:`https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap`}];function f({children:e}){return(0,u.jsxs)(`html`,{lang:`en`,children:[(0,u.jsxs)(`head`,{children:[(0,u.jsx)(`meta`,{charSet:`utf-8`}),(0,u.jsx)(`meta`,{name:`viewport`,content:`width=device-width, initial-scale=1`}),(0,u.jsx)(n,{}),(0,u.jsx)(`script`,{dangerouslySetInnerHTML:{__html:`(() => {
  try {
    const t = localStorage.getItem('theme');
    if (t === 'dark' || (!t && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})()`}}),(0,u.jsx)(`script`,{dangerouslySetInnerHTML:{__html:`(() => {
  try {
    const el = document.getElementById('theme-toggle');
    if (!el) return;
    el.addEventListener('click', () => {
      try {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
      } catch (e) {}
    });
  } catch (e) {}
})()`}}),(0,u.jsx)(i,{})]}),(0,u.jsxs)(`body`,{children:[e,(0,u.jsx)(r,{}),(0,u.jsx)(c,{})]})]})}var p=e(function(){return(0,u.jsx)(l,{children:(0,u.jsx)(o,{})})}),m=a(function({error:e}){let n=`Oops!`,r=`An unexpected error occurred.`;return t(e)&&(n=e.status===404?`404`:`Error`,r=e.status===404?`The requested page could not be found.`:e.statusText||r),(0,u.jsxs)(`main`,{className:`pt-16 p-4 container mx-auto`,children:[(0,u.jsx)(`h1`,{children:n}),(0,u.jsx)(`p`,{children:r}),void 0]})});export{m as ErrorBoundary,f as Layout,p as default,d as links};