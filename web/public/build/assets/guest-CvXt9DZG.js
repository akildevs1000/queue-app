import{r,j as e,K as w,m as E,L as T}from"./app-tcpa3058.js";import{C as R,a as v}from"./card-CLFZ8YIW.js";import{c as C}from"./utils-jAU0Cazi.js";const _=({name:l="ABC Hospital",token_number_display:n,service:i,already_waiting_count:h,estimated_wait_time:m,date:u,time:p,code:o})=>(r.useEffect(()=>{},[]),e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`@media print {
                    @page {
                        size: auto;
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                        overflow: hidden;
                    }
                }`}),e.jsxs("div",{className:`
                    mx-auto 
                    w-[260px] 
                    border border-dashed border-gray-300 
                    bg-white 
                    p-2 
                    font-mono 
                    text-sm 
                    text-black 
                    shadow-md

                    print:w-full
                    print:max-w-full
                    print:border-none
                    print:shadow-none
                    print:p-0
                    print:m-0
                    print:overflow-hidden
                    print:h-[50vh]
                    print:break-after-avoid
                `,children:[e.jsx("div",{className:"text-sm font-semibold",children:l}),e.jsx("div",{className:"text-md mt-2",children:"Ticket"}),e.jsx("div",{className:"my-1 text-3xl font-bold",children:n}),e.jsxs("div",{className:"mb-2 text-sm",children:[p," ",u]}),e.jsx("div",{className:"text-sm",children:"You will be Served"}),e.jsxs("div",{className:"text-sm font-semibold",children:[i," ","SEC"," ",o]}),e.jsxs("div",{className:"mt-4 text-xs",children:["Total: ",h," token waiting for service",e.jsx("br",{}),"Average waiting time ",m]})]})]}));function j({children:l,className:n,...i}){return e.jsx(R,{className:C("bg-gradient-to-r from-blue-500 to-purple-600 text-white cursor-pointer hover:scale-105 transition-transform border-none",n),...i,children:l})}function F(){const{ticketInfo:l}=w().props,[n,i]=r.useState("language"),[h,m]=r.useState([]),u=r.useRef(null),[p,o]=r.useState(!1),a=r.useRef(null),{data:d,setData:x,post:k}=E({language:"",service_id:0,service_name:"",code:""}),N=async t=>{try{const f=await(await fetch(`/service-list?language=${t}`)).json();m(f)}catch(s){console.error("Failed to fetch services",s)}},y=t=>{x("language",t),i("service"),N(t)},S=t=>{const s={language:d.language,service_id:t.id,code:t.code,service_name:t.name};x(s)};return r.useEffect(()=>{const s=async()=>{try{const c=await(await fetch("/socket-ip-and-port")).json();if(!(c!=null&&c.ip)||!(c!=null&&c.port)){o(!0),a.current=setTimeout(s,5e3);return}o(!1);const g=new WebSocket(`ws://${c.ip}:${c.port}`);u.current=g,g.addEventListener("open",()=>{console.log("Connected to WS server"),o(!1),a.current&&(clearTimeout(a.current),a.current=null)});const b=()=>{o(!0),a.current=setTimeout(s,5e3)};g.addEventListener("close",b),g.addEventListener("error",b)}catch(f){o(!0),a.current=setTimeout(s,5e3),console.error("Failed to fetch services",f)}};return s(),()=>{a.current&&clearTimeout(a.current)}},[]),r.useEffect(()=>{d.service_id&&k("/tokens",{onSuccess:()=>{i("thankyou");const t=u.current;if(t&&t.readyState===WebSocket.OPEN){const s={event:"new-ticket"};t.send(JSON.stringify(s))}else console.warn("WebSocket is not open.")},onFinish:()=>{},onError:t=>{console.error("Form submission failed",t)}})},[d]),r.useEffect(()=>{let t;return n==="thankyou"&&(t=setTimeout(()=>{i("language"),x({language:"",service_id:0,service_name:"",code:""}),m([])},1e3)),()=>clearTimeout(t)},[n,x]),e.jsxs("div",{className:"relative flex min-h-screen flex-col items-center justify-center bg-[#f5f5f5] px-4 text-center",children:[e.jsx(T,{title:"Guest"}),e.jsxs("div",{children:[p&&e.jsx("div",{className:"fixed top-0 left-0 z-50 w-full bg-yellow-500 py-1 text-center text-sm text-white shadow",children:"Retrying connection to server..."}),n==="language"&&e.jsxs("div",{className:"space-y-6",children:[e.jsx("h1",{className:"text-3xl font-bold text-gray-800 dark:text-gray-100",children:"Please choose your language"}),e.jsxs("div",{className:"grid grid-cols-1 gap-6 md:grid-cols-2",children:[e.jsx(j,{onClick:()=>y("en"),children:e.jsx(v,{className:"py-10 text-xl font-semibold",children:"English"})}),e.jsx(j,{onClick:()=>y("ar"),children:e.jsx(v,{className:"py-10 text-xl font-semibold",children:"العربية"})})]})]}),n==="service"&&d.language&&e.jsxs("div",{className:"space-y-6",children:[e.jsx("h1",{className:"text-3xl font-bold text-gray-800 dark:text-gray-100",children:d.language==="en"?"Please select a service":"الرجاء اختيار الخدمة"}),e.jsx("div",{className:"mx-auto grid max-w-md grid-cols-1 gap-6 md:grid-cols-2",children:h.map(t=>e.jsx(j,{onClick:()=>S(t),className:"cursor-pointer transition-transform hover:scale-105",children:e.jsx(v,{className:"py-10 text-xl font-semibold",children:t.name})},t.id))})]})]}),e.jsx("div",{children:n==="thankyou"&&l&&e.jsx(_,{...l})})]})}export{F as default};
