const Be="https://huggingface.co",At="https://router.huggingface.co",Gt="X-HF-Bill-To",nt={baseten:{},"black-forest-labs":{},cerebras:{},clarifai:{},cohere:{},"fal-ai":{},"featherless-ai":{},"fireworks-ai":{},groq:{},"hf-inference":{},hyperbolic:{},nebius:{},novita:{},nscale:{},openai:{},publicai:{},ovhcloud:{},replicate:{},sambanova:{},scaleway:{},together:{},wavespeed:{},"zai-org":{}};class Ee extends Error{constructor(t){super(t),this.name="InferenceClientError"}}class D extends Ee{constructor(t){super(t),this.name="InputError"}}class en extends Ee{constructor(t){super(t),this.name="RoutingError"}}class It extends Ee{httpRequest;httpResponse;constructor(t,n,a){super(t),this.httpRequest={...n,...n.headers?{headers:{...n.headers,..."Authorization"in n.headers?{Authorization:"Bearer [redacted]"}:void 0}}:void 0},this.httpResponse=a}}class N extends It{constructor(t,n,a){super(t,n,a),this.name="ProviderApiError"}}class we extends It{constructor(t,n,a){super(t,n,a),this.name="HubApiError"}}class h extends Ee{constructor(t){super(t),this.name="ProviderOutputError"}}function Tt(e){return Array.isArray(e)?e:[e]}class K{provider;baseUrl;clientSideRoutingOnly;constructor(t,n,a=!1){this.provider=t,this.baseUrl=n,this.clientSideRoutingOnly=a}makeBaseUrl(t){return t.authMethod!=="provider-key"?`${At}/${this.provider}`:this.baseUrl}makeBody(t){return"data"in t.args&&t.args.data?t.args.data:JSON.stringify(this.preparePayload(t))}makeUrl(t){const n=this.makeBaseUrl(t),a=this.makeRoute(t).replace(/^\/+/,"");return t.urlTransform?t.urlTransform(`${n}/${a}`):`${n}/${a}`}prepareHeaders(t,n){const a={};return t.authMethod!=="none"&&(a.Authorization=`Bearer ${t.accessToken}`),n||(a["Content-Type"]="application/json"),a}}class q extends K{constructor(t,n,a=!1){super(t,n,a)}makeRoute(){return"v1/chat/completions"}preparePayload(t){return{...t.args,model:t.model}}async getResponse(t){if(typeof t=="object"&&Array.isArray(t?.choices)&&typeof t?.created=="number"&&typeof t?.id=="string"&&typeof t?.model=="string"&&(t.system_fingerprint===void 0||t.system_fingerprint===null||typeof t.system_fingerprint=="string")&&typeof t?.usage=="object")return t;throw new h("Expected ChatCompletionOutput")}}class ie extends K{constructor(t,n,a=!1){super(t,n,a)}preparePayload(t){return{...t.args,model:t.model}}makeRoute(){return"v1/completions"}async getResponse(t){const n=Tt(t);if(Array.isArray(n)&&n.length>0&&n.every(a=>typeof a=="object"&&!!a&&"generated_text"in a&&typeof a.generated_text=="string"))return n[0];throw new h("Expected Array<{generated_text: string}>")}}class St extends q{constructor(){super("auto","https://router.huggingface.co")}makeBaseUrl(t){if(t.authMethod!=="hf-token")throw new en("Cannot select auto-router when using non-Hugging Face API key.");return this.baseUrl}}function z(e){if(globalThis.Buffer)return globalThis.Buffer.from(e).toString("base64");{const t=[];return e.forEach(n=>{t.push(String.fromCharCode(n))}),globalThis.btoa(t.join(""))}}async function ae(e,t="image/jpeg"){const n=await e.arrayBuffer(),a=z(new Uint8Array(n));return`data:${t};base64,${a}`}function tn(e,t){return Object.assign({},...t.map(n=>{if(e[n]!==void 0)return{[n]:e[n]}}))}function Oe(e,t){return e.includes(t)}function A(e,t){const n=Array.isArray(t)?t:[t],a=Object.keys(e).filter(i=>!Oe(n,i));return tn(e,a)}const at=["feature-extraction","sentence-similarity"];class E extends K{constructor(){super("hf-inference",`${At}/hf-inference`)}preparePayload(t){return t.args}makeUrl(t){return t.model.startsWith("http://")||t.model.startsWith("https://")?t.model:super.makeUrl(t)}makeRoute(t){return t.task&&["feature-extraction","sentence-similarity"].includes(t.task)?`models/${t.model}/pipeline/${t.task}`:`models/${t.model}`}async getResponse(t){return t}}class nn extends E{preparePayload(t){if(t.outputType==="url")throw new D("hf-inference provider does not support URL output. Use outputType 'blob', 'dataUrl' or 'json' instead.");return t.args}async getResponse(t,n,a,i){if(!t)throw new h("Received malformed response from HF-Inference text-to-image API: response is undefined");if(typeof t=="object"){if(i==="json")return{...t};if("data"in t&&Array.isArray(t.data)&&t.data[0].b64_json){const o=t.data[0].b64_json;return i==="dataUrl"?`data:image/jpeg;base64,${o}`:await(await fetch(`data:image/jpeg;base64,${o}`)).blob()}if("output"in t&&Array.isArray(t.output)){const r=await(await fetch(t.output[0])).blob();return i==="dataUrl"?ae(r):r}}if(t instanceof Blob)return i==="dataUrl"?ae(t):i==="json"?{output:await ae(t)}:t;throw new h("Received malformed response from HF-Inference text-to-image API: expected a Blob")}}class an extends E{makeUrl(t){let n;return t.model.startsWith("http://")||t.model.startsWith("https://")?n=t.model.trim():n=`${this.makeBaseUrl(t)}/models/${t.model}`,n=n.replace(/\/+$/,""),n.endsWith("/v1")?n+="/chat/completions":n.endsWith("/chat/completions")||(n+="/v1/chat/completions"),n}preparePayload(t){return{...t.args,model:t.model}}async getResponse(t){return t}}class on extends E{async getResponse(t){const n=Tt(t);if(Array.isArray(n)&&n.every(a=>"generated_text"in a&&typeof a?.generated_text=="string"))return n?.[0];throw new h("Received malformed response from HF-Inference text generation API: expected Array<{generated_text: string}>")}}class rn extends E{async getResponse(t){if(Array.isArray(t)&&t.every(n=>typeof n=="object"&&n!==null&&typeof n.label=="string"&&typeof n.score=="number"))return t;throw new h("Received malformed response from HF-Inference audio-classification API: expected Array<{label: string, score: number}> but received different format")}}class sn extends E{async getResponse(t){return t}async preparePayloadAsync(t){return"data"in t?t:{...A(t,"inputs"),data:t.inputs}}}class ln extends E{async getResponse(t){if(!Array.isArray(t))throw new h("Received malformed response from HF-Inference audio-to-audio API: expected Array");if(!t.every(n=>typeof n=="object"&&n&&"label"in n&&typeof n.label=="string"&&"content-type"in n&&typeof n["content-type"]=="string"&&"blob"in n&&typeof n.blob=="string"))throw new h("Received malformed response from HF-Inference audio-to-audio API: expected Array<{label: string, audio: Blob}>");return t}}class cn extends E{async getResponse(t){if(Array.isArray(t)&&t.every(n=>typeof n=="object"&&!!n&&typeof n?.answer=="string"&&(typeof n.end=="number"||typeof n.end>"u")&&(typeof n.score=="number"||typeof n.score>"u")&&(typeof n.start=="number"||typeof n.start>"u")))return t[0];throw new h("Received malformed response from HF-Inference document-question-answering API: expected Array<{answer: string, end: number, score: number, start: number}>")}}class pn extends E{async getResponse(t){const n=(a,i,o=0)=>o>i?!1:a.every(r=>Array.isArray(r))?a.every(r=>n(r,i,o+1)):a.every(r=>typeof r=="number");if(Array.isArray(t)&&n(t,3,0))return t;throw new h("Received malformed response from HF-Inference feature-extraction API: expected Array<number[][][] | number[][] | number[] | number>")}}class dn extends E{async getResponse(t){if(Array.isArray(t)&&t.every(n=>typeof n.label=="string"&&typeof n.score=="number"))return t;throw new h("Received malformed response from HF-Inference image-classification API: expected Array<{label: string, score: number}>")}}class un extends E{async getResponse(t){if(Array.isArray(t)&&t.every(n=>typeof n.label=="string"&&typeof n.mask=="string"&&(n.score===void 0||typeof n.score=="number")))return t;throw new h("Received malformed response from HF-Inference image-segmentation API: expected Array<{label: string, mask: string, score: number}>")}async preparePayloadAsync(t){return{...t,inputs:z(new Uint8Array(t.inputs instanceof ArrayBuffer?t.inputs:await t.inputs.arrayBuffer()))}}}class mn extends E{async getResponse(t){if(typeof t?.generated_text!="string")throw new h("Received malformed response from HF-Inference image-to-text API: expected {generated_text: string}");return t}}class fn extends E{async preparePayloadAsync(t){return t.parameters?{...t,inputs:z(new Uint8Array(t.inputs instanceof ArrayBuffer?t.inputs:await t.inputs.arrayBuffer()))}:{...t,model:t.model,data:t.inputs}}async getResponse(t){if(t instanceof Blob)return t;throw new h("Received malformed response from HF-Inference image-to-image API: expected Blob")}}class gn extends E{async getResponse(t){if(Array.isArray(t)&&t.every(n=>typeof n.label=="string"&&typeof n.score=="number"&&typeof n.box.xmin=="number"&&typeof n.box.ymin=="number"&&typeof n.box.xmax=="number"&&typeof n.box.ymax=="number"))return t;throw new h("Received malformed response from HF-Inference object-detection API: expected Array<{label: string, score: number, box: {xmin: number, ymin: number, xmax: number, ymax: number}}>")}}class hn extends E{async getResponse(t){if(Array.isArray(t)&&t.every(n=>typeof n.label=="string"&&typeof n.score=="number"))return t;throw new h("Received malformed response from HF-Inference zero-shot-image-classification API: expected Array<{label: string, score: number}>")}}class bn extends E{async getResponse(t){const n=t?.[0];if(Array.isArray(n)&&n.every(a=>typeof a?.label=="string"&&typeof a.score=="number"))return n;throw new h("Received malformed response from HF-Inference text-classification API: expected Array<{label: string, score: number}>")}}class yn extends E{async getResponse(t){if(Array.isArray(t)?t.every(n=>typeof n=="object"&&!!n&&typeof n.answer=="string"&&typeof n.end=="number"&&typeof n.score=="number"&&typeof n.start=="number"):typeof t=="object"&&t&&typeof t.answer=="string"&&typeof t.end=="number"&&typeof t.score=="number"&&typeof t.start=="number")return Array.isArray(t)?t[0]:t;throw new h("Received malformed response from HF-Inference question-answering API: expected Array<{answer: string, end: number, score: number, start: number}>")}}class wn extends E{async getResponse(t){if(Array.isArray(t)&&t.every(n=>typeof n.score=="number"&&typeof n.sequence=="string"&&typeof n.token=="number"&&typeof n.token_str=="string"))return t;throw new h("Received malformed response from HF-Inference fill-mask API: expected Array<{score: number, sequence: string, token: number, token_str: string}>")}}class Fe extends E{async getResponse(t){if(typeof t=="object"&&t!==null&&"labels"in t&&"scores"in t&&Array.isArray(t.labels)&&Array.isArray(t.scores)&&t.labels.length===t.scores.length&&t.labels.every(n=>typeof n=="string")&&t.scores.every(n=>typeof n=="number")){const n=t.scores;return t.labels.map((a,i)=>({label:a,score:n[i]}))}if(Array.isArray(t)&&t.every(Fe.validateOutputElement))return t;throw new h("Received malformed response from HF-Inference zero-shot-classification API: expected Array<{label: string, score: number}>")}static validateOutputElement(t){return typeof t=="object"&&!!t&&"label"in t&&"score"in t&&typeof t.label=="string"&&typeof t.score=="number"}}class vn extends E{async getResponse(t){if(Array.isArray(t)&&t.every(n=>typeof n=="number"))return t;throw new h("Received malformed response from HF-Inference sentence-similarity API: expected Array<number>")}}class Ce extends E{static validate(t){return typeof t=="object"&&!!t&&"aggregator"in t&&typeof t.aggregator=="string"&&"answer"in t&&typeof t.answer=="string"&&"cells"in t&&Array.isArray(t.cells)&&t.cells.every(n=>typeof n=="string")&&"coordinates"in t&&Array.isArray(t.coordinates)&&t.coordinates.every(n=>Array.isArray(n)&&n.every(a=>typeof a=="number"))}async getResponse(t){if(Array.isArray(t)&&Array.isArray(t)?t.every(n=>Ce.validate(n)):Ce.validate(t))return Array.isArray(t)?t[0]:t;throw new h("Received malformed response from HF-Inference table-question-answering API: expected {aggregator: string, answer: string, cells: string[], coordinates: number[][]}")}}class _n extends E{async getResponse(t){if(Array.isArray(t)&&t.every(n=>typeof n.end=="number"&&typeof n.entity_group=="string"&&typeof n.score=="number"&&typeof n.start=="number"&&typeof n.word=="string"))return t;throw new h("Received malformed response from HF-Inference token-classification API: expected Array<{end: number, entity_group: string, score: number, start: number, word: string}>")}}class xn extends E{async getResponse(t){if(Array.isArray(t)&&t.every(n=>typeof n?.translation_text=="string"))return t?.length===1?t?.[0]:t;throw new h("Received malformed response from HF-Inference translation API: expected Array<{translation_text: string}>")}}class kn extends E{async getResponse(t){if(Array.isArray(t)&&t.every(n=>typeof n?.summary_text=="string"))return t?.[0];throw new h("Received malformed response from HF-Inference summarization API: expected Array<{summary_text: string}>")}}class An extends E{async getResponse(t){return t}}class In extends E{async getResponse(t){if(Array.isArray(t)&&t.every(n=>typeof n=="number"))return t;throw new h("Received malformed response from HF-Inference tabular-classification API: expected Array<number>")}}class Tn extends E{async getResponse(t){if(Array.isArray(t)&&t.every(n=>typeof n=="object"&&!!n&&typeof n?.answer=="string"&&typeof n.score=="number"))return t[0];throw new h("Received malformed response from HF-Inference visual-question-answering API: expected Array<{answer: string, score: number}>")}}class Sn extends E{async getResponse(t){if(Array.isArray(t)&&t.every(n=>typeof n=="number"))return t;throw new h("Received malformed response from HF-Inference tabular-regression API: expected Array<number>")}}class Pn extends E{async getResponse(t){return t}}let Rn=console;function _e(){return Rn}const je=new Map;function Cn(e,t){return t?Array.isArray(t)?t:Object.entries(t).map(([n,a])=>({provider:n,hfModelId:e,providerId:a.providerId,status:a.status,task:a.task,adapter:a.adapter,adapterWeightsPath:a.adapterWeightsPath})):[]}async function Pt(e,t,n){let a;if(je.has(e))a=je.get(e);else{const i=`${Be}/api/models/${e}?expand[]=inferenceProviderMapping`,o=await(n?.fetch??fetch)(i,{headers:t?.startsWith("hf_")?{Authorization:`Bearer ${t}`}:{}});if(!o.ok)if(o.headers.get("Content-Type")?.startsWith("application/json")){const c=await o.json();if("error"in c&&typeof c.error=="string")throw new we(`Failed to fetch inference provider mapping for model ${e}: ${c.error}`,{url:i,method:"GET"},{requestId:o.headers.get("x-request-id")??"",status:o.status,body:c})}else throw new we(`Failed to fetch inference provider mapping for model ${e}`,{url:i,method:"GET"},{requestId:o.headers.get("x-request-id")??"",status:o.status,body:await o.text()});let r=null;try{r=await o.json()}catch{throw new we(`Failed to fetch inference provider mapping for model ${e}: malformed API response, invalid JSON`,{url:i,method:"GET"},{requestId:o.headers.get("x-request-id")??"",status:o.status,body:await o.text()})}if(!r?.inferenceProviderMapping)throw new we(`We have not been able to find inference provider information for model ${e}.`,{url:i,method:"GET"},{requestId:o.headers.get("x-request-id")??"",status:o.status,body:await o.text()});a=Cn(e,r.inferenceProviderMapping),je.set(e,a)}return a}async function En(e,t){const n=_e();if(e.provider==="auto"&&e.task==="conversational")return{hfModelId:e.modelId,provider:"auto",providerId:e.modelId,status:"live",task:"conversational"};if(nt[e.provider][e.modelId])return nt[e.provider][e.modelId];const i=(await Pt(e.modelId,e.accessToken,t)).find(o=>o.provider===e.provider);if(i){const o=e.provider==="hf-inference"&&Oe(at,e.task)?at:[e.task];if(!Oe(o,i.task))throw new D(`Model ${e.modelId} is not supported for task ${e.task} and provider ${e.provider}. Supported task: ${i.task}.`);return i.status==="staging"&&n.warn(`Model ${e.modelId} is in staging mode for provider ${e.provider}. Meant for test purposes only.`),i}return null}async function S(e,t,n){const a=_e();if(n){if(e)throw new D("Specifying both endpointUrl and provider is not supported.");return"hf-inference"}if(e||(a.log("Defaulting to 'auto' which will select the first provider available for the model, sorted by the user's order in https://hf.co/settings/inference-providers."),e="auto"),e==="auto"){if(!t)throw new D("Specifying a model is required when provider is 'auto'");e=(await Pt(t))[0]?.provider,a.log("Auto selected provider:",e)}if(!e)throw new D(`No Inference Provider available for model ${t}.`);return e}const Un="https://inference.baseten.co";class $n extends q{constructor(){super("baseten",Un)}}const Dn="https://api.clarifai.com";class Ln extends q{constructor(){super("clarifai",Dn)}makeRoute(){return"/v2/ext/openai/v1/chat/completions"}prepareHeaders(t,n){const a={Authorization:t.authMethod!=="provider-key"?`Bearer ${t.accessToken}`:`Key ${t.accessToken}`};return n||(a["Content-Type"]="application/json"),a}}function xe(e){return new Promise(t=>{setTimeout(()=>t(),e)})}const jn="https://api.us1.bfl.ai";class Mn extends K{constructor(){super("black-forest-labs",jn)}preparePayload(t){return{...A(t.args,["inputs","parameters"]),...t.args.parameters,prompt:t.args.inputs}}prepareHeaders(t,n){const a={Authorization:t.authMethod!=="provider-key"?`Bearer ${t.accessToken}`:`X-Key ${t.accessToken}`};return n||(a["Content-Type"]="application/json"),a}makeRoute(t){if(!t)throw new D("Params are required");return`/v1/${t.model}`}async getResponse(t,n,a,i){const o=_e(),r=new URL(t.polling_url);for(let c=0;c<5;c++){await xe(1e3),o.debug(`Polling Black Forest Labs API for the result... ${c+1}/5`),r.searchParams.set("attempt",c.toString(10));const d=await fetch(r,{headers:{"Content-Type":"application/json"}});if(!d.ok)throw new N("Failed to fetch result from black forest labs API",{url:r.toString(),method:"GET",headers:{"Content-Type":"application/json"}},{requestId:d.headers.get("x-request-id")??"",status:d.status,body:await d.text()});const s=await d.json();if(typeof s=="object"&&s&&"status"in s&&typeof s.status=="string"&&s.status==="Ready"&&"result"in s&&typeof s.result=="object"&&s.result&&"sample"in s.result&&typeof s.result.sample=="string")return i==="json"?s.result:i==="url"?s.result.sample:await(await fetch(s.result.sample)).blob()}throw new h("Timed out while waiting for the result from black forest labs API - aborting after 5 attempts")}}class Nn extends q{constructor(){super("cerebras","https://api.cerebras.ai")}}class On extends q{constructor(){super("cohere","https://api.cohere.com")}makeRoute(){return"/compatibility/v1/chat/completions"}}function ee(e){return/^http(s?):/.test(e)||e.startsWith("/")}const it=["audio/mpeg","audio/mp4","audio/wav","audio/x-wav"];class Ve extends K{constructor(t){super("fal-ai",t||"https://fal.run")}preparePayload(t){return t.args}makeRoute(t){return`/${t.model}`}prepareHeaders(t,n){const a={Authorization:t.authMethod!=="provider-key"?`Bearer ${t.accessToken}`:`Key ${t.accessToken}`};return n||(a["Content-Type"]="application/json"),a}}class ke extends Ve{makeRoute(t){return t.authMethod!=="provider-key"?`/${t.model}?_subdomain=queue`:`/${t.model}`}async getResponseFromQueueApi(t,n,a){if(!n||!a)throw new D(`URL and headers are required for ${this.task} task`);if(!t.request_id)throw new h(`Received malformed response from Fal.ai ${this.task} API: no request ID found in the response`);let o=t.status;const r=new URL(n),c=`${r.protocol}//${r.host}${r.host==="router.huggingface.co"?"/fal-ai":""}`,d=new URL(t.response_url).pathname,s=r.search,p=`${c}${d}/status${s}`,u=`${c}${d}${s}`;for(;o!=="COMPLETED";){await xe(500);const C=await fetch(p,{headers:a});if(!C.ok)throw new N("Failed to fetch response status from fal-ai API",{url:p,method:"GET"},{requestId:C.headers.get("x-request-id")??"",status:C.status,body:await C.text()});try{o=(await C.json()).status}catch{throw new h("Failed to parse status response from fal-ai API: received malformed response")}}const g=await fetch(u,{headers:a});let w;try{w=await g.json()}catch{throw new h("Failed to parse result response from fal-ai API: received malformed response")}return w}}function Rt(e,t){return`${Be}/${e}/resolve/main/${t}`}class qn extends ke{task;constructor(){super("https://queue.fal.run"),this.task="text-to-image"}preparePayload(t){const n={...A(t.args,["inputs","parameters"]),...t.args.parameters,prompt:t.args.inputs};return t.mapping?.adapter==="lora"&&t.mapping.adapterWeightsPath&&(n.loras=[{path:Rt(t.mapping.hfModelId,t.mapping.adapterWeightsPath),scale:1}],t.mapping.providerId==="fal-ai/lora"&&(n.model_name="stabilityai/stable-diffusion-xl-base-1.0")),n}async getResponse(t,n,a,i){const o=await this.getResponseFromQueueApi(t,n,a);if(typeof o=="object"&&"images"in o&&Array.isArray(o.images)&&o.images.length>0&&"url"in o.images[0]&&typeof o.images[0].url=="string"&&ee(o.images[0].url)){if(i==="json")return{...o};if(i==="url")return o.images[0].url;const c=await(await fetch(o.images[0].url)).blob();return i==="dataUrl"?ae(c):c}throw new h(`Received malformed response from Fal.ai text-to-image API: expected { images: Array<{ url: string }> } result format, got instead: ${JSON.stringify(o)}`)}}class Ct extends ke{task;constructor(){super("https://queue.fal.run"),this.task="image-to-image"}preparePayload(t){const n=t.args;return t.mapping?.adapter==="lora"&&t.mapping.adapterWeightsPath&&(n.loras=[{path:Rt(t.mapping.hfModelId,t.mapping.adapterWeightsPath),scale:1}]),n}async preparePayloadAsync(t){const a=`data:${t.inputs instanceof Blob?t.inputs.type:"image/png"};base64,${z(new Uint8Array(t.inputs instanceof ArrayBuffer?t.inputs:await t.inputs.arrayBuffer()))}`;return{...A(t,["inputs","parameters"]),image_url:a,...t.parameters,...t,image_urls:[a]}}async getResponse(t,n,a){const i=await this.getResponseFromQueueApi(t,n,a);if(typeof i=="object"&&i&&"images"in i&&Array.isArray(i.images)&&i.images.length>0&&typeof i.images[0]=="object"&&i.images[0]&&"url"in i.images[0]&&typeof i.images[0].url=="string"&&ee(i.images[0].url))return await(await fetch(i.images[0].url)).blob();throw new h(`Received malformed response from Fal.ai image-to-image API: expected { images: Array<{ url: string }> } result format, got instead: ${JSON.stringify(i)}`)}}class Bn extends Ct{constructor(){super(),this.task="image-text-to-image"}async preparePayloadAsync(t){return t.inputs?super.preparePayloadAsync(t):{...A(t,["inputs","parameters"]),...t.parameters,prompt:t.parameters?.prompt,urlTransform:n=>{const a=new URL(n);return a.pathname=a.pathname.split("/").slice(0,-1).join("/"),a.toString()}}}}class Fn extends ke{task;constructor(){super("https://queue.fal.run"),this.task="text-to-video"}preparePayload(t){return{...A(t.args,["inputs","parameters"]),...t.args.parameters,prompt:t.args.inputs}}async getResponse(t,n,a){const i=await this.getResponseFromQueueApi(t,n,a);if(typeof i=="object"&&i&&"video"in i&&typeof i.video=="object"&&i.video&&"url"in i.video&&typeof i.video.url=="string"&&ee(i.video.url))return await(await fetch(i.video.url)).blob();throw new h(`Received malformed response from Fal.ai text-to-video API: expected { video: { url: string } } result format, got instead: ${JSON.stringify(i)}`)}}class Et extends ke{task;constructor(){super("https://queue.fal.run"),this.task="image-to-video"}preparePayload(t){return{...A(t.args,["inputs","parameters"]),...t.args.parameters,image_url:t.args.image_url}}async preparePayloadAsync(t){const n=t.inputs instanceof Blob?t.inputs.type:"image/png";return{...A(t,["inputs","parameters"]),image_url:`data:${n};base64,${z(new Uint8Array(t.inputs instanceof ArrayBuffer?t.inputs:await t.inputs.arrayBuffer()))}`,...t.parameters,...t}}async getResponse(t,n,a){const i=await this.getResponseFromQueueApi(t,n,a);if(typeof i=="object"&&i!==null&&"video"in i&&typeof i.video=="object"&&i.video!==null&&"url"in i.video&&typeof i.video.url=="string"&&"url"in i.video&&ee(i.video.url))return await(await fetch(i.video.url)).blob();throw new h(`Received malformed response from Fal.ai image‑to‑video API: expected { video: { url: string } }, got: ${JSON.stringify(i)}`)}}class Vn extends Et{constructor(){super(),this.task="image-text-to-video"}async preparePayloadAsync(t){return t.inputs?super.preparePayloadAsync(t):{...A(t,["inputs","parameters"]),...t.parameters,prompt:t.parameters?.prompt,urlTransform:n=>{const a=new URL(n);return a.pathname=a.pathname.split("/").slice(0,-1).join("/"),a.toString()}}}}class Hn extends Ve{prepareHeaders(t,n){const a=super.prepareHeaders(t,n);return a["Content-Type"]="application/json",a}async getResponse(t){const n=t;if(typeof n?.text!="string")throw new h(`Received malformed response from Fal.ai Automatic Speech Recognition API: expected { text: string } format, got instead: ${JSON.stringify(t)}`);return{text:n.text}}async preparePayloadAsync(t){const n="data"in t&&t.data instanceof Blob?t.data:"inputs"in t?t.inputs:void 0,a=n?.type;if(!a)throw new D("Unable to determine the input's content-type. Make sure your are passing a Blob when using provider fal-ai.");if(!it.includes(a))throw new D(`Provider fal-ai does not support blob type ${a} - supported content types are: ${it.join(", ")}`);const i=z(new Uint8Array(await n.arrayBuffer()));return{..."data"in t?A(t,"data"):A(t,"inputs"),audio_url:`data:${a};base64,${i}`}}}class Kn extends Ve{preparePayload(t){return{...A(t.args,["inputs","parameters"]),...t.args.parameters,text:t.args.inputs}}async getResponse(t){const n=t;if(typeof n?.audio?.url!="string")throw new h(`Received malformed response from Fal.ai Text-to-Speech API: expected { audio: { url: string } } format, got instead: ${JSON.stringify(t)}`);const a=await fetch(n.audio.url);if(!a.ok)throw new N(`Failed to fetch audio from ${n.audio.url}: ${a.statusText}`,{url:n.audio.url,method:"GET",headers:{"Content-Type":"application/json"}},{requestId:a.headers.get("x-request-id")??"",status:a.status,body:await a.text()});try{return await a.blob()}catch(i){throw new N(`Failed to fetch audio from ${n.audio.url}: ${i instanceof Error?i.message:String(i)}`,{url:n.audio.url,method:"GET",headers:{"Content-Type":"application/json"}},{requestId:a.headers.get("x-request-id")??"",status:a.status,body:await a.text()})}}}class zn extends ke{task;constructor(){super("https://queue.fal.run"),this.task="image-segmentation"}preparePayload(t){return{...A(t.args,["inputs","parameters"]),...t.args.parameters,sync_mode:!0}}async preparePayloadAsync(t){const n="data"in t&&t.data instanceof Blob?t.data:"inputs"in t?t.inputs:void 0,a=n instanceof Blob?n.type:"image/png",i=z(new Uint8Array(n instanceof ArrayBuffer?n:await n.arrayBuffer()));return{...A(t,["inputs","parameters","data"]),...t.parameters,...t,image_url:`data:${a};base64,${i}`,sync_mode:!0}}async getResponse(t,n,a){const i=await this.getResponseFromQueueApi(t,n,a);if(typeof i=="object"&&i!==null&&"image"in i&&typeof i.image=="object"&&i.image!==null&&"url"in i.image&&typeof i.image.url=="string"){const o=await fetch(i.image.url);if(!o.ok)throw new N(`Failed to fetch segmentation mask from ${i.image.url}`,{url:i.image.url,method:"GET"},{requestId:o.headers.get("x-request-id")??"",status:o.status,body:await o.text()});const c=await(await o.blob()).arrayBuffer();return[{label:"mask",score:1,mask:z(new Uint8Array(c))}]}throw new h(`Received malformed response from Fal.ai image-segmentation API: expected { image: { url: string } } format, got instead: ${JSON.stringify(t)}`)}}const Ut="https://api.featherless.ai";class Wn extends q{constructor(){super("featherless-ai",Ut)}}class Xn extends ie{constructor(){super("featherless-ai",Ut)}preparePayload(t){return{model:t.model,...A(t.args,["inputs","parameters"]),...t.args.parameters?{max_tokens:t.args.parameters.max_new_tokens,...A(t.args.parameters,"max_new_tokens")}:void 0,prompt:t.args.inputs}}async getResponse(t){if(typeof t=="object"&&"choices"in t&&Array.isArray(t?.choices)&&typeof t?.model=="string")return{generated_text:t.choices[0].text};throw new h("Received malformed response from Featherless AI text generation API")}}class Qn extends q{constructor(){super("fireworks-ai","https://api.fireworks.ai")}makeRoute(){return"/inference/v1/chat/completions"}}const $t="https://api.groq.com";class Jn extends ie{constructor(){super("groq",$t)}makeRoute(){return"/openai/v1/chat/completions"}}class Yn extends q{constructor(){super("groq",$t)}makeRoute(){return"/openai/v1/chat/completions"}}const He="https://api.hyperbolic.xyz";class Zn extends q{constructor(){super("hyperbolic",He)}}class Gn extends ie{constructor(){super("hyperbolic",He)}makeRoute(){return"v1/chat/completions"}preparePayload(t){return{messages:[{content:t.args.inputs,role:"user"}],...t.args.parameters?{max_tokens:t.args.parameters.max_new_tokens,...A(t.args.parameters,"max_new_tokens")}:void 0,...A(t.args,["inputs","parameters"]),model:t.model}}async getResponse(t){if(typeof t=="object"&&"choices"in t&&Array.isArray(t?.choices)&&typeof t?.model=="string")return{generated_text:t.choices[0].message.content};throw new h("Received malformed response from Hyperbolic text generation API")}}class ea extends K{constructor(){super("hyperbolic",He)}makeRoute(t){return"/v1/images/generations"}preparePayload(t){if(t.outputType==="url")throw new D("hyperbolic provider does not support URL output. Use outputType 'blob', 'dataUrl' or 'json' instead.");return{...A(t.args,["inputs","parameters"]),...t.args.parameters,prompt:t.args.inputs,model_name:t.model}}async getResponse(t,n,a,i){if(typeof t=="object"&&"images"in t&&Array.isArray(t.images)&&t.images[0]&&typeof t.images[0].image=="string")return i==="json"?{...t}:i==="dataUrl"?`data:image/jpeg;base64,${t.images[0].image}`:fetch(`data:image/jpeg;base64,${t.images[0].image}`).then(o=>o.blob());throw new h("Received malformed response from Hyperbolic text-to-image API")}}const Ue="https://api.studio.nebius.ai";class ta extends q{constructor(){super("nebius",Ue)}preparePayload(t){const n=super.preparePayload(t),a=t.args.response_format;return a?.type==="json_schema"&&a.json_schema?.schema&&(n.guided_json=a.json_schema.schema),n}}class na extends ie{constructor(){super("nebius",Ue)}preparePayload(t){return{...t.args,model:t.model,prompt:t.args.inputs}}async getResponse(t){if(typeof t=="object"&&"choices"in t&&Array.isArray(t?.choices)&&t.choices.length>0&&typeof t.choices[0]?.text=="string")return{generated_text:t.choices[0].text};throw new h("Received malformed response from Nebius text generation API")}}class aa extends K{constructor(){super("nebius",Ue)}preparePayload(t){return{...A(t.args,["inputs","parameters"]),...t.args.parameters,response_format:t.outputType==="url"?"url":"b64_json",prompt:t.args.inputs,model:t.model}}makeRoute(){return"v1/images/generations"}async getResponse(t,n,a,i){if(typeof t=="object"&&"data"in t&&Array.isArray(t.data)&&t.data.length>0){if(i==="json")return{...t};if("url"in t.data[0]&&typeof t.data[0].url=="string")return t.data[0].url;if("b64_json"in t.data[0]&&typeof t.data[0].b64_json=="string"){const o=t.data[0].b64_json;return i==="dataUrl"?`data:image/jpeg;base64,${o}`:fetch(`data:image/jpeg;base64,${o}`).then(r=>r.blob())}}throw new h("Received malformed response from Nebius text-to-image API")}}class ia extends K{constructor(){super("nebius",Ue)}preparePayload(t){return{input:t.args.inputs,model:t.model}}makeRoute(){return"v1/embeddings"}async getResponse(t){return t.data.map(n=>n.embedding)}}const Ke="https://api.novita.ai";class oa extends ie{constructor(){super("novita",Ke)}makeRoute(){return"/v3/openai/chat/completions"}}class ra extends q{constructor(){super("novita",Ke)}makeRoute(){return"/v3/openai/chat/completions"}}class sa extends K{constructor(){super("novita",Ke)}makeRoute(t){return`/v3/async/${t.model}`}preparePayload(t){const{num_inference_steps:n,...a}=t.args.parameters??{};return{...A(t.args,["inputs","parameters"]),...a,steps:n,prompt:t.args.inputs}}async getResponse(t,n,a){if(!n||!a)throw new D("URL and headers are required for text-to-video task");const i=t.task_id;if(!i)throw new h("Received malformed response from Novita text-to-video API: no task ID found in the response");const o=new URL(n),c=`${`${o.protocol}//${o.host}${o.host==="router.huggingface.co"?"/novita":""}`}/v3/async/task-result?task_id=${i}`;let d="",s;for(;d!=="TASK_STATUS_SUCCEED"&&d!=="TASK_STATUS_FAILED";){await xe(500);const p=await fetch(c,{headers:a});if(!p.ok)throw new N("Failed to fetch task result",{url:c,method:"GET",headers:a},{requestId:p.headers.get("x-request-id")??"",status:p.status,body:await p.text()});try{if(s=await p.json(),s&&typeof s=="object"&&"task"in s&&s.task&&typeof s.task=="object"&&"status"in s.task&&typeof s.task.status=="string")d=s.task.status;else throw new h("Received malformed response from Novita text-to-video API: failed to get task status")}catch{throw new h("Received malformed response from Novita text-to-video API: failed to parse task result")}}if(d==="TASK_STATUS_FAILED")throw new h("Novita text-to-video task failed");if(typeof s=="object"&&s&&"videos"in s&&typeof s.videos=="object"&&s.videos&&Array.isArray(s.videos)&&s.videos.length>0&&"video_url"in s.videos[0]&&typeof s.videos[0].video_url=="string"&&ee(s.videos[0].video_url))return await(await fetch(s.videos[0].video_url)).blob();throw new h(`Received malformed response from Novita text-to-video API: expected { videos: [{ video_url: string }] } format, got instead: ${JSON.stringify(s)}`)}}const Dt="https://inference.api.nscale.com";class la extends q{constructor(){super("nscale",Dt)}}class ca extends K{constructor(){super("nscale",Dt)}preparePayload(t){if(t.outputType==="url")throw new D("nscale provider does not support URL output. Use outputType 'blob', 'dataUrl' or 'json' instead.");return{...A(t.args,["inputs","parameters"]),...t.args.parameters,response_format:"b64_json",prompt:t.args.inputs,model:t.model}}makeRoute(){return"v1/images/generations"}async getResponse(t,n,a,i){if(typeof t=="object"&&"data"in t&&Array.isArray(t.data)&&t.data.length>0&&"b64_json"in t.data[0]&&typeof t.data[0].b64_json=="string"){if(i==="json")return{...t};const o=t.data[0].b64_json;return i==="dataUrl"?`data:image/jpeg;base64,${o}`:fetch(`data:image/jpeg;base64,${o}`).then(r=>r.blob())}throw new h("Received malformed response from Nscale text-to-image API")}}const pa="https://api.openai.com";class da extends q{constructor(){super("openai",pa,!0)}}const Lt="https://oai.endpoints.kepler.ai.cloud.ovh.net";class ua extends q{constructor(){super("ovhcloud",Lt)}}class ma extends ie{constructor(){super("ovhcloud",Lt)}preparePayload(t){return{model:t.model,...A(t.args,["inputs","parameters"]),...t.args.parameters?{max_tokens:t.args.parameters.max_new_tokens,...A(t.args.parameters,"max_new_tokens")}:void 0,prompt:t.args.inputs}}async getResponse(t){if(typeof t=="object"&&"choices"in t&&Array.isArray(t?.choices)&&typeof t?.model=="string")return{generated_text:t.choices[0].text};throw new h("Received malformed response from OVHcloud text generation API")}}class fa extends q{constructor(){super("publicai","https://api.publicai.co")}}class Ae extends K{constructor(t){super("replicate",t||"https://api.replicate.com")}makeRoute(t){return t.model.includes(":")?"v1/predictions":`v1/models/${t.model}/predictions`}preparePayload(t){return{input:{...A(t.args,["inputs","parameters"]),...t.args.parameters,prompt:t.args.inputs},version:t.model.includes(":")?t.model.split(":")[1]:void 0}}prepareHeaders(t,n){const a={Authorization:`Bearer ${t.accessToken}`,Prefer:"wait"};return n||(a["Content-Type"]="application/json"),a}makeUrl(t){const n=this.makeBaseUrl(t);return t.model.includes(":")?`${n}/v1/predictions`:`${n}/v1/models/${t.model}/predictions`}}class ga extends Ae{preparePayload(t){return{input:{...A(t.args,["inputs","parameters"]),...t.args.parameters,prompt:t.args.inputs,lora_weights:t.mapping?.adapter==="lora"&&t.mapping.adapterWeightsPath?`https://huggingface.co/${t.mapping.hfModelId}`:void 0},version:t.model.includes(":")?t.model.split(":")[1]:void 0}}async getResponse(t,n,a,i){if(typeof t=="object"&&"output"in t&&typeof t.output=="string"&&ee(t.output)){if(i==="json")return{...t};if(i==="url")return t.output;const r=await(await fetch(t.output)).blob();return i==="dataUrl"?ae(r):r}if(typeof t=="object"&&"output"in t&&Array.isArray(t.output)&&t.output.length>0&&typeof t.output[0]=="string"){if(i==="json")return{...t};if(i==="url")return t.output[0];const r=await(await fetch(t.output[0])).blob();return i==="dataUrl"?ae(r):r}throw new h("Received malformed response from Replicate text-to-image API")}}class ha extends Ae{preparePayload(t){const n=super.preparePayload(t),a=n.input;if(typeof a=="object"&&a!==null&&"prompt"in a){const i=a;i.text=i.prompt,delete i.prompt}return n}async getResponse(t){if(t instanceof Blob)return t;if(t&&typeof t=="object"&&"output"in t){if(typeof t.output=="string")return await(await fetch(t.output)).blob();if(Array.isArray(t.output))return await(await fetch(t.output[0])).blob()}throw new h("Received malformed response from Replicate text-to-speech API")}}class ba extends Ae{async getResponse(t){if(typeof t=="object"&&t&&"output"in t&&typeof t.output=="string"&&ee(t.output))return await(await fetch(t.output)).blob();throw new h("Received malformed response from Replicate text-to-video API")}}class ya extends Ae{preparePayload(t){return{input:{...A(t.args,["inputs","parameters"]),...t.args.parameters,audio:t.args.inputs},version:t.model.includes(":")?t.model.split(":")[1]:void 0}}async preparePayloadAsync(t){const n="data"in t&&t.data instanceof Blob?t.data:"inputs"in t?t.inputs:void 0;if(!n||!(n instanceof Blob))throw new Error("Audio input must be a Blob");const a=new Uint8Array(await n.arrayBuffer()),i=z(a),o=`data:${n.type||"audio/wav"};base64,${i}`;return{..."data"in t?A(t,"data"):A(t,"inputs"),inputs:o}}async getResponse(t){if(typeof t?.output=="string")return{text:t.output};if(Array.isArray(t?.output)&&typeof t.output[0]=="string")return{text:t.output[0]};const n=t?.output;if(n&&typeof n=="object"){if(typeof n.transcription=="string")return{text:n.transcription};if(typeof n.translation=="string")return{text:n.translation};if(typeof n.txt_file=="string")return{text:await(await fetch(n.txt_file)).text()}}throw new h("Received malformed response from Replicate automatic-speech-recognition API")}}class wa extends Ae{preparePayload(t){const n=t.args.inputs;return{input:{...A(t.args,["inputs","parameters"]),...t.args.parameters,image:n,images:[n],input_image:n,input_images:[n],lora_weights:t.mapping?.adapter==="lora"&&t.mapping.adapterWeightsPath?`https://huggingface.co/${t.mapping.hfModelId}`:void 0},version:t.model.includes(":")?t.model.split(":")[1]:void 0}}async preparePayloadAsync(t){const{inputs:n,...a}=t,i=new Uint8Array(await n.arrayBuffer()),o=z(i),r=`data:${n.type||"image/jpeg"};base64,${o}`;return{...a,inputs:r}}async getResponse(t){if(typeof t=="object"&&t&&"output"in t&&Array.isArray(t.output)&&t.output.length>0&&typeof t.output[0]=="string")return await(await fetch(t.output[0])).blob();if(typeof t=="object"&&t&&"output"in t&&typeof t.output=="string"&&ee(t.output))return await(await fetch(t.output)).blob();throw new h("Received malformed response from Replicate image-to-image API")}}class va extends q{constructor(){super("sambanova","https://api.sambanova.ai")}preparePayload(t){const n=t.args.response_format;return n?.type==="json_schema"&&n.json_schema&&(n.json_schema.strict??!0)&&(n.json_schema.strict=!1),super.preparePayload(t)}}class _a extends K{constructor(){super("sambanova","https://api.sambanova.ai")}makeRoute(){return"/v1/embeddings"}async getResponse(t){if(typeof t=="object"&&"data"in t&&Array.isArray(t.data))return t.data.map(n=>n.embedding);throw new h("Received malformed response from Sambanova feature-extraction (embeddings) API")}preparePayload(t){return{model:t.model,input:t.args.inputs,...t.args}}}const ze="https://api.scaleway.ai";class xa extends q{constructor(){super("scaleway",ze)}}class ka extends ie{constructor(){super("scaleway",ze)}preparePayload(t){return{model:t.model,...t.args,prompt:t.args.inputs}}async getResponse(t){if(typeof t=="object"&&t!==null&&"choices"in t&&Array.isArray(t.choices)&&t.choices.length>0){const n=t.choices[0];if(typeof n=="object"&&n&&"text"in n&&n.text&&typeof n.text=="string")return{generated_text:n.text}}throw new h("Received malformed response from Scaleway text generation API")}}class Aa extends K{constructor(){super("scaleway",ze)}preparePayload(t){return{input:t.args.inputs,model:t.model}}makeRoute(){return"v1/embeddings"}async getResponse(t){return t.data.map(n=>n.embedding)}}const We="https://api.together.xyz";class Ia extends q{constructor(){super("together",We)}preparePayload(t){const n=super.preparePayload(t),a=n.response_format;return a?.type==="json_schema"&&a?.json_schema?.schema&&(n.response_format={type:"json_schema",schema:a.json_schema.schema}),n}}class Ta extends ie{constructor(){super("together",We)}preparePayload(t){return{model:t.model,...t.args,prompt:t.args.inputs}}async getResponse(t){if(typeof t=="object"&&"choices"in t&&Array.isArray(t?.choices)&&typeof t?.model=="string")return{generated_text:t.choices[0].text};throw new h("Received malformed response from Together text generation API")}}class Sa extends K{constructor(){super("together",We)}makeRoute(){return"v1/images/generations"}preparePayload(t){return{...A(t.args,["inputs","parameters"]),...t.args.parameters,prompt:t.args.inputs,response_format:t.outputType==="url"?"url":"base64",model:t.model}}async getResponse(t,n,a,i){if(typeof t=="object"&&"data"in t&&Array.isArray(t.data)&&t.data.length>0){if(i==="json")return{...t};if("url"in t.data[0]&&typeof t.data[0].url=="string")return t.data[0].url;if("b64_json"in t.data[0]&&typeof t.data[0].b64_json=="string"){const o=t.data[0].b64_json;return i==="dataUrl"?`data:image/jpeg;base64,${o}`:fetch(`data:image/jpeg;base64,${o}`).then(r=>r.blob())}}throw new h("Received malformed response from Together text-to-image API")}}const Ie="https://api.wavespeed.ai";async function jt(e,t){const n=z(new Uint8Array(e instanceof ArrayBuffer?e:await e.arrayBuffer())),a=Array.isArray(t)&&t.every(i=>typeof i=="string")?t:[n];return{base:n,images:a}}class $e extends K{constructor(t){super("wavespeed",t||Ie)}makeRoute(t){return`/api/v3/${t.model}`}preparePayload(t){const n={...A(t.args,["inputs","parameters"]),...t.args.parameters?A(t.args.parameters,["images"]):void 0,prompt:t.args.inputs};return t.mapping?.adapter==="lora"&&(n.loras=[{path:t.mapping.hfModelId,scale:1}]),n}async getResponse(t,n,a,i){if(!n||!a)throw new D("Headers are required for WaveSpeed AI API calls");const o=new URL(n),r=new URL(t.data.urls.get).pathname,d=`${`${o.protocol}//${o.host}${o.host==="router.huggingface.co"?"/wavespeed":""}`}${r}`;for(;;){const s=await fetch(d,{headers:a});if(!s.ok)throw new N("Failed to fetch response status from WaveSpeed AI API",{url:d,method:"GET"},{requestId:s.headers.get("x-request-id")??"",status:s.status,body:await s.text()});const p=await s.json(),u=p.data;switch(u.status){case"completed":{if(!u.outputs?.[0])throw new h("Received malformed response from WaveSpeed AI API: No output URL in completed response");const g=u.outputs[0];if(i==="url")return g;if(i==="json")return p;const w=await fetch(g);if(!w.ok)throw new N("Failed to fetch generation output from WaveSpeed AI API",{url:g,method:"GET"},{requestId:w.headers.get("x-request-id")??"",status:w.status,body:await w.text()});const C=await w.blob();return i==="dataUrl"?ae(C):C}case"failed":throw new h(u.error||"Task failed");default:{await xe(500);continue}}}}}class Pa extends $e{constructor(){super(Ie)}}class Ra extends $e{constructor(){super(Ie)}async getResponse(t,n,a){return super.getResponse(t,n,a)}}class Mt extends $e{constructor(){super(Ie)}async preparePayloadAsync(t){const n=t.images??t.parameters?.images,{base:a,images:i}=await jt(t.inputs,n);return{...t,inputs:t.parameters?.prompt,image:a,images:i}}async getResponse(t,n,a){return super.getResponse(t,n,a)}}class Nt extends $e{constructor(){super(Ie)}async preparePayloadAsync(t){const n=t.images??t.parameters?.images,{base:a,images:i}=await jt(t.inputs,n);return{...t,inputs:t.parameters?.prompt,image:a,images:i}}async getResponse(t,n,a){return super.getResponse(t,n,a)}}const Ca="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";function Ot(){const e=Uint8Array.from(Buffer.from(Ca,"base64"));return new Blob([e],{type:"image/png"})}class Ea extends Mt{constructor(){super()}async preparePayloadAsync(t){const n=t.inputs??Ot();return super.preparePayloadAsync({...t,inputs:n})}}class Ua extends Nt{constructor(){super()}async preparePayloadAsync(t){const n=t.inputs??Ot();return super.preparePayloadAsync({...t,inputs:n})}}const qt="https://api.z.ai";class $a extends q{constructor(){super("zai-org",qt)}prepareHeaders(t,n){const a=super.prepareHeaders(t,n);return a["x-source-channel"]="hugging_face",a["accept-language"]="en-US,en",a}makeRoute(){return"/api/paas/v4/chat/completions"}}const ot=60,Da=5e3;class La extends K{constructor(){super("zai-org",qt)}prepareHeaders(t,n){const a={Authorization:`Bearer ${t.accessToken}`,"x-source-channel":"hugging_face","accept-language":"en-US,en"};return n||(a["Content-Type"]="application/json"),a}makeRoute(){return"/api/paas/v4/async/images/generations"}preparePayload(t){return{...A(t.args,["inputs","parameters"]),...t.args.parameters,model:t.model,prompt:t.args.inputs}}async getResponse(t,n,a,i){if(!n||!a)throw new D("URL and headers are required for 'text-to-image' task");if(typeof t!="object"||!t||!("task_status"in t)||!("id"in t)||typeof t.id!="string")throw new h(`Received malformed response from ZAI text-to-image API: expected { id: string, task_status: string }, got: ${JSON.stringify(t)}`);if(t.task_status==="FAIL")throw new h("ZAI API returned task status: FAIL");const o=t.id,r=new URL(n),d=`${`${r.protocol}//${r.host}${r.host==="router.huggingface.co"?"/zai-org":""}`}/api/paas/v4/async-result/${o}`,s={...a,"x-source-channel":"hugging_face","accept-language":"en-US,en"};for(let p=0;p<ot;p++){await xe(Da);const u=await fetch(d,{method:"GET",headers:s});if(!u.ok)throw new N(`Failed to fetch result from ZAI text-to-image API: ${u.status}`,{url:d,method:"GET"},{requestId:u.headers.get("x-request-id")??"",status:u.status,body:await u.text()});const g=await u.json();if(g.task_status==="FAIL")throw new h("ZAI text-to-image API task failed");if(g.task_status==="SUCCESS"){if(!g.image_result||!Array.isArray(g.image_result)||g.image_result.length===0||typeof g.image_result[0]?.url!="string"||!ee(g.image_result[0].url))throw new h(`Received malformed response from ZAI text-to-image API: expected { image_result: Array<{ url: string }> }, got: ${JSON.stringify(g)}`);const w=g.image_result[0].url;if(i==="json")return{...g};if(i==="url")return w;const M=await(await fetch(w)).blob();return i==="dataUrl"?ae(M):M}}throw new h(`Timed out while waiting for the result from ZAI API - aborting after ${ot} attempts`)}}const Me={baseten:{conversational:new $n},"black-forest-labs":{"text-to-image":new Mn},cerebras:{conversational:new Nn},clarifai:{conversational:new Ln},cohere:{conversational:new On},"fal-ai":{"automatic-speech-recognition":new Hn,"image-text-to-image":new Bn,"image-text-to-video":new Vn,"image-to-image":new Ct,"image-segmentation":new zn,"image-to-video":new Et,"text-to-image":new qn,"text-to-speech":new Kn,"text-to-video":new Fn},"featherless-ai":{conversational:new Wn,"text-generation":new Xn},"hf-inference":{"text-to-image":new nn,conversational:new an,"text-generation":new on,"text-classification":new bn,"question-answering":new yn,"audio-classification":new rn,"automatic-speech-recognition":new sn,"fill-mask":new wn,"feature-extraction":new pn,"image-classification":new dn,"image-segmentation":new un,"document-question-answering":new cn,"image-to-text":new mn,"object-detection":new gn,"audio-to-audio":new ln,"zero-shot-image-classification":new hn,"zero-shot-classification":new Fe,"image-to-image":new fn,"sentence-similarity":new vn,"table-question-answering":new Ce,"tabular-classification":new In,"text-to-speech":new An,"token-classification":new _n,translation:new xn,summarization:new kn,"visual-question-answering":new Tn,"tabular-regression":new Sn,"text-to-audio":new Pn},"fireworks-ai":{conversational:new Qn},groq:{conversational:new Yn,"text-generation":new Jn},hyperbolic:{"text-to-image":new ea,conversational:new Zn,"text-generation":new Gn},nebius:{"text-to-image":new aa,conversational:new ta,"text-generation":new na,"feature-extraction":new ia},novita:{conversational:new ra,"text-generation":new oa,"text-to-video":new sa},nscale:{"text-to-image":new ca,conversational:new la},openai:{conversational:new da},ovhcloud:{conversational:new ua,"text-generation":new ma},publicai:{conversational:new fa},replicate:{"text-to-image":new ga,"text-to-speech":new ha,"text-to-video":new ba,"image-to-image":new wa,"automatic-speech-recognition":new ya},sambanova:{conversational:new va,"feature-extraction":new _a},scaleway:{conversational:new xa,"text-generation":new ka,"feature-extraction":new Aa},together:{"text-to-image":new Sa,conversational:new Ia,"text-generation":new Ta},wavespeed:{"text-to-image":new Pa,"text-to-video":new Ra,"image-to-image":new Mt,"image-to-video":new Nt,"image-text-to-image":new Ea,"image-text-to-video":new Ua},"zai-org":{conversational:new $a,"text-to-image":new La}};function P(e,t){if(e==="hf-inference"&&!t||e==="auto")return new E;if(!t)throw new D("you need to provide a task name when using an external provider, e.g. 'text-to-image'");if(!(e in Me))throw new D(`Provider '${e}' not supported. Available providers: ${Object.keys(Me)}`);const n=Me[e];if(!n||!(t in n))throw new D(`Task '${t}' not supported for provider '${e}'. Available tasks: ${Object.keys(n??{})}`);return n[t]}const ja="4.13.11",Ma="@huggingface/inference";let Ne=null;async function le(e,t,n){const{model:a}=e,i=t.provider,{task:o}=n??{};if(e.endpointUrl&&i!=="hf-inference")throw new D("Cannot use endpointUrl with a third-party provider.");if(a&&ee(a))throw new D("Model URLs are no longer supported. Use endpointUrl instead.");if(e.endpointUrl)return rt(a??e.endpointUrl,t,e,void 0,n);if(!a&&!o)throw new D("No model provided, and no task has been specified.");const r=a??await Na(o);if(t.clientSideRoutingOnly&&!a)throw new D(`Provider ${i} requires a model ID to be passed directly.`);const c=t.clientSideRoutingOnly?{provider:i,providerId:qa(a,i),hfModelId:a,status:"live",task:o}:await En({modelId:r,task:o,provider:i,accessToken:e.accessToken},{fetch:n?.fetch});if(!c)throw new D(`We have not been able to find inference provider information for model ${r}.`);return rt(c.providerId,t,e,c,n)}function rt(e,t,n,a,i){const{accessToken:o,endpointUrl:r,provider:c,model:d,urlTransform:s,...p}=n,u=t.provider,{includeCredentials:g,task:w,signal:C,billTo:M,outputType:W}=i??{},B=(()=>{if(t.clientSideRoutingOnly&&o&&o.startsWith("hf_"))throw new D(`Provider ${u} is closed-source and does not support HF tokens.`);return o?o.startsWith("hf_")?"hf-token":"provider-key":g==="include"?"credentials-include":"none"})(),oe=r??e,Te=t.makeUrl({authMethod:B,model:oe,task:w,urlTransform:s}),pe=t.prepareHeaders({accessToken:o,authMethod:B},"data"in n&&!!n.data);M&&(pe[Gt]=M);const Le=[`${Ma}/${ja}`,typeof navigator<"u"?navigator.userAgent:void 0].filter(me=>me!==void 0).join(" ");pe["User-Agent"]=Le;const Pe=t.makeBody({args:p,model:e,task:w,mapping:a,outputType:W});let de;typeof g=="string"?de=g:g===!0&&(de="include");const ue={headers:pe,method:"POST",body:Pe,...de?{credentials:de}:void 0,signal:C};return{url:Te,info:ue}}async function Na(e){Ne||(Ne=await Oa());const t=Ne[e];if((t?.models.length??0)<=0)throw new D(`No default model defined for task ${e}, please define the model explicitly.`);return t.models[0].id}async function Oa(){const e=`${Be}/api/tasks`,t=await fetch(e);if(!t.ok)throw new we("Failed to load tasks definitions from Hugging Face Hub.",{url:e,method:"GET"},{requestId:t.headers.get("x-request-id")??"",status:t.status,body:await t.text()});return await t.json()}function qa(e,t){if(!e.startsWith(`${t}/`))throw new D(`Models from ${t} must be prefixed by "${t}/". Got "${e}".`);return e.slice(t.length+1)}function Ba(e){let t,n,a,i=!1;return function(r){t===void 0?(t=r,n=0,a=-1):t=Va(t,r);const c=t.length;let d=0;for(;n<c;){i&&(t[n]===10&&(d=++n),i=!1);let s=-1;for(;n<c&&s===-1;++n)switch(t[n]){case 58:a===-1&&(a=n-d);break;case 13:i=!0;case 10:s=n;break}if(s===-1)break;e(t.subarray(d,s),a),d=n,a=-1}d===c?t=void 0:d!==0&&(t=t.subarray(d),n-=d)}}function Fa(e,t,n){let a=st();const i=new TextDecoder;return function(r,c){if(r.length===0)n?.(a),a=st();else if(c>0){const d=i.decode(r.subarray(0,c)),s=c+(r[c+1]===32?2:1),p=i.decode(r.subarray(s));switch(d){case"data":a.data=a.data?a.data+`
`+p:p;break;case"event":a.event=p;break;case"id":e(a.id=p);break;case"retry":{const u=parseInt(p,10);isNaN(u)||t(a.retry=u);break}}}}}function Va(e,t){const n=new Uint8Array(e.length+t.length);return n.set(e),n.set(t,e.length),n}function st(){return{data:"",event:"",id:"",retry:void 0}}function J(e){let t=null;if(e instanceof Blob||e instanceof ArrayBuffer)t="[Blob or ArrayBuffer]";else if(typeof e=="string")try{t=JSON.parse(e)}catch{t=e}return t.accessToken&&(t.accessToken="[REDACTED]"),t}async function R(e,t,n){const{url:a,info:i}=await le(e,t,n),o=await(n?.fetch??fetch)(a,i),r={url:a,info:i};if(n?.retry_on_error!==!1&&o.status===503)return R(e,t,n);if(!o.ok){const d=o.headers.get("Content-Type");if(["application/json","application/problem+json"].some(p=>d?.startsWith(p))){const p=await o.json();throw[400,422,404,500].includes(o.status)&&n?.chatCompletion?new N(`Provider ${e.provider} does not seem to support chat completion for model ${e.model} . Error: ${JSON.stringify(p.error)}`,{url:a,method:i.method??"GET",headers:i.headers,body:J(i.body)},{requestId:o.headers.get("x-request-id")??"",status:o.status,body:p}):typeof p.error=="string"||typeof p.detail=="string"||typeof p.message=="string"?new N(`Failed to perform inference: ${p.error??p.detail??p.message}`,{url:a,method:i.method??"GET",headers:i.headers,body:J(i.body)},{requestId:o.headers.get("x-request-id")??"",status:o.status,body:p}):new N("Failed to perform inference: an HTTP error occurred when requesting the provider.",{url:a,method:i.method??"GET",headers:i.headers,body:J(i.body)},{requestId:o.headers.get("x-request-id")??"",status:o.status,body:p})}const s=d?.startsWith("text/plain;")?await o.text():void 0;throw new N(`Failed to perform inference: ${s??"an HTTP error occurred when requesting the provider"}`,{url:a,method:i.method??"GET",headers:i.headers,body:J(i.body)},{requestId:o.headers.get("x-request-id")??"",status:o.status,body:s??""})}return o.headers.get("Content-Type")?.startsWith("application/json")?{data:await o.json(),requestContext:r}:{data:await o.blob(),requestContext:r}}async function*De(e,t,n){const{url:a,info:i}=await le({...e,stream:!0},t,n),o=await(n?.fetch??fetch)(a,i);if(n?.retry_on_error!==!1&&o.status===503)return yield*De(e,t,n);if(!o.ok){if(o.headers.get("Content-Type")?.startsWith("application/json")){const p=await o.json();if([400,422,404,500].includes(o.status)&&n?.chatCompletion)throw new N(`Provider ${e.provider} does not seem to support chat completion for model ${e.model} . Error: ${JSON.stringify(p.error)}`,{url:a,method:i.method??"GET",headers:i.headers,body:J(i.body)},{requestId:o.headers.get("x-request-id")??"",status:o.status,body:p});if(typeof p.error=="string")throw new N(`Failed to perform inference: ${p.error}`,{url:a,method:i.method??"GET",headers:i.headers,body:J(i.body)},{requestId:o.headers.get("x-request-id")??"",status:o.status,body:p});if(p.error&&"message"in p.error&&typeof p.error.message=="string")throw new N(`Failed to perform inference: ${p.error.message}`,{url:a,method:i.method??"GET",headers:i.headers,body:J(i.body)},{requestId:o.headers.get("x-request-id")??"",status:o.status,body:p});if(typeof p.message=="string")throw new N(`Failed to perform inference: ${p.message}`,{url:a,method:i.method??"GET",headers:i.headers,body:J(i.body)},{requestId:o.headers.get("x-request-id")??"",status:o.status,body:p})}throw new N("Failed to perform inference: an HTTP error occurred when requesting the provider.",{url:a,method:i.method??"GET",headers:i.headers,body:J(i.body)},{requestId:o.headers.get("x-request-id")??"",status:o.status,body:""})}if(!o.headers.get("content-type")?.startsWith("text/event-stream"))throw new N("Failed to perform inference: server does not support event stream content type, it returned "+o.headers.get("content-type"),{url:a,method:i.method??"GET",headers:i.headers,body:J(i.body)},{requestId:o.headers.get("x-request-id")??"",status:o.status,body:""});if(!o.body)return;const r=o.body.getReader();let c=[];const s=Ba(Fa(()=>{},()=>{},p=>{c.push(p)}));try{for(;;){const{done:p,value:u}=await r.read();if(p)return;s(u);for(const g of c)if(g.data.length>0){if(g.data==="[DONE]")return;const w=JSON.parse(g.data);if(typeof w=="object"&&w!==null&&"error"in w){const C=typeof w.error=="string"?w.error:typeof w.error=="object"&&w.error&&"message"in w.error&&typeof w.error.message=="string"?w.error.message:JSON.stringify(w.error);throw new N(`Failed to perform inference: an occurred while streaming the response: ${C}`,{url:a,method:i.method??"GET",headers:i.headers,body:J(i.body)},{requestId:o.headers.get("x-request-id")??"",status:o.status,body:w})}yield w}c=[]}}finally{r.releaseLock()}}async function Ha(e,t){_e().warn("The request method is deprecated and will be removed in a future version of huggingface.js. Use specific task functions instead.");const a=await S(e.provider,e.model,e.endpointUrl),i=P(a,t?.task);return(await R(e,i,t)).data}async function*Ka(e,t){_e().warn("The streamingRequest method is deprecated and will be removed in a future version of huggingface.js. Use specific task functions instead.");const a=await S(e.provider,e.model,e.endpointUrl),i=P(a,t?.task);yield*De(e,i,t)}function Bt(e){return"data"in e?e:{...A(e,"inputs"),data:e.inputs}}async function za(e,t){const n=await S(e.provider,e.model,e.endpointUrl),a=P(n,"audio-classification"),i=Bt(e),{data:o}=await R(i,a,{...t,task:"audio-classification"});return a.getResponse(o)}async function Wa(e,t){const n="inputs"in e?e.model:void 0,a=await S(e.provider,n),i=P(a,"audio-to-audio"),o=Bt(e),{data:r}=await R(o,i,{...t,task:"audio-to-audio"});return i.getResponse(r)}async function Xa(e,t){const n=await S(e.provider,e.model,e.endpointUrl),a=P(n,"automatic-speech-recognition"),i=await a.preparePayloadAsync(e),{data:o}=await R(i,a,{...t,task:"automatic-speech-recognition"});return a.getResponse(o)}async function Qa(e,t){const n=await S(e.provider,e.model,e.endpointUrl),a=P(n,"text-to-speech"),{data:i}=await R(e,a,{...t,task:"text-to-speech"});return a.getResponse(i)}function Xe(e){return"data"in e?e:{...A(e,"inputs"),data:e.inputs}}async function Ja(e,t){const n=await S(e.provider,e.model,e.endpointUrl),a=P(n,"image-classification"),i=Xe(e),{data:o}=await R(i,a,{...t,task:"image-classification"});return a.getResponse(o)}async function Ya(e,t){const n=await S(e.provider,e.model,e.endpointUrl),a=P(n,"image-segmentation"),i=await a.preparePayloadAsync(e),{data:o}=await R(i,a,{...t,task:"image-segmentation"}),{url:r,info:c}=await le(e,a,{...t,task:"image-segmentation"});return a.getResponse(o,r,c.headers)}async function Za(e,t){const n=await S(e.provider,e.model,e.endpointUrl),a=P(n,"image-to-image"),i=await a.preparePayloadAsync(e),{data:o}=await R(i,a,{...t,task:"image-to-image"}),{url:r,info:c}=await le(e,a,{...t,task:"image-to-image"});return a.getResponse(o,r,c.headers)}async function Ga(e,t){const n=await S(e.provider,e.model,e.endpointUrl),a=P(n,"image-to-text"),i=Xe(e),{data:o}=await R(i,a,{...t,task:"image-to-text"});return a.getResponse(o[0])}async function ei(e,t){const n=await S(e.provider,e.model,e.endpointUrl),a=P(n,"image-to-video"),i=await a.preparePayloadAsync(e),{data:o}=await R(i,a,{...t,task:"image-to-video"}),{url:r,info:c}=await le(e,a,{...t,task:"image-to-video"});return a.getResponse(o,r,c.headers)}async function ti(e,t){const n=await S(e.provider,e.model,e.endpointUrl),a=P(n,"image-text-to-image"),i=await a.preparePayloadAsync(e),{data:o,requestContext:r}=await R(i,a,{...t,task:"image-text-to-image"});return a.getResponse(o,r.url,r.info.headers)}async function ni(e,t){const n=await S(e.provider,e.model,e.endpointUrl),a=P(n,"image-text-to-video"),i=await a.preparePayloadAsync(e),{data:o,requestContext:r}=await R(i,a,{...t,task:"image-text-to-video"});return a.getResponse(o,r.url,r.info.headers)}async function ai(e,t){const n=await S(e.provider,e.model,e.endpointUrl),a=P(n,"object-detection"),i=Xe(e),{data:o}=await R(i,a,{...t,task:"object-detection"});return a.getResponse(o)}async function ii(e,t){const n=await S(e.provider,e.model,e.endpointUrl),a=P(n,"text-to-image"),{data:i}=await R(e,a,{...t,task:"text-to-image"}),{url:o,info:r}=await le(e,a,{...t,task:"text-to-image"});return a.getResponse(i,o,r.headers,t?.outputType)}async function oi(e,t){const n=await S(e.provider,e.model,e.endpointUrl),a=P(n,"text-to-video"),{data:i}=await R(e,a,{...t,task:"text-to-video"}),{url:o,info:r}=await le(e,a,{...t,task:"text-to-video"});return a.getResponse(i,o,r.headers)}async function ri(e){return e.inputs instanceof Blob?{...e,inputs:{image:z(new Uint8Array(await e.inputs.arrayBuffer()))}}:{...e,inputs:{image:z(new Uint8Array(e.inputs.image instanceof ArrayBuffer?e.inputs.image:await e.inputs.image.arrayBuffer()))}}}async function si(e,t){const n=await S(e.provider,e.model,e.endpointUrl),a=P(n,"zero-shot-image-classification"),i=await ri(e),{data:o}=await R(i,a,{...t,task:"zero-shot-image-classification"});return a.getResponse(o)}async function li(e,t){let n;if(!e.provider||e.provider==="auto")n=new St;else{const i=await S(e.provider,e.model,e.endpointUrl);n=P(i,"conversational")}const{data:a}=await R(e,n,{...t,task:"conversational"});return n.getResponse(a)}async function*ci(e,t){let n;if(!e.provider||e.provider==="auto")n=new St;else{const a=await S(e.provider,e.model,e.endpointUrl);n=P(a,"conversational")}yield*De(e,n,{...t,task:"conversational"})}async function pi(e,t){const n=await S(e.provider,e.model,e.endpointUrl),a=P(n,"feature-extraction"),{data:i}=await R(e,a,{...t,task:"feature-extraction"});return a.getResponse(i)}async function di(e,t){const n=await S(e.provider,e.model,e.endpointUrl),a=P(n,"fill-mask"),{data:i}=await R(e,a,{...t,task:"fill-mask"});return a.getResponse(i)}async function ui(e,t){const n=await S(e.provider,e.model,e.endpointUrl),a=P(n,"question-answering"),{data:i}=await R(e,a,{...t,task:"question-answering"});return a.getResponse(i)}async function mi(e,t){const n=await S(e.provider,e.model,e.endpointUrl),a=P(n,"sentence-similarity"),{data:i}=await R(e,a,{...t,task:"sentence-similarity"});return a.getResponse(i)}async function fi(e,t){const n=await S(e.provider,e.model,e.endpointUrl),a=P(n,"summarization"),{data:i}=await R(e,a,{...t,task:"summarization"});return a.getResponse(i)}async function gi(e,t){const n=await S(e.provider,e.model,e.endpointUrl),a=P(n,"table-question-answering"),{data:i}=await R(e,a,{...t,task:"table-question-answering"});return a.getResponse(i)}async function hi(e,t){const n=await S(e.provider,e.model,e.endpointUrl),a=P(n,"text-classification"),{data:i}=await R(e,a,{...t,task:"text-classification"});return a.getResponse(i)}async function bi(e,t){const n=await S(e.provider,e.model,e.endpointUrl),a=P(n,"text-generation"),{data:i}=await R(e,a,{...t,task:"text-generation"});return a.getResponse(i)}async function*yi(e,t){const n=await S(e.provider,e.model,e.endpointUrl),a=P(n,"text-generation");yield*De(e,a,{...t,task:"text-generation"})}async function wi(e,t){const n=await S(e.provider,e.model,e.endpointUrl),a=P(n,"token-classification"),{data:i}=await R(e,a,{...t,task:"token-classification"});return a.getResponse(i)}async function vi(e,t){const n=await S(e.provider,e.model,e.endpointUrl),a=P(n,"translation"),{data:i}=await R(e,a,{...t,task:"translation"});return a.getResponse(i)}async function _i(e,t){const n=await S(e.provider,e.model,e.endpointUrl),a=P(n,"zero-shot-classification"),{data:i}=await R(e,a,{...t,task:"zero-shot-classification"});return a.getResponse(i)}async function xi(e,t){const n=await S(e.provider,e.model,e.endpointUrl),a=P(n,"document-question-answering"),i={...e,inputs:{question:e.inputs.question,image:z(new Uint8Array(await e.inputs.image.arrayBuffer()))}},{data:o}=await R(i,a,{...t,task:"document-question-answering"});return a.getResponse(o)}async function ki(e,t){const n=await S(e.provider,e.model,e.endpointUrl),a=P(n,"visual-question-answering"),i={...e,inputs:{question:e.inputs.question,image:z(new Uint8Array(await e.inputs.image.arrayBuffer()))}},{data:o}=await R(i,a,{...t,task:"visual-question-answering"});return a.getResponse(o)}async function Ai(e,t){const n=await S(e.provider,e.model,e.endpointUrl),a=P(n,"tabular-classification"),{data:i}=await R(e,a,{...t,task:"tabular-classification"});return a.getResponse(i)}async function Ii(e,t){const n=await S(e.provider,e.model,e.endpointUrl),a=P(n,"tabular-regression"),{data:i}=await R(e,a,{...t,task:"tabular-regression"});return a.getResponse(i)}const Ti=Object.freeze(Object.defineProperty({__proto__:null,audioClassification:za,audioToAudio:Wa,automaticSpeechRecognition:Xa,chatCompletion:li,chatCompletionStream:ci,documentQuestionAnswering:xi,featureExtraction:pi,fillMask:di,imageClassification:Ja,imageSegmentation:Ya,imageTextToImage:ti,imageTextToVideo:ni,imageToImage:Za,imageToText:Ga,imageToVideo:ei,objectDetection:ai,questionAnswering:ui,request:Ha,sentenceSimilarity:mi,streamingRequest:Ka,summarization:fi,tableQuestionAnswering:gi,tabularClassification:Ai,tabularRegression:Ii,textClassification:hi,textGeneration:bi,textGenerationStream:yi,textToImage:ii,textToSpeech:Qa,textToVideo:oi,tokenClassification:wi,translation:vi,visualQuestionAnswering:ki,zeroShotClassification:_i,zeroShotImageClassification:si},Symbol.toStringTag,{value:"Module"}));function Si(e){return Object.entries(e)}class Qe{accessToken;defaultOptions;constructor(t="",n={}){this.accessToken=t,this.defaultOptions=n;for(const[a,i]of Si(Ti))Object.defineProperty(this,a,{enumerable:!1,value:(o,r)=>i({endpointUrl:n.endpointUrl,accessToken:t,...o},{...A(n,["endpointUrl"]),...r})})}endpoint(t){return new Qe(this.accessToken,{...this.defaultOptions,endpointUrl:t})}}class Fc extends Qe{}var l=Object.freeze({Text:"Text",NumericLiteral:"NumericLiteral",StringLiteral:"StringLiteral",Identifier:"Identifier",Equals:"Equals",OpenParen:"OpenParen",CloseParen:"CloseParen",OpenStatement:"OpenStatement",CloseStatement:"CloseStatement",OpenExpression:"OpenExpression",CloseExpression:"CloseExpression",OpenSquareBracket:"OpenSquareBracket",CloseSquareBracket:"CloseSquareBracket",OpenCurlyBracket:"OpenCurlyBracket",CloseCurlyBracket:"CloseCurlyBracket",Comma:"Comma",Dot:"Dot",Colon:"Colon",Pipe:"Pipe",CallOperator:"CallOperator",AdditiveBinaryOperator:"AdditiveBinaryOperator",MultiplicativeBinaryOperator:"MultiplicativeBinaryOperator",ComparisonBinaryOperator:"ComparisonBinaryOperator",UnaryOperator:"UnaryOperator",Comment:"Comment"}),Q=class{constructor(e,t){this.value=e,this.type=t}};function lt(e){return/\w/.test(e)}function be(e){return/[0-9]/.test(e)}function ct(e){return/\s/.test(e)}var Pi=[["{%",l.OpenStatement],["%}",l.CloseStatement],["{{",l.OpenExpression],["}}",l.CloseExpression],["(",l.OpenParen],[")",l.CloseParen],["{",l.OpenCurlyBracket],["}",l.CloseCurlyBracket],["[",l.OpenSquareBracket],["]",l.CloseSquareBracket],[",",l.Comma],[".",l.Dot],[":",l.Colon],["|",l.Pipe],["<=",l.ComparisonBinaryOperator],[">=",l.ComparisonBinaryOperator],["==",l.ComparisonBinaryOperator],["!=",l.ComparisonBinaryOperator],["<",l.ComparisonBinaryOperator],[">",l.ComparisonBinaryOperator],["+",l.AdditiveBinaryOperator],["-",l.AdditiveBinaryOperator],["~",l.AdditiveBinaryOperator],["*",l.MultiplicativeBinaryOperator],["/",l.MultiplicativeBinaryOperator],["%",l.MultiplicativeBinaryOperator],["=",l.Equals]],Ri=new Map([["n",`
`],["t","	"],["r","\r"],["b","\b"],["f","\f"],["v","\v"],["'","'"],['"','"'],["\\","\\"]]);function Ci(e,t={}){return e.endsWith(`
`)&&(e=e.slice(0,-1)),t.lstrip_blocks&&(e=e.replace(/^[ \t]*({[#%-])/gm,"$1")),t.trim_blocks&&(e=e.replace(/([#%-]})\n/g,"$1")),e.replace(/{%\s*(end)?generation\s*%}/gs,"")}function Ei(e,t={}){const n=[],a=Ci(e,t);let i=0,o=0;const r=s=>{let p="";for(;s(a[i]);){if(a[i]==="\\"){if(++i,i>=a.length)throw new SyntaxError("Unexpected end of input");const u=a[i++],g=Ri.get(u);if(g===void 0)throw new SyntaxError(`Unexpected escaped character: ${u}`);p+=g;continue}if(p+=a[i++],i>=a.length)throw new SyntaxError("Unexpected end of input")}return p},c=()=>{const s=n.at(-1);s&&s.type===l.Text&&(s.value=s.value.trimEnd(),s.value===""&&n.pop())},d=()=>{for(;i<a.length&&ct(a[i]);)++i};e:for(;i<a.length;){const s=n.at(-1)?.type;if(s===void 0||s===l.CloseStatement||s===l.CloseExpression||s===l.Comment){let u="";for(;i<a.length&&!(a[i]==="{"&&(a[i+1]==="%"||a[i+1]==="{"||a[i+1]==="#"));)u+=a[i++];if(u.length>0){n.push(new Q(u,l.Text));continue}}if(a[i]==="{"&&a[i+1]==="#"){i+=2;const u=a[i]==="-";u&&++i;let g="";for(;a[i]!=="#"||a[i+1]!=="}";){if(i+2>=a.length)throw new SyntaxError("Missing end of comment tag");g+=a[i++]}const w=g.endsWith("-");w&&(g=g.slice(0,-1)),u&&c(),n.push(new Q(g,l.Comment)),i+=2,w&&d();continue}if(a.slice(i,i+3)==="{%-"){c(),n.push(new Q("{%",l.OpenStatement)),i+=3;continue}if(a.slice(i,i+3)==="{{-"){c(),n.push(new Q("{{",l.OpenExpression)),o=0,i+=3;continue}if(r(ct),a.slice(i,i+3)==="-%}"){n.push(new Q("%}",l.CloseStatement)),i+=3,d();continue}if(a.slice(i,i+3)==="-}}"){n.push(new Q("}}",l.CloseExpression)),i+=3,d();continue}const p=a[i];if(p==="-"||p==="+"){const u=n.at(-1)?.type;if(u===l.Text||u===void 0)throw new SyntaxError(`Unexpected character: ${p}`);switch(u){case l.Identifier:case l.NumericLiteral:case l.StringLiteral:case l.CloseParen:case l.CloseSquareBracket:break;default:{++i;const g=r(be);n.push(new Q(`${p}${g}`,g.length>0?l.NumericLiteral:l.UnaryOperator));continue}}}for(const[u,g]of Pi){if(u==="}}"&&o>0)continue;if(a.slice(i,i+u.length)===u){n.push(new Q(u,g)),g===l.OpenExpression?o=0:g===l.OpenCurlyBracket?++o:g===l.CloseCurlyBracket&&--o,i+=u.length;continue e}}if(p==="'"||p==='"'){++i;const u=r(g=>g!==p);n.push(new Q(u,l.StringLiteral)),++i;continue}if(be(p)){let u=r(be);if(a[i]==="."&&be(a[i+1])){++i;const g=r(be);u=`${u}.${g}`}n.push(new Q(u,l.NumericLiteral));continue}if(lt(p)){const u=r(lt);n.push(new Q(u,l.Identifier));continue}throw new SyntaxError(`Unexpected character: ${p}`)}return n}var Z=class{type="Statement"},Ui=class extends Z{constructor(e){super(),this.body=e}type="Program"},$i=class extends Z{constructor(e,t,n){super(),this.test=e,this.body=t,this.alternate=n}type="If"},Di=class extends Z{constructor(e,t,n,a){super(),this.loopvar=e,this.iterable=t,this.body=n,this.defaultBlock=a}type="For"},Li=class extends Z{type="Break"},ji=class extends Z{type="Continue"},Mi=class extends Z{constructor(e,t,n){super(),this.assignee=e,this.value=t,this.body=n}type="Set"},Ni=class extends Z{constructor(e,t,n){super(),this.name=e,this.args=t,this.body=n}type="Macro"},Oi=class extends Z{constructor(e){super(),this.value=e}type="Comment"},X=class extends Z{type="Expression"},qi=class extends X{constructor(e,t,n){super(),this.object=e,this.property=t,this.computed=n}type="MemberExpression"},pt=class extends X{constructor(e,t){super(),this.callee=e,this.args=t}type="CallExpression"},fe=class extends X{constructor(e){super(),this.value=e}type="Identifier"},ge=class extends X{constructor(e){super(),this.value=e}type="Literal"},Bi=class extends ge{type="IntegerLiteral"},Fi=class extends ge{type="FloatLiteral"},dt=class extends ge{type="StringLiteral"},Vi=class extends ge{type="ArrayLiteral"},ut=class extends ge{type="TupleLiteral"},Hi=class extends ge{type="ObjectLiteral"},ye=class extends X{constructor(e,t,n){super(),this.operator=e,this.left=t,this.right=n}type="BinaryExpression"},Ki=class extends X{constructor(e,t){super(),this.operand=e,this.filter=t}type="FilterExpression"},zi=class extends Z{constructor(e,t){super(),this.filter=e,this.body=t}type="FilterStatement"},Wi=class extends X{constructor(e,t){super(),this.lhs=e,this.test=t}type="SelectExpression"},Xi=class extends X{constructor(e,t,n){super(),this.operand=e,this.negate=t,this.test=n}type="TestExpression"},Qi=class extends X{constructor(e,t){super(),this.operator=e,this.argument=t}type="UnaryExpression"},Ji=class extends X{constructor(e=void 0,t=void 0,n=void 0){super(),this.start=e,this.stop=t,this.step=n}type="SliceExpression"},Yi=class extends X{constructor(e,t){super(),this.key=e,this.value=t}type="KeywordArgumentExpression"},Zi=class extends X{constructor(e){super(),this.argument=e}type="SpreadExpression"},Gi=class extends Z{constructor(e,t,n){super(),this.call=e,this.callerArgs=t,this.body=n}type="CallStatement"},eo=class extends X{constructor(e,t,n){super(),this.condition=e,this.trueExpr=t,this.falseExpr=n}type="Ternary"};function to(e){const t=new Ui([]);let n=0;function a(m,f){const y=e[n++];if(!y||y.type!==m)throw new Error(`Parser Error: ${f}. ${y.type} !== ${m}.`);return y}function i(m){if(!d(m))throw new SyntaxError(`Expected ${m}`);++n}function o(){switch(e[n].type){case l.Comment:return new Oi(e[n++].value);case l.Text:return s();case l.OpenStatement:return p();case l.OpenExpression:return u();default:throw new SyntaxError(`Unexpected token type: ${e[n].type}`)}}function r(...m){return n+m.length<=e.length&&m.every((f,y)=>f===e[n+y].type)}function c(...m){return e[n]?.type===l.OpenStatement&&e[n+1]?.type===l.Identifier&&m.includes(e[n+1]?.value)}function d(...m){return n+m.length<=e.length&&m.every((f,y)=>e[n+y].type==="Identifier"&&f===e[n+y].value)}function s(){return new dt(a(l.Text,"Expected text token").value)}function p(){if(a(l.OpenStatement,"Expected opening statement token"),e[n].type!==l.Identifier)throw new SyntaxError(`Unknown statement, got ${e[n].type}`);const m=e[n].value;let f;switch(m){case"set":++n,f=g();break;case"if":++n,f=w(),a(l.OpenStatement,"Expected {% token"),i("endif"),a(l.CloseStatement,"Expected %} token");break;case"macro":++n,f=C(),a(l.OpenStatement,"Expected {% token"),i("endmacro"),a(l.CloseStatement,"Expected %} token");break;case"for":++n,f=W(),a(l.OpenStatement,"Expected {% token"),i("endfor"),a(l.CloseStatement,"Expected %} token");break;case"call":{++n;let y=null;r(l.OpenParen)&&(y=me());const F=ne();if(F.type!=="Identifier")throw new SyntaxError("Expected identifier following call statement");const Yt=me();a(l.CloseStatement,"Expected closing statement token");const tt=[];for(;!c("endcall");)tt.push(o());a(l.OpenStatement,"Expected '{%'"),i("endcall"),a(l.CloseStatement,"Expected closing statement token");const Zt=new pt(F,Yt);f=new Gi(Zt,y,tt);break}case"break":++n,a(l.CloseStatement,"Expected closing statement token"),f=new Li;break;case"continue":++n,a(l.CloseStatement,"Expected closing statement token"),f=new ji;break;case"filter":{++n;let y=ne();y instanceof fe&&r(l.OpenParen)&&(y=ue(y)),a(l.CloseStatement,"Expected closing statement token");const F=[];for(;!c("endfilter");)F.push(o());a(l.OpenStatement,"Expected '{%'"),i("endfilter"),a(l.CloseStatement,"Expected '%}'"),f=new zi(y,F);break}default:throw new SyntaxError(`Unknown statement type: ${m}`)}return f}function u(){a(l.OpenExpression,"Expected opening expression token");const m=B();return a(l.CloseExpression,"Expected closing expression token"),m}function g(){const m=M();let f=null;const y=[];if(r(l.Equals))++n,f=M();else{for(a(l.CloseStatement,"Expected %} token");!c("endset");)y.push(o());a(l.OpenStatement,"Expected {% token"),i("endset")}return a(l.CloseStatement,"Expected closing statement token"),new Mi(m,f,y)}function w(){const m=B();a(l.CloseStatement,"Expected closing statement token");const f=[],y=[];for(;!c("elif","else","endif");)f.push(o());if(c("elif")){++n,++n;const F=w();y.push(F)}else if(c("else"))for(++n,++n,a(l.CloseStatement,"Expected closing statement token");!c("endif");)y.push(o());return new $i(m,f,y)}function C(){const m=ne();if(m.type!=="Identifier")throw new SyntaxError("Expected identifier following macro statement");const f=me();a(l.CloseStatement,"Expected closing statement token");const y=[];for(;!c("endmacro");)y.push(o());return new Ni(m,f,y)}function M(m=!1){const f=m?ne:B,y=[f()],F=r(l.Comma);for(;F&&(++n,y.push(f()),!!r(l.Comma)););return F?new ut(y):y[0]}function W(){const m=M(!0);if(!(m instanceof fe||m instanceof ut))throw new SyntaxError(`Expected identifier/tuple for the loop variable, got ${m.type} instead`);if(!d("in"))throw new SyntaxError("Expected `in` keyword following loop variable");++n;const f=B();a(l.CloseStatement,"Expected closing statement token");const y=[];for(;!c("endfor","else");)y.push(o());const F=[];if(c("else"))for(++n,++n,a(l.CloseStatement,"Expected closing statement token");!c("endfor");)F.push(o());return new Di(m,f,y,F)}function B(){return oe()}function oe(){const m=Te();if(d("if")){++n;const f=Te();if(d("else")){++n;const y=oe();return new eo(f,m,y)}else return new Wi(m,f)}return m}function Te(){let m=pe();for(;d("or");){const f=e[n];++n;const y=pe();m=new ye(f,m,y)}return m}function pe(){let m=Se();for(;d("and");){const f=e[n];++n;const y=Se();m=new ye(f,m,y)}return m}function Se(){let m;for(;d("not");){const f=e[n];++n;const y=Se();m=new Qi(f,y)}return m??Le()}function Le(){let m=Pe();for(;;){let f;if(d("not","in"))f=new Q("not in",l.Identifier),n+=2;else if(d("in"))f=e[n++];else if(r(l.ComparisonBinaryOperator))f=e[n++];else break;const y=Pe();m=new ye(f,m,y)}return m}function Pe(){let m=Ge();for(;r(l.AdditiveBinaryOperator);){const f=e[n];++n;const y=Ge();m=new ye(f,m,y)}return m}function de(){const m=Ze(ne());return r(l.OpenParen)?ue(m):m}function ue(m){let f=new pt(m,me());return f=Ze(f),r(l.OpenParen)&&(f=ue(f)),f}function me(){a(l.OpenParen,"Expected opening parenthesis for arguments list");const m=Xt();return a(l.CloseParen,"Expected closing parenthesis for arguments list"),m}function Xt(){const m=[];for(;!r(l.CloseParen);){let f;if(e[n].type===l.MultiplicativeBinaryOperator&&e[n].value==="*"){++n;const y=B();f=new Zi(y)}else if(f=B(),r(l.Equals)){if(++n,!(f instanceof fe))throw new SyntaxError("Expected identifier for keyword argument");const y=B();f=new Yi(f,y)}m.push(f),r(l.Comma)&&++n}return m}function Qt(){const m=[];let f=!1;for(;!r(l.CloseSquareBracket);)r(l.Colon)?(m.push(void 0),++n,f=!0):(m.push(B()),r(l.Colon)&&(++n,f=!0));if(m.length===0)throw new SyntaxError("Expected at least one argument for member/slice expression");if(f){if(m.length>3)throw new SyntaxError("Expected 0-3 arguments for slice expression");return new Ji(...m)}return m[0]}function Ze(m){for(;r(l.Dot)||r(l.OpenSquareBracket);){const f=e[n];++n;let y;const F=f.type===l.OpenSquareBracket;if(F)y=Qt(),a(l.CloseSquareBracket,"Expected closing square bracket");else if(y=ne(),y.type!=="Identifier")throw new SyntaxError("Expected identifier following dot operator");m=new qi(m,y,F)}return m}function Ge(){let m=et();for(;r(l.MultiplicativeBinaryOperator);){const f=e[n++],y=et();m=new ye(f,m,y)}return m}function et(){let m=Jt();for(;d("is");){++n;const f=d("not");f&&++n;const y=ne();if(!(y instanceof fe))throw new SyntaxError("Expected identifier for the test");m=new Xi(m,f,y)}return m}function Jt(){let m=de();for(;r(l.Pipe);){++n;let f=ne();if(!(f instanceof fe))throw new SyntaxError("Expected identifier for the filter");r(l.OpenParen)&&(f=ue(f)),m=new Ki(m,f)}return m}function ne(){const m=e[n++];switch(m.type){case l.NumericLiteral:{const f=m.value;return f.includes(".")?new Fi(Number(f)):new Bi(Number(f))}case l.StringLiteral:{let f=m.value;for(;r(l.StringLiteral);)f+=e[n++].value;return new dt(f)}case l.Identifier:return new fe(m.value);case l.OpenParen:{const f=M();return a(l.CloseParen,"Expected closing parenthesis, got ${tokens[current].type} instead."),f}case l.OpenSquareBracket:{const f=[];for(;!r(l.CloseSquareBracket);)f.push(B()),r(l.Comma)&&++n;return++n,new Vi(f)}case l.OpenCurlyBracket:{const f=new Map;for(;!r(l.CloseCurlyBracket);){const y=B();a(l.Colon,"Expected colon between key and value in object literal");const F=B();f.set(y,F),r(l.Comma)&&++n}return++n,new Hi(f)}default:throw new SyntaxError(`Unexpected token: ${m.type}`)}}for(;n<e.length;)t.body.push(o());return t}function no(e,t,n=1){t===void 0&&(t=e,e=0);const a=[];for(let i=e;i<t;i+=n)a.push(i);return a}function mt(e,t,n,a=1){const i=Math.sign(a);i>=0?(t=(t??=0)<0?Math.max(e.length+t,0):Math.min(t,e.length),n=(n??=e.length)<0?Math.max(e.length+n,0):Math.min(n,e.length)):(t=(t??=e.length-1)<0?Math.max(e.length+t,-1):Math.min(t,e.length-1),n=(n??=-1)<-1?Math.max(e.length+n,-1):Math.min(n,e.length-1));const o=[];for(let r=t;i*r<i*n;r+=a)o.push(e[r]);return o}function ao(e){return e.replace(/\b\w/g,t=>t.toUpperCase())}function io(e){return oo(new Date,e)}function oo(e,t){const n=new Intl.DateTimeFormat(void 0,{month:"long"}),a=new Intl.DateTimeFormat(void 0,{month:"short"}),i=o=>o<10?"0"+o:o.toString();return t.replace(/%[YmdbBHM%]/g,o=>{switch(o){case"%Y":return e.getFullYear().toString();case"%m":return i(e.getMonth()+1);case"%d":return i(e.getDate());case"%b":return a.format(e);case"%B":return n.format(e);case"%H":return i(e.getHours());case"%M":return i(e.getMinutes());case"%%":return"%";default:return o}})}function ro(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function so(e,t,n,a){if(a===0)return e;let i=a==null||a<0?1/0:a;const o=t.length===0?new RegExp("(?=)","gu"):new RegExp(ro(t),"gu");return e.replaceAll(o,r=>i>0?(--i,n):r)}var ft=class extends Error{},gt=class extends Error{},te=class{type="RuntimeValue";value;builtins=new Map;constructor(e=void 0){this.value=e}__bool__(){return new _(!!this.value)}toString(){return String(this.value)}},k=class extends te{type="IntegerValue"},j=class extends te{type="FloatValue";toString(){return this.value%1===0?this.value.toFixed(1):this.value.toString()}},b=class extends te{type="StringValue";builtins=new Map([["upper",new $(()=>new b(this.value.toUpperCase()))],["lower",new $(()=>new b(this.value.toLowerCase()))],["strip",new $(()=>new b(this.value.trim()))],["title",new $(()=>new b(ao(this.value)))],["capitalize",new $(()=>new b(this.value.charAt(0).toUpperCase()+this.value.slice(1)))],["length",new k(this.value.length)],["rstrip",new $(()=>new b(this.value.trimEnd()))],["lstrip",new $(()=>new b(this.value.trimStart()))],["startswith",new $(e=>{if(e.length===0)throw new Error("startswith() requires at least one argument");const t=e[0];if(t instanceof b)return new _(this.value.startsWith(t.value));if(t instanceof I){for(const n of t.value){if(!(n instanceof b))throw new Error("startswith() tuple elements must be strings");if(this.value.startsWith(n.value))return new _(!0)}return new _(!1)}throw new Error("startswith() argument must be a string or tuple of strings")})],["endswith",new $(e=>{if(e.length===0)throw new Error("endswith() requires at least one argument");const t=e[0];if(t instanceof b)return new _(this.value.endsWith(t.value));if(t instanceof I){for(const n of t.value){if(!(n instanceof b))throw new Error("endswith() tuple elements must be strings");if(this.value.endsWith(n.value))return new _(!0)}return new _(!1)}throw new Error("endswith() argument must be a string or tuple of strings")})],["split",new $(e=>{const t=e[0]??new L;if(!(t instanceof b||t instanceof L))throw new Error("sep argument must be a string or null");const n=e[1]??new k(-1);if(!(n instanceof k))throw new Error("maxsplit argument must be a number");let a=[];if(t instanceof L){const i=this.value.trimStart();for(const{0:o,index:r}of i.matchAll(/\S+/g)){if(n.value!==-1&&a.length>=n.value&&r!==void 0){a.push(o+i.slice(r+o.length));break}a.push(o)}}else{if(t.value==="")throw new Error("empty separator");a=this.value.split(t.value),n.value!==-1&&a.length>n.value&&a.push(a.splice(n.value).join(t.value))}return new I(a.map(i=>new b(i)))})],["replace",new $(e=>{if(e.length<2)throw new Error("replace() requires at least two arguments");const t=e[0],n=e[1];if(!(t instanceof b&&n instanceof b))throw new Error("replace() arguments must be strings");let a;if(e.length>2?e[2].type==="KeywordArgumentsValue"?a=e[2].value.get("count")??new L:a=e[2]:a=new L,!(a instanceof k||a instanceof L))throw new Error("replace() count argument must be a number or null");return new b(so(this.value,t.value,n.value,a.value))})]])},_=class extends te{type="BooleanValue"},lo=/[\x7f-\uffff]/g;function ht(e){return e.replace(lo,t=>"\\u"+t.charCodeAt(0).toString(16).padStart(4,"0"))}function se(e,t={},n=0,a=!0){const{indent:i=null,ensureAscii:o=!1,separators:r=null,sortKeys:c=!1}=t;let d,s;switch(r?[d,s]=r:i?(d=",",s=": "):(d=", ",s=": "),e.type){case"NullValue":return"null";case"UndefinedValue":return a?"null":"undefined";case"IntegerValue":case"FloatValue":case"BooleanValue":return JSON.stringify(e.value);case"StringValue":{let p=JSON.stringify(e.value);return o&&(p=ht(p)),p}case"ArrayValue":case"ObjectValue":{const p=i?" ".repeat(i):"",u=`
`+p.repeat(n),g=u+p;if(e.type==="ArrayValue"){const w=e.value.map(C=>se(C,t,n+1,a));return i?`[${g}${w.join(`${d}${g}`)}${u}]`:`[${w.join(d)}]`}else{let w=Array.from(e.value.entries());c&&(w=w.sort(([M],[W])=>M.localeCompare(W)));const C=w.map(([M,W])=>{let B=JSON.stringify(M);o&&(B=ht(B));const oe=`${B}${s}${se(W,t,n+1,a)}`;return i?`${g}${oe}`:oe});return i?`{${C.join(d)}${u}}`:`{${C.join(d)}}`}}default:throw new Error(`Cannot convert to JSON: ${e.type}`)}}var H=class extends te{type="ObjectValue";__bool__(){return new _(this.value.size>0)}builtins=new Map([["get",new $(([e,t])=>{if(!(e instanceof b))throw new Error(`Object key must be a string: got ${e.type}`);return this.value.get(e.value)??t??new L})],["items",new $(()=>this.items())],["keys",new $(()=>this.keys())],["values",new $(()=>this.values())],["dictsort",new $(e=>{let t=new Map;const n=e.filter(c=>c instanceof ve?(t=c.value,!1):!0),a=n.at(0)??t.get("case_sensitive")??new _(!1);if(!(a instanceof _))throw new Error("case_sensitive must be a boolean");const i=n.at(1)??t.get("by")??new b("key");if(!(i instanceof b))throw new Error("by must be a string");if(!["key","value"].includes(i.value))throw new Error("by must be either 'key' or 'value'");const o=n.at(2)??t.get("reverse")??new _(!1);if(!(o instanceof _))throw new Error("reverse must be a boolean");const r=Array.from(this.value.entries()).map(([c,d])=>new I([new b(c),d])).sort((c,d)=>{const s=i.value==="key"?0:1,p=c.value[s],u=d.value[s],g=qe(p,u,a.value);return o.value?-g:g});return new I(r)})]]);items(){return new I(Array.from(this.value.entries()).map(([e,t])=>new I([new b(e),t])))}keys(){return new I(Array.from(this.value.keys()).map(e=>new b(e)))}values(){return new I(Array.from(this.value.values()))}toString(){return se(this,{},0,!1)}},ve=class extends H{type="KeywordArgumentsValue"},I=class extends te{type="ArrayValue";builtins=new Map([["length",new k(this.value.length)]]);__bool__(){return new _(this.value.length>0)}toString(){return se(this,{},0,!1)}},bt=class extends I{type="TupleValue"},$=class extends te{type="FunctionValue"},L=class extends te{type="NullValue"},U=class extends te{type="UndefinedValue"},re=class{constructor(e){this.parent=e}variables=new Map([["namespace",new $(e=>{if(e.length===0)return new H(new Map);if(e.length!==1||!(e[0]instanceof H))throw new Error("`namespace` expects either zero arguments or a single object argument");return e[0]})]]);tests=new Map([["boolean",e=>e.type==="BooleanValue"],["callable",e=>e instanceof $],["odd",e=>{if(!(e instanceof k))throw new Error(`cannot odd on ${e.type}`);return e.value%2!==0}],["even",e=>{if(!(e instanceof k))throw new Error(`cannot even on ${e.type}`);return e.value%2===0}],["false",e=>e.type==="BooleanValue"&&!e.value],["true",e=>e.type==="BooleanValue"&&e.value],["none",e=>e.type==="NullValue"],["string",e=>e.type==="StringValue"],["number",e=>e instanceof k||e instanceof j],["integer",e=>e instanceof k],["iterable",e=>e.type==="ArrayValue"||e.type==="StringValue"],["mapping",e=>e.type==="ObjectValue"],["lower",e=>{const t=e.value;return e.type==="StringValue"&&t===t.toLowerCase()}],["upper",e=>{const t=e.value;return e.type==="StringValue"&&t===t.toUpperCase()}],["none",e=>e.type==="NullValue"],["defined",e=>e.type!=="UndefinedValue"],["undefined",e=>e.type==="UndefinedValue"],["equalto",(e,t)=>e.value===t.value],["eq",(e,t)=>e.value===t.value]]);set(e,t){return this.declareVariable(e,Re(t))}declareVariable(e,t){if(this.variables.has(e))throw new SyntaxError(`Variable already declared: ${e}`);return this.variables.set(e,t),t}setVariable(e,t){return this.variables.set(e,t),t}resolve(e){if(this.variables.has(e))return this;if(this.parent)return this.parent.resolve(e);throw new Error(`Unknown variable: ${e}`)}lookupVariable(e){try{return this.resolve(e).variables.get(e)??new U}catch{return new U}}};function co(e){e.set("false",!1),e.set("true",!0),e.set("none",null),e.set("raise_exception",t=>{throw new Error(t)}),e.set("range",no),e.set("strftime_now",io),e.set("True",!0),e.set("False",!1),e.set("None",null)}function yt(e,t){const n=t.split(".");let a=e;for(const i of n)if(a instanceof H)a=a.value.get(i)??new U;else if(a instanceof I){const o=parseInt(i,10);if(!isNaN(o)&&o>=0&&o<a.value.length)a=a.value[o];else return new U}else return new U;return a}function qe(e,t,n=!1){if(e instanceof L&&t instanceof L)return 0;if(e instanceof L||t instanceof L)throw new Error(`Cannot compare ${e.type} with ${t.type}`);if(e instanceof U&&t instanceof U)return 0;if(e instanceof U||t instanceof U)throw new Error(`Cannot compare ${e.type} with ${t.type}`);const a=o=>o instanceof k||o instanceof j||o instanceof _,i=o=>o instanceof _?o.value?1:0:o.value;if(a(e)&&a(t)){const o=i(e),r=i(t);return o<r?-1:o>r?1:0}if(e.type!==t.type)throw new Error(`Cannot compare different types: ${e.type} and ${t.type}`);if(e.type==="StringValue"){let o=e.value,r=t.value;return n||(o=o.toLowerCase(),r=r.toLowerCase()),o<r?-1:o>r?1:0}else throw new Error(`Cannot compare type: ${e.type}`)}var po=class{global;constructor(e){this.global=e??new re}run(e){return this.evaluate(e,this.global)}evaluateBinaryExpression(e,t){const n=this.evaluate(e.left,t);switch(e.operator.value){case"and":return n.__bool__().value?this.evaluate(e.right,t):n;case"or":return n.__bool__().value?n:this.evaluate(e.right,t)}const a=this.evaluate(e.right,t);switch(e.operator.value){case"==":return new _(n.value==a.value);case"!=":return new _(n.value!=a.value)}if(n instanceof U||a instanceof U){if(a instanceof U&&["in","not in"].includes(e.operator.value))return new _(e.operator.value==="not in");throw new Error(`Cannot perform operation ${e.operator.value} on undefined values`)}else{if(n instanceof L||a instanceof L)throw new Error("Cannot perform operation on null values");if(e.operator.value==="~")return new b(n.value.toString()+a.value.toString());if((n instanceof k||n instanceof j)&&(a instanceof k||a instanceof j)){const i=n.value,o=a.value;switch(e.operator.value){case"+":case"-":case"*":{const r=e.operator.value==="+"?i+o:e.operator.value==="-"?i-o:i*o;return n instanceof j||a instanceof j?new j(r):new k(r)}case"/":return new j(i/o);case"%":{const r=i%o;return n instanceof j||a instanceof j?new j(r):new k(r)}case"<":return new _(i<o);case">":return new _(i>o);case">=":return new _(i>=o);case"<=":return new _(i<=o)}}else if(n instanceof I&&a instanceof I){if(e.operator.value==="+")return new I(n.value.concat(a.value))}else if(a instanceof I){const i=a.value.find(o=>o.value===n.value)!==void 0;switch(e.operator.value){case"in":return new _(i);case"not in":return new _(!i)}}}if((n instanceof b||a instanceof b)&&e.operator.value==="+")return new b(n.value.toString()+a.value.toString());if(n instanceof b&&a instanceof b)switch(e.operator.value){case"in":return new _(a.value.includes(n.value));case"not in":return new _(!a.value.includes(n.value))}if(n instanceof b&&a instanceof H)switch(e.operator.value){case"in":return new _(a.value.has(n.value));case"not in":return new _(!a.value.has(n.value))}throw new SyntaxError(`Unknown operator "${e.operator.value}" between ${n.type} and ${a.type}`)}evaluateArguments(e,t){const n=[],a=new Map;for(const i of e)if(i.type==="SpreadExpression"){const o=i,r=this.evaluate(o.argument,t);if(!(r instanceof I))throw new Error(`Cannot unpack non-iterable type: ${r.type}`);for(const c of r.value)n.push(c)}else if(i.type==="KeywordArgumentExpression"){const o=i;a.set(o.key.value,this.evaluate(o.value,t))}else{if(a.size>0)throw new Error("Positional arguments must come before keyword arguments");n.push(this.evaluate(i,t))}return[n,a]}applyFilter(e,t,n){if(t.type==="Identifier"){const a=t;if(a.value==="tojson")return new b(se(e,{}));if(e instanceof I)switch(a.value){case"list":return e;case"first":return e.value[0];case"last":return e.value[e.value.length-1];case"length":return new k(e.value.length);case"reverse":return new I(e.value.slice().reverse());case"sort":return new I(e.value.slice().sort((i,o)=>qe(i,o,!1)));case"join":return new b(e.value.map(i=>i.value).join(""));case"string":return new b(se(e,{},0,!1));case"unique":{const i=new Set,o=[];for(const r of e.value)i.has(r.value)||(i.add(r.value),o.push(r));return new I(o)}default:throw new Error(`Unknown ArrayValue filter: ${a.value}`)}else if(e instanceof b)switch(a.value){case"length":case"upper":case"lower":case"title":case"capitalize":{const i=e.builtins.get(a.value);if(i instanceof $)return i.value([],n);if(i instanceof k)return i;throw new Error(`Unknown StringValue filter: ${a.value}`)}case"trim":return new b(e.value.trim());case"indent":return new b(e.value.split(`
`).map((i,o)=>o===0||i.length===0?i:"    "+i).join(`
`));case"join":case"string":return e;case"int":{const i=parseInt(e.value,10);return new k(isNaN(i)?0:i)}case"float":{const i=parseFloat(e.value);return new j(isNaN(i)?0:i)}default:throw new Error(`Unknown StringValue filter: ${a.value}`)}else if(e instanceof k||e instanceof j)switch(a.value){case"abs":return e instanceof k?new k(Math.abs(e.value)):new j(Math.abs(e.value));case"int":return new k(Math.floor(e.value));case"float":return new j(e.value);default:throw new Error(`Unknown NumericValue filter: ${a.value}`)}else if(e instanceof H)switch(a.value){case"items":return new I(Array.from(e.value.entries()).map(([i,o])=>new I([new b(i),o])));case"length":return new k(e.value.size);default:{const i=e.builtins.get(a.value);if(i)return i instanceof $?i.value([],n):i;throw new Error(`Unknown ObjectValue filter: ${a.value}`)}}else if(e instanceof _)switch(a.value){case"bool":return new _(e.value);case"int":return new k(e.value?1:0);case"float":return new j(e.value?1:0);case"string":return new b(e.value?"true":"false");default:throw new Error(`Unknown BooleanValue filter: ${a.value}`)}throw new Error(`Cannot apply filter "${a.value}" to type: ${e.type}`)}else if(t.type==="CallExpression"){const a=t;if(a.callee.type!=="Identifier")throw new Error(`Unknown filter: ${a.callee.type}`);const i=a.callee.value;if(i==="tojson"){const[,o]=this.evaluateArguments(a.args,n),r=o.get("indent")??new L;if(!(r instanceof k||r instanceof L))throw new Error("If set, indent must be a number");const c=o.get("ensure_ascii")??new _(!1);if(!(c instanceof _))throw new Error("If set, ensure_ascii must be a boolean");const d=o.get("sort_keys")??new _(!1);if(!(d instanceof _))throw new Error("If set, sort_keys must be a boolean");const s=o.get("separators")??new L;let p=null;if(s instanceof I||s instanceof bt){if(s.value.length!==2)throw new Error("separators must be a tuple of two strings");const[u,g]=s.value;if(!(u instanceof b)||!(g instanceof b))throw new Error("separators must be a tuple of two strings");p=[u.value,g.value]}else if(!(s instanceof L))throw new Error("If set, separators must be a tuple of two strings");return new b(se(e,{indent:r.value,ensureAscii:c.value,sortKeys:d.value,separators:p}))}else if(i==="join"){let o;if(e instanceof b)o=Array.from(e.value);else if(e instanceof I)o=e.value.map(s=>s.value);else throw new Error(`Cannot apply filter "${i}" to type: ${e.type}`);const[r,c]=this.evaluateArguments(a.args,n),d=r.at(0)??c.get("separator")??new b("");if(!(d instanceof b))throw new Error("separator must be a string");return new b(o.join(d.value))}else if(i==="int"||i==="float"){const[o,r]=this.evaluateArguments(a.args,n),c=o.at(0)??r.get("default")??(i==="int"?new k(0):new j(0));if(e instanceof b){const d=i==="int"?parseInt(e.value,10):parseFloat(e.value);return isNaN(d)?c:i==="int"?new k(d):new j(d)}else{if(e instanceof k||e instanceof j)return e;if(e instanceof _)return i==="int"?new k(e.value?1:0):new j(e.value?1:0);throw new Error(`Cannot apply filter "${i}" to type: ${e.type}`)}}else if(i==="default"){const[o,r]=this.evaluateArguments(a.args,n),c=o[0]??new b(""),d=o[1]??r.get("boolean")??new _(!1);if(!(d instanceof _))throw new Error("`default` filter flag must be a boolean");return e instanceof U||d.value&&!e.__bool__().value?c:e}if(e instanceof I){switch(i){case"sort":{const[o,r]=this.evaluateArguments(a.args,n),c=o.at(0)??r.get("reverse")??new _(!1);if(!(c instanceof _))throw new Error("reverse must be a boolean");const d=o.at(1)??r.get("case_sensitive")??new _(!1);if(!(d instanceof _))throw new Error("case_sensitive must be a boolean");const s=o.at(2)??r.get("attribute")??new L;if(!(s instanceof b||s instanceof k||s instanceof L))throw new Error("attribute must be a string, integer, or null");const p=u=>{if(s instanceof L)return u;const g=s instanceof k?String(s.value):s.value;return yt(u,g)};return new I(e.value.slice().sort((u,g)=>{const w=p(u),C=p(g),M=qe(w,C,d.value);return c.value?-M:M}))}case"selectattr":case"rejectattr":{const o=i==="selectattr";if(e.value.some(u=>!(u instanceof H)))throw new Error(`\`${i}\` can only be applied to array of objects`);if(a.args.some(u=>u.type!=="StringLiteral"))throw new Error(`arguments of \`${i}\` must be strings`);const[r,c,d]=a.args.map(u=>this.evaluate(u,n));let s;if(c){const u=n.tests.get(c.value);if(!u)throw new Error(`Unknown test: ${c.value}`);s=u}else s=(...u)=>u[0].__bool__().value;const p=e.value.filter(u=>{const g=u.value.get(r.value),w=g?s(g,d):!1;return o?w:!w});return new I(p)}case"map":{const[,o]=this.evaluateArguments(a.args,n);if(o.has("attribute")){const r=o.get("attribute");if(!(r instanceof b))throw new Error("attribute must be a string");const c=o.get("default"),d=e.value.map(s=>{if(!(s instanceof H))throw new Error("items in map must be an object");const p=yt(s,r.value);return p instanceof U?c??new U:p});return new I(d)}else throw new Error("`map` expressions without `attribute` set are not currently supported.")}}throw new Error(`Unknown ArrayValue filter: ${i}`)}else if(e instanceof b){switch(i){case"indent":{const[o,r]=this.evaluateArguments(a.args,n),c=o.at(0)??r.get("width")??new k(4);if(!(c instanceof k))throw new Error("width must be a number");const d=o.at(1)??r.get("first")??new _(!1),s=o.at(2)??r.get("blank")??new _(!1),p=e.value.split(`
`),u=" ".repeat(c.value),g=p.map((w,C)=>!d.value&&C===0||!s.value&&w.length===0?w:u+w);return new b(g.join(`
`))}case"replace":{const o=e.builtins.get("replace");if(!(o instanceof $))throw new Error("replace filter not available");const[r,c]=this.evaluateArguments(a.args,n);return o.value([...r,new ve(c)],n)}}throw new Error(`Unknown StringValue filter: ${i}`)}else if(e instanceof H){const o=e.builtins.get(i);if(o&&o instanceof $){const[r,c]=this.evaluateArguments(a.args,n);return c.size>0&&r.push(new ve(c)),o.value(r,n)}throw new Error(`Unknown ObjectValue filter: ${i}`)}else throw new Error(`Cannot apply filter "${i}" to type: ${e.type}`)}throw new Error(`Unknown filter: ${t.type}`)}evaluateFilterExpression(e,t){const n=this.evaluate(e.operand,t);return this.applyFilter(n,e.filter,t)}evaluateTestExpression(e,t){const n=this.evaluate(e.operand,t),a=t.tests.get(e.test.value);if(!a)throw new Error(`Unknown test: ${e.test.value}`);const i=a(n);return new _(e.negate?!i:i)}evaluateSelectExpression(e,t){return this.evaluate(e.test,t).__bool__().value?this.evaluate(e.lhs,t):new U}evaluateUnaryExpression(e,t){const n=this.evaluate(e.argument,t);if(e.operator.value==="not")return new _(!n.value);throw new SyntaxError(`Unknown operator: ${e.operator.value}`)}evaluateTernaryExpression(e,t){return this.evaluate(e.condition,t).__bool__().value?this.evaluate(e.trueExpr,t):this.evaluate(e.falseExpr,t)}evalProgram(e,t){return this.evaluateBlock(e.body,t)}evaluateBlock(e,t){let n="";for(const a of e){const i=this.evaluate(a,t);i.type!=="NullValue"&&i.type!=="UndefinedValue"&&(n+=i.toString())}return new b(n)}evaluateIdentifier(e,t){return t.lookupVariable(e.value)}evaluateCallExpression(e,t){const[n,a]=this.evaluateArguments(e.args,t);a.size>0&&n.push(new ve(a));const i=this.evaluate(e.callee,t);if(i.type!=="FunctionValue")throw new Error(`Cannot call something that is not a function: got ${i.type}`);return i.value(n,t)}evaluateSliceExpression(e,t,n){if(!(e instanceof I||e instanceof b))throw new Error("Slice object must be an array or string");const a=this.evaluate(t.start,n),i=this.evaluate(t.stop,n),o=this.evaluate(t.step,n);if(!(a instanceof k||a instanceof U))throw new Error("Slice start must be numeric or undefined");if(!(i instanceof k||i instanceof U))throw new Error("Slice stop must be numeric or undefined");if(!(o instanceof k||o instanceof U))throw new Error("Slice step must be numeric or undefined");return e instanceof I?new I(mt(e.value,a.value,i.value,o.value)):new b(mt(Array.from(e.value),a.value,i.value,o.value).join(""))}evaluateMemberExpression(e,t){const n=this.evaluate(e.object,t);let a;if(e.computed){if(e.property.type==="SliceExpression")return this.evaluateSliceExpression(n,e.property,t);a=this.evaluate(e.property,t)}else a=new b(e.property.value);let i;if(n instanceof H){if(!(a instanceof b))throw new Error(`Cannot access property with non-string: got ${a.type}`);i=n.value.get(a.value)??n.builtins.get(a.value)}else if(n instanceof I||n instanceof b)if(a instanceof k)i=n.value.at(a.value),n instanceof b&&(i=new b(n.value.at(a.value)));else if(a instanceof b)i=n.builtins.get(a.value);else throw new Error(`Cannot access property with non-string/non-number: got ${a.type}`);else{if(!(a instanceof b))throw new Error(`Cannot access property with non-string: got ${a.type}`);i=n.builtins.get(a.value)}return i instanceof te?i:new U}evaluateSet(e,t){const n=e.value?this.evaluate(e.value,t):this.evaluateBlock(e.body,t);if(e.assignee.type==="Identifier"){const a=e.assignee.value;t.setVariable(a,n)}else if(e.assignee.type==="TupleLiteral"){const a=e.assignee;if(!(n instanceof I))throw new Error(`Cannot unpack non-iterable type in set: ${n.type}`);const i=n.value;if(i.length!==a.value.length)throw new Error(`Too ${a.value.length>i.length?"few":"many"} items to unpack in set`);for(let o=0;o<a.value.length;++o){const r=a.value[o];if(r.type!=="Identifier")throw new Error(`Cannot unpack to non-identifier in set: ${r.type}`);t.setVariable(r.value,i[o])}}else if(e.assignee.type==="MemberExpression"){const a=e.assignee,i=this.evaluate(a.object,t);if(!(i instanceof H))throw new Error("Cannot assign to member of non-object");if(a.property.type!=="Identifier")throw new Error("Cannot assign to member with non-identifier property");i.value.set(a.property.value,n)}else throw new Error(`Invalid LHS inside assignment expression: ${JSON.stringify(e.assignee)}`);return new L}evaluateIf(e,t){const n=this.evaluate(e.test,t);return this.evaluateBlock(n.__bool__().value?e.body:e.alternate,t)}evaluateFor(e,t){const n=new re(t);let a,i;if(e.iterable.type==="SelectExpression"){const s=e.iterable;i=this.evaluate(s.lhs,n),a=s.test}else i=this.evaluate(e.iterable,n);if(!(i instanceof I||i instanceof H))throw new Error(`Expected iterable or object type in for loop: got ${i.type}`);i instanceof H&&(i=i.keys());const o=[],r=[];for(let s=0;s<i.value.length;++s){const p=new re(n),u=i.value[s];let g;if(e.loopvar.type==="Identifier")g=w=>w.setVariable(e.loopvar.value,u);else if(e.loopvar.type==="TupleLiteral"){const w=e.loopvar;if(u.type!=="ArrayValue")throw new Error(`Cannot unpack non-iterable type: ${u.type}`);const C=u;if(w.value.length!==C.value.length)throw new Error(`Too ${w.value.length>C.value.length?"few":"many"} items to unpack`);g=M=>{for(let W=0;W<w.value.length;++W){if(w.value[W].type!=="Identifier")throw new Error(`Cannot unpack non-identifier type: ${w.value[W].type}`);M.setVariable(w.value[W].value,C.value[W])}}}else throw new Error(`Invalid loop variable(s): ${e.loopvar.type}`);a&&(g(p),!this.evaluate(a,p).__bool__().value)||(o.push(u),r.push(g))}let c="",d=!0;for(let s=0;s<o.length;++s){const p=new Map([["index",new k(s+1)],["index0",new k(s)],["revindex",new k(o.length-s)],["revindex0",new k(o.length-s-1)],["first",new _(s===0)],["last",new _(s===o.length-1)],["length",new k(o.length)],["previtem",s>0?o[s-1]:new U],["nextitem",s<o.length-1?o[s+1]:new U]]);n.setVariable("loop",new H(p)),r[s](n);try{const u=this.evaluateBlock(e.body,n);c+=u.value}catch(u){if(u instanceof gt)continue;if(u instanceof ft)break;throw u}d=!1}if(d){const s=this.evaluateBlock(e.defaultBlock,n);c+=s.value}return new b(c)}evaluateMacro(e,t){return t.setVariable(e.name.value,new $((n,a)=>{const i=new re(a);n=n.slice();let o;n.at(-1)?.type==="KeywordArgumentsValue"&&(o=n.pop());for(let r=0;r<e.args.length;++r){const c=e.args[r],d=n[r];if(c.type==="Identifier"){const s=c;if(!d)throw new Error(`Missing positional argument: ${s.value}`);i.setVariable(s.value,d)}else if(c.type==="KeywordArgumentExpression"){const s=c,p=d??o?.value.get(s.key.value)??this.evaluate(s.value,i);i.setVariable(s.key.value,p)}else throw new Error(`Unknown argument type: ${c.type}`)}return this.evaluateBlock(e.body,i)})),new L}evaluateCallStatement(e,t){const n=new $((c,d)=>{const s=new re(d);if(e.callerArgs)for(let p=0;p<e.callerArgs.length;++p){const u=e.callerArgs[p];if(u.type!=="Identifier")throw new Error(`Caller parameter must be an identifier, got ${u.type}`);s.setVariable(u.value,c[p]??new U)}return this.evaluateBlock(e.body,s)}),[a,i]=this.evaluateArguments(e.call.args,t);a.push(new ve(i));const o=this.evaluate(e.call.callee,t);if(o.type!=="FunctionValue")throw new Error(`Cannot call something that is not a function: got ${o.type}`);const r=new re(t);return r.setVariable("caller",n),o.value(a,r)}evaluateFilterStatement(e,t){const n=this.evaluateBlock(e.body,t);return this.applyFilter(n,e.filter,t)}evaluate(e,t){if(!e)return new U;switch(e.type){case"Program":return this.evalProgram(e,t);case"Set":return this.evaluateSet(e,t);case"If":return this.evaluateIf(e,t);case"For":return this.evaluateFor(e,t);case"Macro":return this.evaluateMacro(e,t);case"CallStatement":return this.evaluateCallStatement(e,t);case"Break":throw new ft;case"Continue":throw new gt;case"IntegerLiteral":return new k(e.value);case"FloatLiteral":return new j(e.value);case"StringLiteral":return new b(e.value);case"ArrayLiteral":return new I(e.value.map(n=>this.evaluate(n,t)));case"TupleLiteral":return new bt(e.value.map(n=>this.evaluate(n,t)));case"ObjectLiteral":{const n=new Map;for(const[a,i]of e.value){const o=this.evaluate(a,t);if(!(o instanceof b))throw new Error(`Object keys must be strings: got ${o.type}`);n.set(o.value,this.evaluate(i,t))}return new H(n)}case"Identifier":return this.evaluateIdentifier(e,t);case"CallExpression":return this.evaluateCallExpression(e,t);case"MemberExpression":return this.evaluateMemberExpression(e,t);case"UnaryExpression":return this.evaluateUnaryExpression(e,t);case"BinaryExpression":return this.evaluateBinaryExpression(e,t);case"FilterExpression":return this.evaluateFilterExpression(e,t);case"FilterStatement":return this.evaluateFilterStatement(e,t);case"TestExpression":return this.evaluateTestExpression(e,t);case"SelectExpression":return this.evaluateSelectExpression(e,t);case"Ternary":return this.evaluateTernaryExpression(e,t);case"Comment":return new L;default:throw new SyntaxError(`Unknown node type: ${e.type}`)}}};function Re(e){switch(typeof e){case"number":return Number.isInteger(e)?new k(e):new j(e);case"string":return new b(e);case"boolean":return new _(e);case"undefined":return new U;case"object":return e===null?new L:Array.isArray(e)?new I(e.map(Re)):new H(new Map(Object.entries(e).map(([t,n])=>[t,Re(n)])));case"function":return new $((t,n)=>{const a=e(...t.map(i=>i.value))??null;return Re(a)});default:throw new Error(`Cannot convert to runtime value: ${e}`)}}var O=`
`,uo="{%- ",mo=" -%}";function fo(e){switch(e.operator.type){case"MultiplicativeBinaryOperator":return 4;case"AdditiveBinaryOperator":return 3;case"ComparisonBinaryOperator":return 2;case"Identifier":return e.operator.value==="and"?1:e.operator.value==="in"||e.operator.value==="not in"?2:0}return 0}function go(e,t="	"){const n=typeof t=="number"?" ".repeat(t):t;return Y(e.body,0,n).replace(/\n$/,"")}function V(...e){return uo+e.join(" ")+mo}function Y(e,t,n){return e.map(a=>ho(a,t,n)).join(O)}function ho(e,t,n){const a=n.repeat(t);switch(e.type){case"Program":return Y(e.body,t,n);case"If":return bo(e,t,n);case"For":return yo(e,t,n);case"Set":return wo(e,t,n);case"Macro":return vo(e,t,n);case"Break":return a+V("break");case"Continue":return a+V("continue");case"CallStatement":return _o(e,t,n);case"FilterStatement":return xo(e,t,n);case"Comment":return a+"{# "+e.value+" #}";default:return a+"{{- "+T(e)+" -}}"}}function bo(e,t,n){const a=n.repeat(t),i=[];let o=e;for(;o&&(i.push({test:o.test,body:o.body}),o.alternate.length===1&&o.alternate[0].type==="If");)o=o.alternate[0];let r=a+V("if",T(i[0].test))+O+Y(i[0].body,t+1,n);for(let c=1;c<i.length;++c)r+=O+a+V("elif",T(i[c].test))+O+Y(i[c].body,t+1,n);return o&&o.alternate.length>0&&(r+=O+a+V("else")+O+Y(o.alternate,t+1,n)),r+=O+a+V("endif"),r}function yo(e,t,n){const a=n.repeat(t);let i="";if(e.iterable.type==="SelectExpression"){const r=e.iterable;i=`${T(r.lhs)} if ${T(r.test)}`}else i=T(e.iterable);let o=a+V("for",T(e.loopvar),"in",i)+O+Y(e.body,t+1,n);return e.defaultBlock.length>0&&(o+=O+a+V("else")+O+Y(e.defaultBlock,t+1,n)),o+=O+a+V("endfor"),o}function wo(e,t,n){const a=n.repeat(t),i=T(e.assignee),o=e.value?T(e.value):"",r=a+V("set",`${i}${e.value?" = "+o:""}`);return e.body.length===0?r:r+O+Y(e.body,t+1,n)+O+a+V("endset")}function vo(e,t,n){const a=n.repeat(t),i=e.args.map(T).join(", ");return a+V("macro",`${e.name.value}(${i})`)+O+Y(e.body,t+1,n)+O+a+V("endmacro")}function _o(e,t,n){const a=n.repeat(t),i=e.callerArgs&&e.callerArgs.length>0?`(${e.callerArgs.map(T).join(", ")})`:"",o=T(e.call);let r=a+V(`call${i}`,o)+O;return r+=Y(e.body,t+1,n)+O,r+=a+V("endcall"),r}function xo(e,t,n){const a=n.repeat(t),i=e.filter.type==="Identifier"?e.filter.value:T(e.filter);let o=a+V("filter",i)+O;return o+=Y(e.body,t+1,n)+O,o+=a+V("endfilter"),o}function T(e,t=-1){switch(e.type){case"SpreadExpression":return`*${T(e.argument)}`;case"Identifier":return e.value;case"IntegerLiteral":return`${e.value}`;case"FloatLiteral":return`${e.value}`;case"StringLiteral":return JSON.stringify(e.value);case"BinaryExpression":{const n=e,a=fo(n),i=T(n.left,a),o=T(n.right,a+1),r=`${i} ${n.operator.value} ${o}`;return a<t?`(${r})`:r}case"UnaryExpression":{const n=e;return n.operator.value+(n.operator.value==="not"?" ":"")+T(n.argument,1/0)}case"CallExpression":{const n=e,a=n.args.map(T).join(", ");return`${T(n.callee)}(${a})`}case"MemberExpression":{const n=e;let a=T(n.object);["Identifier","MemberExpression","CallExpression","StringLiteral","IntegerLiteral","FloatLiteral","ArrayLiteral","TupleLiteral","ObjectLiteral"].includes(n.object.type)||(a=`(${a})`);let i=T(n.property);return!n.computed&&n.property.type!=="Identifier"&&(i=`(${i})`),n.computed?`${a}[${i}]`:`${a}.${i}`}case"FilterExpression":{const n=e,a=T(n.operand,1/0);return n.filter.type==="CallExpression"?`${a} | ${T(n.filter)}`:`${a} | ${n.filter.value}`}case"SelectExpression":{const n=e;return`${T(n.lhs)} if ${T(n.test)}`}case"TestExpression":{const n=e;return`${T(n.operand)} is${n.negate?" not":""} ${n.test.value}`}case"ArrayLiteral":case"TupleLiteral":{const n=e.value.map(T),a=e.type==="ArrayLiteral"?"[]":"()";return`${a[0]}${n.join(", ")}${a[1]}`}case"ObjectLiteral":return`{${Array.from(e.value.entries()).map(([a,i])=>`${T(a)}: ${T(i)}`).join(", ")}}`;case"SliceExpression":{const n=e,a=n.start?T(n.start):"",i=n.stop?T(n.stop):"",o=n.step?`:${T(n.step)}`:"";return`${a}:${i}${o}`}case"KeywordArgumentExpression":{const n=e;return`${n.key.value}=${T(n.value)}`}case"Ternary":{const n=e,a=`${T(n.trueExpr)} if ${T(n.condition,0)} else ${T(n.falseExpr)}`;return t>-1?`(${a})`:a}default:throw new Error(`Unknown expression type: ${e.type}`)}}var ko=class{parsed;constructor(e){const t=Ei(e,{lstrip_blocks:!0,trim_blocks:!0});this.parsed=to(t)}render(e){const t=new re;if(co(t),e)for(const[i,o]of Object.entries(e))t.set(i,o);return new po(t).run(this.parsed).value}format(e){return go(this.parsed,e?.indent||"	")}};const Ao={transformers:["audio-classification","automatic-speech-recognition","depth-estimation","document-question-answering","feature-extraction","fill-mask","image-classification","image-feature-extraction","image-segmentation","image-to-image","image-to-text","image-text-to-text","mask-generation","object-detection","question-answering","summarization","table-question-answering","text-classification","text-generation","text-to-audio","text-to-speech","token-classification","translation","video-classification","visual-question-answering","zero-shot-classification","zero-shot-image-classification","zero-shot-object-detection"]},Io=["image-to-text","summarization","translation"],Je={"text-classification":{name:"Text Classification",subtasks:[{type:"acceptability-classification",name:"Acceptability Classification"},{type:"entity-linking-classification",name:"Entity Linking Classification"},{type:"fact-checking",name:"Fact Checking"},{type:"intent-classification",name:"Intent Classification"},{type:"language-identification",name:"Language Identification"},{type:"multi-class-classification",name:"Multi Class Classification"},{type:"multi-label-classification",name:"Multi Label Classification"},{type:"multi-input-text-classification",name:"Multi-input Text Classification"},{type:"natural-language-inference",name:"Natural Language Inference"},{type:"semantic-similarity-classification",name:"Semantic Similarity Classification"},{type:"sentiment-classification",name:"Sentiment Classification"},{type:"topic-classification",name:"Topic Classification"},{type:"semantic-similarity-scoring",name:"Semantic Similarity Scoring"},{type:"sentiment-scoring",name:"Sentiment Scoring"},{type:"sentiment-analysis",name:"Sentiment Analysis"},{type:"hate-speech-detection",name:"Hate Speech Detection"},{type:"text-scoring",name:"Text Scoring"}],modality:"nlp"},"token-classification":{name:"Token Classification",subtasks:[{type:"named-entity-recognition",name:"Named Entity Recognition"},{type:"part-of-speech",name:"Part of Speech"},{type:"parsing",name:"Parsing"},{type:"lemmatization",name:"Lemmatization"},{type:"word-sense-disambiguation",name:"Word Sense Disambiguation"},{type:"coreference-resolution",name:"Coreference-resolution"}],modality:"nlp"},"table-question-answering":{name:"Table Question Answering",modality:"nlp"},"question-answering":{name:"Question Answering",subtasks:[{type:"extractive-qa",name:"Extractive QA"},{type:"open-domain-qa",name:"Open Domain QA"},{type:"closed-domain-qa",name:"Closed Domain QA"}],modality:"nlp"},"zero-shot-classification":{name:"Zero-Shot Classification",modality:"nlp"},translation:{name:"Translation",modality:"nlp"},summarization:{name:"Summarization",subtasks:[{type:"news-articles-summarization",name:"News Articles Summarization"},{type:"news-articles-headline-generation",name:"News Articles Headline Generation"}],modality:"nlp"},"feature-extraction":{name:"Feature Extraction",modality:"nlp"},"text-generation":{name:"Text Generation",subtasks:[{type:"dialogue-modeling",name:"Dialogue Modeling"},{type:"dialogue-generation",name:"Dialogue Generation"},{type:"conversational",name:"Conversational"},{type:"language-modeling",name:"Language Modeling"},{type:"text-simplification",name:"Text simplification"},{type:"explanation-generation",name:"Explanation Generation"},{type:"abstractive-qa",name:"Abstractive QA"},{type:"open-domain-abstractive-qa",name:"Open Domain Abstractive QA"},{type:"closed-domain-qa",name:"Closed Domain QA"},{type:"open-book-qa",name:"Open Book QA"},{type:"closed-book-qa",name:"Closed Book QA"},{type:"text2text-generation",name:"Text2Text Generation"}],modality:"nlp"},"fill-mask":{name:"Fill-Mask",subtasks:[{type:"slot-filling",name:"Slot Filling"},{type:"masked-language-modeling",name:"Masked Language Modeling"}],modality:"nlp"},"sentence-similarity":{name:"Sentence Similarity",modality:"nlp"},"text-to-speech":{name:"Text-to-Speech",modality:"audio"},"text-to-audio":{name:"Text-to-Audio",modality:"audio"},"automatic-speech-recognition":{name:"Automatic Speech Recognition",modality:"audio"},"audio-to-audio":{name:"Audio-to-Audio",modality:"audio"},"audio-classification":{name:"Audio Classification",subtasks:[{type:"keyword-spotting",name:"Keyword Spotting"},{type:"speaker-identification",name:"Speaker Identification"},{type:"audio-intent-classification",name:"Audio Intent Classification"},{type:"audio-emotion-recognition",name:"Audio Emotion Recognition"},{type:"audio-language-identification",name:"Audio Language Identification"}],modality:"audio"},"audio-text-to-text":{name:"Audio-Text-to-Text",modality:"multimodal",hideInDatasets:!0},"voice-activity-detection":{name:"Voice Activity Detection",modality:"audio"},"depth-estimation":{name:"Depth Estimation",modality:"cv"},"image-classification":{name:"Image Classification",subtasks:[{type:"multi-label-image-classification",name:"Multi Label Image Classification"},{type:"multi-class-image-classification",name:"Multi Class Image Classification"}],modality:"cv"},"object-detection":{name:"Object Detection",subtasks:[{type:"face-detection",name:"Face Detection"},{type:"vehicle-detection",name:"Vehicle Detection"}],modality:"cv"},"image-segmentation":{name:"Image Segmentation",subtasks:[{type:"instance-segmentation",name:"Instance Segmentation"},{type:"semantic-segmentation",name:"Semantic Segmentation"},{type:"panoptic-segmentation",name:"Panoptic Segmentation"}],modality:"cv"},"text-to-image":{name:"Text-to-Image",modality:"cv"},"image-to-text":{name:"Image-to-Text",subtasks:[{type:"image-captioning",name:"Image Captioning"}],modality:"cv"},"image-to-image":{name:"Image-to-Image",subtasks:[{type:"image-inpainting",name:"Image Inpainting"},{type:"image-colorization",name:"Image Colorization"},{type:"super-resolution",name:"Super Resolution"}],modality:"cv"},"image-to-video":{name:"Image-to-Video",modality:"cv"},"unconditional-image-generation":{name:"Unconditional Image Generation",modality:"cv"},"video-classification":{name:"Video Classification",modality:"cv"},"reinforcement-learning":{name:"Reinforcement Learning",modality:"rl"},robotics:{name:"Robotics",modality:"rl",subtasks:[{type:"grasping",name:"Grasping"},{type:"task-planning",name:"Task Planning"}]},"tabular-classification":{name:"Tabular Classification",modality:"tabular",subtasks:[{type:"tabular-multi-class-classification",name:"Tabular Multi Class Classification"},{type:"tabular-multi-label-classification",name:"Tabular Multi Label Classification"}]},"tabular-regression":{name:"Tabular Regression",modality:"tabular",subtasks:[{type:"tabular-single-column-regression",name:"Tabular Single Column Regression"}]},"tabular-to-text":{name:"Tabular to Text",modality:"tabular",subtasks:[{type:"rdf-to-text",name:"RDF to text"}],hideInModels:!0},"table-to-text":{name:"Table to Text",modality:"nlp",hideInModels:!0},"multiple-choice":{name:"Multiple Choice",subtasks:[{type:"multiple-choice-qa",name:"Multiple Choice QA"},{type:"multiple-choice-coreference-resolution",name:"Multiple Choice Coreference Resolution"}],modality:"nlp",hideInModels:!0},"text-ranking":{name:"Text Ranking",modality:"nlp"},"text-retrieval":{name:"Text Retrieval",subtasks:[{type:"document-retrieval",name:"Document Retrieval"},{type:"utterance-retrieval",name:"Utterance Retrieval"},{type:"entity-linking-retrieval",name:"Entity Linking Retrieval"},{type:"fact-checking-retrieval",name:"Fact Checking Retrieval"}],modality:"nlp",hideInModels:!0},"time-series-forecasting":{name:"Time Series Forecasting",modality:"tabular",subtasks:[{type:"univariate-time-series-forecasting",name:"Univariate Time Series Forecasting"},{type:"multivariate-time-series-forecasting",name:"Multivariate Time Series Forecasting"}]},"text-to-video":{name:"Text-to-Video",modality:"cv"},"image-text-to-text":{name:"Image-Text-to-Text",modality:"multimodal"},"image-text-to-image":{name:"Image-Text-to-Image",modality:"multimodal"},"image-text-to-video":{name:"Image-Text-to-Video",modality:"multimodal"},"visual-question-answering":{name:"Visual Question Answering",subtasks:[{type:"visual-question-answering",name:"Visual Question Answering"}],modality:"multimodal"},"document-question-answering":{name:"Document Question Answering",subtasks:[{type:"document-question-answering",name:"Document Question Answering"}],modality:"multimodal",hideInDatasets:!0},"zero-shot-image-classification":{name:"Zero-Shot Image Classification",modality:"cv"},"graph-ml":{name:"Graph Machine Learning",modality:"other"},"mask-generation":{name:"Mask Generation",modality:"cv"},"zero-shot-object-detection":{name:"Zero-Shot Object Detection",modality:"cv"},"text-to-3d":{name:"Text-to-3D",modality:"cv"},"image-to-3d":{name:"Image-to-3D",modality:"cv"},"image-feature-extraction":{name:"Image Feature Extraction",modality:"cv"},"video-text-to-text":{name:"Video-Text-to-Text",modality:"multimodal",hideInDatasets:!1},"keypoint-detection":{name:"Keypoint Detection",subtasks:[{type:"pose-estimation",name:"Pose Estimation"}],modality:"cv",hideInDatasets:!0},"visual-document-retrieval":{name:"Visual Document Retrieval",modality:"multimodal"},"any-to-any":{name:"Any-to-Any",modality:"multimodal"},"video-to-video":{name:"Video-to-Video",modality:"cv",hideInDatasets:!0},other:{name:"Other",modality:"other",hideInModels:!0,hideInDatasets:!0}},To=Object.keys(Je);Object.values(Je).flatMap(e=>"subtasks"in e?e.subtasks:[]).map(e=>e.type);new Set(To);const So={datasets:[{description:"A dataset with multiple modality input and output pairs.",id:"PKU-Alignment/align-anything"}],demo:{inputs:[{filename:"any-to-any-input.jpg",type:"img"},{label:"Text Prompt",content:"What is the significance of this place?",type:"text"}],outputs:[{label:"Generated Text",content:"The place in the picture is Osaka Castle, located in Osaka, Japan. Osaka Castle is a historic castle that was originally built in the 16th century by Toyotomi Hideyoshi, a powerful warlord of the time. It is one of the most famous landmarks in Osaka and is known for its distinctive white walls and black roof tiles. The castle has been rebuilt several times over the centuries and is now a popular tourist attraction, offering visitors a glimpse into Japan's rich history and culture.",type:"text"},{filename:"any-to-any-output.wav",type:"audio"}]},metrics:[],models:[{description:"Strong model that can take in video, audio, image, text and output text and natural speech.",id:"Qwen/Qwen2.5-Omni-7B"},{description:"Robust model that can take in image and text and generate image and text.",id:"OmniGen2/OmniGen2"},{description:"Any-to-any model with speech, video, audio, image and text understanding capabilities.",id:"openbmb/MiniCPM-o-2_6"},{description:"A model that can understand image and text and generate image and text.",id:"ByteDance-Seed/BAGEL-7B-MoT"}],spaces:[{description:"An application to chat with an any-to-any (image & text) model.",id:"OmniGen2/OmniGen2"}],summary:"Any-to-any models can understand two or more modalities and output two or more modalities.",widgetModels:[],youtubeId:""},Po={datasets:[{description:"A benchmark of 10 different audio tasks.",id:"s3prl/superb"},{description:"A dataset of YouTube clips and their sound categories.",id:"agkphysics/AudioSet"}],demo:{inputs:[{filename:"audio.wav",type:"audio"}],outputs:[{data:[{label:"Up",score:.2},{label:"Down",score:.8}],type:"chart"}]},metrics:[{description:"",id:"accuracy"},{description:"",id:"recall"},{description:"",id:"precision"},{description:"",id:"f1"}],models:[{description:"An easy-to-use model for command recognition.",id:"speechbrain/google_speech_command_xvector"},{description:"An emotion recognition model.",id:"ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition"},{description:"A language identification model.",id:"facebook/mms-lid-126"}],spaces:[{description:"An application that can classify music into different genre.",id:"kurianbenoy/audioclassification"}],summary:"Audio classification is the task of assigning a label or class to a given audio. It can be used for recognizing which command a user is giving or the emotion of a statement, as well as identifying a speaker.",widgetModels:["MIT/ast-finetuned-audioset-10-10-0.4593"],youtubeId:"KWwzcmG98Ds"},Ro={datasets:[{description:"A dataset containing audio conversations with question–answer pairs.",id:"nvidia/AF-Think"},{description:"A more advanced and comprehensive dataset that contains characteristics of the audio as well",id:"tsinghua-ee/QualiSpeech"}],demo:{inputs:[{filename:"audio.wav",type:"audio"},{label:"Text Prompt",content:"What is the gender of the speaker?",type:"text"}],outputs:[{label:"Generated Text",content:"The gender of the speaker is female.",type:"text"}]},metrics:[],models:[{description:"A lightweight model that has capabilities of taking both audio and text as inputs and generating responses.",id:"fixie-ai/ultravox-v0_5-llama-3_2-1b"},{description:"A multimodal model that supports voice chat and audio analysis.",id:"Qwen/Qwen2-Audio-7B-Instruct"},{description:"A model for audio understanding, speech translation, and transcription.",id:"mistralai/Voxtral-Small-24B-2507"},{description:"A new model capable of audio question answering and reasoning.",id:"nvidia/audio-flamingo-3"}],spaces:[{description:"A space that takes input as both audio and text and generates answers.",id:"iamomtiwari/ATTT"},{description:"A web application that demonstrates chatting with the Qwen2Audio Model.",id:"freddyaboulton/talk-to-qwen-webrtc"}],summary:"Audio-text-to-text models take both an audio clip and a text prompt as input, and generate natural language text as output. These models can answer questions about spoken content, summarize meetings, analyze music, or interpret speech beyond simple transcription. They are useful for applications that combine speech understanding with reasoning or conversation.",widgetModels:[],youtubeId:""},Co={datasets:[{description:"512-element X-vector embeddings of speakers from CMU ARCTIC dataset.",id:"Matthijs/cmu-arctic-xvectors"}],demo:{inputs:[{filename:"input.wav",type:"audio"}],outputs:[{filename:"label-0.wav",type:"audio"},{filename:"label-1.wav",type:"audio"}]},metrics:[{description:"The Signal-to-Noise ratio is the relationship between the target signal level and the background noise level. It is calculated as the logarithm of the target signal divided by the background noise, in decibels.",id:"snri"},{description:"The Signal-to-Distortion ratio is the relationship between the target signal and the sum of noise, interference, and artifact errors",id:"sdri"}],models:[{description:"A speech enhancement model.",id:"ResembleAI/resemble-enhance"},{description:"A model that can change the voice in a speech recording.",id:"microsoft/speecht5_vc"}],spaces:[{description:"An application for speech separation.",id:"younver/speechbrain-speech-separation"},{description:"An application for audio style transfer.",id:"nakas/audio-diffusion_style_transfer"}],summary:"Audio-to-Audio is a family of tasks in which the input is an audio and the output is one or multiple generated audios. Some example tasks are speech enhancement and source separation.",widgetModels:["speechbrain/sepformer-wham"],youtubeId:"iohj7nCCYoM"},Eo={datasets:[{description:"31,175 hours of multilingual audio-text dataset in 108 languages.",id:"mozilla-foundation/common_voice_17_0"},{description:"Multilingual and diverse audio dataset with 101k hours of audio.",id:"amphion/Emilia-Dataset"},{description:"A dataset with 44.6k hours of English speaker data and 6k hours of other language speakers.",id:"parler-tts/mls_eng"},{description:"A multilingual audio dataset with 370K hours of audio.",id:"espnet/yodas"}],demo:{inputs:[{filename:"input.flac",type:"audio"}],outputs:[{label:"Transcript",content:"Going along slushy country roads and speaking to damp audiences in...",type:"text"}]},metrics:[{description:"",id:"wer"},{description:"",id:"cer"}],models:[{description:"A powerful ASR model by OpenAI.",id:"openai/whisper-large-v3"},{description:"A good generic speech model by MetaAI for fine-tuning.",id:"facebook/w2v-bert-2.0"},{description:"An end-to-end model that performs ASR and Speech Translation by MetaAI.",id:"facebook/seamless-m4t-v2-large"},{description:"A powerful multilingual ASR and Speech Translation model by Nvidia.",id:"nvidia/canary-1b"},{description:"Powerful speaker diarization model.",id:"pyannote/speaker-diarization-3.1"}],spaces:[{description:"A powerful general-purpose speech recognition application.",id:"hf-audio/whisper-large-v3"},{description:"Latest ASR model from Useful Sensors.",id:"mrfakename/Moonshinex"},{description:"A high quality speech and text translation model by Meta.",id:"facebook/seamless_m4t"},{description:"A powerful multilingual ASR and Speech Translation model by Nvidia",id:"nvidia/canary-1b"}],summary:"Automatic Speech Recognition (ASR), also known as Speech to Text (STT), is the task of transcribing a given audio to text. It has many applications, such as voice user interfaces.",widgetModels:["openai/whisper-large-v3"],youtubeId:"TksaY_FDgnk"},Uo={datasets:[{description:"Largest document understanding dataset.",id:"HuggingFaceM4/Docmatix"},{description:"Dataset from the 2020 DocVQA challenge. The documents are taken from the UCSF Industry Documents Library.",id:"eliolio/docvqa"}],demo:{inputs:[{label:"Question",content:"What is the idea behind the consumer relations efficiency team?",type:"text"},{filename:"document-question-answering-input.png",type:"img"}],outputs:[{label:"Answer",content:"Balance cost efficiency with quality customer service",type:"text"}]},metrics:[{description:"The evaluation metric for the DocVQA challenge is the Average Normalized Levenshtein Similarity (ANLS). This metric is flexible to character regognition errors and compares the predicted answer with the ground truth answer.",id:"anls"},{description:"Exact Match is a metric based on the strict character match of the predicted answer and the right answer. For answers predicted correctly, the Exact Match will be 1. Even if only one character is different, Exact Match will be 0",id:"exact-match"}],models:[{description:"A robust document question answering model.",id:"impira/layoutlm-document-qa"},{description:"A document question answering model specialized in invoices.",id:"impira/layoutlm-invoices"},{description:"A special model for OCR-free document question answering.",id:"microsoft/udop-large"},{description:"A powerful model for document question answering.",id:"google/pix2struct-docvqa-large"}],spaces:[{description:"A robust document question answering application.",id:"impira/docquery"},{description:"An application that can answer questions from invoices.",id:"impira/invoices"},{description:"An application to compare different document question answering models.",id:"merve/compare_docvqa_models"}],summary:"Document Question Answering (also known as Document Visual Question Answering) is the task of answering questions on document images. Document question answering models take a (document, question) pair as input and return an answer in natural language. Models usually rely on multi-modal features, combining text, position of words (bounding-boxes) and image.",widgetModels:["impira/layoutlm-invoices"],youtubeId:""},$o={datasets:[{description:"Wikipedia dataset containing cleaned articles of all languages. Can be used to train `feature-extraction` models.",id:"wikipedia"}],demo:{inputs:[{label:"Input",content:"India, officially the Republic of India, is a country in South Asia.",type:"text"}],outputs:[{table:[["Dimension 1","Dimension 2","Dimension 3"],["2.583383083343506","2.757075071334839","0.9023529887199402"],["8.29393482208252","1.1071064472198486","2.03399395942688"],["-0.7754912972450256","-1.647324562072754","-0.6113331913948059"],["0.07087723910808563","1.5942802429199219","1.4610432386398315"]],type:"tabular"}]},metrics:[],models:[{description:"A powerful feature extraction model for natural language processing tasks.",id:"thenlper/gte-large"},{description:"A strong feature extraction model for retrieval.",id:"Alibaba-NLP/gte-Qwen1.5-7B-instruct"}],spaces:[{description:"A leaderboard to rank text feature extraction models based on a benchmark.",id:"mteb/leaderboard"},{description:"A leaderboard to rank best feature extraction models based on human feedback.",id:"mteb/arena"}],summary:"Feature extraction is the task of extracting features learnt in a model.",widgetModels:["facebook/bart-base"]},Do={datasets:[{description:"A common dataset that is used to train models for many languages.",id:"wikipedia"},{description:"A large English dataset with text crawled from the web.",id:"c4"}],demo:{inputs:[{label:"Input",content:"The <mask> barked at me",type:"text"}],outputs:[{type:"chart",data:[{label:"wolf",score:.487},{label:"dog",score:.061},{label:"cat",score:.058},{label:"fox",score:.047},{label:"squirrel",score:.025}]}]},metrics:[{description:"Cross Entropy is a metric that calculates the difference between two probability distributions. Each probability distribution is the distribution of predicted words",id:"cross_entropy"},{description:"Perplexity is the exponential of the cross-entropy loss. It evaluates the probabilities assigned to the next word by the model. Lower perplexity indicates better performance",id:"perplexity"}],models:[{description:"State-of-the-art masked language model.",id:"answerdotai/ModernBERT-large"},{description:"A multilingual model trained on 100 languages.",id:"FacebookAI/xlm-roberta-base"}],spaces:[],summary:"Masked language modeling is the task of masking some of the words in a sentence and predicting which words should replace those masks. These models are useful when we want to get a statistical understanding of the language in which the model is trained in.",widgetModels:["distilroberta-base"],youtubeId:"mqElG5QJWUg"},Lo={datasets:[{description:"Benchmark dataset used for image classification with images that belong to 100 classes.",id:"cifar100"},{description:"Dataset consisting of images of garments.",id:"fashion_mnist"}],demo:{inputs:[{filename:"image-classification-input.jpeg",type:"img"}],outputs:[{type:"chart",data:[{label:"Egyptian cat",score:.514},{label:"Tabby cat",score:.193},{label:"Tiger cat",score:.068}]}]},metrics:[{description:"",id:"accuracy"},{description:"",id:"recall"},{description:"",id:"precision"},{description:"",id:"f1"}],models:[{description:"A strong image classification model.",id:"google/vit-base-patch16-224"},{description:"A robust image classification model.",id:"facebook/deit-base-distilled-patch16-224"},{description:"A strong image classification model.",id:"facebook/convnext-large-224"}],spaces:[{description:"A leaderboard to evaluate different image classification models.",id:"timm/leaderboard"}],summary:"Image classification is the task of assigning a label or class to an entire image. Images are expected to have only one class for each image. Image classification models take an image as input and return a prediction about which class the image belongs to.",widgetModels:["google/vit-base-patch16-224"],youtubeId:"tjAIM7BOYhw"},jo={datasets:[{description:"ImageNet-1K is a image classification dataset in which images are used to train image-feature-extraction models.",id:"imagenet-1k"}],demo:{inputs:[{filename:"mask-generation-input.png",type:"img"}],outputs:[{table:[["Dimension 1","Dimension 2","Dimension 3"],["0.21236686408519745","1.0919708013534546","0.8512550592422485"],["0.809657871723175","-0.18544459342956543","-0.7851548194885254"],["1.3103108406066895","-0.2479034662246704","-0.9107287526130676"],["1.8536205291748047","-0.36419737339019775","0.09717650711536407"]],type:"tabular"}]},metrics:[],models:[{description:"A powerful image feature extraction model.",id:"timm/vit_large_patch14_dinov2.lvd142m"},{description:"A strong image feature extraction model.",id:"nvidia/MambaVision-T-1K"},{description:"A robust image feature extraction model.",id:"facebook/dino-vitb16"},{description:"Cutting-edge image feature extraction model.",id:"apple/aimv2-large-patch14-336-distilled"},{description:"Strong image feature extraction model that can be used on images and documents.",id:"OpenGVLab/InternViT-6B-448px-V1-2"}],spaces:[{description:"A leaderboard to evaluate different image-feature-extraction models on classification performances",id:"timm/leaderboard"}],summary:"Image feature extraction is the task of extracting features learnt in a computer vision model.",widgetModels:[]},Mo={datasets:[{description:"Synthetic dataset, for image relighting",id:"VIDIT"},{description:"Multiple images of celebrities, used for facial expression translation",id:"huggan/CelebA-faces"},{description:"12M image-caption pairs.",id:"Spawning/PD12M"}],demo:{inputs:[{filename:"image-to-image-input.jpeg",type:"img"}],outputs:[{filename:"image-to-image-output.png",type:"img"}]},isPlaceholder:!1,metrics:[{description:"Peak Signal to Noise Ratio (PSNR) is an approximation of the human perception, considering the ratio of the absolute intensity with respect to the variations. Measured in dB, a high value indicates a high fidelity.",id:"PSNR"},{description:"Structural Similarity Index (SSIM) is a perceptual metric which compares the luminance, contrast and structure of two images. The values of SSIM range between -1 and 1, and higher values indicate closer resemblance to the original image.",id:"SSIM"},{description:"Inception Score (IS) is an analysis of the labels predicted by an image classification model when presented with a sample of the generated images.",id:"IS"}],models:[{description:"An image-to-image model to improve image resolution.",id:"fal/AuraSR-v2"},{description:"Powerful image editing model.",id:"black-forest-labs/FLUX.1-Kontext-dev"},{description:"Virtual try-on model.",id:"yisol/IDM-VTON"},{description:"Image re-lighting model.",id:"kontext-community/relighting-kontext-dev-lora-v3"},{description:"Strong model for inpainting and outpainting.",id:"black-forest-labs/FLUX.1-Fill-dev"},{description:"Strong model for image editing using depth maps.",id:"black-forest-labs/FLUX.1-Depth-dev-lora"}],spaces:[{description:"Image editing application.",id:"black-forest-labs/FLUX.1-Kontext-Dev"},{description:"Image relighting application.",id:"lllyasviel/iclight-v2-vary"},{description:"An application for image upscaling.",id:"jasperai/Flux.1-dev-Controlnet-Upscaler"}],summary:"Image-to-image is the task of transforming an input image through a variety of possible manipulations and enhancements, such as super-resolution, image inpainting, colorization, and more.",widgetModels:["Qwen/Qwen-Image"],youtubeId:""},No={datasets:[{description:"Dataset from 12M image-text of Reddit",id:"red_caps"},{description:"Dataset from 3.3M images of Google",id:"datasets/conceptual_captions"}],demo:{inputs:[{filename:"savanna.jpg",type:"img"}],outputs:[{label:"Detailed description",content:"a herd of giraffes and zebras grazing in a field",type:"text"}]},metrics:[],models:[{description:"Strong OCR model.",id:"allenai/olmOCR-7B-0725"},{description:"Powerful image captioning model.",id:"fancyfeast/llama-joycaption-beta-one-hf-llava"}],spaces:[{description:"SVG generator app from images.",id:"multimodalart/OmniSVG-3B"},{description:"An application that converts documents to markdown.",id:"numind/NuMarkdown-8B-Thinking"},{description:"An application that can caption images.",id:"fancyfeast/joy-caption-beta-one"}],summary:"Image to text models output a text from a given image. Image captioning or optical character recognition can be considered as the most common applications of image to text.",widgetModels:["Salesforce/blip-image-captioning-large"],youtubeId:""},Oo={datasets:[{description:"Instructions composed of image and text.",id:"liuhaotian/LLaVA-Instruct-150K"},{description:"Collection of image-text pairs on scientific topics.",id:"DAMO-NLP-SG/multimodal_textbook"},{description:"A collection of datasets made for model fine-tuning.",id:"HuggingFaceM4/the_cauldron"},{description:"Screenshots of websites with their HTML/CSS codes.",id:"HuggingFaceM4/WebSight"}],demo:{inputs:[{filename:"image-text-to-text-input.png",type:"img"},{label:"Text Prompt",content:"Describe the position of the bee in detail.",type:"text"}],outputs:[{label:"Answer",content:"The bee is sitting on a pink flower, surrounded by other flowers. The bee is positioned in the center of the flower, with its head and front legs sticking out.",type:"text"}]},metrics:[],models:[{description:"Small and efficient yet powerful vision language model.",id:"HuggingFaceTB/SmolVLM-Instruct"},{description:"Cutting-edge reasoning vision language model.",id:"zai-org/GLM-4.5V"},{description:"Cutting-edge small vision language model to convert documents to text.",id:"rednote-hilab/dots.ocr"},{description:"Small yet powerful model.",id:"Qwen/Qwen2.5-VL-3B-Instruct"},{description:"Image-text-to-text model with agentic capabilities.",id:"microsoft/Magma-8B"}],spaces:[{description:"Leaderboard to evaluate vision language models.",id:"opencompass/open_vlm_leaderboard"},{description:"An application that compares object detection capabilities of different vision language models.",id:"sergiopaniego/vlm_object_understanding"},{description:"An application to compare different OCR models.",id:"prithivMLmods/Multimodal-OCR"}],summary:"Image-text-to-text models take in an image and text prompt and output text. These models are also called vision-language models, or VLMs. The difference from image-to-text models is that these models take an additional text input, not restricting the model to certain use cases like image captioning, and may also be trained to accept a conversation as input.",widgetModels:["zai-org/GLM-4.5V"],youtubeId:"IoGaGfU1CIg"},qo={datasets:[],demo:{inputs:[{filename:"image-text-to-image-input.jpeg",type:"img"},{label:"Input",content:"A city above clouds, pastel colors, Victorian style",type:"text"}],outputs:[{filename:"image-text-to-image-output.png",type:"img"}]},metrics:[{description:"The Fréchet Inception Distance (FID) calculates the distance between distributions between synthetic and real samples. A lower FID score indicates better similarity between the distributions of real and generated images.",id:"FID"},{description:"CLIP Score measures the similarity between the generated image and the text prompt using CLIP embeddings. A higher score indicates better alignment with the text prompt.",id:"CLIP"}],models:[{description:"A powerful model for image-text-to-image generation.",id:"black-forest-labs/FLUX.2-dev"}],spaces:[{description:"An application for image-text-to-image generation.",id:"black-forest-labs/FLUX.2-dev"}],summary:"Image-text-to-image models take an image and a text prompt as input and generate a new image based on the reference image and text instructions. These models are useful for image editing, style transfer, image variations, and guided image generation tasks.",widgetModels:["black-forest-labs/FLUX.2-dev"],youtubeId:void 0},Bo={datasets:[],demo:{inputs:[{filename:"image-text-to-video-input.jpg",type:"img"},{label:"Input",content:"Darth Vader is surfing on the waves.",type:"text"}],outputs:[{filename:"image-text-to-video-output.gif",type:"img"}]},metrics:[{description:"Frechet Video Distance uses a model that captures coherence for changes in frames and the quality of each frame. A smaller score indicates better video generation.",id:"fvd"},{description:"CLIPSIM measures similarity between video frames and text using an image-text similarity model. A higher score indicates better video generation.",id:"clipsim"}],models:[{description:"A powerful model for image-text-to-video generation.",id:"Lightricks/LTX-Video"}],spaces:[{description:"An application for image-text-to-video generation.",id:"Lightricks/ltx-video-distilled"}],summary:"Image-text-to-video models take an reference image and a text instructions as and generate a video based on them. These models are useful for animating still images, creating dynamic content from static references, and generating videos with specific motion or transformation guidance.",widgetModels:["Lightricks/LTX-Video"],youtubeId:void 0},Fo={datasets:[{description:"Scene segmentation dataset.",id:"scene_parse_150"}],demo:{inputs:[{filename:"image-segmentation-input.jpeg",type:"img"}],outputs:[{filename:"image-segmentation-output.png",type:"img"}]},metrics:[{description:"Average Precision (AP) is the Area Under the PR Curve (AUC-PR). It is calculated for each semantic class separately",id:"Average Precision"},{description:"Mean Average Precision (mAP) is the overall average of the AP values",id:"Mean Average Precision"},{description:"Intersection over Union (IoU) is the overlap of segmentation masks. Mean IoU is the average of the IoU of all semantic classes",id:"Mean Intersection over Union"},{description:"APα is the Average Precision at the IoU threshold of a α value, for example, AP50 and AP75",id:"APα"}],models:[{description:"Solid panoptic segmentation model trained on COCO.",id:"tue-mps/coco_panoptic_eomt_large_640"},{description:"Background removal model.",id:"briaai/RMBG-1.4"},{description:"A multipurpose image segmentation model for high resolution images.",id:"ZhengPeng7/BiRefNet"},{description:"Powerful human-centric image segmentation model.",id:"facebook/sapiens-seg-1b"},{description:"Panoptic segmentation model trained on the COCO (common objects) dataset.",id:"facebook/mask2former-swin-large-coco-panoptic"}],spaces:[{description:"A semantic segmentation application that can predict unseen instances out of the box.",id:"facebook/ov-seg"},{description:"One of the strongest segmentation applications.",id:"jbrinkma/segment-anything"},{description:"A human-centric segmentation model.",id:"facebook/sapiens-pose"},{description:"An instance segmentation application to predict neuronal cell types from microscopy images.",id:"rashmi/sartorius-cell-instance-segmentation"},{description:"An application that segments videos.",id:"ArtGAN/Segment-Anything-Video"},{description:"An panoptic segmentation application built for outdoor environments.",id:"segments/panoptic-segment-anything"}],summary:"Image Segmentation divides an image into segments where each pixel in the image is mapped to an object. This task has multiple variants such as instance segmentation, panoptic segmentation and semantic segmentation.",widgetModels:["nvidia/segformer-b0-finetuned-ade-512-512"],youtubeId:"dKE8SIt9C-w"},Vo={datasets:[{description:"A benchmark dataset for reference image controlled video generation.",id:"ali-vilab/VACE-Benchmark"},{description:"A dataset of video generation style preferences.",id:"Rapidata/sora-video-generation-style-likert-scoring"},{description:"A dataset with videos and captions throughout the videos.",id:"BestWishYsh/ChronoMagic"}],demo:{inputs:[{filename:"image-to-video-input.jpg",type:"img"},{label:"Optional Text Prompt",content:"This penguin is dancing",type:"text"}],outputs:[{filename:"image-to-video-output.gif",type:"img"}]},metrics:[{description:"Fréchet Video Distance (FVD) measures the perceptual similarity between the distributions of generated videos and a set of real videos, assessing overall visual quality and temporal coherence of the video generated from an input image.",id:"fvd"},{description:"CLIP Score measures the semantic similarity between a textual prompt (if provided alongside the input image) and the generated video frames. It evaluates how well the video's generated content and motion align with the textual description, conditioned on the initial image.",id:"clip_score"},{description:"First Frame Fidelity, often measured using LPIPS (Learned Perceptual Image Patch Similarity), PSNR, or SSIM, quantifies how closely the first frame of the generated video matches the input conditioning image.",id:"lpips"},{description:"Identity Preservation Score measures the consistency of identity (e.g., a person's face or a specific object's characteristics) between the input image and throughout the generated video frames, often calculated using features from specialized models like face recognition (e.g., ArcFace) or re-identification models.",id:"identity_preservation"},{description:"Motion Score evaluates the quality, realism, and temporal consistency of motion in the video generated from a static image. This can be based on optical flow analysis (e.g., smoothness, magnitude), consistency of object trajectories, or specific motion plausibility assessments.",id:"motion_score"}],models:[{description:"LTX-Video, a 13B parameter model for high quality video generation",id:"Lightricks/LTX-Video-0.9.7-dev"},{description:"A 14B parameter model for reference image controlled video generation",id:"Wan-AI/Wan2.1-VACE-14B"},{description:"An image-to-video generation model using FramePack F1 methodology with Hunyuan-DiT architecture",id:"lllyasviel/FramePack_F1_I2V_HY_20250503"},{description:"A distilled version of the LTX-Video-0.9.7-dev model for faster inference",id:"Lightricks/LTX-Video-0.9.7-distilled"},{description:"An image-to-video generation model by Skywork AI, 14B parameters, producing 720p videos.",id:"Skywork/SkyReels-V2-I2V-14B-720P"},{description:"Image-to-video variant of Tencent's HunyuanVideo.",id:"tencent/HunyuanVideo-I2V"},{description:"A 14B parameter model for 720p image-to-video generation by Wan-AI.",id:"Wan-AI/Wan2.1-I2V-14B-720P"},{description:"A Diffusers version of the Wan2.1-I2V-14B-720P model for 720p image-to-video generation.",id:"Wan-AI/Wan2.1-I2V-14B-720P-Diffusers"}],spaces:[{description:"An application to generate videos fast.",id:"Lightricks/ltx-video-distilled"},{description:"Generate videos with the FramePack-F1",id:"linoyts/FramePack-F1"},{description:"Generate videos with the FramePack",id:"lisonallen/framepack-i2v"},{description:"Wan2.1 with CausVid LoRA",id:"multimodalart/wan2-1-fast"},{description:"A demo for Stable Video Diffusion",id:"multimodalart/stable-video-diffusion"}],summary:"Image-to-video models take a still image as input and generate a video. These models can be guided by text prompts to influence the content and style of the output video.",widgetModels:[],youtubeId:void 0},Ho={datasets:[{description:"Widely used benchmark dataset for multiple Vision tasks.",id:"merve/coco2017"},{description:"Medical Imaging dataset of the Human Brain for segmentation and mask generating tasks",id:"rocky93/BraTS_segmentation"}],demo:{inputs:[{filename:"mask-generation-input.png",type:"img"}],outputs:[{filename:"mask-generation-output.png",type:"img"}]},metrics:[{description:"IoU is used to measure the overlap between predicted mask and the ground truth mask.",id:"Intersection over Union (IoU)"}],models:[{description:"Small yet powerful mask generation model.",id:"Zigeng/SlimSAM-uniform-50"},{description:"Very strong mask generation model.",id:"facebook/sam2-hiera-large"}],spaces:[{description:"An application that combines a mask generation model with a zero-shot object detection model for text-guided image segmentation.",id:"merve/OWLSAM2"},{description:"An application that compares the performance of a large and a small mask generation model.",id:"merve/slimsam"},{description:"An application based on an improved mask generation model.",id:"SkalskiP/segment-anything-model-2"},{description:"An application to remove objects from videos using mask generation models.",id:"SkalskiP/SAM_and_ProPainter"}],summary:"Mask generation is the task of generating masks that identify a specific object or region of interest in a given image. Masks are often used in segmentation tasks, where they provide a precise way to isolate the object of interest for further processing or analysis.",widgetModels:[],youtubeId:""},Ko={datasets:[{description:"Widely used benchmark dataset for multiple vision tasks.",id:"merve/coco2017"},{description:"Multi-task computer vision benchmark.",id:"merve/pascal-voc"}],demo:{inputs:[{filename:"object-detection-input.jpg",type:"img"}],outputs:[{filename:"object-detection-output.jpg",type:"img"}]},metrics:[{description:"The Average Precision (AP) metric is the Area Under the PR Curve (AUC-PR). It is calculated for each class separately",id:"Average Precision"},{description:"The Mean Average Precision (mAP) metric is the overall average of the AP values",id:"Mean Average Precision"},{description:"The APα metric is the Average Precision at the IoU threshold of a α value, for example, AP50 and AP75",id:"APα"}],models:[{description:"Solid object detection model pre-trained on the COCO 2017 dataset.",id:"facebook/detr-resnet-50"},{description:"Accurate object detection model.",id:"IDEA-Research/dab-detr-resnet-50"},{description:"Fast and accurate object detection model.",id:"PekingU/rtdetr_v2_r50vd"},{description:"Object detection model for low-lying objects.",id:"StephanST/WALDO30"}],spaces:[{description:"Real-time object detection demo.",id:"Roboflow/RF-DETR"},{description:"An application that contains various object detection models to try from.",id:"Gradio-Blocks/Object-Detection-With-DETR-and-YOLOS"},{description:"A cutting-edge object detection application.",id:"sunsmarterjieleaf/yolov12"},{description:"An object tracking, segmentation and inpainting application.",id:"VIPLab/Track-Anything"},{description:"Very fast object tracking application based on object detection.",id:"merve/RT-DETR-tracking-coco"}],summary:"Object Detection models allow users to identify objects of certain defined classes. Object detection models receive an image as input and output the images with bounding boxes and labels on detected objects.",widgetModels:["facebook/detr-resnet-50"],youtubeId:"WdAeKSOpxhw"},zo={datasets:[{description:"NYU Depth V2 Dataset: Video dataset containing both RGB and depth sensor data.",id:"sayakpaul/nyu_depth_v2"},{description:"Monocular depth estimation benchmark based without noise and errors.",id:"depth-anything/DA-2K"}],demo:{inputs:[{filename:"depth-estimation-input.jpg",type:"img"}],outputs:[{filename:"depth-estimation-output.png",type:"img"}]},metrics:[],models:[{description:"Cutting-edge depth estimation model.",id:"depth-anything/Depth-Anything-V2-Large"},{description:"A strong monocular depth estimation model.",id:"jingheya/lotus-depth-g-v1-0"},{description:"A depth estimation model that predicts depth in videos.",id:"tencent/DepthCrafter"},{description:"A robust depth estimation model.",id:"apple/DepthPro-hf"}],spaces:[{description:"An application that predicts the depth of an image and then reconstruct the 3D model as voxels.",id:"radames/dpt-depth-estimation-3d-voxels"},{description:"An application for bleeding-edge depth estimation.",id:"akhaliq/depth-pro"},{description:"An application on cutting-edge depth estimation in videos.",id:"tencent/DepthCrafter"},{description:"A human-centric depth estimation application.",id:"facebook/sapiens-depth"}],summary:"Depth estimation is the task of predicting depth of the objects present in an image.",widgetModels:[""],youtubeId:""},Wo={datasets:[],demo:{inputs:[],outputs:[]},isPlaceholder:!0,metrics:[],models:[],spaces:[],summary:"",widgetModels:[],youtubeId:void 0,canonicalId:void 0},Xo={datasets:[{description:"A curation of widely used datasets for Data Driven Deep Reinforcement Learning (D4RL)",id:"edbeeching/decision_transformer_gym_replay"}],demo:{inputs:[{label:"State",content:"Red traffic light, pedestrians are about to pass.",type:"text"}],outputs:[{label:"Action",content:"Stop the car.",type:"text"},{label:"Next State",content:"Yellow light, pedestrians have crossed.",type:"text"}]},metrics:[{description:"Accumulated reward across all time steps discounted by a factor that ranges between 0 and 1 and determines how much the agent optimizes for future relative to immediate rewards. Measures how good is the policy ultimately found by a given algorithm considering uncertainty over the future.",id:"Discounted Total Reward"},{description:"Average return obtained after running the policy for a certain number of evaluation episodes. As opposed to total reward, mean reward considers how much reward a given algorithm receives while learning.",id:"Mean Reward"},{description:"Measures how good a given algorithm is after a predefined time. Some algorithms may be guaranteed to converge to optimal behavior across many time steps. However, an agent that reaches an acceptable level of optimality after a given time horizon may be preferable to one that ultimately reaches optimality but takes a long time.",id:"Level of Performance After Some Time"}],models:[{description:"A Reinforcement Learning model trained on expert data from the Gym Hopper environment",id:"edbeeching/decision-transformer-gym-hopper-expert"},{description:"A PPO agent playing seals/CartPole-v0 using the stable-baselines3 library and the RL Zoo.",id:"HumanCompatibleAI/ppo-seals-CartPole-v0"}],spaces:[{description:"An application for a cute puppy agent learning to catch a stick.",id:"ThomasSimonini/Huggy"},{description:"An application to play Snowball Fight with a reinforcement learning agent.",id:"ThomasSimonini/SnowballFight"}],summary:"Reinforcement learning is the computational approach of learning from action by interacting with an environment through trial and error and receiving rewards (negative or positive) as feedback",widgetModels:[],youtubeId:"q0BiUn5LiBc"},Qo={datasets:[{description:"A famous question answering dataset based on English articles from Wikipedia.",id:"squad_v2"},{description:"A dataset of aggregated anonymized actual queries issued to the Google search engine.",id:"natural_questions"}],demo:{inputs:[{label:"Question",content:"Which name is also used to describe the Amazon rainforest in English?",type:"text"},{label:"Context",content:"The Amazon rainforest, also known in English as Amazonia or the Amazon Jungle",type:"text"}],outputs:[{label:"Answer",content:"Amazonia",type:"text"}]},metrics:[{description:"Exact Match is a metric based on the strict character match of the predicted answer and the right answer. For answers predicted correctly, the Exact Match will be 1. Even if only one character is different, Exact Match will be 0",id:"exact-match"},{description:" The F1-Score metric is useful if we value both false positives and false negatives equally. The F1-Score is calculated on each word in the predicted sequence against the correct answer",id:"f1"}],models:[{description:"A robust baseline model for most question answering domains.",id:"deepset/roberta-base-squad2"},{description:"Small yet robust model that can answer questions.",id:"distilbert/distilbert-base-cased-distilled-squad"},{description:"A special model that can answer questions from tables.",id:"google/tapas-base-finetuned-wtq"}],spaces:[{description:"An application that can answer a long question from Wikipedia.",id:"deepset/wikipedia-assistant"}],summary:"Question Answering models can retrieve the answer to a question from a given text, which is useful for searching for an answer in a document. Some question answering models can generate answers without context!",widgetModels:["deepset/roberta-base-squad2"],youtubeId:"ajPx5LwJD-I"},Jo={datasets:[{description:"Bing queries with relevant passages from various web sources.",id:"microsoft/ms_marco"}],demo:{inputs:[{label:"Source sentence",content:"Machine learning is so easy.",type:"text"},{label:"Sentences to compare to",content:"Deep learning is so straightforward.",type:"text"},{label:"",content:"This is so difficult, like rocket science.",type:"text"},{label:"",content:"I can't believe how much I struggled with this.",type:"text"}],outputs:[{type:"chart",data:[{label:"Deep learning is so straightforward.",score:.623},{label:"This is so difficult, like rocket science.",score:.413},{label:"I can't believe how much I struggled with this.",score:.256}]}]},metrics:[{description:"Reciprocal Rank is a measure used to rank the relevancy of documents given a set of documents. Reciprocal Rank is the reciprocal of the rank of the document retrieved, meaning, if the rank is 3, the Reciprocal Rank is 0.33. If the rank is 1, the Reciprocal Rank is 1",id:"Mean Reciprocal Rank"},{description:"The similarity of the embeddings is evaluated mainly on cosine similarity. It is calculated as the cosine of the angle between two vectors. It is particularly useful when your texts are not the same length",id:"Cosine Similarity"}],models:[{description:"This model works well for sentences and paragraphs and can be used for clustering/grouping and semantic searches.",id:"sentence-transformers/all-mpnet-base-v2"},{description:"A multilingual robust sentence similarity model.",id:"BAAI/bge-m3"},{description:"A robust sentence similarity model.",id:"HIT-TMG/KaLM-embedding-multilingual-mini-instruct-v1.5"}],spaces:[{description:"An application that leverages sentence similarity to answer questions from YouTube videos.",id:"Gradio-Blocks/Ask_Questions_To_YouTube_Videos"},{description:"An application that retrieves relevant PubMed abstracts for a given online article which can be used as further references.",id:"Gradio-Blocks/pubmed-abstract-retriever"},{description:"An application that leverages sentence similarity to summarize text.",id:"nickmuchi/article-text-summarizer"},{description:"A guide that explains how Sentence Transformers can be used for semantic search.",id:"sentence-transformers/Sentence_Transformers_for_semantic_search"}],summary:"Sentence Similarity is the task of determining how similar two texts are. Sentence similarity models convert input texts into vectors (embeddings) that capture semantic information and calculate how close (similar) they are between them. This task is particularly useful for information retrieval and clustering/grouping.",widgetModels:["sentence-transformers/all-MiniLM-L6-v2"],youtubeId:"VCZq5AkbNEU"},Yo={canonicalId:"text-generation",datasets:[{description:"News articles in five different languages along with their summaries. Widely used for benchmarking multilingual summarization models.",id:"mlsum"},{description:"English conversations and their summaries. Useful for benchmarking conversational agents.",id:"samsum"}],demo:{inputs:[{label:"Input",content:"The tower is 324 metres (1,063 ft) tall, about the same height as an 81-storey building, and the tallest structure in Paris. Its base is square, measuring 125 metres (410 ft) on each side. It was the first structure to reach a height of 300 metres. Excluding transmitters, the Eiffel Tower is the second tallest free-standing structure in France after the Millau Viaduct.",type:"text"}],outputs:[{label:"Output",content:"The tower is 324 metres (1,063 ft) tall, about the same height as an 81-storey building. It was the first structure to reach a height of 300 metres.",type:"text"}]},metrics:[{description:"The generated sequence is compared against its summary, and the overlap of tokens are counted. ROUGE-N refers to overlap of N subsequent tokens, ROUGE-1 refers to overlap of single tokens and ROUGE-2 is the overlap of two subsequent tokens.",id:"rouge"}],models:[{description:"A strong summarization model trained on English news articles. Excels at generating factual summaries.",id:"facebook/bart-large-cnn"},{description:"A summarization model trained on medical articles.",id:"Falconsai/medical_summarization"}],spaces:[{description:"An application that can summarize long paragraphs.",id:"pszemraj/summarize-long-text"},{description:"A much needed summarization application for terms and conditions.",id:"ml6team/distilbart-tos-summarizer-tosdr"},{description:"An application that summarizes long documents.",id:"pszemraj/document-summarization"},{description:"An application that can detect errors in abstractive summarization.",id:"ml6team/post-processing-summarization"}],summary:"Summarization is the task of producing a shorter version of a document while preserving its important information. Some models can extract text from the original input, while other models can generate entirely new text.",widgetModels:["facebook/bart-large-cnn"],youtubeId:"yHnr5Dk2zCI"},Zo={datasets:[{description:"The WikiTableQuestions dataset is a large-scale dataset for the task of question answering on semi-structured tables.",id:"wikitablequestions"},{description:"WikiSQL is a dataset of 80654 hand-annotated examples of questions and SQL queries distributed across 24241 tables from Wikipedia.",id:"wikisql"}],demo:{inputs:[{table:[["Rank","Name","No.of reigns","Combined days"],["1","lou Thesz","3","3749"],["2","Ric Flair","8","3103"],["3","Harley Race","7","1799"]],type:"tabular"},{label:"Question",content:"What is the number of reigns for Harley Race?",type:"text"}],outputs:[{label:"Result",content:"7",type:"text"}]},metrics:[{description:"Checks whether the predicted answer(s) is the same as the ground-truth answer(s).",id:"Denotation Accuracy"}],models:[{description:"A table question answering model that is capable of neural SQL execution, i.e., employ TAPEX to execute a SQL query on a given table.",id:"microsoft/tapex-base"},{description:"A robust table question answering model.",id:"google/tapas-base-finetuned-wtq"}],spaces:[{description:"An application that answers questions based on table CSV files.",id:"katanaml/table-query"}],summary:"Table Question Answering (Table QA) is the answering a question about an information on a given table.",widgetModels:["google/tapas-base-finetuned-wtq"]},Go={datasets:[{description:"A comprehensive curation of datasets covering all benchmarks.",id:"inria-soda/tabular-benchmark"}],demo:{inputs:[{table:[["Glucose","Blood Pressure ","Skin Thickness","Insulin","BMI"],["148","72","35","0","33.6"],["150","50","30","0","35.1"],["141","60","29","1","39.2"]],type:"tabular"}],outputs:[{table:[["Diabetes"],["1"],["1"],["0"]],type:"tabular"}]},metrics:[{description:"",id:"accuracy"},{description:"",id:"recall"},{description:"",id:"precision"},{description:"",id:"f1"}],models:[{description:"Breast cancer prediction model based on decision trees.",id:"scikit-learn/cancer-prediction-trees"}],spaces:[{description:"An application that can predict defective products on a production line.",id:"scikit-learn/tabular-playground"},{description:"An application that compares various tabular classification techniques on different datasets.",id:"scikit-learn/classification"}],summary:"Tabular classification is the task of classifying a target category (a group) based on set of attributes.",widgetModels:["scikit-learn/tabular-playground"],youtubeId:""},er={datasets:[{description:"A comprehensive curation of datasets covering all benchmarks.",id:"inria-soda/tabular-benchmark"}],demo:{inputs:[{table:[["Car Name","Horsepower","Weight"],["ford torino","140","3,449"],["amc hornet","97","2,774"],["toyota corolla","65","1,773"]],type:"tabular"}],outputs:[{table:[["MPG (miles per gallon)"],["17"],["18"],["31"]],type:"tabular"}]},metrics:[{description:"",id:"mse"},{description:"Coefficient of determination (or R-squared) is a measure of how well the model fits the data. Higher R-squared is considered a better fit.",id:"r-squared"}],models:[{description:"Fish weight prediction based on length measurements and species.",id:"scikit-learn/Fish-Weight"}],spaces:[{description:"An application that can predict weight of a fish based on set of attributes.",id:"scikit-learn/fish-weight-prediction"}],summary:"Tabular regression is the task of predicting a numerical value given a set of attributes.",widgetModels:["scikit-learn/Fish-Weight"],youtubeId:""},tr={datasets:[{description:"RedCaps is a large-scale dataset of 12M image-text pairs collected from Reddit.",id:"red_caps"},{description:"Conceptual Captions is a dataset consisting of ~3.3M images annotated with captions.",id:"conceptual_captions"},{description:"12M image-caption pairs.",id:"Spawning/PD12M"}],demo:{inputs:[{label:"Input",content:"A city above clouds, pastel colors, Victorian style",type:"text"}],outputs:[{filename:"image.jpeg",type:"img"}]},metrics:[{description:"The Inception Score (IS) measure assesses diversity and meaningfulness. It uses a generated image sample to predict its label. A higher score signifies more diverse and meaningful images.",id:"IS"},{description:"The Fréchet Inception Distance (FID) calculates the distance between distributions between synthetic and real samples. A lower FID score indicates better similarity between the distributions of real and generated images.",id:"FID"},{description:"R-precision assesses how the generated image aligns with the provided text description. It uses the generated images as queries to retrieve relevant text descriptions. The top 'r' relevant descriptions are selected and used to calculate R-precision as r/R, where 'R' is the number of ground truth descriptions associated with the generated images. A higher R-precision value indicates a better model.",id:"R-Precision"}],models:[{description:"One of the most powerful image generation models that can generate realistic outputs.",id:"black-forest-labs/FLUX.1-Krea-dev"},{description:"A powerful image generation model.",id:"Qwen/Qwen-Image"},{description:"Powerful and fast image generation model.",id:"ByteDance/SDXL-Lightning"},{description:"A powerful text-to-image model.",id:"ByteDance/Hyper-SD"}],spaces:[{description:"A powerful text-to-image application.",id:"stabilityai/stable-diffusion-3-medium"},{description:"A text-to-image application to generate comics.",id:"jbilcke-hf/ai-comic-factory"},{description:"An application to match multiple custom image generation models.",id:"multimodalart/flux-lora-lab"},{description:"A powerful yet very fast image generation application.",id:"latent-consistency/lcm-lora-for-sdxl"},{description:"A gallery to explore various text-to-image models.",id:"multimodalart/LoraTheExplorer"},{description:"An application for `text-to-image`, `image-to-image` and image inpainting.",id:"ArtGAN/Stable-Diffusion-ControlNet-WebUI"},{description:"An application to generate realistic images given photos of a person and a prompt.",id:"InstantX/InstantID"}],summary:"Text-to-image is the task of generating images from input text. These pipelines can also be used to modify and edit images based on text prompts.",widgetModels:["black-forest-labs/FLUX.1-dev"],youtubeId:""},nr={canonicalId:"text-to-audio",datasets:[{description:"10K hours of multi-speaker English dataset.",id:"parler-tts/mls_eng_10k"},{description:"Multi-speaker English dataset.",id:"mythicinfinity/libritts_r"},{description:"Multi-lingual dataset.",id:"facebook/multilingual_librispeech"}],demo:{inputs:[{label:"Input",content:"I love audio models on the Hub!",type:"text"}],outputs:[{filename:"audio.wav",type:"audio"}]},metrics:[{description:"The Mel Cepstral Distortion (MCD) metric is used to calculate the quality of generated speech.",id:"mel cepstral distortion"}],models:[{description:"Small yet powerful TTS model.",id:"KittenML/kitten-tts-nano-0.1"},{description:"Bleeding edge TTS model.",id:"ResembleAI/chatterbox"},{description:"A massively multi-lingual TTS model.",id:"fishaudio/fish-speech-1.5"},{description:"A text-to-dialogue model.",id:"nari-labs/Dia-1.6B-0626"}],spaces:[{description:"An application for generate high quality speech in different languages.",id:"hexgrad/Kokoro-TTS"},{description:"A multilingual text-to-speech application.",id:"fishaudio/fish-speech-1"},{description:"Performant TTS application.",id:"ResembleAI/Chatterbox"},{description:"An application to compare different TTS models.",id:"TTS-AGI/TTS-Arena-V2"},{description:"An application that generates podcast episodes.",id:"ngxson/kokoro-podcast-generator"}],summary:"Text-to-Speech (TTS) is the task of generating natural sounding speech given text input. TTS models can be extended to have a single model that generates speech for multiple speakers and multiple languages.",widgetModels:["suno/bark"],youtubeId:"NW62DpzJ274"},ar={datasets:[{description:"A widely used dataset useful to benchmark named entity recognition models.",id:"eriktks/conll2003"},{description:"A multilingual dataset of Wikipedia articles annotated for named entity recognition in over 150 different languages.",id:"unimelb-nlp/wikiann"}],demo:{inputs:[{label:"Input",content:"My name is Omar and I live in Zürich.",type:"text"}],outputs:[{text:"My name is Omar and I live in Zürich.",tokens:[{type:"PERSON",start:11,end:15},{type:"GPE",start:30,end:36}],type:"text-with-tokens"}]},metrics:[{description:"",id:"accuracy"},{description:"",id:"recall"},{description:"",id:"precision"},{description:"",id:"f1"}],models:[{description:"A robust performance model to identify people, locations, organizations and names of miscellaneous entities.",id:"dslim/bert-base-NER"},{description:"A strong model to identify people, locations, organizations and names in multiple languages.",id:"FacebookAI/xlm-roberta-large-finetuned-conll03-english"},{description:"A token classification model specialized on medical entity recognition.",id:"blaze999/Medical-NER"},{description:"Flair models are typically the state of the art in named entity recognition tasks.",id:"flair/ner-english"}],spaces:[{description:"An application that can recognizes entities, extracts noun chunks and recognizes various linguistic features of each token.",id:"spacy/gradio_pipeline_visualizer"}],summary:"Token classification is a natural language understanding task in which a label is assigned to some tokens in a text. Some popular token classification subtasks are Named Entity Recognition (NER) and Part-of-Speech (PoS) tagging. NER models could be trained to identify specific entities in a text, such as dates, individuals and places; and PoS tagging would identify, for example, which words in a text are verbs, nouns, and punctuation marks.",widgetModels:["FacebookAI/xlm-roberta-large-finetuned-conll03-english"],youtubeId:"wVHdVlPScxA"},ir={canonicalId:"text-generation",datasets:[{description:"A dataset of copyright-free books translated into 16 different languages.",id:"Helsinki-NLP/opus_books"},{description:"An example of translation between programming languages. This dataset consists of functions in Java and C#.",id:"google/code_x_glue_cc_code_to_code_trans"}],demo:{inputs:[{label:"Input",content:"My name is Omar and I live in Zürich.",type:"text"}],outputs:[{label:"Output",content:"Mein Name ist Omar und ich wohne in Zürich.",type:"text"}]},metrics:[{description:"BLEU score is calculated by counting the number of shared single or subsequent tokens between the generated sequence and the reference. Subsequent n tokens are called “n-grams”. Unigram refers to a single token while bi-gram refers to token pairs and n-grams refer to n subsequent tokens. The score ranges from 0 to 1, where 1 means the translation perfectly matched and 0 did not match at all",id:"bleu"},{description:"",id:"sacrebleu"}],models:[{description:"Very powerful model that can translate many languages between each other, especially low-resource languages.",id:"facebook/nllb-200-1.3B"},{description:"A general-purpose Transformer that can be used to translate from English to German, French, or Romanian.",id:"google-t5/t5-base"}],spaces:[{description:"An application that can translate between 100 languages.",id:"Iker/Translate-100-languages"},{description:"An application that can translate between many languages.",id:"Geonmo/nllb-translation-demo"}],summary:"Translation is the task of converting text from one language to another.",widgetModels:["facebook/mbart-large-50-many-to-many-mmt"],youtubeId:"1JvfrvZgi6c"},or={datasets:[{description:"A widely used dataset used to benchmark multiple variants of text classification.",id:"nyu-mll/glue"},{description:"A text classification dataset used to benchmark natural language inference models",id:"stanfordnlp/snli"}],demo:{inputs:[{label:"Input",content:"I love Hugging Face!",type:"text"}],outputs:[{type:"chart",data:[{label:"POSITIVE",score:.9},{label:"NEUTRAL",score:.1},{label:"NEGATIVE",score:0}]}]},metrics:[{description:"",id:"accuracy"},{description:"",id:"recall"},{description:"",id:"precision"},{description:"The F1 metric is the harmonic mean of the precision and recall. It can be calculated as: F1 = 2 * (precision * recall) / (precision + recall)",id:"f1"}],models:[{description:"A robust model trained for sentiment analysis.",id:"distilbert/distilbert-base-uncased-finetuned-sst-2-english"},{description:"A sentiment analysis model specialized in financial sentiment.",id:"ProsusAI/finbert"},{description:"A sentiment analysis model specialized in analyzing tweets.",id:"cardiffnlp/twitter-roberta-base-sentiment-latest"},{description:"A model that can classify languages.",id:"papluca/xlm-roberta-base-language-detection"},{description:"A model that can classify text generation attacks.",id:"meta-llama/Prompt-Guard-86M"}],spaces:[{description:"An application that can classify financial sentiment.",id:"IoannisTr/Tech_Stocks_Trading_Assistant"},{description:"A dashboard that contains various text classification tasks.",id:"miesnerjacob/Multi-task-NLP"},{description:"An application that analyzes user reviews in healthcare.",id:"spacy/healthsea-demo"}],summary:"Text Classification is the task of assigning a label or class to a given text. Some use cases are sentiment analysis, natural language inference, and assessing grammatical correctness.",widgetModels:["distilbert/distilbert-base-uncased-finetuned-sst-2-english"],youtubeId:"leNG9fN9FQU"},rr={datasets:[{description:"Multilingual dataset used to evaluate text generation models.",id:"CohereForAI/Global-MMLU"},{description:"High quality multilingual data used to train text-generation models.",id:"HuggingFaceFW/fineweb-2"},{description:"Truly open-source, curated and cleaned dialogue dataset.",id:"HuggingFaceH4/ultrachat_200k"},{description:"A reasoning dataset.",id:"open-r1/OpenThoughts-114k-math"},{description:"A multilingual instruction dataset with preference ratings on responses.",id:"allenai/tulu-3-sft-mixture"},{description:"A large synthetic dataset for alignment of text generation models.",id:"HuggingFaceTB/smoltalk"},{description:"A dataset made for training text generation models solving math questions.",id:"HuggingFaceTB/finemath"}],demo:{inputs:[{label:"Input",content:"Once upon a time,",type:"text"}],outputs:[{label:"Output",content:"Once upon a time, we knew that our ancestors were on the verge of extinction. The great explorers and poets of the Old World, from Alexander the Great to Chaucer, are dead and gone. A good many of our ancient explorers and poets have",type:"text"}]},metrics:[{description:"Cross Entropy is a metric that calculates the difference between two probability distributions. Each probability distribution is the distribution of predicted words",id:"Cross Entropy"},{description:"The Perplexity metric is the exponential of the cross-entropy loss. It evaluates the probabilities assigned to the next word by the model. Lower perplexity indicates better performance",id:"Perplexity"}],models:[{description:"A text-generation model trained to follow instructions.",id:"google/gemma-2-2b-it"},{description:"Powerful text generation model for coding.",id:"Qwen/Qwen3-Coder-480B-A35B-Instruct"},{description:"Great text generation model with top-notch tool calling capabilities.",id:"openai/gpt-oss-120b"},{description:"Powerful text generation model.",id:"zai-org/GLM-4.5"},{description:"A powerful small model with reasoning capabilities.",id:"Qwen/Qwen3-4B-Thinking-2507"},{description:"Strong conversational model that supports very long instructions.",id:"Qwen/Qwen2.5-7B-Instruct-1M"},{description:"Text generation model used to write code.",id:"Qwen/Qwen2.5-Coder-32B-Instruct"},{description:"Powerful reasoning based open large language model.",id:"deepseek-ai/DeepSeek-R1"}],spaces:[{description:"An application that writes and executes code from text instructions and supports many models.",id:"akhaliq/anycoder"},{description:"An application that builds websites from natural language prompts.",id:"enzostvs/deepsite"},{description:"A leaderboard for comparing chain-of-thought performance of models.",id:"logikon/open_cot_leaderboard"},{description:"An text generation based application based on a very powerful LLaMA2 model.",id:"ysharma/Explore_llamav2_with_TGI"},{description:"An text generation based application to converse with Zephyr model.",id:"HuggingFaceH4/zephyr-chat"},{description:"A leaderboard that ranks text generation models based on blind votes from people.",id:"lmsys/chatbot-arena-leaderboard"},{description:"An chatbot to converse with a very powerful text generation model.",id:"mlabonne/phixtral-chat"}],summary:"Generating text is the task of generating new text given another text. These models can, for example, fill in incomplete text or paraphrase.",widgetModels:["mistralai/Mistral-Nemo-Instruct-2407"],youtubeId:"e9gNEAlsOvU"},sr={datasets:[{description:"Bing queries with relevant passages from various web sources.",id:"microsoft/ms_marco"}],demo:{inputs:[{label:"Source sentence",content:"Machine learning is so easy.",type:"text"},{label:"Sentences to compare to",content:"Deep learning is so straightforward.",type:"text"},{label:"",content:"This is so difficult, like rocket science.",type:"text"},{label:"",content:"I can't believe how much I struggled with this.",type:"text"}],outputs:[{type:"chart",data:[{label:"Deep learning is so straightforward.",score:2.2006407},{label:"This is so difficult, like rocket science.",score:-6.2634873},{label:"I can't believe how much I struggled with this.",score:-10.251488}]}]},metrics:[{description:"Discounted Cumulative Gain (DCG) measures the gain, or usefulness, of search results discounted by their position. The normalization is done by dividing the DCG by the ideal DCG, which is the DCG of the perfect ranking.",id:"Normalized Discounted Cumulative Gain"},{description:"Reciprocal Rank is a measure used to rank the relevancy of documents given a set of documents. Reciprocal Rank is the reciprocal of the rank of the document retrieved, meaning, if the rank is 3, the Reciprocal Rank is 0.33. If the rank is 1, the Reciprocal Rank is 1",id:"Mean Reciprocal Rank"},{description:"Mean Average Precision (mAP) is the overall average of the Average Precision (AP) values, where AP is the Area Under the PR Curve (AUC-PR)",id:"Mean Average Precision"}],models:[{description:"An extremely efficient text ranking model trained on a web search dataset.",id:"cross-encoder/ms-marco-MiniLM-L6-v2"},{description:"A strong multilingual text reranker model.",id:"Alibaba-NLP/gte-multilingual-reranker-base"},{description:"An efficient text ranking model that punches above its weight.",id:"Alibaba-NLP/gte-reranker-modernbert-base"}],spaces:[],summary:"Text Ranking is the task of ranking a set of texts based on their relevance to a query. Text ranking models are trained on large datasets of queries and relevant documents to learn how to rank documents based on their relevance to the query. This task is particularly useful for search engines and information retrieval systems.",widgetModels:["cross-encoder/ms-marco-MiniLM-L6-v2"],youtubeId:""},lr={datasets:[{description:"Microsoft Research Video to Text is a large-scale dataset for open domain video captioning",id:"iejMac/CLIP-MSR-VTT"},{description:"UCF101 Human Actions dataset consists of 13,320 video clips from YouTube, with 101 classes.",id:"quchenyuan/UCF101-ZIP"},{description:"A high-quality dataset for human action recognition in YouTube videos.",id:"nateraw/kinetics"},{description:"A dataset of video clips of humans performing pre-defined basic actions with everyday objects.",id:"HuggingFaceM4/something_something_v2"},{description:"This dataset consists of text-video pairs and contains noisy samples with irrelevant video descriptions",id:"HuggingFaceM4/webvid"},{description:"A dataset of short Flickr videos for the temporal localization of events with descriptions.",id:"iejMac/CLIP-DiDeMo"}],demo:{inputs:[{label:"Input",content:"Darth Vader is surfing on the waves.",type:"text"}],outputs:[{filename:"text-to-video-output.gif",type:"img"}]},metrics:[{description:"Inception Score uses an image classification model that predicts class labels and evaluates how distinct and diverse the images are. A higher score indicates better video generation.",id:"is"},{description:"Frechet Inception Distance uses an image classification model to obtain image embeddings. The metric compares mean and standard deviation of the embeddings of real and generated images. A smaller score indicates better video generation.",id:"fid"},{description:"Frechet Video Distance uses a model that captures coherence for changes in frames and the quality of each frame. A smaller score indicates better video generation.",id:"fvd"},{description:"CLIPSIM measures similarity between video frames and text using an image-text similarity model. A higher score indicates better video generation.",id:"clipsim"}],models:[{description:"A strong model for consistent video generation.",id:"tencent/HunyuanVideo"},{description:"A text-to-video model with high fidelity motion and strong prompt adherence.",id:"Lightricks/LTX-Video"},{description:"A text-to-video model focusing on physics-aware applications like robotics.",id:"nvidia/Cosmos-1.0-Diffusion-7B-Text2World"},{description:"Very fast model for video generation.",id:"Lightricks/LTX-Video-0.9.8-13B-distilled"}],spaces:[{description:"An application that generates video from text.",id:"VideoCrafter/VideoCrafter"},{description:"Consistent video generation application.",id:"Wan-AI/Wan2.1"},{description:"A cutting edge video generation application.",id:"Pyramid-Flow/pyramid-flow"}],summary:"Text-to-video models can be used in any application that requires generating consistent sequence of images from text. ",widgetModels:["Wan-AI/Wan2.2-TI2V-5B"],youtubeId:void 0},cr={datasets:[{description:"The CIFAR-100 dataset consists of 60000 32x32 colour images in 100 classes, with 600 images per class.",id:"cifar100"},{description:"Multiple images of celebrities, used for facial expression translation.",id:"CelebA"}],demo:{inputs:[{label:"Seed",content:"42",type:"text"},{label:"Number of images to generate:",content:"4",type:"text"}],outputs:[{filename:"unconditional-image-generation-output.jpeg",type:"img"}]},metrics:[{description:"The inception score (IS) evaluates the quality of generated images. It measures the diversity of the generated images (the model predictions are evenly distributed across all possible labels) and their 'distinction' or 'sharpness' (the model confidently predicts a single label for each image).",id:"Inception score (IS)"},{description:"The Fréchet Inception Distance (FID) evaluates the quality of images created by a generative model by calculating the distance between feature vectors for real and generated images.",id:"Frećhet Inception Distance (FID)"}],models:[{description:"High-quality image generation model trained on the CIFAR-10 dataset. It synthesizes images of the ten classes presented in the dataset using diffusion probabilistic models, a class of latent variable models inspired by considerations from nonequilibrium thermodynamics.",id:"google/ddpm-cifar10-32"},{description:"High-quality image generation model trained on the 256x256 CelebA-HQ dataset. It synthesizes images of faces using diffusion probabilistic models, a class of latent variable models inspired by considerations from nonequilibrium thermodynamics.",id:"google/ddpm-celebahq-256"}],spaces:[{description:"An application that can generate realistic faces.",id:"CompVis/celeba-latent-diffusion"}],summary:"Unconditional image generation is the task of generating images with no condition in any context (like a prompt text or another image). Once trained, the model will create images that resemble its training data distribution.",widgetModels:[""],youtubeId:""},pr={datasets:[{description:"Benchmark dataset used for video classification with videos that belong to 400 classes.",id:"kinetics400"}],demo:{inputs:[{filename:"video-classification-input.gif",type:"img"}],outputs:[{type:"chart",data:[{label:"Playing Guitar",score:.514},{label:"Playing Tennis",score:.193},{label:"Cooking",score:.068}]}]},metrics:[{description:"",id:"accuracy"},{description:"",id:"recall"},{description:"",id:"precision"},{description:"",id:"f1"}],models:[{description:"Strong Video Classification model trained on the Kinetics 400 dataset.",id:"google/vivit-b-16x2-kinetics400"},{description:"Strong Video Classification model trained on the Kinetics 400 dataset.",id:"microsoft/xclip-base-patch32"}],spaces:[{description:"An application that classifies video at different timestamps.",id:"nateraw/lavila"},{description:"An application that classifies video.",id:"fcakyon/video-classification"}],summary:"Video classification is the task of assigning a label or class to an entire video. Videos are expected to have only one class for each video. Video classification models take a video as input and return a prediction about which class the video belongs to.",widgetModels:[],youtubeId:""},dr={datasets:[{description:"A large dataset used to train visual document retrieval models.",id:"vidore/colpali_train_set"}],demo:{inputs:[{filename:"input.png",type:"img"},{label:"Question",content:"Is the model in this paper the fastest for inference?",type:"text"}],outputs:[{type:"chart",data:[{label:"Page 10",score:.7},{label:"Page 11",score:.06},{label:"Page 9",score:.003}]}]},isPlaceholder:!1,metrics:[{description:"NDCG@k scores ranked recommendation lists for top-k results. 0 is the worst, 1 is the best.",id:"Normalized Discounted Cumulative Gain at K"}],models:[{description:"Very accurate visual document retrieval model for multilingual queries and documents.",id:"vidore/colqwen2-v1.0"},{description:"Very fast and efficient visual document retrieval model that can also take in other modalities like audio.",id:"Tevatron/OmniEmbed-v0.1"}],spaces:[{description:"A leaderboard of visual document retrieval models.",id:"vidore/vidore-leaderboard"},{description:"Visual retrieval augmented generation demo based on ColQwen2 model.",id:"vidore/visual-rag-tool"}],summary:"Visual document retrieval is the task of searching for relevant image-based documents, such as PDFs. These models take a text query and multiple documents as input and return the top-most relevant documents and relevancy scores as output.",widgetModels:[""],youtubeId:""},ur={datasets:[{description:"A widely used dataset containing questions (with answers) about images.",id:"Graphcore/vqa"},{description:"A dataset to benchmark visual reasoning based on text in images.",id:"facebook/textvqa"}],demo:{inputs:[{filename:"elephant.jpeg",type:"img"},{label:"Question",content:"What is in this image?",type:"text"}],outputs:[{type:"chart",data:[{label:"elephant",score:.97},{label:"elephants",score:.06},{label:"animal",score:.003}]}]},isPlaceholder:!1,metrics:[{description:"",id:"accuracy"},{description:"Measures how much a predicted answer differs from the ground truth based on the difference in their semantic meaning.",id:"wu-palmer similarity"}],models:[{description:"A visual question answering model trained to convert charts and plots to text.",id:"google/deplot"},{description:"A visual question answering model trained for mathematical reasoning and chart derendering from images.",id:"google/matcha-base"},{description:"A strong visual question answering that answers questions from book covers.",id:"google/pix2struct-ocrvqa-large"}],spaces:[{description:"An application that compares visual question answering models across different tasks.",id:"merve/pix2struct"},{description:"An application that can answer questions based on images.",id:"nielsr/vilt-vqa"},{description:"An application that can caption images and answer questions about a given image. ",id:"Salesforce/BLIP"},{description:"An application that can caption images and answer questions about a given image. ",id:"vumichien/Img2Prompt"}],summary:"Visual Question Answering is the task of answering open-ended questions based on an image. They output natural language responses to natural language questions.",widgetModels:["dandelin/vilt-b32-finetuned-vqa"],youtubeId:""},mr={datasets:[{description:"A widely used dataset used to benchmark multiple variants of text classification.",id:"nyu-mll/glue"},{description:"The Multi-Genre Natural Language Inference (MultiNLI) corpus is a crowd-sourced collection of 433k sentence pairs annotated with textual entailment information.",id:"nyu-mll/multi_nli"},{description:"FEVER is a publicly available dataset for fact extraction and verification against textual sources.",id:"fever/fever"}],demo:{inputs:[{label:"Text Input",content:"Dune is the best movie ever.",type:"text"},{label:"Candidate Labels",content:"CINEMA, ART, MUSIC",type:"text"}],outputs:[{type:"chart",data:[{label:"CINEMA",score:.9},{label:"ART",score:.1},{label:"MUSIC",score:0}]}]},metrics:[],models:[{description:"Powerful zero-shot text classification model.",id:"facebook/bart-large-mnli"},{description:"Cutting-edge zero-shot multilingual text classification model.",id:"MoritzLaurer/ModernBERT-large-zeroshot-v2.0"},{description:"Zero-shot text classification model that can be used for topic and sentiment classification.",id:"knowledgator/gliclass-modern-base-v2.0-init"}],spaces:[],summary:"Zero-shot text classification is a task in natural language processing where a model is trained on a set of labeled examples but is then able to classify new examples from previously unseen classes.",widgetModels:["facebook/bart-large-mnli"]},fr={datasets:[{description:"",id:""}],demo:{inputs:[{filename:"image-classification-input.jpeg",type:"img"},{label:"Classes",content:"cat, dog, bird",type:"text"}],outputs:[{type:"chart",data:[{label:"Cat",score:.664},{label:"Dog",score:.329},{label:"Bird",score:.008}]}]},metrics:[{description:"Computes the number of times the correct label appears in top K labels predicted",id:"top-K accuracy"}],models:[{description:"Multilingual image classification model for 80 languages.",id:"visheratin/mexma-siglip"},{description:"Strong zero-shot image classification model.",id:"google/siglip2-base-patch16-224"},{description:"Robust zero-shot image classification model.",id:"intfloat/mmE5-mllama-11b-instruct"},{description:"Powerful zero-shot image classification model supporting 94 languages.",id:"jinaai/jina-clip-v2"},{description:"Strong image classification model for biomedical domain.",id:"microsoft/BiomedCLIP-PubMedBERT_256-vit_base_patch16_224"}],spaces:[{description:"An application that leverages zero-shot image classification to find best captions to generate an image. ",id:"pharma/CLIP-Interrogator"},{description:"An application to compare different zero-shot image classification models. ",id:"merve/compare_clip_siglip"}],summary:"Zero-shot image classification is the task of classifying previously unseen classes during training of a model.",widgetModels:["google/siglip-so400m-patch14-224"],youtubeId:""},gr={datasets:[],demo:{inputs:[{filename:"zero-shot-object-detection-input.jpg",type:"img"},{label:"Classes",content:"cat, dog, bird",type:"text"}],outputs:[{filename:"zero-shot-object-detection-output.jpg",type:"img"}]},metrics:[{description:"The Average Precision (AP) metric is the Area Under the PR Curve (AUC-PR). It is calculated for each class separately",id:"Average Precision"},{description:"The Mean Average Precision (mAP) metric is the overall average of the AP values",id:"Mean Average Precision"},{description:"The APα metric is the Average Precision at the IoU threshold of a α value, for example, AP50 and AP75",id:"APα"}],models:[{description:"Solid zero-shot object detection model.",id:"openmmlab-community/mm_grounding_dino_large_all"},{description:"Cutting-edge zero-shot object detection model.",id:"fushh7/LLMDet"}],spaces:[{description:"A demo to compare different zero-shot object detection models per output and latency.",id:"ariG23498/zero-shot-od"},{description:"A demo that combines a zero-shot object detection and mask generation model for zero-shot segmentation.",id:"merve/OWLSAM"}],summary:"Zero-shot object detection is a computer vision task to detect objects and their classes in images, without any prior training or knowledge of the classes. Zero-shot object detection models receive an image as input, as well as a list of candidate classes, and output the bounding boxes and labels where the objects have been detected.",widgetModels:[],youtubeId:""},hr={datasets:[{description:"A large dataset of over 10 million 3D objects.",id:"allenai/objaverse-xl"},{description:"A dataset of isolated object images for evaluating image-to-3D models.",id:"dylanebert/iso3d"}],demo:{inputs:[{filename:"image-to-3d-image-input.png",type:"img"}],outputs:[{label:"Result",content:"image-to-3d-3d-output-filename.glb",type:"text"}]},metrics:[],models:[{description:"Fast image-to-3D mesh model by Tencent.",id:"TencentARC/InstantMesh"},{description:"3D world generation model.",id:"tencent/HunyuanWorld-1"},{description:"A scaled up image-to-3D mesh model derived from TripoSR.",id:"hwjiang/Real3D"},{description:"Consistent image-to-3d generation model.",id:"stabilityai/stable-point-aware-3d"}],spaces:[{description:"Leaderboard to evaluate image-to-3D models.",id:"dylanebert/3d-arena"},{description:"Image-to-3D demo with mesh outputs.",id:"TencentARC/InstantMesh"},{description:"Image-to-3D demo.",id:"stabilityai/stable-point-aware-3d"},{description:"Image-to-3D demo with mesh outputs.",id:"hwjiang/Real3D"},{description:"Image-to-3D demo with splat outputs.",id:"dylanebert/LGM-mini"}],summary:"Image-to-3D models take in image input and produce 3D output.",widgetModels:[],youtubeId:""},br={datasets:[{description:"A large dataset of over 10 million 3D objects.",id:"allenai/objaverse-xl"},{description:"Descriptive captions for 3D objects in Objaverse.",id:"tiange/Cap3D"}],demo:{inputs:[{label:"Prompt",content:"a cat statue",type:"text"}],outputs:[{label:"Result",content:"text-to-3d-3d-output-filename.glb",type:"text"}]},metrics:[],models:[{description:"Text-to-3D mesh model by OpenAI",id:"openai/shap-e"},{description:"Generative 3D gaussian splatting model.",id:"ashawkey/LGM"}],spaces:[{description:"Text-to-3D demo with mesh outputs.",id:"hysts/Shap-E"},{description:"Text/image-to-3D demo with splat outputs.",id:"ashawkey/LGM"}],summary:"Text-to-3D models take in text input and produce 3D output.",widgetModels:[],youtubeId:""},yr={datasets:[{description:"A dataset of hand keypoints of over 500k examples.",id:"Vincent-luo/hagrid-mediapipe-hands"}],demo:{inputs:[{filename:"keypoint-detection-input.png",type:"img"}],outputs:[{filename:"keypoint-detection-output.png",type:"img"}]},metrics:[],models:[{description:"A robust keypoint detection model.",id:"magic-leap-community/superpoint"},{description:"A robust keypoint matching model.",id:"magic-leap-community/superglue_outdoor"},{description:"Strong keypoint detection model used to detect human pose.",id:"qualcomm/RTMPose-Body2d"},{description:"Powerful keypoint matching model.",id:"ETH-CVG/lightglue_disk"}],spaces:[{description:"An application that detects hand keypoints in real-time.",id:"datasciencedojo/Hand-Keypoint-Detection-Realtime"},{description:"An application for keypoint detection and matching.",id:"ETH-CVG/LightGlue"}],summary:"Keypoint detection is the task of identifying meaningful distinctive points or features in an image.",widgetModels:[],youtubeId:""},wr={datasets:[{description:"Multiple-choice questions and answers about videos.",id:"lmms-lab/Video-MME"},{description:"A dataset of instructions and question-answer pairs about videos.",id:"lmms-lab/VideoChatGPT"},{description:"Large video understanding dataset.",id:"HuggingFaceFV/finevideo"}],demo:{inputs:[{filename:"video-text-to-text-input.gif",type:"img"},{label:"Text Prompt",content:"What is happening in this video?",type:"text"}],outputs:[{label:"Answer",content:"The video shows a series of images showing a fountain with water jets and a variety of colorful flowers and butterflies in the background.",type:"text"}]},metrics:[],models:[{description:"A robust video-text-to-text model.",id:"Vision-CAIR/LongVU_Qwen2_7B"},{description:"Strong video-text-to-text model with reasoning capabilities.",id:"GoodiesHere/Apollo-LMMs-Apollo-7B-t32"},{description:"Strong video-text-to-text model.",id:"HuggingFaceTB/SmolVLM2-2.2B-Instruct"}],spaces:[{description:"An application to chat with a video-text-to-text model.",id:"llava-hf/video-llava"},{description:"A leaderboard for various video-text-to-text models.",id:"opencompass/openvlm_video_leaderboard"},{description:"An application to generate highlights from a video.",id:"HuggingFaceTB/SmolVLM2-HighlightGenerator"}],summary:"Video-text-to-text models take in a video and a text prompt and output text. These models are also called video-language models.",widgetModels:[""],youtubeId:""},vr={datasets:[{description:"Dataset with detailed annotations for training and benchmarking video instance editing.",id:"suimu/VIRESET"},{description:"Dataset to evaluate models on long video generation and understanding.",id:"zhangsh2001/LongV-EVAL"},{description:"Collection of 104 demo videos from the SeedVR/SeedVR2 series showcasing model outputs.",id:"Iceclear/SeedVR_VideoDemos"}],demo:{inputs:[{filename:"input.gif",type:"img"}],outputs:[{filename:"output.gif",type:"img"}]},metrics:[],models:[{description:"Model for editing outfits, character, and scenery in videos.",id:"decart-ai/Lucy-Edit-Dev"},{description:"Framework that uses 3D mesh proxies for precise, consistent video editing.",id:"LeoLau/Shape-for-Motion"},{description:"Model for generating physics-aware videos from input videos and control conditions.",id:"nvidia/Cosmos-Transfer2.5-2B"},{description:"A model to upscale videos at input, designed for seamless use with ComfyUI.",id:"numz/SeedVR2_comfyUI"}],spaces:[{description:"Interactive demo space for Lucy-Edit-Dev video editing.",id:"decart-ai/lucy-edit-dev"},{description:"Demo space for SeedVR2-3B showcasing video upscaling and restoration.",id:"ByteDance-Seed/SeedVR2-3B"}],summary:"Video-to-video models take one or more videos as input and generate new videos as output. They can enhance quality, interpolate frames, modify styles, or create new motion dynamics, enabling creative applications, video production, and research.",widgetModels:[],youtubeId:""},_r={"audio-classification":["speechbrain","transformers","transformers.js"],"audio-to-audio":["asteroid","fairseq","speechbrain"],"automatic-speech-recognition":["espnet","nemo","speechbrain","transformers","transformers.js"],"audio-text-to-text":["transformers"],"depth-estimation":["transformers","transformers.js"],"document-question-answering":["transformers","transformers.js"],"feature-extraction":["sentence-transformers","transformers","transformers.js"],"fill-mask":["transformers","transformers.js"],"graph-ml":["transformers"],"image-classification":["keras","timm","transformers","transformers.js"],"image-feature-extraction":["timm","transformers"],"image-segmentation":["transformers","transformers.js"],"image-text-to-text":["transformers"],"image-text-to-image":["diffusers"],"image-text-to-video":["diffusers"],"image-to-image":["diffusers","transformers","transformers.js"],"image-to-text":["transformers","transformers.js"],"image-to-video":["diffusers"],"keypoint-detection":["transformers"],"video-classification":["transformers"],"mask-generation":["transformers"],"multiple-choice":["transformers"],"object-detection":["transformers","transformers.js","ultralytics"],other:[],"question-answering":["adapter-transformers","allennlp","transformers","transformers.js"],robotics:[],"reinforcement-learning":["transformers","stable-baselines3","ml-agents","sample-factory"],"sentence-similarity":["sentence-transformers","spacy","transformers.js"],summarization:["transformers","transformers.js"],"table-question-answering":["transformers"],"table-to-text":["transformers"],"tabular-classification":["sklearn"],"tabular-regression":["sklearn"],"tabular-to-text":["transformers"],"text-classification":["adapter-transformers","setfit","spacy","transformers","transformers.js"],"text-generation":["transformers","transformers.js"],"text-ranking":["sentence-transformers","transformers"],"text-retrieval":[],"text-to-image":["diffusers"],"text-to-speech":["espnet","tensorflowtts","transformers","transformers.js"],"text-to-audio":["transformers","transformers.js"],"text-to-video":["diffusers"],"time-series-forecasting":[],"token-classification":["adapter-transformers","flair","spacy","span-marker","stanza","transformers","transformers.js"],translation:["transformers","transformers.js"],"unconditional-image-generation":["diffusers"],"video-text-to-text":["transformers"],"visual-question-answering":["transformers","transformers.js"],"voice-activity-detection":[],"zero-shot-classification":["transformers","transformers.js"],"zero-shot-image-classification":["transformers","transformers.js"],"zero-shot-object-detection":["transformers","transformers.js"],"text-to-3d":["diffusers"],"image-to-3d":["diffusers"],"any-to-any":["transformers"],"visual-document-retrieval":["transformers"],"video-to-video":["diffusers"]};function x(e,t=Wo){return{...t,id:e,label:Je[e].name,libraries:_r[e]}}x("any-to-any",So),x("audio-classification",Po),x("audio-to-audio",Co),x("audio-text-to-text",Ro),x("automatic-speech-recognition",Eo),x("depth-estimation",zo),x("document-question-answering",Uo),x("visual-document-retrieval",dr),x("feature-extraction",$o),x("fill-mask",Do),x("image-classification",Lo),x("image-feature-extraction",jo),x("image-segmentation",Fo),x("image-to-image",Mo),x("image-text-to-text",Oo),x("image-text-to-image",qo),x("image-text-to-video",Bo),x("image-to-text",No),x("image-to-video",Vo),x("keypoint-detection",yr),x("mask-generation",Ho),x("object-detection",Ko),x("video-classification",pr),x("question-answering",Qo),x("reinforcement-learning",Xo),x("sentence-similarity",Jo),x("summarization",Yo),x("table-question-answering",Zo),x("tabular-classification",Go),x("tabular-regression",er),x("text-classification",or),x("text-generation",rr),x("text-ranking",sr),x("text-to-image",tr),x("text-to-speech",nr),x("text-to-video",lr),x("token-classification",ar),x("translation",ir),x("unconditional-image-generation",cr),x("video-text-to-text",wr),x("video-to-video",vr),x("visual-question-answering",ur),x("zero-shot-classification",mr),x("zero-shot-image-classification",fr),x("zero-shot-object-detection",gr),x("text-to-3d",br),x("image-to-3d",hr);const xr=()=>'"Hi, I recently bought a device from your company but it is not working as advertised and I would like to get reimbursed!"',kr=()=>'"Меня зовут Вольфганг и я живу в Берлине"',Ar=()=>'"The tower is 324 metres (1,063 ft) tall, about the same height as an 81-storey building, and the tallest structure in Paris. Its base is square, measuring 125 metres (410 ft) on each side. During its construction, the Eiffel Tower surpassed the Washington Monument to become the tallest man-made structure in the world, a title it held for 41 years until the Chrysler Building in New York City was finished in 1930. It was the first structure to reach a height of 300 metres. Due to the addition of a broadcasting aerial at the top of the tower in 1957, it is now taller than the Chrysler Building by 5.2 metres (17 ft). Excluding transmitters, the Eiffel Tower is the second tallest free-standing structure in France after the Millau Viaduct."',Ir=()=>`{
    "query": "How many stars does the transformers repository have?",
    "table": {
        "Repository": ["Transformers", "Datasets", "Tokenizers"],
        "Stars": ["36542", "4512", "3934"],
        "Contributors": ["651", "77", "34"],
        "Programming language": [
            "Python",
            "Python",
            "Rust, Python and NodeJS"
        ]
    }
}`,Tr=()=>`{
        "image": "cat.png",
        "question": "What is in this image?"
    }`,Sr=()=>`{
    "question": "What is my name?",
    "context": "My name is Clara and I live in Berkeley."
}`,Pr=()=>'"I like you. I love you"',Rr=()=>'"My name is Sarah Jessica Parker but you can call me Jessica"',wt=e=>e.tags.includes("conversational")?e.pipeline_tag==="text-generation"?[{role:"user",content:"What is the capital of France?"}]:[{role:"user",content:[{type:"text",text:"Describe this image in one sentence."},{type:"image_url",image_url:{url:"https://cdn.britannica.com/61/93061-050-99147DCE/Statue-of-Liberty-Island-New-York-Bay.jpg"}}]}]:'"Can you please let us know more details about your "',Cr=e=>`"The answer to the universe is ${e.mask_token}."`,Er=()=>`{
    "source_sentence": "That is a happy person",
    "sentences": [
        "That is a happy dog",
        "That is a very happy person",
        "Today is a sunny day"
    ]
}`,Ur=()=>'"Today is a sunny day and I will get some ice cream."',$r=()=>'"cats.jpg"',Dr=()=>'"cats.jpg"',Lr=()=>`{
    "image": "cat.png",
    "prompt": "Turn the cat into a tiger."
}`,jr=()=>`{
    "image": "cat.png",
    "prompt": "The cat starts to dance"
}`,Mr=()=>`{
    "image": "cat.png",
    "prompt": "Turn the cat into a tiger."
}`,Nr=()=>`{
    "image": "cat.png",
    "prompt": "The cat starts to dance"
}`,Or=()=>'"cats.jpg"',qr=()=>'"cats.jpg"',Br=()=>'"sample1.flac"',Fr=()=>'"sample1.flac"',Vr=()=>'"Astronaut riding a horse"',Hr=()=>'"A young man walking on the street"',Kr=()=>'"The answer to the universe is 42"',zr=()=>'"liquid drum and bass, atmospheric synths, airy sounds"',Wr=()=>'"sample1.flac"',vt=()=>`'{"Height":[11.52,12.48],"Length1":[23.2,24.0],"Length2":[25.4,26.3],"Species": ["Bream","Bream"]}'`,Xr=()=>'"cats.jpg"',Qr={"audio-to-audio":Br,"audio-classification":Fr,"automatic-speech-recognition":Wr,"document-question-answering":Tr,"feature-extraction":Ur,"fill-mask":Cr,"image-classification":$r,"image-to-text":Dr,"image-to-image":Lr,"image-to-video":jr,"image-text-to-image":Mr,"image-text-to-video":Nr,"image-segmentation":Or,"object-detection":qr,"question-answering":Sr,"sentence-similarity":Er,summarization:Ar,"table-question-answering":Ir,"tabular-regression":vt,"tabular-classification":vt,"text-classification":Pr,"text-generation":wt,"image-text-to-text":wt,"text-to-image":Vr,"text-to-video":Hr,"text-to-speech":Kr,"text-to-audio":zr,"token-classification":Rr,translation:kr,"zero-shot-classification":xr,"zero-shot-image-classification":Xr};function Jr(e,t=!1,n=!1){if(e.pipeline_tag){const a=Qr[e.pipeline_tag];if(a){let i=a(e);if(typeof i=="string"&&(t&&(i=i.replace(/(?:(?:\r?\n|\r)\t*)|\t+/g," ")),n)){const o=/^"(.+)"$/s,r=i.match(o);i=r?r[1]:i}return i}}return"No input example has been defined for this model task."}function Yr(e,t){let n=JSON.stringify(e,null,"	");return t?.indent&&(n=n.replaceAll(`
`,`
${t.indent}`)),t?.attributeKeyQuotes||(n=n.replace(/"([^"]+)":/g,"$1:")),t?.customContentEscaper&&(n=t.customContentEscaper(n)),n}const Ft="custom_code";function G(e){const t=e.split("/");return t.length===1?t[0]:t[1]}const Zr=e=>JSON.stringify(e).slice(1,-1),Gr=e=>[`from adapters import AutoAdapterModel

model = AutoAdapterModel.from_pretrained("${e.config?.adapter_transformers?.model_name}")
model.load_adapter("${e.id}", set_active=True)`],es=e=>[`import allennlp_models
from allennlp.predictors.predictor import Predictor

predictor = Predictor.from_path("hf://${e.id}")`],ts=e=>[`import allennlp_models
from allennlp.predictors.predictor import Predictor

predictor = Predictor.from_path("hf://${e.id}")
predictor_input = {"passage": "My name is Wolfgang and I live in Berlin", "question": "Where do I live?"}
predictions = predictor.predict_json(predictor_input)`],ns=e=>e.tags.includes("question-answering")?ts(e):es(e),as=e=>[`from araclip import AraClip

model = AraClip.from_pretrained("${e.id}")`],is=e=>[`from asteroid.models import BaseModel

model = BaseModel.from_pretrained("${e.id}")`],os=e=>{const t=`# Watermark Generator
from audioseal import AudioSeal

model = AudioSeal.load_generator("${e.id}")
# pass a tensor (tensor_wav) of shape (batch, channels, samples) and a sample rate
wav, sr = tensor_wav, 16000
	
watermark = model.get_watermark(wav, sr)
watermarked_audio = wav + watermark`,n=`# Watermark Detector
from audioseal import AudioSeal

detector = AudioSeal.load_detector("${e.id}")
	
result, message = detector.detect_watermark(watermarked_audio, sr)`;return[t,n]};function he(e){return e.cardData?.base_model?.toString()??"fill-in-base-model"}function ce(e){const t=e.widgetData?.[0]?.text??e.cardData?.instance_prompt;if(t)return Zr(t)}const rs=e=>[`import requests
from PIL import Image
from ben2 import AutoModel

url = "https://huggingface.co/datasets/mishig/sample_images/resolve/main/teapot.jpg"
image = Image.open(requests.get(url, stream=True).raw)

model = AutoModel.from_pretrained("${e.id}")
model.to("cuda").eval()
foreground = model.inference(image)
`],ss=e=>[`from bertopic import BERTopic

model = BERTopic.load("${e.id}")`],ls=e=>[`from bm25s.hf import BM25HF

retriever = BM25HF.load_from_hub("${e.id}")`],cs=()=>[`# pip install chatterbox-tts
import torchaudio as ta
from chatterbox.tts import ChatterboxTTS

model = ChatterboxTTS.from_pretrained(device="cuda")

text = "Ezreal and Jinx teamed up with Ahri, Yasuo, and Teemo to take down the enemy's Nexus in an epic late-game pentakill."
wav = model.generate(text)
ta.save("test-1.wav", wav, model.sr)

# If you want to synthesize with a different voice, specify the audio prompt
AUDIO_PROMPT_PATH="YOUR_FILE.wav"
wav = model.generate(text, audio_prompt_path=AUDIO_PROMPT_PATH)
ta.save("test-2.wav", wav, model.sr)`],ps=e=>{const t="pip install chronos-forecasting",n=`import pandas as pd
from chronos import BaseChronosPipeline

pipeline = BaseChronosPipeline.from_pretrained("${e.id}", device_map="cuda")

# Load historical data
context_df = pd.read_csv("https://autogluon.s3.us-west-2.amazonaws.com/datasets/timeseries/misc/AirPassengers.csv")

# Generate predictions
pred_df = pipeline.predict_df(
    context_df,
    prediction_length=36,  # Number of steps to forecast
    quantile_levels=[0.1, 0.5, 0.9],  # Quantiles for probabilistic forecast
    id_column="item_id",  # Column identifying different time series
    timestamp_column="Month",  # Column with datetime information
    target="#Passengers",  # Column(s) with time series values to predict
)`;return[t,n]},ds=e=>{const t="pip install colipri",n=`from colipri import get_model
from colipri import get_processor
from colipri import load_sample_ct
from colipri import ZeroShotImageClassificationPipeline

model = get_model().cuda()
processor = get_processor()
pipeline = ZeroShotImageClassificationPipeline("${e.id}", processor)

image = load_sample_ct()

pipeline(image, ["No lung nodules", "Lung nodules"])
`;return[t,n]},us=()=>["pip install git+https://github.com/SAP-samples/sap-rpt-1-oss",`# Run a classification task
from sklearn.datasets import load_breast_cancer
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split

from sap_rpt_oss import SAP_RPT_OSS_Classifier

# Load sample data
X, y = load_breast_cancer(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.5, random_state=42)

# Initialize a classifier, 8k context and 8-fold bagging gives best performance, reduce if running out of memory
clf = SAP_RPT_OSS_Classifier(max_context_size=8192, bagging=8)

clf.fit(X_train, y_train)

# Predict probabilities
prediction_probabilities = clf.predict_proba(X_test)
# Predict labels
predictions = clf.predict(X_test)
print("Accuracy", accuracy_score(y_test, predictions))`,`# Run a regression task
from sklearn.datasets import fetch_openml
from sklearn.metrics import r2_score
from sklearn.model_selection import train_test_split

from sap_rpt_oss import SAP_RPT_OSS_Regressor

# Load sample data
df = fetch_openml(data_id=531, as_frame=True)
X = df.data
y = df.target.astype(float)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.5, random_state=42)

# Initialize the regressor, 8k context and 8-fold bagging gives best performance, reduce if running out of memory
regressor = SAP_RPT_OSS_Regressor(max_context_size=8192, bagging=8)

regressor.fit(X_train, y_train)

# Predict on the test set
predictions = regressor.predict(X_test)

r2 = r2_score(y_test, predictions)
print("R² Score:", r2)`],ms=()=>[`# pip install git+https://github.com/Google-Health/cxr-foundation.git#subdirectory=python

# Load image as grayscale (Stillwaterising, CC0, via Wikimedia Commons)
import requests
from PIL import Image
from io import BytesIO
image_url = "https://upload.wikimedia.org/wikipedia/commons/c/c8/Chest_Xray_PA_3-8-2010.png"
img = Image.open(requests.get(image_url, headers={'User-Agent': 'Demo'}, stream=True).raw).convert('L')

# Run inference
from clientside.clients import make_hugging_face_client
cxr_client = make_hugging_face_client('cxr_model')
print(cxr_client.get_image_embeddings_from_images([img]))`],fs=e=>{let t,n,a;return t="<ENCODER>",n="<NUMBER_OF_FEATURES>",a="<OUT_CHANNELS>",e.id==="depth-anything/Depth-Anything-V2-Small"?(t="vits",n="64",a="[48, 96, 192, 384]"):e.id==="depth-anything/Depth-Anything-V2-Base"?(t="vitb",n="128",a="[96, 192, 384, 768]"):e.id==="depth-anything/Depth-Anything-V2-Large"&&(t="vitl",n="256",a="[256, 512, 1024, 1024"),[`
# Install from https://github.com/DepthAnything/Depth-Anything-V2

# Load the model and infer depth from an image
import cv2
import torch

from depth_anything_v2.dpt import DepthAnythingV2

# instantiate the model
model = DepthAnythingV2(encoder="${t}", features=${n}, out_channels=${a})

# load the weights
filepath = hf_hub_download(repo_id="${e.id}", filename="depth_anything_v2_${t}.pth", repo_type="model")
state_dict = torch.load(filepath, map_location="cpu")
model.load_state_dict(state_dict).eval()

raw_img = cv2.imread("your/image/path")
depth = model.infer_image(raw_img) # HxW raw depth map in numpy
    `]},gs=e=>[`# Download checkpoint
pip install huggingface-hub
huggingface-cli download --local-dir checkpoints ${e.id}`,`import depth_pro

# Load model and preprocessing transform
model, transform = depth_pro.create_model_and_transforms()
model.eval()

# Load and preprocess an image.
image, _, f_px = depth_pro.load_rgb("example.png")
image = transform(image)

# Run inference.
prediction = model.infer(image, f_px=f_px)

# Results: 1. Depth in meters
depth = prediction["depth"]
# Results: 2. Focal length in pixels
focallength_px = prediction["focallength_px"]`],hs=()=>[`from huggingface_hub import from_pretrained_keras
import tensorflow as tf, requests

# Load and format input
IMAGE_URL = "https://storage.googleapis.com/dx-scin-public-data/dataset/images/3445096909671059178.png"
input_tensor = tf.train.Example(
    features=tf.train.Features(
        feature={
            "image/encoded": tf.train.Feature(
                bytes_list=tf.train.BytesList(value=[requests.get(IMAGE_URL, stream=True).content])
            )
        }
    )
).SerializeToString()

# Load model and run inference
loaded_model = from_pretrained_keras("google/derm-foundation")
infer = loaded_model.signatures["serving_default"]
print(infer(inputs=tf.constant([input_tensor])))`],bs=e=>[`import soundfile as sf
from dia.model import Dia

model = Dia.from_pretrained("${e.id}")
text = "[S1] Dia is an open weights text to dialogue model. [S2] You get full control over scripts and voices. [S1] Wow. Amazing. (laughs) [S2] Try it now on Git hub or Hugging Face."
output = model.generate(text)

sf.write("simple.mp3", output, 44100)`],ys=e=>[`from dia2 import Dia2, GenerationConfig, SamplingConfig

dia = Dia2.from_repo("${e.id}", device="cuda", dtype="bfloat16")
config = GenerationConfig(
    cfg_scale=2.0,
    audio=SamplingConfig(temperature=0.8, top_k=50),
    use_cuda_graph=True,
)
result = dia.generate("[S1] Hello Dia2!", config=config, output_wav="hello.wav", verbose=True)
`],ws=e=>[`# pip install git+https://github.com/NVlabs/describe-anything
from huggingface_hub import snapshot_download
from dam import DescribeAnythingModel

snapshot_download(${e.id}, local_dir="checkpoints")

dam = DescribeAnythingModel(
	model_path="checkpoints",
	conv_mode="v1",
	prompt_mode="focal_prompt",
)`],vs="pip install -U diffusers transformers accelerate",Vt="Astronaut in a jungle, cold color palette, muted colors, detailed, 8k",Ht="Turn this cat into a dog",Ye="A man with short gray hair plays a red electric guitar.",_s=e=>[`import torch
from diffusers import DiffusionPipeline

# switch to "mps" for apple devices
pipe = DiffusionPipeline.from_pretrained("${e.id}", dtype=torch.bfloat16, device_map="cuda")

prompt = "${ce(e)??Vt}"
image = pipe(prompt).images[0]`],xs=e=>[`import torch
from diffusers import DiffusionPipeline
from diffusers.utils import load_image

# switch to "mps" for apple devices
pipe = DiffusionPipeline.from_pretrained("${e.id}", dtype=torch.bfloat16, device_map="cuda")

prompt = "${ce(e)??Ht}"
input_image = load_image("https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/diffusers/cat.png")

image = pipe(image=input_image, prompt=prompt).images[0]`],ks=e=>[`import torch
from diffusers import DiffusionPipeline
from diffusers.utils import load_image, export_to_video

# switch to "mps" for apple devices
pipe = DiffusionPipeline.from_pretrained("${e.id}", dtype=torch.bfloat16, device_map="cuda")
pipe.to("cuda")

prompt = "${ce(e)??Ye}"
image = load_image(
    "https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/diffusers/guitar-man.png"
)

output = pipe(image=image, prompt=prompt).frames[0]
export_to_video(output, "output.mp4")`],As=e=>[`from diffusers import ControlNetModel, StableDiffusionControlNetPipeline

controlnet = ControlNetModel.from_pretrained("${e.id}")
pipe = StableDiffusionControlNetPipeline.from_pretrained(
	"${he(e)}", controlnet=controlnet
)`],Is=e=>[`import torch
from diffusers import DiffusionPipeline

# switch to "mps" for apple devices
pipe = DiffusionPipeline.from_pretrained("${he(e)}", dtype=torch.bfloat16, device_map="cuda")
pipe.load_lora_weights("${e.id}")

prompt = "${ce(e)??Vt}"
image = pipe(prompt).images[0]`],Ts=e=>[`import torch
from diffusers import DiffusionPipeline
from diffusers.utils import load_image

# switch to "mps" for apple devices
pipe = DiffusionPipeline.from_pretrained("${he(e)}", dtype=torch.bfloat16, device_map="cuda")
pipe.load_lora_weights("${e.id}")

prompt = "${ce(e)??Ht}"
input_image = load_image("https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/diffusers/cat.png")

image = pipe(image=input_image, prompt=prompt).images[0]`],Ss=e=>[`import torch
from diffusers import DiffusionPipeline
from diffusers.utils import export_to_video

# switch to "mps" for apple devices
pipe = DiffusionPipeline.from_pretrained("${he(e)}", dtype=torch.bfloat16, device_map="cuda")
pipe.load_lora_weights("${e.id}")

prompt = "${ce(e)??Ye}"

output = pipe(prompt=prompt).frames[0]
export_to_video(output, "output.mp4")`],Ps=e=>[`import torch
from diffusers import DiffusionPipeline
from diffusers.utils import load_image, export_to_video

# switch to "mps" for apple devices
pipe = DiffusionPipeline.from_pretrained("${he(e)}", dtype=torch.bfloat16, device_map="cuda")
pipe.load_lora_weights("${e.id}")

prompt = "${ce(e)??Ye}"
input_image = load_image("https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/diffusers/guitar-man.png")

image = pipe(image=input_image, prompt=prompt).frames[0]
export_to_video(output, "output.mp4")`],Rs=e=>[`import torch
from diffusers import DiffusionPipeline

# switch to "mps" for apple devices
pipe = DiffusionPipeline.from_pretrained("${he(e)}", dtype=torch.bfloat16, device_map="cuda")
pipe.load_textual_inversion("${e.id}")`],Cs=e=>[`import torch
from diffusers import FluxFillPipeline
from diffusers.utils import load_image

image = load_image("https://huggingface.co/datasets/diffusers/diffusers-images-docs/resolve/main/cup.png")
mask = load_image("https://huggingface.co/datasets/diffusers/diffusers-images-docs/resolve/main/cup_mask.png")

# switch to "mps" for apple devices
pipe = FluxFillPipeline.from_pretrained("${e.id}", dtype=torch.bfloat16, device_map="cuda")
image = pipe(
    prompt="a white paper cup",
    image=image,
    mask_image=mask,
    height=1632,
    width=1232,
    guidance_scale=30,
    num_inference_steps=50,
    max_sequence_length=512,
    generator=torch.Generator("cpu").manual_seed(0)
).images[0]
image.save(f"flux-fill-dev.png")`],Es=e=>[`import torch
from diffusers import AutoPipelineForInpainting
from diffusers.utils import load_image

# switch to "mps" for apple devices
pipe = AutoPipelineForInpainting.from_pretrained("${e.id}", dtype=torch.float16, variant="fp16", device_map="cuda")

img_url = "https://raw.githubusercontent.com/CompVis/latent-diffusion/main/data/inpainting_examples/overture-creations-5sI6fQgYIuo.png"
mask_url = "https://raw.githubusercontent.com/CompVis/latent-diffusion/main/data/inpainting_examples/overture-creations-5sI6fQgYIuo_mask.png"

image = load_image(img_url).resize((1024, 1024))
mask_image = load_image(mask_url).resize((1024, 1024))

prompt = "a tiger sitting on a park bench"
generator = torch.Generator(device="cuda").manual_seed(0)

image = pipe(
  prompt=prompt,
  image=image,
  mask_image=mask_image,
  guidance_scale=8.0,
  num_inference_steps=20,  # steps between 15 and 30 work well for us
  strength=0.99,  # make sure to use \`strength\` below 1.0
  generator=generator,
).images[0]`],Kt=e=>{let t;return e.tags.includes("StableDiffusionInpaintPipeline")||e.tags.includes("StableDiffusionXLInpaintPipeline")?t=Es(e):e.tags.includes("controlnet")?t=As(e):e.tags.includes("lora")?e.pipeline_tag==="image-to-image"?t=Ts(e):e.pipeline_tag==="image-to-video"?t=Ps(e):e.pipeline_tag==="text-to-video"?t=Ss(e):t=Is(e):e.tags.includes("textual_inversion")?t=Rs(e):e.tags.includes("FluxFillPipeline")?t=Cs(e):e.pipeline_tag==="image-to-video"?t=ks(e):e.pipeline_tag==="image-to-image"?t=xs(e):t=_s(e),[vs,...t]},Us=e=>{const t=`# Pipeline for Stable Diffusion 3
from diffusionkit.mlx import DiffusionPipeline

pipeline = DiffusionPipeline(
	shift=3.0,
	use_t5=False,
	model_version=${e.id},
	low_memory_mode=True,
	a16=True,
	w16=True,
)`,n=`# Pipeline for Flux
from diffusionkit.mlx import FluxPipeline

pipeline = FluxPipeline(
  shift=1.0,
  model_version=${e.id},
  low_memory_mode=True,
  a16=True,
  w16=True,
)`,a=`# Image Generation
HEIGHT = 512
WIDTH = 512
NUM_STEPS = ${e.tags.includes("flux")?4:50}
CFG_WEIGHT = ${e.tags.includes("flux")?0:5}

image, _ = pipeline.generate_image(
  "a photo of a cat",
  cfg_weight=CFG_WEIGHT,
  num_steps=NUM_STEPS,
  latent_size=(HEIGHT // 8, WIDTH // 8),
)`;return[e.tags.includes("flux")?n:t,a]},$s=e=>[`# pip install --no-binary :all: cartesia-pytorch
from cartesia_pytorch import ReneLMHeadModel
from transformers import AutoTokenizer

model = ReneLMHeadModel.from_pretrained("${e.id}")
tokenizer = AutoTokenizer.from_pretrained("allenai/OLMo-1B-hf")

in_message = ["Rene Descartes was"]
inputs = tokenizer(in_message, return_tensors="pt")

outputs = model.generate(inputs.input_ids, max_length=50, top_k=100, top_p=0.99)
out_message = tokenizer.batch_decode(outputs, skip_special_tokens=True)[0]

print(out_message)
)`],Ds=e=>[`import mlx.core as mx
import cartesia_mlx as cmx

model = cmx.from_pretrained("${e.id}")
model.set_dtype(mx.float32)   

prompt = "Rene Descartes was"

for text in model.generate(
    prompt,
    max_tokens=500,
    eval_every_n=5,
    verbose=True,
    top_p=0.99,
    temperature=0.85,
):
    print(text, end="", flush=True)
`],Ls=e=>{const t=G(e.id).replaceAll("-","_");return[`# Load it from the Hub directly
import edsnlp
nlp = edsnlp.load("${e.id}")
`,`# Or install it as a package
!pip install git+https://huggingface.co/${e.id}

# and import it as a module
import ${t}

nlp = ${t}.load()  # or edsnlp.load("${t}")
`]},js=e=>[`from espnet2.bin.tts_inference import Text2Speech

model = Text2Speech.from_pretrained("${e.id}")

speech, *_ = model("text to generate speech from")`],Ms=e=>[`from espnet2.bin.asr_inference import Speech2Text

model = Speech2Text.from_pretrained(
  "${e.id}"
)

speech, rate = soundfile.read("speech.wav")
text, *_ = model(speech)[0]`],Ns=()=>["unknown model type (must be text-to-speech or automatic-speech-recognition)"],Os=e=>e.tags.includes("text-to-speech")?js(e):e.tags.includes("automatic-speech-recognition")?Ms(e):Ns(),qs=e=>[`from fairseq.checkpoint_utils import load_model_ensemble_and_task_from_hf_hub

models, cfg, task = load_model_ensemble_and_task_from_hf_hub(
    "${e.id}"
)`],Bs=e=>[`from flair.models import SequenceTagger

tagger = SequenceTagger.load("${e.id}")`],Fs=e=>[`from gliner import GLiNER

model = GLiNER.from_pretrained("${e.id}")`],Vs=e=>[`from gliner2 import GLiNER2

model = GLiNER2.from_pretrained("${e.id}")

# Extract entities
text = "Apple CEO Tim Cook announced iPhone 15 in Cupertino yesterday."
result = extractor.extract_entities(text, ["company", "person", "product", "location"])

print(result)`],Hs=e=>[`# Download model
from huggingface_hub import snapshot_download

snapshot_download(${e.id}, local_dir="checkpoints")

from indextts.infer import IndexTTS

# Ensure config.yaml is present in the checkpoints directory
tts = IndexTTS(model_dir="checkpoints", cfg_path="checkpoints/config.yaml")

voice = "path/to/your/reference_voice.wav"  # Path to the voice reference audio file
text = "Hello, how are you?"
output_path = "output_index.wav"

tts.infer(voice, text, output_path)`],Ks=e=>[`# CLI usage
# see docs: https://ai-riksarkivet.github.io/htrflow/latest/getting_started/quick_start.html
htrflow pipeline <path/to/pipeline.yaml> <path/to/image>`,`# Python usage
from htrflow.pipeline.pipeline import Pipeline
from htrflow.pipeline.steps import Task
from htrflow.models.framework.model import ModelClass

pipeline = Pipeline(
    [
        Task(
            ModelClass, {"model": "${e.id}"}, {}
        ),
    ])`],zs=e=>[`# Available backend options are: "jax", "torch", "tensorflow".
import os
os.environ["KERAS_BACKEND"] = "jax"
	
import keras

model = keras.saving.load_model("hf://${e.id}")
`],Ws=e=>`
import keras_hub

# Load CausalLM model (optional: use half precision for inference)
causal_lm = keras_hub.models.CausalLM.from_preset("hf://${e}", dtype="bfloat16")
causal_lm.compile(sampler="greedy")  # (optional) specify a sampler

# Generate text
causal_lm.generate("Keras: deep learning for", max_length=64)
`,Xs=e=>`
import keras_hub

# Load TextToImage model (optional: use half precision for inference)
text_to_image = keras_hub.models.TextToImage.from_preset("hf://${e}", dtype="bfloat16")

# Generate images with a TextToImage model.
text_to_image.generate("Astronaut in a jungle")
`,Qs=e=>`
import keras_hub

# Load TextClassifier model
text_classifier = keras_hub.models.TextClassifier.from_preset(
    "hf://${e}",
    num_classes=2,
)
# Fine-tune
text_classifier.fit(x=["Thilling adventure!", "Total snoozefest."], y=[1, 0])
# Classify text
text_classifier.predict(["Not my cup of tea."])
`,Js=e=>`
import keras_hub
import keras

# Load ImageClassifier model
image_classifier = keras_hub.models.ImageClassifier.from_preset(
    "hf://${e}",
    num_classes=2,
)
# Fine-tune
image_classifier.fit(
    x=keras.random.randint((32, 64, 64, 3), 0, 256),
    y=keras.random.randint((32, 1), 0, 2),
)
# Classify image
image_classifier.predict(keras.random.randint((1, 64, 64, 3), 0, 256))
`,_t={CausalLM:Ws,TextToImage:Xs,TextClassifier:Qs,ImageClassifier:Js},Ys=(e,t)=>`
import keras_hub

# Create a ${e} model
task = keras_hub.models.${e}.from_preset("hf://${t}")
`,Zs=e=>`
import keras_hub

# Create a Backbone model unspecialized for any task
backbone = keras_hub.models.Backbone.from_preset("hf://${e}")
`,Gs=e=>{const t=e.id,n=e.config?.keras_hub?.tasks??[],a=[];for(const[i,o]of Object.entries(_t))n.includes(i)&&a.push(o(t));for(const i of n)Object.keys(_t).includes(i)||a.push(Ys(i,t));return a.push(Zs(t)),a},el=e=>[`# !pip install kernels

from kernels import get_kernel

kernel = get_kernel("${e.id}")`],tl=e=>[`# Example usage for KimiAudio
# pip install git+https://github.com/MoonshotAI/Kimi-Audio.git

from kimia_infer.api.kimia import KimiAudio

model = KimiAudio(model_path="${e.id}", load_detokenizer=True)

sampling_params = {
    "audio_temperature": 0.8,
    "audio_top_k": 10,
    "text_temperature": 0.0,
    "text_top_k": 5,
}

# For ASR
asr_audio = "asr_example.wav"
messages_asr = [
    {"role": "user", "message_type": "text", "content": "Please transcribe the following audio:"},
    {"role": "user", "message_type": "audio", "content": asr_audio}
]
_, text = model.generate(messages_asr, **sampling_params, output_type="text")
print(text)

# For Q&A
qa_audio = "qa_example.wav"
messages_conv = [{"role": "user", "message_type": "audio", "content": qa_audio}]
wav, text = model.generate(messages_conv, **sampling_params, output_type="both")
sf.write("output_audio.wav", wav.cpu().view(-1).numpy(), 24000)
print(text)
`],nl=e=>[`from kittentts import KittenTTS
m = KittenTTS("${e.id}")

audio = m.generate("This high quality TTS model works without a GPU")

# Save the audio
import soundfile as sf
sf.write('output.wav', audio, 24000)`],al=e=>e.tags.includes("bi-encoder")?[`#install from https://github.com/webis-de/lightning-ir

from lightning_ir import BiEncoderModule
model = BiEncoderModule("${e.id}")

model.score("query", ["doc1", "doc2", "doc3"])`]:e.tags.includes("cross-encoder")?[`#install from https://github.com/webis-de/lightning-ir

from lightning_ir import CrossEncoderModule
model = CrossEncoderModule("${e.id}")

model.score("query", ["doc1", "doc2", "doc3"])`]:[`#install from https://github.com/webis-de/lightning-ir

from lightning_ir import BiEncoderModule, CrossEncoderModule

# depending on the model type, use either BiEncoderModule or CrossEncoderModule
model = BiEncoderModule("${e.id}") 
# model = CrossEncoderModule("${e.id}")

model.score("query", ["doc1", "doc2", "doc3"])`],il=e=>{const t=[`# !pip install llama-cpp-python

from llama_cpp import Llama

llm = Llama.from_pretrained(
	repo_id="${e.id}",
	filename="{{GGUF_FILE}}",
)
`];if(e.tags.includes("conversational")){const n=Jr(e);t.push(`llm.create_chat_completion(
	messages = ${Yr(n,{attributeKeyQuotes:!0,indent:"	"})}
)`)}else t.push(`output = llm(
	"Once upon a time,",
	max_tokens=512,
	echo=True
)
print(output)`);return t},ol=e=>{if(e.tags.includes("smolvla")){const t=[`# See https://github.com/huggingface/lerobot?tab=readme-ov-file#installation for more details
git clone https://github.com/huggingface/lerobot.git
cd lerobot
pip install -e .[smolvla]`,`# Launch finetuning on your dataset
python lerobot/scripts/train.py \\
--policy.path=${e.id} \\
--dataset.repo_id=lerobot/svla_so101_pickplace \\ 
--batch_size=64 \\
--steps=20000 \\
--output_dir=outputs/train/my_smolvla \\
--job_name=my_smolvla_training \\
--policy.device=cuda \\
--wandb.enable=true`];return e.id!=="lerobot/smolvla_base"&&t.push(`# Run the policy using the record function	
python -m lerobot.record \\
  --robot.type=so101_follower \\
  --robot.port=/dev/ttyACM0 \\ # <- Use your port
  --robot.id=my_blue_follower_arm \\ # <- Use your robot id
  --robot.cameras="{ front: {type: opencv, index_or_path: 8, width: 640, height: 480, fps: 30}}" \\ # <- Use your cameras
  --dataset.single_task="Grasp a lego block and put it in the bin." \\ # <- Use the same task description you used in your dataset recording
  --dataset.repo_id=HF_USER/dataset_name \\  # <- This will be the dataset name on HF Hub
  --dataset.episode_time_s=50 \\
  --dataset.num_episodes=10 \\
  --policy.path=${e.id}`),t}return[]},rl=e=>[`# Note: 'keras<3.x' or 'tf_keras' must be installed (legacy)
# See https://github.com/keras-team/tf-keras for more details.
from huggingface_hub import from_pretrained_keras

model = from_pretrained_keras("${e.id}")
`],sl=e=>[`from mamba_ssm import MambaLMHeadModel

model = MambaLMHeadModel.from_pretrained("${e.id}")`],ll=e=>[`# Install from https://github.com/Camb-ai/MARS5-TTS

from inference import Mars5TTS
mars5 = Mars5TTS.from_pretrained("${e.id}")`],cl=e=>[`# Install from https://github.com/pq-yang/MatAnyone.git

from matanyone.model.matanyone import MatAnyone
model = MatAnyone.from_pretrained("${e.id}")`,`
from matanyone import InferenceCore
processor = InferenceCore("${e.id}")`],pl=()=>[`# Install from https://github.com/buaacyw/MeshAnything.git

from MeshAnything.models.meshanything import MeshAnything

# refer to https://github.com/buaacyw/MeshAnything/blob/main/main.py#L91 on how to define args
# and https://github.com/buaacyw/MeshAnything/blob/main/app.py regarding usage
model = MeshAnything(args)`],dl=e=>[`import open_clip

model, preprocess_train, preprocess_val = open_clip.create_model_and_transforms('hf-hub:${e.id}')
tokenizer = open_clip.get_tokenizer('hf-hub:${e.id}')`],ul=e=>{if(e.config?.architectures?.[0]){const t=e.config.architectures[0];return[[`from paddlenlp.transformers import AutoTokenizer, ${t}`,"",`tokenizer = AutoTokenizer.from_pretrained("${e.id}", from_hf_hub=True)`,`model = ${t}.from_pretrained("${e.id}", from_hf_hub=True)`].join(`
`)]}else return[["# ⚠️ Type of model unknown","from paddlenlp.transformers import AutoTokenizer, AutoModel","",`tokenizer = AutoTokenizer.from_pretrained("${e.id}", from_hf_hub=True)`,`model = AutoModel.from_pretrained("${e.id}", from_hf_hub=True)`].join(`
`)]},ml=e=>{const t={textline_detection:{className:"TextDetection"},textline_recognition:{className:"TextRecognition"},seal_text_detection:{className:"SealTextDetection"},doc_img_unwarping:{className:"TextImageUnwarping"},doc_img_orientation_classification:{className:"DocImgOrientationClassification"},textline_orientation_classification:{className:"TextLineOrientationClassification"},chart_parsing:{className:"ChartParsing"},formula_recognition:{className:"FormulaRecognition"},layout_detection:{className:"LayoutDetection"},table_cells_detection:{className:"TableCellsDetection"},wired_table_classification:{className:"TableClassification"},table_structure_recognition:{className:"TableStructureRecognition"}};if(e.tags.includes("doc_vlm"))return[`# 1. See https://www.paddlepaddle.org.cn/en/install to install paddlepaddle
# 2. pip install paddleocr

from paddleocr import DocVLM
model = DocVLM(model_name="${G(e.id)}")
output = model.predict(
    input={"image": "path/to/image.png", "query": "Parsing this image and output the content in Markdown format."},
    batch_size=1
)
for res in output:
    res.print()
    res.save_to_json(save_path="./output/res.json")`];if(e.tags.includes("document-parse"))return[`# See https://www.paddleocr.ai/latest/version3.x/pipeline_usage/PaddleOCR-VL.html to installation

from paddleocr import PaddleOCRVL
pipeline = PaddleOCRVL()
output = pipeline.predict("path/to/document_image.png")
for res in output:
	res.print()
	res.save_to_json(save_path="output")
	res.save_to_markdown(save_path="output")`];for(const n of e.tags)if(n in t){const{className:a}=t[n];return[`# 1. See https://www.paddlepaddle.org.cn/en/install to install paddlepaddle
# 2. pip install paddleocr

from paddleocr import ${a}
model = ${a}(model_name="${G(e.id)}")
output = model.predict(input="path/to/image.png", batch_size=1)
for res in output:
    res.print()
    res.save_to_img(save_path="./output/")
    res.save_to_json(save_path="./output/res.json")`]}return[`# Please refer to the document for information on how to use the model. 
# https://paddlepaddle.github.io/PaddleOCR/latest/en/version3.x/module_usage/module_overview.html`]},fl=e=>{const t=`# Use PE-Core models as CLIP models
import core.vision_encoder.pe as pe

model = pe.CLIP.from_config("${e.id}", pretrained=True)`,n=`# Use any PE model as a vision encoder
import core.vision_encoder.pe as pe

model = pe.VisionTransformer.from_config("${e.id}", pretrained=True)`;return e.id.includes("Core")?[t,n]:[n]},gl=e=>[`from huggingface_hub import snapshot_download
from phantom_wan import WANI2V, configs

checkpoint_dir = snapshot_download("${e.id}")
wan_i2v = WanI2V(
            config=configs.WAN_CONFIGS['i2v-14B'],
            checkpoint_dir=checkpoint_dir,
        )
 video = wan_i2v.generate(text_prompt, image_prompt)`],hl=e=>[`from pocket_tts import TTSModel
import scipy.io.wavfile

tts_model = TTSModel.load_model("${e.id}")
voice_state = tts_model.get_state_for_audio_prompt(
    "hf://kyutai/tts-voices/alba-mackenna/casual.wav"
)
audio = tts_model.generate_audio(voice_state, "Hello world, this is a test.")
# Audio is a 1D torch tensor containing PCM data.
scipy.io.wavfile.write("output.wav", tts_model.sample_rate, audio.numpy())`],bl=e=>[`from pyannote.audio import Pipeline
  
pipeline = Pipeline.from_pretrained("${e.id}")

# inference on the whole file
pipeline("file.wav")

# inference on an excerpt
from pyannote.core import Segment
excerpt = Segment(start=2.0, end=5.0)

from pyannote.audio import Audio
waveform, sample_rate = Audio().crop("file.wav", excerpt)
pipeline({"waveform": waveform, "sample_rate": sample_rate})`],yl=e=>[`from pyannote.audio import Model, Inference

model = Model.from_pretrained("${e.id}")
inference = Inference(model)

# inference on the whole file
inference("file.wav")

# inference on an excerpt
from pyannote.core import Segment
excerpt = Segment(start=2.0, end=5.0)
inference.crop("file.wav", excerpt)`],wl=e=>e.tags.includes("pyannote-audio-pipeline")?bl(e):yl(e),vl=e=>[`from relik import Relik
 
relik = Relik.from_pretrained("${e.id}")`],_l=e=>[`# Install from https://github.com/microsoft/renderformer

from renderformer import RenderFormerRenderingPipeline
pipeline = RenderFormerRenderingPipeline.from_pretrained("${e.id}")`],xl=e=>[`from tensorflow_tts.inference import AutoProcessor, TFAutoModel

processor = AutoProcessor.from_pretrained("${e.id}")
model = TFAutoModel.from_pretrained("${e.id}")
`],kl=e=>[`from tensorflow_tts.inference import TFAutoModel

model = TFAutoModel.from_pretrained("${e.id}")
audios = model.inference(mels)
`],Al=e=>[`from tensorflow_tts.inference import TFAutoModel

model = TFAutoModel.from_pretrained("${e.id}")
`],Il=e=>e.tags.includes("text-to-mel")?xl(e):e.tags.includes("mel-to-wav")?kl(e):Al(e),Tl=e=>[`import timm

model = timm.create_model("hf_hub:${e.id}", pretrained=True)`],Sl=()=>[`# pip install sae-lens
from sae_lens import SAE

sae, cfg_dict, sparsity = SAE.from_pretrained(
    release = "RELEASE_ID", # e.g., "gpt2-small-res-jb". See other options in https://github.com/jbloomAus/SAELens/blob/main/sae_lens/pretrained_saes.yaml
    sae_id = "SAE_ID", # e.g., "blocks.8.hook_resid_pre". Won't always be a hook point
)`],Pl=()=>[`# seed_story_cfg_path refers to 'https://github.com/TencentARC/SEED-Story/blob/master/configs/clm_models/agent_7b_sft.yaml'
# llm_cfg_path refers to 'https://github.com/TencentARC/SEED-Story/blob/master/configs/clm_models/llama2chat7b_lora.yaml'
from omegaconf import OmegaConf
import hydra

# load Llama2
llm_cfg = OmegaConf.load(llm_cfg_path)
llm = hydra.utils.instantiate(llm_cfg, torch_dtype="fp16")

# initialize seed_story
seed_story_cfg = OmegaConf.load(seed_story_cfg_path)
seed_story = hydra.utils.instantiate(seed_story_cfg, llm=llm) `],Rl=(e,t)=>[`import joblib
from skops.hub_utils import download
download("${e.id}", "path_to_folder")
model = joblib.load(
	"${t}"
)
# only load pickle files from sources you trust
# read more about it here https://skops.readthedocs.io/en/stable/persistence.html`],Cl=(e,t)=>[`from skops.hub_utils import download
from skops.io import load
download("${e.id}", "path_to_folder")
# make sure model file is in skops format
# if model is a pickle file, make sure it's from a source you trust
model = load("path_to_folder/${t}")`],El=e=>[`from huggingface_hub import hf_hub_download
import joblib
model = joblib.load(
	hf_hub_download("${e.id}", "sklearn_model.joblib")
)
# only load pickle files from sources you trust
# read more about it here https://skops.readthedocs.io/en/stable/persistence.html`],Ul=e=>{if(e.tags.includes("skops")){const t=e.config?.sklearn?.model?.file,n=e.config?.sklearn?.model_format;return t?n==="pickle"?Rl(e,t):Cl(e,t):["# ⚠️ Model filename not specified in config.json"]}else return El(e)},$l=e=>[`import torch
import torchaudio
from einops import rearrange
from stable_audio_tools import get_pretrained_model
from stable_audio_tools.inference.generation import generate_diffusion_cond

device = "cuda" if torch.cuda.is_available() else "cpu"

# Download model
model, model_config = get_pretrained_model("${e.id}")
sample_rate = model_config["sample_rate"]
sample_size = model_config["sample_size"]

model = model.to(device)

# Set up text and timing conditioning
conditioning = [{
	"prompt": "128 BPM tech house drum loop",
}]

# Generate stereo audio
output = generate_diffusion_cond(
	model,
	conditioning=conditioning,
	sample_size=sample_size,
	device=device
)

# Rearrange audio batch to a single sequence
output = rearrange(output, "b d n -> d (b n)")

# Peak normalize, clip, convert to int16, and save to file
output = output.to(torch.float32).div(torch.max(torch.abs(output))).clamp(-1, 1).mul(32767).to(torch.int16).cpu()
torchaudio.save("output.wav", output, sample_rate)`],Dl=e=>[`from huggingface_hub import from_pretrained_fastai

learn = from_pretrained_fastai("${e.id}")`],Ll=e=>{const t=`# Use SAM2 with images
import torch
from sam2.sam2_image_predictor import SAM2ImagePredictor

predictor = SAM2ImagePredictor.from_pretrained(${e.id})

with torch.inference_mode(), torch.autocast("cuda", dtype=torch.bfloat16):
    predictor.set_image(<your_image>)
    masks, _, _ = predictor.predict(<input_prompts>)`,n=`# Use SAM2 with videos
import torch
from sam2.sam2_video_predictor import SAM2VideoPredictor
	
predictor = SAM2VideoPredictor.from_pretrained(${e.id})

with torch.inference_mode(), torch.autocast("cuda", dtype=torch.bfloat16):
    state = predictor.init_state(<your_video>)

    # add new prompts and instantly get the output on the same frame
    frame_idx, object_ids, masks = predictor.add_new_points(state, <your_prompts>):

    # propagate the prompts to get masklets throughout the video
    for frame_idx, object_ids, masks in predictor.propagate_in_video(state):
        ...`;return[t,n]},jl=e=>[`from inference import Inference, load_image, load_single_mask
from huggingface_hub import hf_hub_download

path = hf_hub_download("${e.id}", "pipeline.yaml")
inference = Inference(path, compile=False)

image = load_image("path_to_image.png")
mask = load_single_mask("path_to_mask.png", index=14)

output = inference(image, mask)`],Ml=e=>[`from notebook.utils import setup_sam_3d_body

estimator = setup_sam_3d_body(${e.id})
outputs = estimator.process_one_image(image)
rend_img = visualize_sample_together(image, outputs, estimator.faces)`],Nl=e=>[`python -m sample_factory.huggingface.load_from_hub -r ${e.id} -d ./train_dir`];function Ol(e){const t=e.widgetData?.[0];if(t?.source_sentence&&t?.sentences?.length)return[t.source_sentence,...t.sentences]}const ql=e=>{const t=e.tags.includes(Ft)?", trust_remote_code=True":"";if(e.tags.includes("PyLate"))return[`from pylate import models

queries = [
    "Which planet is known as the Red Planet?",
    "What is the largest planet in our solar system?",
]

documents = [
    ["Mars is the Red Planet.", "Venus is Earth's twin."],
    ["Jupiter is the largest planet.", "Saturn has rings."],
]

model = models.ColBERT(model_name_or_path="${e.id}")

queries_emb = model.encode(queries, is_query=True)
docs_emb = model.encode(documents, is_query=False)`];if(e.tags.includes("cross-encoder")||e.pipeline_tag=="text-ranking")return[`from sentence_transformers import CrossEncoder

model = CrossEncoder("${e.id}"${t})

query = "Which planet is known as the Red Planet?"
passages = [
	"Venus is often called Earth's twin because of its similar size and proximity.",
	"Mars, known for its reddish appearance, is often referred to as the Red Planet.",
	"Jupiter, the largest planet in our solar system, has a prominent red spot.",
	"Saturn, famous for its rings, is sometimes mistaken for the Red Planet."
]

scores = model.predict([(query, passage) for passage in passages])
print(scores)`];const n=Ol(e)??["The weather is lovely today.","It's so sunny outside!","He drove to the stadium."];return[`from sentence_transformers import SentenceTransformer

model = SentenceTransformer("${e.id}"${t})

sentences = ${JSON.stringify(n,null,4)}
embeddings = model.encode(sentences)

similarities = model.similarity(embeddings, embeddings)
print(similarities.shape)
# [${n.length}, ${n.length}]`]},Bl=e=>[`from setfit import SetFitModel

model = SetFitModel.from_pretrained("${e.id}")`],Fl=e=>[`!pip install https://huggingface.co/${e.id}/resolve/main/${G(e.id)}-any-py3-none-any.whl

# Using spacy.load().
import spacy
nlp = spacy.load("${G(e.id)}")

# Importing as module.
import ${G(e.id)}
nlp = ${G(e.id)}.load()`],Vl=e=>[`from span_marker import SpanMarkerModel

model = SpanMarkerModel.from_pretrained("${e.id}")`],Hl=e=>[`import stanza

stanza.download("${G(e.id).replace("stanza-","")}")
nlp = stanza.Pipeline("${G(e.id).replace("stanza-","")}")`],Kl=e=>{switch(e){case"EncoderClassifier":return"classify_file";case"EncoderDecoderASR":case"EncoderASR":return"transcribe_file";case"SpectralMaskEnhancement":return"enhance_file";case"SepformerSeparation":return"separate_file";default:return}},zl=e=>{const t=e.config?.speechbrain?.speechbrain_interface;if(t===void 0)return["# interface not specified in config.json"];const n=Kl(t);return n===void 0?["# interface in config.json invalid"]:[`from speechbrain.pretrained import ${t}
model = ${t}.from_hparams(
  "${e.id}"
)
model.${n}("file.wav")`]},Wl=e=>[`from terratorch.registry import BACKBONE_REGISTRY

model = BACKBONE_REGISTRY.build("${e.id}")`],Xl=e=>e.config?.tokenizer_config?.chat_template!==void 0||e.config?.processor_config?.chat_template!==void 0||e.config?.chat_template_jinja!==void 0,zt=e=>{const t=e.transformersInfo;if(!t)return["# ⚠️ Type of model unknown"];const n=e.tags.includes(Ft)?", trust_remote_code=True":"",a=[];if(t.processor){const i=t.processor==="AutoTokenizer"?"tokenizer":t.processor==="AutoFeatureExtractor"?"extractor":"processor";a.push("# Load model directly",`from transformers import ${t.processor}, ${t.auto_model}`,"",`${i} = ${t.processor}.from_pretrained("${e.id}"`+n+")",`model = ${t.auto_model}.from_pretrained("${e.id}"`+n+")"),e.tags.includes("conversational")&&Xl(e)&&(e.tags.includes("image-text-to-text")?a.push("messages = [",["    {",'        "role": "user",','        "content": [','            {"type": "image", "url": "https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/p-blog/candy.JPG"},','            {"type": "text", "text": "What animal is on the candy?"}',"        ]","    },"].join(`
`),"]"):a.push("messages = [",'    {"role": "user", "content": "Who are you?"},',"]"),a.push(`inputs = ${i}.apply_chat_template(`,"	messages,","	add_generation_prompt=True,","	tokenize=True,","	return_dict=True,",'	return_tensors="pt",',").to(model.device)","","outputs = model.generate(**inputs, max_new_tokens=40)",`print(${i}.decode(outputs[0][inputs["input_ids"].shape[-1]:]))`))}else a.push("# Load model directly",`from transformers import ${t.auto_model}`,`model = ${t.auto_model}.from_pretrained("${e.id}"`+n+', dtype="auto")');if(e.pipeline_tag&&Ao.transformers?.includes(e.pipeline_tag)){const i=["# Use a pipeline as a high-level helper"];return Io.includes(e.pipeline_tag)&&i.push(`# Warning: Pipeline type "${e.pipeline_tag}" is no longer supported in transformers v5.`,"# You must load the model directly (see below) or downgrade to v4.x with:",`# 'pip install "transformers<5.0.0'`),i.push("from transformers import pipeline","",`pipe = pipeline("${e.pipeline_tag}", model="${e.id}"`+n+")"),e.tags.includes("conversational")?e.tags.includes("image-text-to-text")?(i.push("messages = [",["    {",'        "role": "user",','        "content": [','            {"type": "image", "url": "https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/p-blog/candy.JPG"},','            {"type": "text", "text": "What animal is on the candy?"}',"        ]","    },"].join(`
`),"]"),i.push("pipe(text=messages)")):(i.push("messages = [",'    {"role": "user", "content": "Who are you?"},',"]"),i.push("pipe(messages)")):e.pipeline_tag==="zero-shot-image-classification"?i.push("pipe(",'    "https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/hub/parrots.png",','    candidate_labels=["animals", "humans", "landscape"],',")"):e.pipeline_tag==="image-classification"&&i.push('pipe("https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/hub/parrots.png")'),[i.join(`
`),a.join(`
`)]}return[a.join(`
`)]},Ql=e=>{if(!e.pipeline_tag)return["// ⚠️ Unknown pipeline tag"];const t="@huggingface/transformers";return[`// npm i ${t}
import { pipeline } from '${t}';

// Allocate pipeline
const pipe = await pipeline('${e.pipeline_tag}', '${e.id}');`]},Jl=e=>{switch(e){case"CAUSAL_LM":return"CausalLM";case"SEQ_2_SEQ_LM":return"Seq2SeqLM";case"TOKEN_CLS":return"TokenClassification";case"SEQ_CLS":return"SequenceClassification";default:return}},Yl=e=>{const{base_model_name_or_path:t,task_type:n}=e.config?.peft??{},a=Jl(n);return a?t?[`from peft import PeftModel
from transformers import AutoModelFor${a}

base_model = AutoModelFor${a}.from_pretrained("${t}")
model = PeftModel.from_pretrained(base_model, "${e.id}")`]:["Base model is not found."]:["Task type is invalid."]},Zl=e=>[`from huggingface_hub import hf_hub_download
import fasttext

model = fasttext.load_model(hf_hub_download("${e.id}", "model.bin"))`],Gl=e=>[`from huggingface_sb3 import load_from_hub
checkpoint = load_from_hub(
	repo_id="${e.id}",
	filename="{MODEL FILENAME}.zip",
)`],ec=(e,t)=>{if(e==="ASR")return[`import nemo.collections.asr as nemo_asr
asr_model = nemo_asr.models.ASRModel.from_pretrained("${t.id}")

transcriptions = asr_model.transcribe(["file.wav"])`]},tc=e=>[`mlagents-load-from-hf --repo-id="${e.id}" --local-dir="./download: string[]s"`],nc=()=>[`string modelName = "[Your model name here].sentis";
Model model = ModelLoader.Load(Application.streamingAssetsPath + "/" + modelName);
IWorker engine = WorkerFactory.CreateWorker(BackendType.GPUCompute, model);
// Please see provided C# file for more details
`],ac=e=>[`
# Load the model and infer image from text
import torch
from app.sana_pipeline import SanaPipeline
from torchvision.utils import save_image

sana = SanaPipeline("configs/sana_config/1024ms/Sana_1600M_img1024.yaml")
sana.from_pretrained("hf://${e.id}")

image = sana(
    prompt='a cyberpunk cat with a neon sign that says "Sana"',
    height=1024,
    width=1024,
    guidance_scale=5.0,
    pag_guidance_scale=2.0,
    num_inference_steps=18,
) `],ic=e=>[`import torch, soundfile as sf, librosa, numpy as np
from vibevoice.processor.vibevoice_processor import VibeVoiceProcessor
from vibevoice.modular.modeling_vibevoice_inference import VibeVoiceForConditionalGenerationInference

# Load voice sample (should be 24kHz mono)
voice, sr = sf.read("path/to/voice_sample.wav")
if voice.ndim > 1: voice = voice.mean(axis=1)
if sr != 24000: voice = librosa.resample(voice, sr, 24000)

processor = VibeVoiceProcessor.from_pretrained("${e.id}")
model = VibeVoiceForConditionalGenerationInference.from_pretrained(
    "${e.id}", torch_dtype=torch.bfloat16
).to("cuda").eval()
model.set_ddpm_inference_steps(5)

inputs = processor(text=["Speaker 0: Hello!\\nSpeaker 1: Hi there!"],
                   voice_samples=[[voice]], return_tensors="pt")
audio = model.generate(**inputs, cfg_scale=1.3,
                       tokenizer=processor.tokenizer).speech_outputs[0]
sf.write("output.wav", audio.cpu().numpy().squeeze(), 24000)`],oc=e=>[`# Install from https://github.com/google-deepmind/videoprism
import jax
from videoprism import models as vp

flax_model = vp.get_model("${e.id}")
loaded_state = vp.load_pretrained_weights("${e.id}")

@jax.jit
def forward_fn(inputs, train=False):
  return flax_model.apply(loaded_state, inputs, train=train)`],rc=e=>[`from Trainer_finetune import Model

model = Model.from_pretrained("${e.id}")`],sc=e=>[`from huggingface_hub import hf_hub_download
	 from inference_onnx import LVFaceONNXInferencer

model_path = hf_hub_download("${e.id}", "LVFace-L_Glint360K/LVFace-L_Glint360K.onnx")
inferencer = LVFaceONNXInferencer(model_path, use_gpu=True, timeout=300)
img_path = 'path/to/image1.jpg'
embedding = inferencer.infer_from_image(img_path)`],lc=e=>[`from voicecraft import VoiceCraft

model = VoiceCraft.from_pretrained("${e.id}")`],cc=e=>[`import soundfile as sf
from voxcpm import VoxCPM

model = VoxCPM.from_pretrained("${e.id}")

wav = model.generate(
    text="VoxCPM is an innovative end-to-end TTS model from ModelBest, designed to generate highly expressive speech.",
    prompt_wav_path=None,      # optional: path to a prompt speech for voice cloning
    prompt_text=None,          # optional: reference text
    cfg_value=2.0,             # LM guidance on LocDiT, higher for better adherence to the prompt, but maybe worse
    inference_timesteps=10,   # LocDiT inference timesteps, higher for better result, lower for fast speed
    normalize=True,           # enable external TN tool
    denoise=True,             # enable external Denoise tool
    retry_badcase=True,        # enable retrying mode for some bad cases (unstoppable)
    retry_badcase_max_times=3,  # maximum retrying times
    retry_badcase_ratio_threshold=6.0, # maximum length restriction for bad case detection (simple but effective), it could be adjusted for slow pace speech
)

sf.write("output.wav", wav, 16000)
print("saved: output.wav")`],pc=()=>[`# !pip install git+https://github.com/fluxions-ai/vui

import torchaudio

from vui.inference import render
from vui.model import Vui,

model = Vui.from_pretrained().cuda()
waveform = render(
    model,
    "Hey, here is some random stuff, usually something quite long as the shorter the text the less likely the model can cope!",
)
print(waveform.shape)
torchaudio.save("out.opus", waveform[0], 22050)
`],dc=()=>[`import ChatTTS
import torchaudio

chat = ChatTTS.Chat()
chat.load_models(compile=False) # Set to True for better performance

texts = ["PUT YOUR TEXT HERE",]

wavs = chat.infer(texts, )

torchaudio.save("output1.wav", torch.from_numpy(wavs[0]), 24000)`],xt=e=>{const t=e.tags.find(i=>i.match(/^yolov\d+$/)),n=t?`YOLOv${t.slice(4)}`:"YOLOvXX";return[(t?"":`# Couldn't find a valid YOLO version tag.
# Replace XX with the correct version.
`)+`from ultralytics import ${n}

model = ${n}.from_pretrained("${e.id}")
source = 'http://images.cocodataset.org/val2017/000000039769.jpg'
model.predict(source=source, save=True)`]},uc=e=>[`# Option 1: use with transformers

from transformers import AutoModelForImageSegmentation
birefnet = AutoModelForImageSegmentation.from_pretrained("${e.id}", trust_remote_code=True)
`,`# Option 2: use with BiRefNet

# Install from https://github.com/ZhengPeng7/BiRefNet

from models.birefnet import BiRefNet
model = BiRefNet.from_pretrained("${e.id}")`],mc=()=>[`from supertonic import TTS

tts = TTS(auto_download=True)

style = tts.get_voice_style(voice_name="M1")

text = "The train delay was announced at 4:45 PM on Wed, Apr 3, 2024 due to track maintenance."
wav, duration = tts.synthesize(text, voice_style=style)

tts.save_audio(wav, "output.wav")`],fc=e=>[`from swarmformer import SwarmFormerModel

model = SwarmFormerModel.from_pretrained("${e.id}")
`],gc=e=>[`# Follow installation instructions at https://github.com/PKU-YuanGroup/UniWorld-V1

from univa.models.qwen2p5vl.modeling_univa_qwen2p5vl import UnivaQwen2p5VLForConditionalGeneration
	model = UnivaQwen2p5VLForConditionalGeneration.from_pretrained(
        "${e.id}",
        torch_dtype=torch.bfloat16,
        attn_implementation="flash_attention_2",
    ).to("cuda")
	processor = AutoProcessor.from_pretrained("${e.id}")
`],hc=e=>[`# Download the model from the Hub
pip install huggingface_hub[hf_xet]

huggingface-cli download --local-dir ${G(e.id)} ${e.id}`],bc=e=>[`# Make sure mlx-lm is installed
# pip install --upgrade mlx-lm
# if on a CUDA device, also pip install mlx[cuda]

# Generate text with mlx-lm
from mlx_lm import load, generate

model, tokenizer = load("${e.id}")

prompt = "Once upon a time in"
text = generate(model, tokenizer, prompt=prompt, verbose=True)`],yc=e=>[`# Make sure mlx-lm is installed
# pip install --upgrade mlx-lm

# Generate text with mlx-lm
from mlx_lm import load, generate

model, tokenizer = load("${e.id}")

prompt = "Write a story about Einstein"
messages = [{"role": "user", "content": prompt}]
prompt = tokenizer.apply_chat_template(
    messages, add_generation_prompt=True
)

text = generate(model, tokenizer, prompt=prompt, verbose=True)`],wc=e=>[`# Make sure mlx-vlm is installed
# pip install --upgrade mlx-vlm

from mlx_vlm import load, generate
from mlx_vlm.prompt_utils import apply_chat_template
from mlx_vlm.utils import load_config

# Load the model
model, processor = load("${e.id}")
config = load_config("${e.id}")

# Prepare input
image = ["http://images.cocodataset.org/val2017/000000039769.jpg"]
prompt = "Describe this image."

# Apply chat template
formatted_prompt = apply_chat_template(
    processor, config, prompt, num_images=1
)

# Generate output
output = generate(model, processor, formatted_prompt, image)
print(output)`],vc=e=>[`from mlxim.model import create_model

model = create_model(${e.id})`],_c=e=>e.pipeline_tag==="image-text-to-text"?wc(e):e.pipeline_tag==="text-generation"?e.tags.includes("conversational")?yc(e):bc(e):hc(e),xc=e=>[`from model2vec import StaticModel

model = StaticModel.from_pretrained("${e.id}")`],kc=e=>{let t;e.tags.includes("diffusers")?t=Ac(e):e.tags.includes("transformers")?t=Ic(e):t=Tc(e);const n=a=>/^from pruna import PrunaModel/m.test(a)?a:`from pruna import PrunaModel
${a}`;return t=t.map(n),e.tags.includes("pruna_pro-ai")?t.map(a=>a.replace(/\bpruna\b/g,"pruna_pro").replace(/\bPrunaModel\b/g,"PrunaProModel")):t},Ac=e=>Kt(e).map(n=>n.replace(/\b\w*Pipeline\w*\b/g,"PrunaModel").replace(/from diffusers import ([^,\n]*PrunaModel[^,\n]*)/g,"").replace(/from diffusers import ([^,\n]+),?\s*([^,\n]*PrunaModel[^,\n]*)/g,"from diffusers import $1").replace(/from diffusers import\s*(\n|$)/g,"").replace(/from diffusers import PrunaModel/g,"from pruna import PrunaModel").replace(/from diffusers import ([^,\n]+), PrunaModel/g,"from diffusers import $1").replace(/from diffusers import PrunaModel, ([^,\n]+)/g,"from diffusers import $1").replace(/\n\n+/g,`
`).trim()),Ic=e=>{const t=e.transformersInfo;let a=zt(e).map(i=>i.replace(/from transformers import pipeline/g,"from pruna import PrunaModel").replace(/pipeline\([^)]*\)/g,`PrunaModel.from_pretrained("${e.id}")`));return t?.auto_model&&(a=a.map(i=>i.replace(new RegExp(`from transformers import ${t.auto_model}
?`,"g"),"").replace(new RegExp(`${t.auto_model}.from_pretrained`,"g"),"PrunaModel.from_pretrained").replace(new RegExp(`^.*from.*import.*(, *${t.auto_model})+.*$`,"gm"),o=>o.replace(new RegExp(`, *${t.auto_model}`,"g"),"")))),a},Tc=e=>[`from pruna import PrunaModel
model = PrunaModel.from_pretrained("${e.id}")
`],Sc=e=>{let t;return e.tags.includes("automatic-speech-recognition")&&(t=ec("ASR",e)),t??["# tag did not correspond to a valid NeMo domain."]},Pc=e=>{const t=e.tags??[];return t.includes("gguf")||t.includes("onnx")?[]:[`
  import outetts
  
  enum = outetts.Models("${e.id}".split("/", 1)[1])       # VERSION_1_0_SIZE_1B
  cfg  = outetts.ModelConfig.auto_config(enum, outetts.Backend.HF)
  tts  = outetts.Interface(cfg)
  
  speaker = tts.load_default_speaker("EN-FEMALE-1-NEUTRAL")
  tts.generate(
	  outetts.GenerationConfig(
		  text="Hello there, how are you doing?",
		  speaker=speaker,
	  )
  ).save("output.wav")
  `]},Rc=e=>[`from pxia import AutoModel

model = AutoModel.from_pretrained("${e.id}")`],Cc=e=>[`from pythae.models import AutoModel

model = AutoModel.load_from_hf_hub("${e.id}")`],Ec=e=>[`from audiocraft.models import MusicGen

model = MusicGen.get_pretrained("${e.id}")

descriptions = ['happy rock', 'energetic EDM', 'sad jazz']
wav = model.generate(descriptions)  # generates 3 samples.`],Uc=e=>[`from audiocraft.models import MAGNeT
	
model = MAGNeT.get_pretrained("${e.id}")

descriptions = ['disco beat', 'energetic EDM', 'funky groove']
wav = model.generate(descriptions)  # generates 3 samples.`],$c=e=>[`from audiocraft.models import AudioGen
	
model = AudioGen.get_pretrained("${e.id}")
model.set_generation_params(duration=5)  # generate 5 seconds.
descriptions = ['dog barking', 'sirene of an emergency vehicle', 'footsteps in a corridor']
wav = model.generate(descriptions)  # generates 3 samples.`],Dc=e=>[`from anemoi.inference.runners.default import DefaultRunner
from anemoi.inference.config.run import RunConfiguration
# Create Configuration
config = RunConfiguration(checkpoint = {"huggingface":"${e.id}"})
# Load Runner
runner = DefaultRunner(config)`],Lc=e=>e.tags.includes("musicgen")?Ec(e):e.tags.includes("audiogen")?$c(e):e.tags.includes("magnet")?Uc(e):["# Type of model unknown."],jc=()=>[`# Install CLI with Homebrew on macOS device
brew install whisperkit-cli

# View all available inference options
whisperkit-cli transcribe --help
	
# Download and run inference using whisper base model
whisperkit-cli transcribe --audio-path /path/to/audio.mp3

# Or use your preferred model variant
whisperkit-cli transcribe --model "large-v3" --model-prefix "distil" --audio-path /path/to/audio.mp3 --verbose`],Mc=e=>[`from threedtopia_xl.models import threedtopia_xl

model = threedtopia_xl.from_pretrained("${e.id}")
model.generate(cond="path/to/image.png")`],Nc=e=>[`# pip install git+https://github.com/Zyphra/Zonos.git
import torchaudio
from zonos.model import Zonos
from zonos.conditioning import make_cond_dict

model = Zonos.from_pretrained("${e.id}", device="cuda")

wav, sr = torchaudio.load("speaker.wav")           # 5-10s reference clip
speaker = model.make_speaker_embedding(wav, sr)

cond  = make_cond_dict(text="Hello, world!", speaker=speaker, language="en-us")
codes = model.generate(model.prepare_conditioning(cond))

audio = model.autoencoder.decode(codes)[0].cpu()
torchaudio.save("sample.wav", audio, model.autoencoder.sampling_rate)
`],Oc={acestep:{prettyLabel:"ACE-Step",repoName:"ACE-Step",repoUrl:"https://github.com/ace-step/ACE-Step",filter:!1,countDownloads:'path:"ace_step_transformer/config.json"'},"adapter-transformers":{prettyLabel:"Adapters",repoName:"adapters",repoUrl:"https://github.com/Adapter-Hub/adapters",docsUrl:"https://huggingface.co/docs/hub/adapters",snippets:Gr,filter:!0,countDownloads:'path:"adapter_config.json"'},allennlp:{prettyLabel:"AllenNLP",repoName:"AllenNLP",repoUrl:"https://github.com/allenai/allennlp",docsUrl:"https://huggingface.co/docs/hub/allennlp",snippets:ns,filter:!0},anemoi:{prettyLabel:"AnemoI",repoName:"AnemoI",repoUrl:"https://github.com/ecmwf/anemoi-inference",docsUrl:"https://anemoi.readthedocs.io/en/latest/",filter:!1,countDownloads:'path_extension:"ckpt"',snippets:Dc},araclip:{prettyLabel:"AraClip",repoName:"AraClip",repoUrl:"https://huggingface.co/Arabic-Clip/araclip",filter:!1,snippets:as},"aviation-ner":{prettyLabel:"Aviation NER",repoName:"Aviation NER",repoUrl:"https://github.com/Boeing/aviation_ner_sdr",docsUrl:"https://github.com/Boeing/aviation_ner_sdr",countDownloads:'path:"gliner_config.json"',filter:!1},asteroid:{prettyLabel:"Asteroid",repoName:"Asteroid",repoUrl:"https://github.com/asteroid-team/asteroid",docsUrl:"https://huggingface.co/docs/hub/asteroid",snippets:is,filter:!0,countDownloads:'path:"pytorch_model.bin"'},audiocraft:{prettyLabel:"Audiocraft",repoName:"audiocraft",repoUrl:"https://github.com/facebookresearch/audiocraft",snippets:Lc,filter:!1,countDownloads:'path:"state_dict.bin"'},audioseal:{prettyLabel:"AudioSeal",repoName:"audioseal",repoUrl:"https://github.com/facebookresearch/audioseal",filter:!1,countDownloads:'path_extension:"pth"',snippets:os},"bagel-mot":{prettyLabel:"Bagel",repoName:"Bagel",repoUrl:"https://github.com/ByteDance-Seed/Bagel/",filter:!1,countDownloads:'path:"llm_config.json"'},bboxmaskpose:{prettyLabel:"BBoxMaskPose",repoName:"BBoxMaskPose",repoUrl:"https://github.com/MiraPurkrabek/BBoxMaskPose",filter:!1,countDownloads:'path_extension:"pth"'},ben2:{prettyLabel:"BEN2",repoName:"BEN2",repoUrl:"https://github.com/PramaLLC/BEN2",snippets:rs,filter:!1},bertopic:{prettyLabel:"BERTopic",repoName:"BERTopic",repoUrl:"https://github.com/MaartenGr/BERTopic",snippets:ss,filter:!0},big_vision:{prettyLabel:"Big Vision",repoName:"big_vision",repoUrl:"https://github.com/google-research/big_vision",filter:!1,countDownloads:'path_extension:"npz"'},birder:{prettyLabel:"Birder",repoName:"Birder",repoUrl:"https://gitlab.com/birder/birder",filter:!1,countDownloads:'path_extension:"pt"'},birefnet:{prettyLabel:"BiRefNet",repoName:"BiRefNet",repoUrl:"https://github.com/ZhengPeng7/BiRefNet",snippets:uc,filter:!1},bm25s:{prettyLabel:"BM25S",repoName:"bm25s",repoUrl:"https://github.com/xhluca/bm25s",snippets:ls,filter:!1,countDownloads:'path:"params.index.json"'},boltzgen:{prettyLabel:"BoltzGen",repoName:"BoltzGen",repoUrl:"https://github.com/HannesStark/boltzgen",filter:!1,countDownloads:'path:"boltzgen1_diverse.ckpt"'},cancertathomev2:{prettyLabel:"Cancer@HomeV2",repoName:"Cancer@HomeV2",repoUrl:"https://huggingface.co/OpenPeerAI/CancerAtHomeV2",filter:!1,countDownloads:'path:"run.py"'},cartesia_pytorch:{prettyLabel:"Cartesia Pytorch",repoName:"Cartesia Pytorch",repoUrl:"https://github.com/cartesia-ai/cartesia_pytorch",snippets:$s},cartesia_mlx:{prettyLabel:"Cartesia MLX",repoName:"Cartesia MLX",repoUrl:"https://github.com/cartesia-ai/cartesia_mlx",snippets:Ds},champ:{prettyLabel:"Champ",repoName:"Champ",repoUrl:"https://github.com/fudan-generative-vision/champ",countDownloads:'path:"champ/motion_module.pth"'},chatterbox:{prettyLabel:"Chatterbox",repoName:"Chatterbox",repoUrl:"https://github.com/resemble-ai/chatterbox",snippets:cs,countDownloads:'path:"tokenizer.json"',filter:!1},chaossim:{prettyLabel:"ChaosSIM",repoName:"ChaosSIM",repoUrl:"https://huggingface.co/OpenPeerAI/ChaosSIM/",countDownloads:'path:"ChaosSim.nb"',filter:!1},chat_tts:{prettyLabel:"ChatTTS",repoName:"ChatTTS",repoUrl:"https://github.com/2noise/ChatTTS.git",snippets:dc,filter:!1,countDownloads:'path:"asset/GPT.pt"'},"chronos-forecasting":{prettyLabel:"Chronos",repoName:"Chronos",repoUrl:"https://github.com/amazon-science/chronos-forecasting",snippets:ps},clara:{prettyLabel:"Clara",repoName:"Clara",filter:!1,repoUrl:"https://github.com/nvidia/clara",countDownloads:'path_extension:"ckpt" OR path:"config.json"'},clipscope:{prettyLabel:"clipscope",repoName:"clipscope",repoUrl:"https://github.com/Lewington-pitsos/clipscope",filter:!1,countDownloads:'path_extension:"pt"'},"cloud-agents":{prettyLabel:"Cloud Agents",repoName:"Cloud Agents",repoUrl:"https://huggingface.co/OpenPeerAI/Cloud-Agents",filter:!1,countDownloads:'path:"setup.py"'},colipri:{prettyLabel:"COLIPRI",repoName:"COLIPRI",repoUrl:"https://huggingface.co/microsoft/colipri",snippets:ds,filter:!1,countDownloads:'path_extension:"safetensors"'},cosyvoice:{prettyLabel:"CosyVoice",repoName:"CosyVoice",repoUrl:"https://github.com/FunAudioLLM/CosyVoice",filter:!1,countDownloads:'path_extension:"onnx" OR path_extension:"pt"'},cotracker:{prettyLabel:"CoTracker",repoName:"CoTracker",repoUrl:"https://github.com/facebookresearch/co-tracker",filter:!1,countDownloads:'path_extension:"pth"'},colpali:{prettyLabel:"ColPali",repoName:"ColPali",repoUrl:"https://github.com/ManuelFay/colpali",filter:!1,countDownloads:'path:"adapter_config.json"'},comet:{prettyLabel:"COMET",repoName:"COMET",repoUrl:"https://github.com/Unbabel/COMET/",countDownloads:'path:"hparams.yaml"'},cosmos:{prettyLabel:"Cosmos",repoName:"Cosmos",repoUrl:"https://github.com/NVIDIA/Cosmos",countDownloads:'path:"config.json" OR path_extension:"pt"'},"cxr-foundation":{prettyLabel:"CXR Foundation",repoName:"cxr-foundation",repoUrl:"https://github.com/google-health/cxr-foundation",snippets:ms,filter:!1,countDownloads:'path:"precomputed_embeddings/embeddings.npz" OR path:"pax-elixr-b-text/saved_model.pb"'},deepforest:{prettyLabel:"DeepForest",repoName:"deepforest",docsUrl:"https://deepforest.readthedocs.io/en/latest/",repoUrl:"https://github.com/weecology/DeepForest"},"depth-anything-v2":{prettyLabel:"DepthAnythingV2",repoName:"Depth Anything V2",repoUrl:"https://github.com/DepthAnything/Depth-Anything-V2",snippets:fs,filter:!1,countDownloads:'path_extension:"pth"'},"depth-pro":{prettyLabel:"Depth Pro",repoName:"Depth Pro",repoUrl:"https://github.com/apple/ml-depth-pro",countDownloads:'path_extension:"pt"',snippets:gs,filter:!1},"derm-foundation":{prettyLabel:"Derm Foundation",repoName:"derm-foundation",repoUrl:"https://github.com/google-health/derm-foundation",snippets:hs,filter:!1,countDownloads:'path:"scin_dataset_precomputed_embeddings.npz" OR path:"saved_model.pb"'},"describe-anything":{prettyLabel:"Describe Anything",repoName:"Describe Anything",repoUrl:"https://github.com/NVlabs/describe-anything",snippets:ws,filter:!1},"dia-tts":{prettyLabel:"Dia",repoName:"Dia",repoUrl:"https://github.com/nari-labs/dia",snippets:bs,filter:!1},dia2:{prettyLabel:"Dia2",repoName:"Dia2",repoUrl:"https://github.com/nari-labs/dia2",snippets:ys,filter:!1},"diff-interpretation-tuning":{prettyLabel:"Diff Interpretation Tuning",repoName:"Diff Interpretation Tuning",repoUrl:"https://github.com/Aviously/diff-interpretation-tuning",filter:!1,countDownloads:'path_extension:"pt"'},diffree:{prettyLabel:"Diffree",repoName:"Diffree",repoUrl:"https://github.com/OpenGVLab/Diffree",filter:!1,countDownloads:'path:"diffree-step=000010999.ckpt"'},diffusers:{prettyLabel:"Diffusers",repoName:"🤗/diffusers",repoUrl:"https://github.com/huggingface/diffusers",docsUrl:"https://huggingface.co/docs/hub/diffusers",snippets:Kt,filter:!0},diffusionkit:{prettyLabel:"DiffusionKit",repoName:"DiffusionKit",repoUrl:"https://github.com/argmaxinc/DiffusionKit",snippets:Us},"docking-at-home":{prettyLabel:"Docking@Home",repoName:"Docking@Home",repoUrl:"https://huggingface.co/OpenPeerAI/DockingAtHOME",filter:!1,countDownloads:'path:"setup.py"'},doctr:{prettyLabel:"docTR",repoName:"doctr",repoUrl:"https://github.com/mindee/doctr"},edsnlp:{prettyLabel:"EDS-NLP",repoName:"edsnlp",repoUrl:"https://github.com/aphp/edsnlp",docsUrl:"https://aphp.github.io/edsnlp/latest/",filter:!1,snippets:Ls,countDownloads:'path_filename:"config" AND path_extension:"cfg"'},elm:{prettyLabel:"ELM",repoName:"elm",repoUrl:"https://github.com/slicex-ai/elm",filter:!1,countDownloads:'path_filename:"slicex_elm_config" AND path_extension:"json"'},espnet:{prettyLabel:"ESPnet",repoName:"ESPnet",repoUrl:"https://github.com/espnet/espnet",docsUrl:"https://huggingface.co/docs/hub/espnet",snippets:Os,filter:!0},fairseq:{prettyLabel:"Fairseq",repoName:"fairseq",repoUrl:"https://github.com/pytorch/fairseq",snippets:qs,filter:!0},fastai:{prettyLabel:"fastai",repoName:"fastai",repoUrl:"https://github.com/fastai/fastai",docsUrl:"https://huggingface.co/docs/hub/fastai",snippets:Dl,filter:!0},fastprint:{prettyLabel:"Fast Print",repoName:"Fast Print",repoUrl:"https://huggingface.co/OpenPeerAI/FastPrint",countDownloads:'path_extension:"cs"'},fasttext:{prettyLabel:"fastText",repoName:"fastText",repoUrl:"https://fasttext.cc/",snippets:Zl,filter:!0,countDownloads:'path_extension:"bin"'},fixer:{prettyLabel:"Fixer",repoName:"Fixer",repoUrl:"https://github.com/nv-tlabs/Fixer",filter:!1,countDownloads:'path:"pretrained/pretrained_fixer.pkl"'},flair:{prettyLabel:"Flair",repoName:"Flair",repoUrl:"https://github.com/flairNLP/flair",docsUrl:"https://huggingface.co/docs/hub/flair",snippets:Bs,filter:!0,countDownloads:'path:"pytorch_model.bin"'},fme:{prettyLabel:"Full Model Emulation",repoName:"Full Model Emulation",repoUrl:"https://github.com/ai2cm/ace",docsUrl:"https://ai2-climate-emulator.readthedocs.io/en/latest/",filter:!1,countDownloads:'path_extension:"tar"'},"gemma.cpp":{prettyLabel:"gemma.cpp",repoName:"gemma.cpp",repoUrl:"https://github.com/google/gemma.cpp",filter:!1,countDownloads:'path_extension:"sbs"'},"geometry-crafter":{prettyLabel:"GeometryCrafter",repoName:"GeometryCrafter",repoUrl:"https://github.com/TencentARC/GeometryCrafter",countDownloads:'path:"point_map_vae/diffusion_pytorch_model.safetensors"'},gliner:{prettyLabel:"GLiNER",repoName:"GLiNER",repoUrl:"https://github.com/urchade/GLiNER",snippets:Fs,filter:!1,countDownloads:'path:"gliner_config.json"'},gliner2:{prettyLabel:"GLiNER2",repoName:"GLiNER2",repoUrl:"https://github.com/fastino-ai/GLiNER2",snippets:Vs,filter:!1},"glm-tts":{prettyLabel:"GLM-TTS",repoName:"GLM-TTS",repoUrl:"https://github.com/zai-org/GLM-TTS",filter:!1,countDownloads:'path:"flow/flow.pt"'},"glyph-byt5":{prettyLabel:"Glyph-ByT5",repoName:"Glyph-ByT5",repoUrl:"https://github.com/AIGText/Glyph-ByT5",filter:!1,countDownloads:'path:"checkpoints/byt5_model.pt"'},grok:{prettyLabel:"Grok",repoName:"Grok",repoUrl:"https://github.com/xai-org/grok-1",filter:!1,countDownloads:'path:"ckpt/tensor00000_000" OR path:"ckpt-0/tensor00000_000"'},"habibi-tts":{prettyLabel:"Habibi-TTS",repoName:"Habibi-TTS",repoUrl:"https://github.com/SWivid/Habibi-TTS",filter:!1,countDownloads:'path_extension:"safetensors"'},hallo:{prettyLabel:"Hallo",repoName:"Hallo",repoUrl:"https://github.com/fudan-generative-vision/hallo",countDownloads:'path:"hallo/net.pth"'},hermes:{prettyLabel:"HERMES",repoName:"HERMES",repoUrl:"https://github.com/LMD0311/HERMES",filter:!1,countDownloads:'path:"ckpt/hermes_final.pth"'},hezar:{prettyLabel:"Hezar",repoName:"Hezar",repoUrl:"https://github.com/hezarai/hezar",docsUrl:"https://hezarai.github.io/hezar",countDownloads:'path:"model_config.yaml" OR path:"embedding/embedding_config.yaml"'},htrflow:{prettyLabel:"HTRflow",repoName:"HTRflow",repoUrl:"https://github.com/AI-Riksarkivet/htrflow",docsUrl:"https://ai-riksarkivet.github.io/htrflow",snippets:Ks},"hunyuan-dit":{prettyLabel:"HunyuanDiT",repoName:"HunyuanDiT",repoUrl:"https://github.com/Tencent/HunyuanDiT",countDownloads:'path:"pytorch_model_ema.pt" OR path:"pytorch_model_distill.pt"'},"hunyuan3d-2":{prettyLabel:"Hunyuan3D-2",repoName:"Hunyuan3D-2",repoUrl:"https://github.com/Tencent/Hunyuan3D-2",countDownloads:'path_filename:"model_index" OR path_filename:"config"'},"hunyuanworld-voyager":{prettyLabel:"HunyuanWorld-voyager",repoName:"HunyuanWorld-voyager",repoUrl:"https://github.com/Tencent-Hunyuan/HunyuanWorld-Voyager"},"hy-worldplay":{prettyLabel:"HY-WorldPlay",repoName:"HY-WorldPlay",repoUrl:"https://github.com/Tencent-Hunyuan/HY-WorldPlay",filter:!1,countDownloads:'path_extension:"json"'},"image-matching-models":{prettyLabel:"Image Matching Models",repoName:"Image Matching Models",repoUrl:"https://github.com/alexstoken/image-matching-models",filter:!1,countDownloads:'path_extension:"safetensors"'},imstoucan:{prettyLabel:"IMS Toucan",repoName:"IMS-Toucan",repoUrl:"https://github.com/DigitalPhonetics/IMS-Toucan",countDownloads:'path:"embedding_gan.pt" OR path:"Vocoder.pt" OR path:"ToucanTTS.pt"'},"index-tts":{prettyLabel:"IndexTTS",repoName:"IndexTTS",repoUrl:"https://github.com/index-tts/index-tts",snippets:Hs,filter:!1},infinitetalk:{prettyLabel:"InfiniteTalk",repoName:"InfiniteTalk",repoUrl:"https://github.com/MeiGen-AI/InfiniteTalk",filter:!1,countDownloads:'path_extension:"safetensors"'},"infinite-you":{prettyLabel:"InfiniteYou",repoName:"InfiniteYou",repoUrl:"https://github.com/bytedance/InfiniteYou",filter:!1,countDownloads:'path:"infu_flux_v1.0/sim_stage1/image_proj_model.bin" OR path:"infu_flux_v1.0/aes_stage2/image_proj_model.bin"'},keras:{prettyLabel:"Keras",repoName:"Keras",repoUrl:"https://github.com/keras-team/keras",docsUrl:"https://huggingface.co/docs/hub/keras",snippets:zs,filter:!0,countDownloads:'path:"config.json" OR path_extension:"keras"'},"tf-keras":{prettyLabel:"TF-Keras",repoName:"TF-Keras",repoUrl:"https://github.com/keras-team/tf-keras",docsUrl:"https://huggingface.co/docs/hub/tf-keras",snippets:rl,countDownloads:'path:"saved_model.pb"'},"keras-hub":{prettyLabel:"KerasHub",repoName:"KerasHub",repoUrl:"https://github.com/keras-team/keras-hub",docsUrl:"https://keras.io/keras_hub/",snippets:Gs,filter:!0},kernels:{prettyLabel:"Kernels",repoName:"Kernels",repoUrl:"https://github.com/huggingface/kernels",docsUrl:"https://huggingface.co/docs/kernels",snippets:el,countDownloads:'path_filename:"_ops" AND path_extension:"py"'},"kimi-audio":{prettyLabel:"KimiAudio",repoName:"KimiAudio",repoUrl:"https://github.com/MoonshotAI/Kimi-Audio",snippets:tl,filter:!1},kittentts:{prettyLabel:"KittenTTS",repoName:"KittenTTS",repoUrl:"https://github.com/KittenML/KittenTTS",snippets:nl},kronos:{prettyLabel:"KRONOS",repoName:"KRONOS",repoUrl:"https://github.com/mahmoodlab/KRONOS",filter:!1,countDownloads:'path_extension:"pt"'},k2:{prettyLabel:"K2",repoName:"k2",repoUrl:"https://github.com/k2-fsa/k2"},"lightning-ir":{prettyLabel:"Lightning IR",repoName:"Lightning IR",repoUrl:"https://github.com/webis-de/lightning-ir",snippets:al},litert:{prettyLabel:"LiteRT",repoName:"LiteRT",repoUrl:"https://github.com/google-ai-edge/LiteRT",filter:!1,countDownloads:'path_extension:"tflite"'},"litert-lm":{prettyLabel:"LiteRT-LM",repoName:"LiteRT-LM",repoUrl:"https://github.com/google-ai-edge/LiteRT-LM",filter:!1,countDownloads:'path_extension:"litertlm" OR path_extension:"task"'},lerobot:{prettyLabel:"LeRobot",repoName:"LeRobot",repoUrl:"https://github.com/huggingface/lerobot",docsUrl:"https://huggingface.co/docs/lerobot",filter:!1,snippets:ol},lightglue:{prettyLabel:"LightGlue",repoName:"LightGlue",repoUrl:"https://github.com/cvg/LightGlue",filter:!1,countDownloads:'path_extension:"pth" OR path:"config.json"'},liveportrait:{prettyLabel:"LivePortrait",repoName:"LivePortrait",repoUrl:"https://github.com/KwaiVGI/LivePortrait",filter:!1,countDownloads:'path:"liveportrait/landmark.onnx"'},"llama-cpp-python":{prettyLabel:"llama-cpp-python",repoName:"llama-cpp-python",repoUrl:"https://github.com/abetlen/llama-cpp-python",snippets:il},"mini-omni2":{prettyLabel:"Mini-Omni2",repoName:"Mini-Omni2",repoUrl:"https://github.com/gpt-omni/mini-omni2",countDownloads:'path:"model_config.yaml"'},mindspore:{prettyLabel:"MindSpore",repoName:"mindspore",repoUrl:"https://github.com/mindspore-ai/mindspore"},"magi-1":{prettyLabel:"MAGI-1",repoName:"MAGI-1",repoUrl:"https://github.com/SandAI-org/MAGI-1",countDownloads:'path:"ckpt/vae/config.json"'},"magenta-realtime":{prettyLabel:"Magenta RT",repoName:"Magenta RT",repoUrl:"https://github.com/magenta/magenta-realtime",countDownloads:'path:"checkpoints/llm_base_x4286_c1860k.tar" OR path:"checkpoints/llm_large_x3047_c1860k.tar" OR path:"checkpoints/llm_large_x3047_c1860k/checkpoint"'},"mamba-ssm":{prettyLabel:"MambaSSM",repoName:"MambaSSM",repoUrl:"https://github.com/state-spaces/mamba",filter:!1,snippets:sl},"mars5-tts":{prettyLabel:"MARS5-TTS",repoName:"MARS5-TTS",repoUrl:"https://github.com/Camb-ai/MARS5-TTS",filter:!1,countDownloads:'path:"mars5_ar.safetensors"',snippets:ll},matanyone:{prettyLabel:"MatAnyone",repoName:"MatAnyone",repoUrl:"https://github.com/pq-yang/MatAnyone",snippets:cl,filter:!1},"mesh-anything":{prettyLabel:"MeshAnything",repoName:"MeshAnything",repoUrl:"https://github.com/buaacyw/MeshAnything",filter:!1,countDownloads:'path:"MeshAnything_350m.pth"',snippets:pl},merlin:{prettyLabel:"Merlin",repoName:"Merlin",repoUrl:"https://github.com/StanfordMIMI/Merlin",filter:!1,countDownloads:'path_extension:"pt"'},medvae:{prettyLabel:"MedVAE",repoName:"MedVAE",repoUrl:"https://github.com/StanfordMIMI/MedVAE",filter:!1,countDownloads:'path_extension:"ckpt"'},mitie:{prettyLabel:"MITIE",repoName:"MITIE",repoUrl:"https://github.com/mit-nlp/MITIE",countDownloads:'path_filename:"total_word_feature_extractor"'},"ml-agents":{prettyLabel:"ml-agents",repoName:"ml-agents",repoUrl:"https://github.com/Unity-Technologies/ml-agents",docsUrl:"https://huggingface.co/docs/hub/ml-agents",snippets:tc,filter:!0,countDownloads:'path_extension:"onnx"'},"ml-sharp":{prettyLabel:"Sharp",repoName:"Sharp",repoUrl:"https://github.com/apple/ml-sharp",filter:!1,countDownloads:'path_extension:"pt"'},mlx:{prettyLabel:"MLX",repoName:"MLX",repoUrl:"https://github.com/ml-explore/mlx-examples/tree/main",snippets:_c,filter:!0},"mlx-image":{prettyLabel:"mlx-image",repoName:"mlx-image",repoUrl:"https://github.com/riccardomusmeci/mlx-image",docsUrl:"https://huggingface.co/docs/hub/mlx-image",snippets:vc,filter:!1,countDownloads:'path:"model.safetensors"'},"mlc-llm":{prettyLabel:"MLC-LLM",repoName:"MLC-LLM",repoUrl:"https://github.com/mlc-ai/mlc-llm",docsUrl:"https://llm.mlc.ai/docs/",filter:!1,countDownloads:'path:"mlc-chat-config.json"'},model2vec:{prettyLabel:"Model2Vec",repoName:"model2vec",repoUrl:"https://github.com/MinishLab/model2vec",snippets:xc,filter:!1},moshi:{prettyLabel:"Moshi",repoName:"Moshi",repoUrl:"https://github.com/kyutai-labs/moshi",filter:!1,countDownloads:'path:"tokenizer-e351c8d8-checkpoint125.safetensors"'},mtvcraft:{prettyLabel:"MTVCraft",repoName:"MTVCraft",repoUrl:"https://github.com/baaivision/MTVCraft",filter:!1,countDownloads:'path:"vae/3d-vae.pt"'},nemo:{prettyLabel:"NeMo",repoName:"NeMo",repoUrl:"https://github.com/NVIDIA/NeMo",snippets:Sc,filter:!0,countDownloads:'path_extension:"nemo" OR path:"model_config.yaml" OR path_extension:"json"'},"open-oasis":{prettyLabel:"open-oasis",repoName:"open-oasis",repoUrl:"https://github.com/etched-ai/open-oasis",countDownloads:'path:"oasis500m.safetensors"'},open_clip:{prettyLabel:"OpenCLIP",repoName:"OpenCLIP",repoUrl:"https://github.com/mlfoundations/open_clip",snippets:dl,filter:!0,countDownloads:`path:"open_clip_model.safetensors"
			OR path:"model.safetensors"
			OR path:"open_clip_pytorch_model.bin"
			OR path:"pytorch_model.bin"`},openpeerllm:{prettyLabel:"OpenPeerLLM",repoName:"OpenPeerLLM",repoUrl:"https://huggingface.co/openpeerai/openpeerllm",docsUrl:"https://huggingface.co/OpenPeerAI/OpenPeerLLM/blob/main/README.md",countDownloads:'path:".meta-huggingface.json"',filter:!1},"open-sora":{prettyLabel:"Open-Sora",repoName:"Open-Sora",repoUrl:"https://github.com/hpcaitech/Open-Sora",filter:!1,countDownloads:'path:"Open_Sora_v2.safetensors"'},outetts:{prettyLabel:"OuteTTS",repoName:"OuteTTS",repoUrl:"https://github.com/edwko/OuteTTS",snippets:Pc,filter:!1},paddlenlp:{prettyLabel:"paddlenlp",repoName:"PaddleNLP",repoUrl:"https://github.com/PaddlePaddle/PaddleNLP",docsUrl:"https://huggingface.co/docs/hub/paddlenlp",snippets:ul,filter:!0,countDownloads:'path:"model_config.json"'},PaddleOCR:{prettyLabel:"PaddleOCR",repoName:"PaddleOCR",repoUrl:"https://github.com/PaddlePaddle/PaddleOCR",docsUrl:"https://www.paddleocr.ai/",snippets:ml,filter:!0,countDownloads:'path_extension:"safetensors" OR path:"inference.pdiparams"'},peft:{prettyLabel:"PEFT",repoName:"PEFT",repoUrl:"https://github.com/huggingface/peft",snippets:Yl,filter:!0,countDownloads:'path:"adapter_config.json"'},"perception-encoder":{prettyLabel:"PerceptionEncoder",repoName:"PerceptionModels",repoUrl:"https://github.com/facebookresearch/perception_models",filter:!1,snippets:fl,countDownloads:'path_extension:"pt"'},"phantom-wan":{prettyLabel:"Phantom",repoName:"Phantom",repoUrl:"https://github.com/Phantom-video/Phantom",snippets:gl,filter:!1,countDownloads:'path_extension:"pth"'},"pocket-tts":{prettyLabel:"Pocket-TTS",repoName:"PocketTTS",repoUrl:"https://github.com/kyutai-labs/pocket-tts",snippets:hl,filter:!1,countDownloads:'path:"tts_b6369a24.safetensors"'},"pruna-ai":{prettyLabel:"Pruna AI",repoName:"Pruna AI",repoUrl:"https://github.com/PrunaAI/pruna",snippets:kc,docsUrl:"https://docs.pruna.ai"},pxia:{prettyLabel:"pxia",repoName:"pxia",repoUrl:"https://github.com/not-lain/pxia",snippets:Rc,filter:!1},"pyannote-audio":{prettyLabel:"pyannote.audio",repoName:"pyannote-audio",repoUrl:"https://github.com/pyannote/pyannote-audio",snippets:wl,filter:!0},"py-feat":{prettyLabel:"Py-Feat",repoName:"Py-Feat",repoUrl:"https://github.com/cosanlab/py-feat",docsUrl:"https://py-feat.org/",filter:!1},pythae:{prettyLabel:"pythae",repoName:"pythae",repoUrl:"https://github.com/clementchadebec/benchmark_VAE",snippets:Cc,filter:!1},quantumpeer:{prettyLabel:"QuantumPeer",repoName:"QuantumPeer",repoUrl:"https://github.com/OpenPeer-AI/QuantumPeer",filter:!1,countDownloads:'path_extension:"setup.py"'},recurrentgemma:{prettyLabel:"RecurrentGemma",repoName:"recurrentgemma",repoUrl:"https://github.com/google-deepmind/recurrentgemma",filter:!1,countDownloads:'path:"tokenizer.model"'},relik:{prettyLabel:"Relik",repoName:"Relik",repoUrl:"https://github.com/SapienzaNLP/relik",snippets:vl,filter:!1},refiners:{prettyLabel:"Refiners",repoName:"Refiners",repoUrl:"https://github.com/finegrain-ai/refiners",docsUrl:"https://refine.rs/",filter:!1,countDownloads:'path:"model.safetensors"'},renderformer:{prettyLabel:"RenderFormer",repoName:"RenderFormer",repoUrl:"https://github.com/microsoft/renderformer",snippets:_l,filter:!1},reverb:{prettyLabel:"Reverb",repoName:"Reverb",repoUrl:"https://github.com/revdotcom/reverb",filter:!1},rkllm:{prettyLabel:"RKLLM",repoName:"RKLLM",repoUrl:"https://github.com/airockchip/rknn-llm",countDownloads:'path_extension:"rkllm"'},saelens:{prettyLabel:"SAELens",repoName:"SAELens",repoUrl:"https://github.com/jbloomAus/SAELens",snippets:Sl,filter:!1},sam2:{prettyLabel:"sam2",repoName:"sam2",repoUrl:"https://github.com/facebookresearch/segment-anything-2",filter:!1,snippets:Ll,countDownloads:'path_extension:"pt"'},"sam-3d-body":{prettyLabel:"SAM 3D Body",repoName:"SAM 3D Body",repoUrl:"https://github.com/facebookresearch/sam-3d-body",filter:!1,snippets:Ml,countDownloads:'path:"model_config.yaml"'},"sam-3d-objects":{prettyLabel:"SAM 3D Objects",repoName:"SAM 3D Objects",repoUrl:"https://github.com/facebookresearch/sam-3d-objects",filter:!1,snippets:jl,countDownloads:'path:"checkpoints/pipeline.yaml"'},same:{prettyLabel:"SAME",repoName:"SAME",repoUrl:"https://github.com/GengzeZhou/SAME",filter:!1,countDownloads:'path:"ckpt/SAME.pt" OR path:"pretrain/Attnq_pretrained_ckpt.pt"'},"sample-factory":{prettyLabel:"sample-factory",repoName:"sample-factory",repoUrl:"https://github.com/alex-petrenko/sample-factory",docsUrl:"https://huggingface.co/docs/hub/sample-factory",snippets:Nl,filter:!0,countDownloads:'path:"cfg.json"'},"sap-rpt-1-oss":{prettyLabel:"sap-rpt-1-oss",repoName:"sap-rpt-1-oss",repoUrl:"https://github.com/SAP-samples/sap-rpt-1-oss",countDownloads:'path_extension:"pt"',snippets:us},sapiens:{prettyLabel:"sapiens",repoName:"sapiens",repoUrl:"https://github.com/facebookresearch/sapiens",filter:!1,countDownloads:'path_extension:"pt2" OR path_extension:"pth" OR path_extension:"onnx"'},seedvr:{prettyLabel:"SeedVR",repoName:"SeedVR",repoUrl:"https://github.com/ByteDance-Seed/SeedVR",filter:!1,countDownloads:'path_extension:"pth"'},"self-forcing":{prettyLabel:"SelfForcing",repoName:"SelfForcing",repoUrl:"https://github.com/guandeh17/Self-Forcing",filter:!1,countDownloads:'path_extension:"pt"'},"sentence-transformers":{prettyLabel:"sentence-transformers",repoName:"sentence-transformers",repoUrl:"https://github.com/UKPLab/sentence-transformers",docsUrl:"https://huggingface.co/docs/hub/sentence-transformers",snippets:ql,filter:!0},setfit:{prettyLabel:"setfit",repoName:"setfit",repoUrl:"https://github.com/huggingface/setfit",docsUrl:"https://huggingface.co/docs/hub/setfit",snippets:Bl,filter:!0},sklearn:{prettyLabel:"Scikit-learn",repoName:"Scikit-learn",repoUrl:"https://github.com/scikit-learn/scikit-learn",snippets:Ul,filter:!0,countDownloads:'path:"sklearn_model.joblib"'},spacy:{prettyLabel:"spaCy",repoName:"spaCy",repoUrl:"https://github.com/explosion/spaCy",docsUrl:"https://huggingface.co/docs/hub/spacy",snippets:Fl,filter:!0,countDownloads:'path_extension:"whl"'},"span-marker":{prettyLabel:"SpanMarker",repoName:"SpanMarkerNER",repoUrl:"https://github.com/tomaarsen/SpanMarkerNER",docsUrl:"https://huggingface.co/docs/hub/span_marker",snippets:Vl,filter:!0},speechbrain:{prettyLabel:"speechbrain",repoName:"speechbrain",repoUrl:"https://github.com/speechbrain/speechbrain",docsUrl:"https://huggingface.co/docs/hub/speechbrain",snippets:zl,filter:!0,countDownloads:'path:"hyperparams.yaml"'},"ssr-speech":{prettyLabel:"SSR-Speech",repoName:"SSR-Speech",repoUrl:"https://github.com/WangHelin1997/SSR-Speech",filter:!1,countDownloads:'path_extension:".pth"'},"stable-audio-tools":{prettyLabel:"Stable Audio Tools",repoName:"stable-audio-tools",repoUrl:"https://github.com/Stability-AI/stable-audio-tools.git",filter:!1,countDownloads:'path:"model.safetensors"',snippets:$l},monkeyocr:{prettyLabel:"MonkeyOCR",repoName:"monkeyocr",repoUrl:"https://github.com/Yuliang-Liu/MonkeyOCR",filter:!1,countDownloads:'path:"Recognition/config.json"'},"diffusion-single-file":{prettyLabel:"Diffusion Single File",repoName:"diffusion-single-file",repoUrl:"https://github.com/comfyanonymous/ComfyUI",filter:!1,countDownloads:'path_extension:"safetensors"'},"seed-story":{prettyLabel:"SEED-Story",repoName:"SEED-Story",repoUrl:"https://github.com/TencentARC/SEED-Story",filter:!1,countDownloads:'path:"cvlm_llama2_tokenizer/tokenizer.model"',snippets:Pl},soloaudio:{prettyLabel:"SoloAudio",repoName:"SoloAudio",repoUrl:"https://github.com/WangHelin1997/SoloAudio",filter:!1,countDownloads:'path:"soloaudio_v2.pt"'},songbloom:{prettyLabel:"SongBloom",repoName:"SongBloom",repoUrl:"https://github.com/Cypress-Yang/SongBloom",filter:!1,countDownloads:'path_extension:"pt"'},"stable-baselines3":{prettyLabel:"stable-baselines3",repoName:"stable-baselines3",repoUrl:"https://github.com/huggingface/huggingface_sb3",docsUrl:"https://huggingface.co/docs/hub/stable-baselines3",snippets:Gl,filter:!0,countDownloads:'path_extension:"zip"'},stanza:{prettyLabel:"Stanza",repoName:"stanza",repoUrl:"https://github.com/stanfordnlp/stanza",docsUrl:"https://huggingface.co/docs/hub/stanza",snippets:Hl,filter:!0,countDownloads:'path:"models/default.zip"'},supertonic:{prettyLabel:"Supertonic",repoName:"Supertonic",repoUrl:"https://github.com/supertone-inc/supertonic",snippets:mc,filter:!1},swarmformer:{prettyLabel:"SwarmFormer",repoName:"SwarmFormer",repoUrl:"https://github.com/takara-ai/SwarmFormer",snippets:fc,filter:!1},"f5-tts":{prettyLabel:"F5-TTS",repoName:"F5-TTS",repoUrl:"https://github.com/SWivid/F5-TTS",filter:!1,countDownloads:'path_extension:"safetensors" OR path_extension:"pt"'},genmo:{prettyLabel:"Genmo",repoName:"Genmo",repoUrl:"https://github.com/genmoai/models",filter:!1,countDownloads:'path:"vae_stats.json"'},"tencent-song-generation":{prettyLabel:"SongGeneration",repoName:"SongGeneration",repoUrl:"https://github.com/tencent-ailab/songgeneration",filter:!1,countDownloads:'path:"ckpt/songgeneration_base/model.pt"'},tensorflowtts:{prettyLabel:"TensorFlowTTS",repoName:"TensorFlowTTS",repoUrl:"https://github.com/TensorSpeech/TensorFlowTTS",snippets:Il},tensorrt:{prettyLabel:"TensorRT",repoName:"TensorRT",repoUrl:"https://github.com/NVIDIA/TensorRT",countDownloads:'path_extension:"onnx"'},tabpfn:{prettyLabel:"TabPFN",repoName:"TabPFN",repoUrl:"https://github.com/PriorLabs/TabPFN"},terratorch:{prettyLabel:"TerraTorch",repoName:"TerraTorch",repoUrl:"https://github.com/IBM/terratorch",docsUrl:"https://ibm.github.io/terratorch/",filter:!1,countDownloads:'path_extension:"pt" OR path_extension:"ckpt"',snippets:Wl},"tic-clip":{prettyLabel:"TiC-CLIP",repoName:"TiC-CLIP",repoUrl:"https://github.com/apple/ml-tic-clip",filter:!1,countDownloads:'path_extension:"pt" AND path_prefix:"checkpoints/"'},timesfm:{prettyLabel:"TimesFM",repoName:"timesfm",repoUrl:"https://github.com/google-research/timesfm",filter:!1,countDownloads:'path:"checkpoints/checkpoint_1100000/state/checkpoint" OR path:"checkpoints/checkpoint_2150000/state/checkpoint" OR path_extension:"ckpt"'},timm:{prettyLabel:"timm",repoName:"pytorch-image-models",repoUrl:"https://github.com/rwightman/pytorch-image-models",docsUrl:"https://huggingface.co/docs/hub/timm",snippets:Tl,filter:!0,countDownloads:'path:"pytorch_model.bin" OR path:"model.safetensors"'},tirex:{prettyLabel:"TiRex",repoName:"TiRex",repoUrl:"https://github.com/NX-AI/tirex",countDownloads:'path_extension:"ckpt"'},torchgeo:{prettyLabel:"TorchGeo",repoName:"TorchGeo",repoUrl:"https://github.com/microsoft/torchgeo",docsUrl:"https://torchgeo.readthedocs.io/",filter:!1,countDownloads:'path_extension:"pt" OR path_extension:"pth"'},transformers:{prettyLabel:"Transformers",repoName:"🤗/transformers",repoUrl:"https://github.com/huggingface/transformers",docsUrl:"https://huggingface.co/docs/hub/transformers",snippets:zt,filter:!0},"transformers.js":{prettyLabel:"Transformers.js",repoName:"transformers.js",repoUrl:"https://github.com/huggingface/transformers.js",docsUrl:"https://huggingface.co/docs/hub/transformers-js",snippets:Ql,filter:!0},trellis:{prettyLabel:"Trellis",repoName:"Trellis",repoUrl:"https://github.com/microsoft/TRELLIS",countDownloads:'path_extension:"safetensors"'},ultralytics:{prettyLabel:"ultralytics",repoName:"ultralytics",repoUrl:"https://github.com/ultralytics/ultralytics",docsUrl:"https://github.com/ultralytics/ultralytics",filter:!1,countDownloads:'path_extension:"pt"',snippets:xt},univa:{prettyLabel:"univa",repoName:"univa",repoUrl:"https://github.com/PKU-YuanGroup/UniWorld-V1",snippets:gc,filter:!0,countDownloads:'path:"config.json"'},"uni-3dar":{prettyLabel:"Uni-3DAR",repoName:"Uni-3DAR",repoUrl:"https://github.com/dptech-corp/Uni-3DAR",docsUrl:"https://github.com/dptech-corp/Uni-3DAR",countDownloads:'path_extension:"pt"'},"unity-sentis":{prettyLabel:"unity-sentis",repoName:"unity-sentis",repoUrl:"https://github.com/Unity-Technologies/sentis-samples",snippets:nc,filter:!0,countDownloads:'path_extension:"sentis"'},sana:{prettyLabel:"Sana",repoName:"Sana",repoUrl:"https://github.com/NVlabs/Sana",countDownloads:'path_extension:"pth"',snippets:ac},videoprism:{prettyLabel:"VideoPrism",repoName:"VideoPrism",repoUrl:"https://github.com/google-deepmind/videoprism",countDownloads:'path_extension:"npz"',snippets:oc},"vfi-mamba":{prettyLabel:"VFIMamba",repoName:"VFIMamba",repoUrl:"https://github.com/MCG-NJU/VFIMamba",countDownloads:'path_extension:"pkl"',snippets:rc},lvface:{prettyLabel:"LVFace",repoName:"LVFace",repoUrl:"https://github.com/bytedance/LVFace",countDownloads:'path_extension:"pt" OR path_extension:"onnx"',snippets:sc},voicecraft:{prettyLabel:"VoiceCraft",repoName:"VoiceCraft",repoUrl:"https://github.com/jasonppy/VoiceCraft",docsUrl:"https://github.com/jasonppy/VoiceCraft",snippets:lc},voxcpm:{prettyLabel:"VoxCPM",repoName:"VoxCPM",repoUrl:"https://github.com/OpenBMB/VoxCPM",snippets:cc,filter:!1},vui:{prettyLabel:"Vui",repoName:"Vui",repoUrl:"https://github.com/vui-ai/vui",countDownloads:'path_extension:"pt"',snippets:pc},vibevoice:{prettyLabel:"VibeVoice",repoName:"VibeVoice",repoUrl:"https://github.com/microsoft/VibeVoice",snippets:ic,filter:!1},videox_fun:{prettyLabel:"VideoX Fun",repoName:"VideoX Fun",repoUrl:"https://github.com/aigc-apps/VideoX-Fun",filter:!1,countDownloads:'path_extension:"safetensors"'},"wan2.2":{prettyLabel:"Wan2.2",repoName:"Wan2.2",repoUrl:"https://github.com/Wan-Video/Wan2.2",countDownloads:'path_filename:"config" AND path_extension:"json"'},wham:{prettyLabel:"WHAM",repoName:"wham",repoUrl:"https://huggingface.co/microsoft/wham",docsUrl:"https://huggingface.co/microsoft/wham/blob/main/README.md",countDownloads:'path_extension:"ckpt"'},whisperkit:{prettyLabel:"WhisperKit",repoName:"WhisperKit",repoUrl:"https://github.com/argmaxinc/WhisperKit",docsUrl:"https://github.com/argmaxinc/WhisperKit?tab=readme-ov-file#homebrew",snippets:jc,countDownloads:'path_filename:"model" AND path_extension:"mil" AND _exists_:"path_prefix"'},yolov10:{prettyLabel:"YOLOv10",repoName:"YOLOv10",repoUrl:"https://github.com/THU-MIG/yolov10",docsUrl:"https://github.com/THU-MIG/yolov10",countDownloads:'path_extension:"pt" OR path_extension:"safetensors"',snippets:xt},yolov26:{prettyLabel:"YOLOv26",repoName:"YOLOv26",repoUrl:"https://github.com/ultralytics/ultralytics",docsUrl:"https://docs.ultralytics.com/models/yolo26/",countDownloads:'path_extension:"pt" OR path_extension:"safetensors"'},zonos:{prettyLabel:"Zonos",repoName:"Zonos",repoUrl:"https://github.com/Zyphra/Zonos",docsUrl:"https://github.com/Zyphra/Zonos",snippets:Nc,filter:!1},"3dtopia-xl":{prettyLabel:"3DTopia-XL",repoName:"3DTopia-XL",repoUrl:"https://github.com/3DTopia/3DTopia-XL",filter:!1,countDownloads:'path:"model_vae_fp16.pt"',snippets:Mc}};Object.entries(Oc).filter(([e,t])=>t.filter).map(([e])=>e);var v;(function(e){e[e.F32=0]="F32",e[e.F16=1]="F16",e[e.Q4_0=2]="Q4_0",e[e.Q4_1=3]="Q4_1",e[e.Q4_1_SOME_F16=4]="Q4_1_SOME_F16",e[e.Q4_2=5]="Q4_2",e[e.Q4_3=6]="Q4_3",e[e.Q8_0=7]="Q8_0",e[e.Q5_0=8]="Q5_0",e[e.Q5_1=9]="Q5_1",e[e.Q2_K=10]="Q2_K",e[e.Q3_K_S=11]="Q3_K_S",e[e.Q3_K_M=12]="Q3_K_M",e[e.Q3_K_L=13]="Q3_K_L",e[e.Q4_K_S=14]="Q4_K_S",e[e.Q4_K_M=15]="Q4_K_M",e[e.Q5_K_S=16]="Q5_K_S",e[e.Q5_K_M=17]="Q5_K_M",e[e.Q6_K=18]="Q6_K",e[e.IQ2_XXS=19]="IQ2_XXS",e[e.IQ2_XS=20]="IQ2_XS",e[e.Q2_K_S=21]="Q2_K_S",e[e.IQ3_XS=22]="IQ3_XS",e[e.IQ3_XXS=23]="IQ3_XXS",e[e.IQ1_S=24]="IQ1_S",e[e.IQ4_NL=25]="IQ4_NL",e[e.IQ3_S=26]="IQ3_S",e[e.IQ3_M=27]="IQ3_M",e[e.IQ2_S=28]="IQ2_S",e[e.IQ2_M=29]="IQ2_M",e[e.IQ4_XS=30]="IQ4_XS",e[e.IQ1_M=31]="IQ1_M",e[e.BF16=32]="BF16",e[e.Q4_0_4_4=33]="Q4_0_4_4",e[e.Q4_0_4_8=34]="Q4_0_4_8",e[e.Q4_0_8_8=35]="Q4_0_8_8",e[e.TQ1_0=36]="TQ1_0",e[e.TQ2_0=37]="TQ2_0",e[e.MXFP4_MOE=38]="MXFP4_MOE",e[e.Q2_K_XL=1e3]="Q2_K_XL",e[e.Q3_K_XL=1001]="Q3_K_XL",e[e.Q4_K_XL=1002]="Q4_K_XL",e[e.Q5_K_XL=1003]="Q5_K_XL",e[e.Q6_K_XL=1004]="Q6_K_XL",e[e.Q8_K_XL=1005]="Q8_K_XL"})(v||(v={}));const qc=Object.values(v).filter(e=>typeof e=="string");new RegExp(`(?<quant>${qc.join("|")})(_(?<sizeVariation>[A-Z]+))?`);v.F32,v.BF16,v.F16,v.Q8_K_XL,v.Q8_0,v.Q6_K_XL,v.Q6_K,v.Q5_K_XL,v.Q5_K_M,v.Q5_K_S,v.Q5_0,v.Q5_1,v.Q4_K_XL,v.Q4_K_M,v.Q4_K_S,v.IQ4_NL,v.IQ4_XS,v.Q4_0_4_4,v.Q4_0_4_8,v.Q4_0_8_8,v.Q4_1_SOME_F16,v.Q4_0,v.Q4_1,v.Q4_2,v.Q4_3,v.MXFP4_MOE,v.Q3_K_XL,v.Q3_K_L,v.Q3_K_M,v.Q3_K_S,v.IQ3_M,v.IQ3_S,v.IQ3_XS,v.IQ3_XXS,v.Q2_K_XL,v.Q2_K,v.Q2_K_S,v.IQ2_M,v.IQ2_S,v.IQ2_XS,v.IQ2_XXS,v.IQ1_S,v.IQ1_M,v.TQ1_0,v.TQ2_0;var kt;(function(e){e[e.F32=0]="F32",e[e.F16=1]="F16",e[e.Q4_0=2]="Q4_0",e[e.Q4_1=3]="Q4_1",e[e.Q5_0=6]="Q5_0",e[e.Q5_1=7]="Q5_1",e[e.Q8_0=8]="Q8_0",e[e.Q8_1=9]="Q8_1",e[e.Q2_K=10]="Q2_K",e[e.Q3_K=11]="Q3_K",e[e.Q4_K=12]="Q4_K",e[e.Q5_K=13]="Q5_K",e[e.Q6_K=14]="Q6_K",e[e.Q8_K=15]="Q8_K",e[e.IQ2_XXS=16]="IQ2_XXS",e[e.IQ2_XS=17]="IQ2_XS",e[e.IQ3_XXS=18]="IQ3_XXS",e[e.IQ1_S=19]="IQ1_S",e[e.IQ4_NL=20]="IQ4_NL",e[e.IQ3_S=21]="IQ3_S",e[e.IQ2_S=22]="IQ2_S",e[e.IQ4_XS=23]="IQ4_XS",e[e.I8=24]="I8",e[e.I16=25]="I16",e[e.I32=26]="I32",e[e.I64=27]="I64",e[e.F64=28]="F64",e[e.IQ1_M=29]="IQ1_M",e[e.BF16=30]="BF16",e[e.TQ1_0=34]="TQ1_0",e[e.TQ2_0=35]="TQ2_0",e[e.MXFP4=39]="MXFP4"})(kt||(kt={}));const Bc={js:{fetch:{basic:`async function query(data) {
	const response = await fetch(
		"{{ fullUrl }}",
		{
			headers: {
				Authorization: "{{ authorizationHeader }}",
				"Content-Type": "application/json",
{% if billTo %}
				"X-HF-Bill-To": "{{ billTo }}",
{% endif %}			},
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.json();
	return result;
}

query({ inputs: {{ providerInputs.asObj.inputs }} }).then((response) => {
    console.log(JSON.stringify(response));
});`,basicAudio:`async function query(data) {
	const response = await fetch(
		"{{ fullUrl }}",
		{
			headers: {
				Authorization: "{{ authorizationHeader }}",
				"Content-Type": "audio/flac",
{% if billTo %}
				"X-HF-Bill-To": "{{ billTo }}",
{% endif %}			},
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.json();
	return result;
}

query({ inputs: {{ providerInputs.asObj.inputs }} }).then((response) => {
    console.log(JSON.stringify(response));
});`,basicImage:`async function query(data) {
	const response = await fetch(
		"{{ fullUrl }}",
		{
			headers: {
				Authorization: "{{ authorizationHeader }}",
				"Content-Type": "image/jpeg",
{% if billTo %}
				"X-HF-Bill-To": "{{ billTo }}",
{% endif %}			},
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.json();
	return result;
}

query({ inputs: {{ providerInputs.asObj.inputs }} }).then((response) => {
    console.log(JSON.stringify(response));
});`,conversational:`async function query(data) {
	const response = await fetch(
		"{{ fullUrl }}",
		{
			headers: {
				Authorization: "{{ authorizationHeader }}",
				"Content-Type": "application/json",
{% if billTo %}
				"X-HF-Bill-To": "{{ billTo }}",
{% endif %}			},
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.json();
	return result;
}

query({ 
{{ autoInputs.asTsString }}
}).then((response) => {
    console.log(JSON.stringify(response));
});`,imageToImage:`const image = fs.readFileSync("{{inputs.asObj.inputs}}");

async function query(data) {
	const response = await fetch(
		"{{ fullUrl }}",
		{
			headers: {
				Authorization: "{{ authorizationHeader }}",
				"Content-Type": "image/jpeg",
{% if billTo %}
				"X-HF-Bill-To": "{{ billTo }}",
{% endif %}			},
			method: "POST",
			body: {
				"inputs": \`data:image/png;base64,\${data.inputs.encode("base64")}\`,
				"parameters": data.parameters,
			}
		}
	);
	const result = await response.json();
	return result;
}

query({ 
	inputs: image,
	parameters: {
		prompt: "{{ inputs.asObj.parameters.prompt }}",
	}
}).then((response) => {
    console.log(JSON.stringify(response));
});`,imageToVideo:`const image = fs.readFileSync("{{inputs.asObj.inputs}}");

async function query(data) {
	const response = await fetch(
		"{{ fullUrl }}",
		{
			headers: {
				Authorization: "{{ authorizationHeader }}",
				"Content-Type": "image/jpeg",
{% if billTo %}
				"X-HF-Bill-To": "{{ billTo }}",
{% endif %}			},
			method: "POST",
			body: {
				"image_url": \`data:image/png;base64,\${data.image.encode("base64")}\`,
				"prompt": data.prompt,
			}
		}
	);
	const result = await response.json();
	return result;
}

query({
	"image": image,
	"prompt": "{{inputs.asObj.parameters.prompt}}",
}).then((response) => {
    // Use video
});`,textToAudio:`{% if model.library_name == "transformers" %}
async function query(data) {
	const response = await fetch(
		"{{ fullUrl }}",
		{
			headers: {
				Authorization: "{{ authorizationHeader }}",
				"Content-Type": "application/json",
{% if billTo %}
				"X-HF-Bill-To": "{{ billTo }}",
{% endif %}			},
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.blob();
    return result;
}

query({ inputs: {{ providerInputs.asObj.inputs }} }).then((response) => {
    // Returns a byte object of the Audio wavform. Use it directly!
});
{% else %}
async function query(data) {
	const response = await fetch(
		"{{ fullUrl }}",
		{
			headers: {
				Authorization: "{{ authorizationHeader }}",
				"Content-Type": "application/json",
			},
			method: "POST",
			body: JSON.stringify(data),
		}
	);
    const result = await response.json();
    return result;
}

query({ inputs: {{ providerInputs.asObj.inputs }} }).then((response) => {
    console.log(JSON.stringify(response));
});
{% endif %} `,textToImage:`async function query(data) {
	const response = await fetch(
		"{{ fullUrl }}",
		{
			headers: {
				Authorization: "{{ authorizationHeader }}",
				"Content-Type": "application/json",
{% if billTo %}
				"X-HF-Bill-To": "{{ billTo }}",
{% endif %}			},
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.blob();
	return result;
}


query({ {{ providerInputs.asTsString }} }).then((response) => {
    // Use image
});`,textToSpeech:`{% if model.library_name == "transformers" %}
async function query(data) {
	const response = await fetch(
		"{{ fullUrl }}",
		{
			headers: {
				Authorization: "{{ authorizationHeader }}",
				"Content-Type": "application/json",
{% if billTo %}
				"X-HF-Bill-To": "{{ billTo }}",
{% endif %}			},
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.blob();
    return result;
}

query({ text: {{ inputs.asObj.inputs }} }).then((response) => {
    // Returns a byte object of the Audio wavform. Use it directly!
});
{% else %}
async function query(data) {
	const response = await fetch(
		"{{ fullUrl }}",
		{
			headers: {
				Authorization: "{{ authorizationHeader }}",
				"Content-Type": "application/json",
			},
			method: "POST",
			body: JSON.stringify(data),
		}
	);
    const result = await response.json();
    return result;
}

query({ text: {{ inputs.asObj.inputs }} }).then((response) => {
    console.log(JSON.stringify(response));
});
{% endif %} `,zeroShotClassification:`async function query(data) {
    const response = await fetch(
		"{{ fullUrl }}",
        {
            headers: {
				Authorization: "{{ authorizationHeader }}",
                "Content-Type": "application/json",
{% if billTo %}
                "X-HF-Bill-To": "{{ billTo }}",
{% endif %}         },
            method: "POST",
            body: JSON.stringify(data),
        }
    );
    const result = await response.json();
    return result;
}

query({
    inputs: {{ providerInputs.asObj.inputs }},
    parameters: { candidate_labels: ["refund", "legal", "faq"] }
}).then((response) => {
    console.log(JSON.stringify(response));
});`},"huggingface.js":{basic:`import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient("{{ accessToken }}");

const output = await client.{{ methodName }}({
{% if endpointUrl %}
    endpointUrl: "{{ endpointUrl }}",
{% endif %}
	model: "{{ model.id }}",
	inputs: {{ inputs.asObj.inputs }},
	provider: "{{ provider }}",
}{% if billTo %}, {
	billTo: "{{ billTo }}",
}{% endif %});

console.log(output);`,basicAudio:`import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient("{{ accessToken }}");

const data = fs.readFileSync({{inputs.asObj.inputs}});

const output = await client.{{ methodName }}({
{% if endpointUrl %}
    endpointUrl: "{{ endpointUrl }}",
{% endif %}
	data,
	model: "{{ model.id }}",
	provider: "{{ provider }}",
}{% if billTo %}, {
	billTo: "{{ billTo }}",
}{% endif %});

console.log(output);`,basicImage:`import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient("{{ accessToken }}");

const data = fs.readFileSync({{inputs.asObj.inputs}});

const output = await client.{{ methodName }}({
{% if endpointUrl %}
    endpointUrl: "{{ endpointUrl }}",
{% endif %}
	data,
	model: "{{ model.id }}",
	provider: "{{ provider }}",
}{% if billTo %}, {
	billTo: "{{ billTo }}",
}{% endif %});

console.log(output);`,conversational:`import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient("{{ accessToken }}");

const chatCompletion = await client.chatCompletion({
{% if endpointUrl %}
    endpointUrl: "{{ endpointUrl }}",
{% endif %}
{% if directRequest %}
    provider: "{{ provider }}",
    model: "{{ model.id }}",
{% else %}
    model: "{{ providerModelId }}",
{% endif %}
{{ inputs.asTsString }}
}{% if billTo %}, {
    billTo: "{{ billTo }}",
}{% endif %});

console.log(chatCompletion.choices[0].message);`,conversationalStream:`import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient("{{ accessToken }}");

let out = "";

const stream = client.chatCompletionStream({
{% if endpointUrl %}
    endpointUrl: "{{ endpointUrl }}",
{% endif %}
    model: "{{ providerModelId }}",
{{ inputs.asTsString }}
}{% if billTo %}, {
    billTo: "{{ billTo }}",
}{% endif %});

for await (const chunk of stream) {
	if (chunk.choices && chunk.choices.length > 0) {
		const newContent = chunk.choices[0].delta.content;
		out += newContent;
		console.log(newContent);
	}
}`,imageToImage:`import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient("{{ accessToken }}");

const data = fs.readFileSync("{{inputs.asObj.inputs}}");

const image = await client.imageToImage({
{% if endpointUrl %}
	endpointUrl: "{{ endpointUrl }}",
{% endif %}
	provider: "{{provider}}",
	model: "{{model.id}}",
	inputs: data,
	parameters: { prompt: "{{inputs.asObj.parameters.prompt}}", },
}{% if billTo %}, {
	billTo: "{{ billTo }}",
}{% endif %});
/// Use the generated image (it's a Blob)
// For example, you can save it to a file or display it in an image element
`,imageToVideo:`import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient("{{ accessToken }}");

const data = fs.readFileSync("{{inputs.asObj.inputs}}");

const video = await client.imageToVideo({
{% if endpointUrl %}
	endpointUrl: "{{ endpointUrl }}",
{% endif %}
	provider: "{{provider}}",
	model: "{{model.id}}",
	inputs: data,
	parameters: { prompt: "{{inputs.asObj.parameters.prompt}}", },
}{% if billTo %}, {
	billTo: "{{ billTo }}",
}{% endif %});

/// Use the generated video (it's a Blob)
// For example, you can save it to a file or display it in a video element
`,textToImage:`import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient("{{ accessToken }}");

const image = await client.textToImage({
{% if endpointUrl %}
    endpointUrl: "{{ endpointUrl }}",
{% endif %}
    provider: "{{ provider }}",
    model: "{{ model.id }}",
	inputs: {{ inputs.asObj.inputs }},
	parameters: { num_inference_steps: 5 },
}{% if billTo %}, {
    billTo: "{{ billTo }}",
}{% endif %});
/// Use the generated image (it's a Blob)`,textToSpeech:`import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient("{{ accessToken }}");

const audio = await client.textToSpeech({
{% if endpointUrl %}
    endpointUrl: "{{ endpointUrl }}",
{% endif %}
    provider: "{{ provider }}",
    model: "{{ model.id }}",
	inputs: {{ inputs.asObj.inputs }},
}{% if billTo %}, {
    billTo: "{{ billTo }}",
}{% endif %});
// Use the generated audio (it's a Blob)`,textToVideo:`import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient("{{ accessToken }}");

const video = await client.textToVideo({
{% if endpointUrl %}
    endpointUrl: "{{ endpointUrl }}",
{% endif %}
    provider: "{{ provider }}",
    model: "{{ model.id }}",
	inputs: {{ inputs.asObj.inputs }},
}{% if billTo %}, {
    billTo: "{{ billTo }}",
}{% endif %});
// Use the generated video (it's a Blob)`},openai:{conversational:`import { OpenAI } from "openai";

const client = new OpenAI({
	baseURL: "{{ baseUrl }}",
	apiKey: "{{ accessToken }}",
{% if billTo %}
	defaultHeaders: {
		"X-HF-Bill-To": "{{ billTo }}" 
	}
{% endif %}
});

const chatCompletion = await client.chat.completions.create({
	model: "{{ providerModelId }}",
{{ inputs.asTsString }}
});

console.log(chatCompletion.choices[0].message);`,conversationalStream:`import { OpenAI } from "openai";

const client = new OpenAI({
	baseURL: "{{ baseUrl }}",
	apiKey: "{{ accessToken }}",
{% if billTo %}
    defaultHeaders: {
		"X-HF-Bill-To": "{{ billTo }}" 
	}
{% endif %}
});

const stream = await client.chat.completions.create({
    model: "{{ providerModelId }}",
{{ inputs.asTsString }}
    stream: true,
});

for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || "");
}`}},python:{fal_client:{imageToImage:`{%if provider == "fal-ai" %}
import fal_client
import base64

def on_queue_update(update):
    if isinstance(update, fal_client.InProgress):
        for log in update.logs:
           print(log["message"])

with open("{{inputs.asObj.inputs}}", "rb") as image_file:
    image_base_64 = base64.b64encode(image_file.read()).decode('utf-8')

result = fal_client.subscribe(
    "fal-ai/flux-kontext/dev",
    arguments={
        "prompt": f"data:image/png;base64,{image_base_64}",
        "image_url": "{{ providerInputs.asObj.inputs }}",
    },
    with_logs=True,
    on_queue_update=on_queue_update,
)
print(result)
{%endif%}
`,imageToVideo:`{%if provider == "fal-ai" %}
import fal_client
import base64

def on_queue_update(update):
    if isinstance(update, fal_client.InProgress):
        for log in update.logs:
           print(log["message"])

with open("{{inputs.asObj.inputs}}", "rb") as image_file:
    image_base_64 = base64.b64encode(image_file.read()).decode('utf-8')

result = fal_client.subscribe(
    "{{model.id}}",
    arguments={
        "image_url": f"data:image/png;base64,{image_base_64}",
        "prompt": "{{inputs.asObj.parameters.prompt}}",
    },
    with_logs=True,
    on_queue_update=on_queue_update,
)
print(result)
{%endif%}
`,textToImage:`{% if provider == "fal-ai" %}
import fal_client

{% if providerInputs.asObj.loras is defined and providerInputs.asObj.loras != none %}
result = fal_client.subscribe(
    "{{ providerModelId }}",
    arguments={
        "prompt": {{ inputs.asObj.inputs }},
        "loras":{{ providerInputs.asObj.loras | tojson }},
    },
)
{% else %}
result = fal_client.subscribe(
    "{{ providerModelId }}",
    arguments={
        "prompt": {{ inputs.asObj.inputs }},
    },
)
{% endif %} 
print(result)
{% endif %} `},huggingface_hub:{basic:`result = client.{{ methodName }}(
    {{ inputs.asObj.inputs }},
    model="{{ model.id }}",
)`,basicAudio:'output = client.{{ methodName }}({{ inputs.asObj.inputs }}, model="{{ model.id }}")',basicImage:'output = client.{{ methodName }}({{ inputs.asObj.inputs }}, model="{{ model.id }}")',conversational:`completion = client.chat.completions.create(
{% if directRequest %}
    model="{{ model.id }}",
{% else %}
    model="{{ providerModelId }}",
{% endif %}
{{ inputs.asPythonString }}
)

print(completion.choices[0].message) `,conversationalStream:`stream = client.chat.completions.create(
    model="{{ providerModelId }}",
{{ inputs.asPythonString }}
    stream=True,
)

for chunk in stream:
    print(chunk.choices[0].delta.content, end="") `,documentQuestionAnswering:`output = client.document_question_answering(
    "{{ inputs.asObj.image }}",
    question="{{ inputs.asObj.question }}",
    model="{{ model.id }}",
) `,imageToImage:`with open("{{ inputs.asObj.inputs }}", "rb") as image_file:
   input_image = image_file.read()

# output is a PIL.Image object
image = client.image_to_image(
    input_image,
    prompt="{{ inputs.asObj.parameters.prompt }}",
    model="{{ model.id }}",
)
`,imageToVideo:`with open("{{ inputs.asObj.inputs }}", "rb") as image_file:
   input_image = image_file.read()

video = client.image_to_video(
    input_image,
    prompt="{{ inputs.asObj.parameters.prompt }}",
    model="{{ model.id }}",
) 
`,importInferenceClient:`from huggingface_hub import InferenceClient

client = InferenceClient(
{% if endpointUrl %}
    base_url="{{ baseUrl }}",
{% endif %}
{% if task != "conversational" or directRequest %}
    provider="{{ provider }}",
{% endif %}
    api_key="{{ accessToken }}",
{% if billTo %}
    bill_to="{{ billTo }}",
{% endif %}
)`,questionAnswering:`answer = client.question_answering(
    question="{{ inputs.asObj.question }}",
    context="{{ inputs.asObj.context }}",
    model="{{ model.id }}",
) `,tableQuestionAnswering:`answer = client.table_question_answering(
    query="{{ inputs.asObj.query }}",
    table={{ inputs.asObj.table }},
    model="{{ model.id }}",
) `,textToImage:`# output is a PIL.Image object
image = client.text_to_image(
    {{ inputs.asObj.inputs }},
    model="{{ model.id }}",
) `,textToSpeech:`# audio is returned as bytes
audio = client.text_to_speech(
    {{ inputs.asObj.inputs }},
    model="{{ model.id }}",
) 
`,textToVideo:`video = client.text_to_video(
    {{ inputs.asObj.inputs }},
    model="{{ model.id }}",
) `},openai:{conversational:`from openai import OpenAI

client = OpenAI(
    base_url="{{ baseUrl }}",
    api_key="{{ accessToken }}",
{% if billTo %}
    default_headers={
        "X-HF-Bill-To": "{{ billTo }}"
    }
{% endif %}
)

completion = client.chat.completions.create(
    model="{{ providerModelId }}",
{{ inputs.asPythonString }}
)

print(completion.choices[0].message) `,conversationalStream:`from openai import OpenAI

client = OpenAI(
    base_url="{{ baseUrl }}",
    api_key="{{ accessToken }}",
{% if billTo %}
    default_headers={
        "X-HF-Bill-To": "{{ billTo }}"
    }
{% endif %}
)

stream = client.chat.completions.create(
    model="{{ providerModelId }}",
{{ inputs.asPythonString }}
    stream=True,
)

for chunk in stream:
    print(chunk.choices[0].delta.content, end="")`},requests:{basic:`def query(payload):
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.json()

output = query({
    "inputs": {{ providerInputs.asObj.inputs }},
}) `,basicAudio:`def query(filename):
    with open(filename, "rb") as f:
        data = f.read()
    response = requests.post(API_URL, headers={"Content-Type": "audio/flac", **headers}, data=data)
    return response.json()

output = query({{ providerInputs.asObj.inputs }})`,basicImage:`def query(filename):
    with open(filename, "rb") as f:
        data = f.read()
    response = requests.post(API_URL, headers={"Content-Type": "image/jpeg", **headers}, data=data)
    return response.json()

output = query({{ providerInputs.asObj.inputs }})`,conversational:`def query(payload):
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.json()

response = query({
{{ autoInputs.asJsonString }}
})

print(response["choices"][0]["message"])`,conversationalStream:`def query(payload):
    response = requests.post(API_URL, headers=headers, json=payload, stream=True)
    for line in response.iter_lines():
        if not line.startswith(b"data:"):
            continue
        if line.strip() == b"data: [DONE]":
            return
        yield json.loads(line.decode("utf-8").lstrip("data:").rstrip("/n"))

chunks = query({
{{ autoInputs.asJsonString }},
    "stream": True,
})

for chunk in chunks:
    print(chunk["choices"][0]["delta"]["content"], end="")`,documentQuestionAnswering:`def query(payload):
    with open(payload["image"], "rb") as f:
        img = f.read()
        payload["image"] = base64.b64encode(img).decode("utf-8")
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.json()

output = query({
    "inputs": {
        "image": "{{ inputs.asObj.image }}",
        "question": "{{ inputs.asObj.question }}",
    },
}) `,imageToImage:`
def query(payload):
    with open(payload["inputs"], "rb") as f:
        img = f.read()
        payload["inputs"] = base64.b64encode(img).decode("utf-8")
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.content

image_bytes = query({
{{ providerInputs.asJsonString }}
})

# You can access the image with PIL.Image for example
import io
from PIL import Image
image = Image.open(io.BytesIO(image_bytes)) `,imageToVideo:`
def query(payload):
    with open(payload["inputs"], "rb") as f:
        img = f.read()
        payload["inputs"] = base64.b64encode(img).decode("utf-8")
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.content

video_bytes = query({
{{ inputs.asJsonString }}
})
`,importRequests:`{% if importBase64 %}
import base64
{% endif %}
{% if importJson %}
import json
{% endif %}
import requests

API_URL = "{{ fullUrl }}"
headers = {
    "Authorization": "{{ authorizationHeader }}",
{% if billTo %}
    "X-HF-Bill-To": "{{ billTo }}"
{% endif %}
}`,tabular:`def query(payload):
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.content

response = query({
    "inputs": {
        "data": {{ providerInputs.asObj.inputs }}
    },
}) `,textToAudio:`{% if model.library_name == "transformers" %}
def query(payload):
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.content

audio_bytes = query({
    "inputs": {{ inputs.asObj.inputs }},
})
# You can access the audio with IPython.display for example
from IPython.display import Audio
Audio(audio_bytes)
{% else %}
def query(payload):
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.json()

audio, sampling_rate = query({
    "inputs": {{ inputs.asObj.inputs }},
})
# You can access the audio with IPython.display for example
from IPython.display import Audio
Audio(audio, rate=sampling_rate)
{% endif %} `,textToImage:`{% if provider == "hf-inference" %}
def query(payload):
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.content

image_bytes = query({
    "inputs": {{ providerInputs.asObj.inputs }},
})

# You can access the image with PIL.Image for example
import io
from PIL import Image
image = Image.open(io.BytesIO(image_bytes))
{% endif %}`,textToSpeech:`{% if model.library_name == "transformers" %}
def query(payload):
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.content

audio_bytes = query({
    "text": {{ inputs.asObj.inputs }},
})
# You can access the audio with IPython.display for example
from IPython.display import Audio
Audio(audio_bytes)
{% else %}
def query(payload):
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.json()

audio, sampling_rate = query({
    "text": {{ inputs.asObj.inputs }},
})
# You can access the audio with IPython.display for example
from IPython.display import Audio
Audio(audio, rate=sampling_rate)
{% endif %} `,zeroShotClassification:`def query(payload):
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.json()

output = query({
    "inputs": {{ providerInputs.asObj.inputs }},
    "parameters": {"candidate_labels": ["refund", "legal", "faq"]},
}) `,zeroShotImageClassification:`def query(data):
    with open(data["image_path"], "rb") as f:
        img = f.read()
    payload={
        "parameters": data["parameters"],
        "inputs": base64.b64encode(img).decode("utf-8")
    }
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.json()

output = query({
    "image_path": {{ providerInputs.asObj.inputs }},
    "parameters": {"candidate_labels": ["cat", "dog", "llama"]},
}) `}},sh:{curl:{basic:`curl {{ fullUrl }} \\
    -X POST \\
    -H 'Authorization: {{ authorizationHeader }}' \\
    -H 'Content-Type: application/json' \\
{% if billTo %}
    -H 'X-HF-Bill-To: {{ billTo }}' \\
{% endif %}
    -d '{
{{ providerInputs.asCurlString }}
    }'`,basicAudio:`curl {{ fullUrl }} \\
    -X POST \\
    -H 'Authorization: {{ authorizationHeader }}' \\
    -H 'Content-Type: audio/flac' \\
{% if billTo %}
    -H 'X-HF-Bill-To: {{ billTo }}' \\
{% endif %}
    --data-binary @{{ providerInputs.asObj.inputs }}`,basicImage:`curl {{ fullUrl }} \\
    -X POST \\
    -H 'Authorization: {{ authorizationHeader }}' \\
    -H 'Content-Type: image/jpeg' \\
{% if billTo %}
    -H 'X-HF-Bill-To: {{ billTo }}' \\
{% endif %}
    --data-binary @{{ providerInputs.asObj.inputs }}`,conversational:`curl {{ fullUrl }} \\
    -H 'Authorization: {{ authorizationHeader }}' \\
    -H 'Content-Type: application/json' \\
{% if billTo %}
    -H 'X-HF-Bill-To: {{ billTo }}' \\
{% endif %}
    -d '{
{{ autoInputs.asCurlString }},
        "stream": false
    }'`,conversationalStream:`curl {{ fullUrl }} \\
    -H 'Authorization: {{ authorizationHeader }}' \\
    -H 'Content-Type: application/json' \\
{% if billTo %}
    -H 'X-HF-Bill-To: {{ billTo }}' \\
{% endif %}
    -d '{
{{ autoInputs.asCurlString }},
        "stream": true
    }'`,zeroShotClassification:`curl {{ fullUrl }} \\
    -X POST \\
    -d '{"inputs": {{ providerInputs.asObj.inputs }}, "parameters": {"candidate_labels": ["refund", "legal", "faq"]}}' \\
    -H 'Content-Type: application/json' \\
    -H 'Authorization: {{ authorizationHeader }}'
{% if billTo %} \\
    -H 'X-HF-Bill-To: {{ billTo }}'
{% endif %}`}}},Wt=(e,t,n)=>{const a=Bc[e]?.[t]?.[n];if(!a)throw new Error(`Template not found: ${e}/${t}/${n}`);return i=>new ko(a).render({...i})};Wt("python","huggingface_hub","importInferenceClient");Wt("python","requests","importRequests");export{Fc as HfInference,Qe as InferenceClient,Ee as InferenceClientError,we as InferenceClientHubApiError,D as InferenceClientInputError,N as InferenceClientProviderApiError,h as InferenceClientProviderOutputError,en as InferenceClientRoutingError,Me as PROVIDERS,za as audioClassification,Wa as audioToAudio,Xa as automaticSpeechRecognition,li as chatCompletion,ci as chatCompletionStream,xi as documentQuestionAnswering,pi as featureExtraction,di as fillMask,P as getProviderHelper,Ja as imageClassification,Ya as imageSegmentation,ti as imageTextToImage,ni as imageTextToVideo,Za as imageToImage,Ga as imageToText,ei as imageToVideo,le as makeRequestOptions,rt as makeRequestOptionsFromResolvedModel,ai as objectDetection,ui as questionAnswering,Ha as request,mi as sentenceSimilarity,Ka as streamingRequest,fi as summarization,gi as tableQuestionAnswering,Ai as tabularClassification,Ii as tabularRegression,hi as textClassification,bi as textGeneration,yi as textGenerationStream,ii as textToImage,Qa as textToSpeech,oi as textToVideo,wi as tokenClassification,vi as translation,ki as visualQuestionAnswering,_i as zeroShotClassification,si as zeroShotImageClassification};
