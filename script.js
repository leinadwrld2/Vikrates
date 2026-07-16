import * as THREE from "three";
import { db } from "./firebase-config.js";

import {
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const API_KEY="873659d253950812b2f2a182";

const API_URL=
`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/NGN`;

const officialContainer=document.getElementById("officialRates");
const blackContainer=document.getElementById("blackRates");
const search=document.getElementById("search");
const lastUpdated=document.getElementById("lastUpdated");
const themeBtn=document.getElementById("theme");

async function getOfficialRates(){

try{

const response=await fetch(API_URL);
const data=await response.json();

return data.conversion_rates;

}catch(error){

console.log(error);

return null;

}

}

async function loadRates(){

officialContainer.innerHTML="<p>Loading...</p>";
blackContainer.innerHTML="<p>Loading...</p>";

try{

const officialRates=await getOfficialRates();

const snapshot=
await getDocs(collection(db,"rates"));

const firestoreRates=[];

officialContainer.innerHTML="";
blackContainer.innerHTML="";

snapshot.forEach(doc=>{

const rate=doc.data();

firestoreRates.push(rate);

const officialRate=
officialRates && officialRates[rate.currency]
? (1/officialRates[rate.currency]).toFixed(2)
: "N/A";

officialContainer.innerHTML+=`

<div class="card">

<div class="flag">${rate.flag}</div>

<div class="currency">${rate.currency}</div>

<div class="rate-title">
Official Rate
</div>

<div class="buy">
₦${officialRate}
</div>

</div>

`;

blackContainer.innerHTML+=`

<div class="card">

<div class="flag">${rate.flag}</div>

<div class="currency">${rate.currency}</div>

<div class="rate-title">
Black Buy
</div>

<div class="buy">
₦${rate.blackBuy}
</div>

<div class="rate-title">
Black Sell
</div>

<div class="sell">
₦${rate.blackSell}
</div>

</div>

`;

});

updatePopular(officialRates,firestoreRates);
  converterRates = officialRates;
initializeConverter();

}catch(error){

console.log(error);

officialContainer.innerHTML=
"<h3>Unable to load rates.</h3>";

blackContainer.innerHTML="";

}

}

loadRates();

/*==============================
  POPULAR CURRENCIES
==============================*/

function updatePopular(officialRates, firestoreRates){

const currencies=["USD","GBP","EUR","PLN"];

currencies.forEach(currency=>{

const rate=
firestoreRates.find(r=>r.currency===currency);

if(!rate) return;

const official=
officialRates && officialRates[currency]
? (1/officialRates[currency]).toFixed(2)
: "N/A";

const officialElement=
document.getElementById(currency.toLowerCase()+"Official");

const trendText =
document.getElementById(currency.toLowerCase()+"Trend");

const trendIcon =
document.getElementById(currency.toLowerCase()+"TrendIcon");

const trendBox =
document.getElementById(currency.toLowerCase()+"TrendBox");
  if(
!officialElement ||
!trendText ||
!trendIcon ||
!trendBox
){
    return;
}
  officialElement.innerHTML = "₦" + official;

if(official==="N/A") return;

const currentRate=parseFloat(official);

const previousRate =
parseFloat(localStorage.getItem(currency));

if(!isNaN(previousRate)){

const change =
((currentRate - previousRate) / previousRate) * 100;

const percent =
Math.abs(change).toFixed(2);

if(change >= 0){

trendBox.className = "rate-change up";
trendIcon.className = "fa-solid fa-arrow-trend-up";
trendText.innerHTML = percent + "%";

}else{

trendBox.className = "rate-change down";
trendIcon.className = "fa-solid fa-arrow-trend-down";
trendText.innerHTML = percent + "%";

}

}else{

trendBox.className = "rate-change up";
trendIcon.className = "fa-solid fa-arrow-right";
trendText.innerHTML = "0.00%";

}

localStorage.setItem(currency,currentRate);

const updatedElement =
document.getElementById(currency.toLowerCase()+"Updated");

if(updatedElement){

updatedElement.innerHTML =
"Updated " +
new Date().toLocaleTimeString([],{
hour:"2-digit",
minute:"2-digit"
});

}
  
}); // closes currencies.forEach()

}
/*==============================
 SEARCH
==============================*/

if(search){

search.addEventListener("keyup",()=>{

const value=search.value.toLowerCase();

document.querySelectorAll(".card").forEach(card=>{

card.style.display=

card.innerText.toLowerCase().includes(value)

?

"block"

:

"none";

});

});

}

/*==============================
 LAST UPDATED
==============================*/

function updateTime(){

if(lastUpdated){

lastUpdated.innerHTML=

"Last Updated : "+

new Date().toLocaleString();

}

}

updateTime();

setInterval(updateTime,1000);


/*==============================
 MOBILE MENU
==============================*/

const menuBtn=document.getElementById("menuBtn");

const closeMenu=document.getElementById("closeMenu");

const mobileMenu=document.getElementById("mobileMenu");

if(menuBtn && mobileMenu){

menuBtn.addEventListener("click",()=>{

mobileMenu.classList.add("active");

});

}

if(closeMenu && mobileMenu){

closeMenu.addEventListener("click",()=>{

mobileMenu.classList.remove("active");

});

}
/*==============================
  CURRENCY CONVERTER
==============================*/

const amountInput = document.getElementById("amount");
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const convertBtn = document.getElementById("convertBtn");
const swapBtn = document.getElementById("swapBtn");
const conversionResult =
document.getElementById("conversionResult");

let converterRates = null;
/*==============================
 CUSTOM DROPDOWN DATA
==============================*/

const currencyInfo = {

USD:{name:"US Dollar",country:"us"},
NGN:{name:"Nigerian Naira",country:"ng"},
GBP:{name:"British Pound",country:"gb"},
EUR:{name:"Euro",country:"eu"},
PLN:{name:"Polish Zloty",country:"pl"},
CAD:{name:"Canadian Dollar",country:"ca"},
AUD:{name:"Australian Dollar",country:"au"},
JPY:{name:"Japanese Yen",country:"jp"},
CNY:{name:"Chinese Yuan",country:"cn"},
CHF:{name:"Swiss Franc",country:"ch"}

};

function getCurrencyInfo(currency){

if(currencyInfo[currency]){

return{

name:currencyInfo[currency].name,

flag:`https://flagcdn.com/w40/${currencyInfo[currency].country}.png`

};

}

const country = currency.substring(0,2).toLowerCase();

return{

name:currency,

flag:`https://flagcdn.com/w40/${country}.png`

};

}

function createOption(currency){

const info = getCurrencyInfo(currency);

return `

<div class="option" data-currency="${currency}">

<img
src="${info.flag}"
onerror="this.src='https://flagcdn.com/w40/un.png'">

<div>

<h4>${currency}</h4>

<p>${info.name}</p>

</div>

</div>

`;

}

return `

<div class="option"

data-currency="${currency}">

<img src="${info.flag}">

<div>

<h4>${currency}</h4>

<p>${info.name}</p>

</div>

</div>

`;

}
function updateSelected(type,currency){

const info = getCurrencyInfo(currency);

document.getElementById(type+"Code").innerHTML = currency;

document.getElementById(type+"Name").innerHTML = info.name;

const flag = document.getElementById(type+"Flag");

flag.src = info.flag;

flag.onerror = ()=>{

flag.src = "https://flagcdn.com/w40/un.png";

};

}
function initializeCustomDropdowns(){

const fromSelect=document.getElementById("fromSelect");

const toSelect=document.getElementById("toSelect");

const fromOptions=document.getElementById("fromOptions");

const toOptions=document.getElementById("toOptions");

fromOptions.innerHTML="";

toOptions.innerHTML="";

Object.keys(converterRates).sort().forEach(currency=>{

fromOptions.innerHTML+=createOption(currency);

toOptions.innerHTML+=createOption(currency);

});
  
document.addEventListener("click",(e)=>{

if(!fromSelect.contains(e.target)){

fromSelect.classList.remove("active");

}

if(!toSelect.contains(e.target)){

toSelect.classList.remove("active");

}

});
document.querySelectorAll("#fromOptions .option")

.forEach(option=>{

option.onclick=()=>{

const currency=

option.dataset.currency;

fromCurrency.value=currency;

updateSelected("from",currency);

convertCurrency();

fromSelect.classList.remove("active");

};

});

document.querySelectorAll("#toOptions .option")

.forEach(option=>{

option.onclick=()=>{

const currency=

option.dataset.currency;

toCurrency.value=currency;

updateSelected("to",currency);

convertCurrency();

toSelect.classList.remove("active");

};

});

fromSelect.querySelector(".selected")

.onclick=()=>{

fromSelect.classList.toggle("active");

};

toSelect.querySelector(".selected")

.onclick=()=>{

toSelect.classList.toggle("active");

};

}

async function initializeConverter(){

if(!converterRates){

converterRates = await getOfficialRates();

}

if(!converterRates) return;

/* Hidden selects */

fromCurrency.innerHTML="";
toCurrency.innerHTML="";

Object.keys(converterRates)

.sort()

.forEach(currency=>{

fromCurrency.innerHTML+=
`<option value="${currency}">
${currency}
</option>`;

toCurrency.innerHTML+=
`<option value="${currency}">
${currency}
</option>`;

});

fromCurrency.value="USD";
toCurrency.value="NGN";
  

/* Update custom UI */

updateSelected("from","USD");

updateSelected("to","NGN");

/* Build dropdown */

initializeCustomDropdowns();

/* Convert */

convertCurrency();

}

function convertCurrency(){

if(!converterRates) return;

const amount = parseFloat(amountInput.value) || 0;

const from = fromCurrency.value;
const to = toCurrency.value;

const ngnFrom = 1 / converterRates[from];
const ngnTo = 1 / converterRates[to];

const result = amount * ngnFrom / ngnTo;

const formatter = new Intl.NumberFormat("en",{
style:"currency",
currency:to,
maximumFractionDigits:2
});

conversionResult.innerHTML = formatter.format(result);

document.getElementById("converterRate").innerHTML =
`1 ${from} = ${(ngnFrom/ngnTo).toFixed(4)} ${to}`;

}
if(
amountInput &&
fromCurrency &&
toCurrency &&
convertBtn &&
swapBtn &&
conversionResult
){

convertBtn.onclick = convertCurrency;

amountInput.oninput = convertCurrency;

fromCurrency.onchange = ()=>{

updateSelected("from", fromCurrency.value);

convertCurrency();

};

toCurrency.onchange = ()=>{

updateSelected("to", toCurrency.value);

convertCurrency();

};

swapBtn.onclick = ()=>{

const temp = fromCurrency.value;

fromCurrency.value = toCurrency.value;

toCurrency.value = temp;

updateSelected("from", fromCurrency.value);

updateSelected("to", toCurrency.value);

convertCurrency();

};

}
/*==============================
 AUTO REFRESH
==============================*/

setInterval(()=>{

loadRates();

},30000);
/*==============================
  3D GLOBE
==============================*/

const globeContainer = document.getElementById("globe3d");

if(globeContainer){

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(

45,

globeContainer.clientWidth /

globeContainer.clientHeight,

0.1,

1000

);

camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({

antialias:true,

alpha:true

});

renderer.setPixelRatio(window.devicePixelRatio);

renderer.setSize(

globeContainer.clientWidth,

globeContainer.clientHeight

);

globeContainer.appendChild(renderer.domElement);

/* Earth */

const geometry = new THREE.SphereGeometry(

1,

64,

64

);

const material = new THREE.MeshStandardMaterial({

color:0x2f80ff,

metalness:0.2,

roughness:0.7

});

const earth = new THREE.Mesh(

geometry,

material

);

scene.add(earth);

/* Lights */

const light = new THREE.DirectionalLight(

0xffffff,

2

);

light.position.set(

5,

3,

5

);

scene.add(light);

scene.add(

new THREE.AmbientLight(

0x6fa8ff,

1.5

)

);

/* Animation */

function animate(){

requestAnimationFrame(animate);

earth.rotation.y += 0.003;

renderer.render(scene,camera);

}

animate();

/* Resize */

window.addEventListener("resize",()=>{

camera.aspect =

globeContainer.clientWidth/

globeContainer.clientHeight;

camera.updateProjectionMatrix();

renderer.setSize(

globeContainer.clientWidth,

globeContainer.clientHeight

);

});

}
