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

const currentRate = parseFloat(official);

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

});

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
 AUTO REFRESH
==============================*/

setInterval(()=>{

loadRates();

},30000);
