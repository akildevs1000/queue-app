import{r as o,j as e,K as j,m as b,L as k}from"./app-B8FREZE8.js";import{C as y,a as x}from"./card-Cu-DKIN-.js";import{c as N}from"./utils-jAU0Cazi.js";const S=({name:i="ABC Hospital",token_number_display:t,service:r,already_waiting_count:m,estimated_wait_time:l,date:d,time:a,code:c})=>(o.useEffect(()=>{},[]),e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`@media print {
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
                `,children:[e.jsx("div",{className:"text-sm font-semibold",children:i}),e.jsx("div",{className:"text-md mt-2",children:"Ticket"}),e.jsx("div",{className:"my-1 text-3xl font-bold",children:t}),e.jsxs("div",{className:"mb-2 text-sm",children:[a," ",d]}),e.jsx("div",{className:"text-sm",children:"You will be Served"}),e.jsxs("div",{className:"text-sm font-semibold",children:[r," ","SEC"," ",c]}),e.jsxs("div",{className:"mt-4 text-xs",children:["Total: ",m," token waiting for service",e.jsx("br",{}),"Average waiting time ",l]})]})]}));function g({children:i,className:t,...r}){return e.jsx(y,{className:N("bg-gradient-to-r from-blue-500 to-purple-600 text-white cursor-pointer hover:scale-105 transition-transform border-none",t),...r,children:i})}function _(){const{ticketInfo:i}=j().props,[t,r]=o.useState("language"),[m,l]=o.useState([]),d=o.useRef(null),{data:a,setData:c,post:h}=b({language:"",service_id:0,service_name:"",code:""}),f=async s=>{try{const v=await(await fetch(`/service-list?language=${s}`)).json();l(v)}catch(n){console.error("Failed to fetch services",n)}},u=s=>{c("language",s),r("service"),f(s)},p=s=>{const n={language:a.language,service_id:s.id,code:s.code,service_name:s.name};c(n)};return o.useEffect(()=>{const s=new WebSocket("ws://192.168.3.245:7777");return d.current=s,s.addEventListener("open",()=>{console.log("Connected to WS server")}),s.addEventListener("error",n=>{console.error("WebSocket error:",n)}),()=>{s.close()}},[]),o.useEffect(()=>{a.service_id&&h("/tokens",{onSuccess:()=>{r("thankyou");const s=d.current;if(s&&s.readyState===WebSocket.OPEN){const n={event:"new-ticket"};s.send(JSON.stringify(n))}else console.warn("WebSocket is not open.")},onFinish:()=>{},onError:s=>{console.error("Form submission failed",s)}})},[a]),o.useEffect(()=>{let s;return t==="thankyou"&&(s=setTimeout(()=>{r("language"),c({language:"",service_id:0,service_name:"",code:""}),l([])},1e3)),()=>clearTimeout(s)},[t,c]),e.jsxs("div",{className:"flex min-h-screen flex-col items-center justify-center bg-[#f5f5f5] px-4 text-center",children:[e.jsx(k,{title:"Guest"}),e.jsxs("div",{children:[t==="language"&&e.jsxs("div",{className:"space-y-6",children:[e.jsx("h1",{className:"text-3xl font-bold text-gray-800 dark:text-gray-100",children:"Please choose your language"}),e.jsxs("div",{className:"grid grid-cols-1 gap-6 md:grid-cols-2",children:[e.jsx(g,{onClick:()=>u("en"),children:e.jsx(x,{className:"py-10 text-xl font-semibold",children:"English"})}),e.jsx(g,{onClick:()=>u("ar"),children:e.jsx(x,{className:"py-10 text-xl font-semibold",children:"العربية"})})]})]}),t==="service"&&a.language&&e.jsxs("div",{className:"space-y-6",children:[e.jsx("h1",{className:"text-3xl font-bold text-gray-800 dark:text-gray-100",children:a.language==="en"?"Please select a service":"الرجاء اختيار الخدمة"}),e.jsx("div",{className:"mx-auto grid max-w-md grid-cols-1 gap-6 md:grid-cols-2",children:m.map(s=>e.jsx(g,{onClick:()=>p(s),className:"cursor-pointer transition-transform hover:scale-105",children:e.jsx(x,{className:"py-10 text-xl font-semibold",children:s.name})},s.id))})]})]}),e.jsx("div",{children:t==="thankyou"&&i&&e.jsx(S,{...i})})]})}export{_ as default};
