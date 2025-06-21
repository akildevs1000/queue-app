import{r as o,j as e,K as k,m as y,L as N}from"./app-DT_bFNg-.js";import{C as S,a as g}from"./card-Bre8w5Cv.js";import{c as w}from"./utils-jAU0Cazi.js";const E=({name:c="ABC Hospital",token_number_display:t,service:r,already_waiting_count:x,estimated_wait_time:l,date:d,time:a,code:i})=>(o.useEffect(()=>{},[]),e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`@media print {
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
                `,children:[e.jsx("div",{className:"text-sm font-semibold",children:c}),e.jsx("div",{className:"text-md mt-2",children:"Ticket"}),e.jsx("div",{className:"my-1 text-3xl font-bold",children:t}),e.jsxs("div",{className:"mb-2 text-sm",children:[a," ",d]}),e.jsx("div",{className:"text-sm",children:"You will be Served"}),e.jsxs("div",{className:"text-sm font-semibold",children:[r," ","SEC"," ",i]}),e.jsxs("div",{className:"mt-4 text-xs",children:["Total: ",x," token waiting for service",e.jsx("br",{}),"Average waiting time ",l]})]})]}));function f({children:c,className:t,...r}){return e.jsx(S,{className:w("bg-gradient-to-r from-blue-500 to-purple-600 text-white cursor-pointer hover:scale-105 transition-transform border-none",t),...r,children:c})}function W(){const{ticketInfo:c}=k().props,[t,r]=o.useState("language"),[x,l]=o.useState([]),d=o.useRef(null),{data:a,setData:i,post:p}=y({language:"",service_id:0,service_name:"",code:""}),v=async s=>{try{const m=await(await fetch(`/service-list?language=${s}`)).json();l(m)}catch(n){console.error("Failed to fetch services",n)}},u=s=>{i("language",s),r("service"),v(s)},j=s=>{const n={language:a.language,service_id:s.id,code:s.code,service_name:s.name};i(n)};return o.useEffect(()=>{(async()=>{try{const m=await(await fetch("/socket-ip-and-port")).json(),h=new WebSocket(`ws://${m.ip}:${m.port}`);d.current=h,h.addEventListener("open",()=>{console.log("Connected to WS server")}),h.addEventListener("error",b=>{console.error("WebSocket error:",b)})}catch(n){console.error("Failed to fetch services",n)}})()},[]),o.useEffect(()=>{a.service_id&&p("/tokens",{onSuccess:()=>{r("thankyou");const s=d.current;if(s&&s.readyState===WebSocket.OPEN){const n={event:"new-ticket"};s.send(JSON.stringify(n))}else console.warn("WebSocket is not open.")},onFinish:()=>{},onError:s=>{console.error("Form submission failed",s)}})},[a]),o.useEffect(()=>{let s;return t==="thankyou"&&(s=setTimeout(()=>{r("language"),i({language:"",service_id:0,service_name:"",code:""}),l([])},1e3)),()=>clearTimeout(s)},[t,i]),e.jsxs("div",{className:"flex min-h-screen flex-col items-center justify-center bg-[#f5f5f5] px-4 text-center",children:[e.jsx(N,{title:"Guest"}),e.jsxs("div",{children:[t==="language"&&e.jsxs("div",{className:"space-y-6",children:[e.jsx("h1",{className:"text-3xl font-bold text-gray-800 dark:text-gray-100",children:"Please choose your language"}),e.jsxs("div",{className:"grid grid-cols-1 gap-6 md:grid-cols-2",children:[e.jsx(f,{onClick:()=>u("en"),children:e.jsx(g,{className:"py-10 text-xl font-semibold",children:"English"})}),e.jsx(f,{onClick:()=>u("ar"),children:e.jsx(g,{className:"py-10 text-xl font-semibold",children:"العربية"})})]})]}),t==="service"&&a.language&&e.jsxs("div",{className:"space-y-6",children:[e.jsx("h1",{className:"text-3xl font-bold text-gray-800 dark:text-gray-100",children:a.language==="en"?"Please select a service":"الرجاء اختيار الخدمة"}),e.jsx("div",{className:"mx-auto grid max-w-md grid-cols-1 gap-6 md:grid-cols-2",children:x.map(s=>e.jsx(f,{onClick:()=>j(s),className:"cursor-pointer transition-transform hover:scale-105",children:e.jsx(g,{className:"py-10 text-xl font-semibold",children:s.name})},s.id))})]})]}),e.jsx("div",{children:t==="thankyou"&&c&&e.jsx(E,{...c})})]})}export{W as default};
