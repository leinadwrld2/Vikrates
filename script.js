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

USD:{
name:"US Dollar",
flag:"https://flagcdn.com/w40/us.png"
},

NGN:{
name:"Nigerian Naira",
flag:"https://flagcdn.com/w40/ng.png"
},

GBP:{
name:"British Pound",
flag:"https://flagcdn.com/w40/gb.png"
},

EUR:{
name:"Euro",
flag:"https://flagcdn.com/w40/eu.png"
},

PLN:{
name:"Polish Zloty",
flag:"https://flagcdn.com/w40/pl.png"
},

CAD:{
name:"Canadian Dollar",
flag:"https://flagcdn.com/w40/ca.png"
},

AUD:{
name:"Australian Dollar",
flag:"https://flagcdn.com/w40/au.png"
},

JPY:{
name:"Japanese Yen",
flag:"https://flagcdn.com/w40/jp.png"
},

CNY:{
name:"Chinese Yuan",
flag:"https://flagcdn.com/w40/cn.png"
},

CHF:{
name:"Swiss Franc",
flag:"https://flagcdn.com/w40/ch.png"
}

};
function createOption(currency){

const info = currencyInfo[currency] || {

name:currency,

flag:"https://flagcdn.com/w40/un.png"

};

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

const info=

currencyInfo[currency]||

{

name:currency,

flag:"https://flagcdn.com/40x30/un.png"

};

document.getElementById(type+"Code").innerHTML=

currency;

document.getElementById(type+"Name").innerHTML=

info.name;

document.getElementById(type+"Flag").src=

info.flag;

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
swapBtn.onclick=()=>{

const temp=

fromCurrency.value;

fromCurrency.value=

toCurrency.value;

toCurrency.value=temp;

updateSelected(

"from",

fromCurrency.value

);

updateSelected(

"to",

toCurrency.value

);

convertCurrency();

};

}
/*==============================
 AUTO REFRESH
==============================*/

setInterval(()=>{

loadRates();

},30000);
