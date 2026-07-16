import { db } from "./firebase-config.js";

import {
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

/*=========================================
            API
=========================================*/

const API_KEY = "873659d253950812b2f2a182";

const API_URL =
`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/NGN`;

/*=========================================
            DOM
=========================================*/

const officialContainer =
document.getElementById("officialRates");

const blackContainer =
document.getElementById("blackRates");

const search =
document.getElementById("search");

const lastUpdated =
document.getElementById("lastUpdated");

/* Popular */

const popularCurrencies = [
"USD",
"GBP",
"EUR",
"PLN"
];

/* Converter */

let converterRates = null;

/*=========================================
          MOBILE MENU
=========================================*/

const menuBtn =
document.getElementById("menuBtn");

const mobileMenu =
document.getElementById("mobileMenu");

const closeMenu =
document.getElementById("closeMenu");

if(menuBtn){

menuBtn.onclick=()=>{

mobileMenu.classList.add("active");

};

}

if(closeMenu){

closeMenu.onclick=()=>{

mobileMenu.classList.remove("active");

};

}

document.addEventListener("click",e=>{

if(

mobileMenu &&
!mobileMenu.contains(e.target) &&
!menuBtn.contains(e.target)

){

mobileMenu.classList.remove("active");

}

});

/*=========================================
            SEARCH
=========================================*/

if(search){

search.addEventListener("input",()=>{

const value =
search.value.toLowerCase();

document
.querySelectorAll(".card")
.forEach(card=>{

card.style.display =

card.innerText
.toLowerCase()
.includes(value)

?

"block"

:

"none";

});

});

}

/*=========================================
         LAST UPDATED
=========================================*/

function updateTime(){

if(lastUpdated){

lastUpdated.innerHTML =
"Last Updated • " +
new Date().toLocaleString();

}

}

updateTime();

setInterval(updateTime,1000);

/*=========================================
        GET OFFICIAL RATES
=========================================*/

async function getOfficialRates(){

try{

const response =
await fetch(API_URL);

const data =
await response.json();

return data.conversion_rates;

}catch(error){

console.error(error);

return null;

}

}
/*=========================================
        LOAD ALL RATES
=========================================*/

async function loadRates(){

officialContainer.innerHTML =
"<p>Loading...</p>";

blackContainer.innerHTML =
"<p>Loading...</p>";

try{

const officialRates =
await getOfficialRates();

converterRates = officialRates;

const snapshot =
await getDocs(
collection(db,"rates")
);

officialContainer.innerHTML = "";
blackContainer.innerHTML = "";

const firestoreRates = [];

snapshot.forEach(doc=>{

const rate = doc.data();

firestoreRates.push(rate);

const official =

officialRates &&
officialRates[rate.currency]

?

(1 / officialRates[rate.currency]).toFixed(2)

:

"N/A";

/* Official Card */

officialContainer.innerHTML += `

<div class="card">

<div class="flag">
${rate.flag}
</div>

<div class="currency">
${rate.currency}
</div>

<div class="rate-title">
Official Rate
</div>

<div class="buy">
₦${official}
</div>

</div>

`;

/* Black Market */

blackContainer.innerHTML += `

<div class="card">

<div class="flag">
${rate.flag}
</div>

<div class="currency">
${rate.currency}
</div>

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

/* Update Popular Cards */

updatePopularCards(
officialRates,
firestoreRates
);

/* Update Converter */

if(typeof initializeConverter==="function"){

initializeConverter();

}

}catch(error){

console.error(error);

officialContainer.innerHTML =

"<h3>Unable to load rates.</h3>";

blackContainer.innerHTML = "";

}

}

/*=========================================
        START APP
=========================================*/

loadRates();

/*=========================================
        AUTO REFRESH
=========================================*/

setInterval(async()=>{

const refresh=document.getElementById("lastUpdated");

refresh.innerHTML=
"Refreshing...";

await loadRates();

updateTime();

},30000);

/*=========================================
      POPULAR CURRENCIES
=========================================*/

function updatePopularCards(officialRates, firestoreRates){

popularCurrencies.forEach(currency=>{

const rate =
firestoreRates.find(
r=>r.currency===currency
);

if(!rate) return;

const official =

officialRates &&
officialRates[currency]

?

(1 / officialRates[currency]).toFixed(2)

:

"N/A";

const officialElement =
document.getElementById(
currency.toLowerCase()+"Official"
);

const trendText =
document.getElementById(
currency.toLowerCase()+"Trend"
);

const trendIcon =
document.getElementById(
currency.toLowerCase()+"TrendIcon"
);

const trendBox =
document.getElementById(
currency.toLowerCase()+"TrendBox"
);

const updated =
document.getElementById(
currency.toLowerCase()+"Updated"
);

if(
!officialElement ||
!trendText ||
!trendIcon ||
!trendBox
){

return;

}

/* Official Price */

animateValue(
officialElement,
parseFloat(official)
);

/* Trend */

const current =
parseFloat(official);

const previous =
parseFloat(
localStorage.getItem(currency)
);

if(!isNaN(previous)){

const change =
((current-previous)/previous)*100;

const percent =
Math.abs(change).toFixed(2);

if(change>=0){

trendBox.className =
"rate-change up";

trendIcon.className =
"fa-solid fa-arrow-trend-up";

trendText.innerHTML =
percent+"%";

}else{

trendBox.className =
"rate-change down";

trendIcon.className =
"fa-solid fa-arrow-trend-down";

trendText.innerHTML =
percent+"%";

}

}else{

trendBox.className =
"rate-change";

trendIcon.className =
"fa-solid fa-arrow-right";

trendText.innerHTML =
"0.00%";

}

localStorage.setItem(
currency,
current
);

/* Updated Time */

if(updated){

updated.innerHTML =
"Updated " +

new Date().toLocaleTimeString([],{

hour:"2-digit",

minute:"2-digit"

});

}

});

}

/*=========================================
        CURRENCY CONVERTER
=========================================*/

const amountInput = document.getElementById("amount");
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const convertBtn = document.getElementById("convertBtn");
const swapBtn = document.getElementById("swapBtn");

const conversionResult =
document.getElementById("conversionResult");

const converterRate =
document.getElementById("converterRate");

async function initializeConverter(){

if(!converterRates) return;

fromCurrency.innerHTML = "";
toCurrency.innerHTML = "";

Object.keys(converterRates)
.sort()
.forEach(currency=>{

fromCurrency.innerHTML +=
`<option value="${currency}">
${currency}
</option>`;

toCurrency.innerHTML +=
`<option value="${currency}">
${currency}
</option>`;

});

fromCurrency.value = "USD";
toCurrency.value = "NGN";

convertCurrency();

}

function convertCurrency(){

if(!converterRates) return;

const amount =
parseFloat(amountInput.value) || 0;

const from =
fromCurrency.value;

const to =
toCurrency.value;

const ngnFrom =
1 / converterRates[from];

const ngnTo =
1 / converterRates[to];

const result =
amount * ngnFrom / ngnTo;

conversionResult.innerHTML =
new Intl.NumberFormat("en",{

style:"currency",

currency:to,

maximumFractionDigits:2

}).format(result);

converterRate.innerHTML =
`1 ${from} = ${(ngnFrom/ngnTo).toFixed(4)} ${to}`;

}

/* Events */

convertBtn.onclick = convertCurrency;

amountInput.oninput = convertCurrency;

fromCurrency.onchange = convertCurrency;

toCurrency.onchange = convertCurrency;

swapBtn.onclick = ()=>{

const temp =
fromCurrency.value;

fromCurrency.value =
toCurrency.value;

toCurrency.value =
temp;

convertCurrency();

};
/*=========================================
      CUSTOM DROPDOWN
=========================================*/

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

function getCurrencyInfo(code){

if(currencyInfo[code]){

return{

name:currencyInfo[code].name,

flag:`https://flagcdn.com/w40/${currencyInfo[code].country}.png`

};

}

return{

name:code,

flag:"https://flagcdn.com/w40/un.png"

};

}

function updateSelected(type,code){

const info=getCurrencyInfo(code);

document.getElementById(type+"Code").textContent=code;

document.getElementById(type+"Name").textContent=info.name;

document.getElementById(type+"Flag").src=info.flag;

}

function buildDropdown(){

const fromOptions=document.getElementById("fromOptions");

const toOptions=document.getElementById("toOptions");

if(!fromOptions || !toOptions) return;

fromOptions.innerHTML="";
toOptions.innerHTML="";

Object.keys(converterRates)
.sort()
.forEach(code=>{

const info=getCurrencyInfo(code);

const html=`

<div class="option" data-code="${code}">

<img src="${info.flag}">

<div>

<h4>${code}</h4>

<p>${info.name}</p>

</div>

</div>

`;

fromOptions.innerHTML+=html;
toOptions.innerHTML+=html;

});

document.querySelectorAll("#fromOptions .option")
.forEach(option=>{

option.onclick=()=>{

const code=option.dataset.code;

fromCurrency.value=code;

updateSelected("from",code);

convertCurrency();

document
.getElementById("fromSelect")
.classList.remove("active");

};

});

document.querySelectorAll("#toOptions .option")
.forEach(option=>{

option.onclick=()=>{

const code=option.dataset.code;

toCurrency.value=code;

updateSelected("to",code);

convertCurrency();

document
.getElementById("toSelect")
.classList.remove("active");

};

});

}

/*==============================*/

window.addEventListener("load",()=>{

if(converterRates){

buildDropdown();

}

});

/*==============================*/

document
.querySelector("#fromSelect .selected")
.onclick=()=>{

document
.getElementById("fromSelect")
.classList.toggle("active");

};

document
.querySelector("#toSelect .selected")
.onclick=()=>{

document
.getElementById("toSelect")
.classList.toggle("active");

};

/*==============================*/

swapBtn.onclick=()=>{

const temp=fromCurrency.value;

fromCurrency.value=toCurrency.value;

toCurrency.value=temp;

updateSelected("from",fromCurrency.value);

updateSelected("to",toCurrency.value);

convertCurrency();

};
/*=========================================
        PREMIUM EFFECTS
=========================================*/

window.addEventListener("load",()=>{

document.body.classList.add("loaded");

});

/* Cards */

const observer = new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("show-card");

}

});

},{
threshold:.2
});

document.querySelectorAll(".card,.popular-card,.converter-card")
.forEach(card=>{

observer.observe(card);

});

/*=========================================
      BUTTON RIPPLE
=========================================*/

document.querySelectorAll("button,.contact-btn,.hero-contact")
.forEach(button=>{

button.addEventListener("click",function(e){

const ripple=document.createElement("span");

const size=Math.max(
this.offsetWidth,
this.offsetHeight
);

ripple.style.width=size+"px";
ripple.style.height=size+"px";

ripple.style.left=
e.offsetX-size/2+"px";

ripple.style.top=
e.offsetY-size/2+"px";

ripple.classList.add("ripple");

this.appendChild(ripple);

setTimeout(()=>{

ripple.remove();

},600);

});

});

/*=========================================
      HEADER SHADOW
=========================================*/

window.addEventListener("scroll",()=>{

const nav=document.querySelector(".navbar");

if(window.scrollY>50){

nav.classList.add("sticky");

}else{

nav.classList.remove("sticky");

}

});

/*=========================================
        COUNT UP
=========================================*/

function animateValue(el,end){

let start=0;

const duration=1000;

const step=end/(duration/16);

function update(){

start+=step;

if(start>=end){

el.innerHTML="₦"+end.toLocaleString();

return;

}

el.innerHTML=
"₦"+Math.floor(start).toLocaleString();

requestAnimationFrame(update);

}

update();

}
