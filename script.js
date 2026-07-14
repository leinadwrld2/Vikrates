import { db } from "./firebase-config.js";

import {
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const API_KEY = "873659d253950812b2f2a182";

const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/NGN`;

async function getOfficialRates() {

    try {

        const response = await fetch(API_URL);

        const data = await response.json();

        return data.conversion_rates;

    } catch (error) {

        console.error(error);

        return null;

    }

}
const officialContainer =
document.getElementById("officialRates");

const blackContainer =
document.getElementById("blackRates");

const search =
document.getElementById("search");

const lastUpdated =
document.getElementById("lastUpdated");

const themeBtn =
document.getElementById("theme");



// ---------- Load Rates ----------

async function loadRates(){

officialContainer.innerHTML="<p>Loading...</p>";

blackContainer.innerHTML="<p>Loading...</p>";

try{

const officialRates = await getOfficialRates();

const snapshot =
await getDocs(collection(db,"rates"));
const firestoreRates=[];

snapshot.forEach(doc=>{

firestoreRates.push(doc.data());

});    

officialContainer.innerHTML="";
blackContainer.innerHTML="";

snapshot.forEach(doc=>{
console.log(doc.data());
const rate = doc.data();

const officialRate =
officialRates && officialRates[rate.currency]
? (1 / officialRates[rate.currency]).toFixed(2)
: "N/A";

const card=`

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

officialContainer.innerHTML+=card;



const card2=`

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

blackContainer.innerHTML+=card2;

});
updatePopular(officialRates, firestoreRates);
}
catch(error){

officialContainer.innerHTML=
"<h3>Unable to load rates.</h3>";

blackContainer.innerHTML="";

console.log(error);

}

}

loadRates();

/*==============================
  POPULAR CURRENCIES
==============================*/

function updatePopular(officialRates, firestoreRates){

const currencies=["USD","GBP","EUR","PLN"];

currencies.forEach(currency=>{

const rate=firestoreRates.find(r=>r.currency===currency);

if(!rate) return;

const official=
officialRates && officialRates[currency]
? (1/officialRates[currency]).toFixed(2)
: "N/A";

const officialElement=
document.getElementById(currency.toLowerCase()+"Official");

const updatedElement =
document.getElementById(currency.toLowerCase()+"Updated");

if(officialElement){

officialElement.innerHTML="₦"+official;

}

if(updatedElement){

updatedElement.innerHTML=
"Updated "+
new Date().toLocaleTimeString([],{
hour:"2-digit",
minute:"2-digit"
});
    const trendText =
document.getElementById(currency.toLowerCase()+"Trend");

const trendIcon =
document.getElementById(currency.toLowerCase()+"TrendIcon");

const trendBox =
trendIcon.parentElement;

const currentRate = parseFloat(official);

const previousRate =
parseFloat(localStorage.getItem(currency));

if(previousRate){

const change =
((currentRate-previousRate)/previousRate)*100;

const percent =
Math.abs(change).toFixed(2);

if(change>=0){

trendBox.className="trend up";

trendIcon.className=
"fa-solid fa-arrow-trend-up";

trendText.innerHTML=
`+${percent}% Today`;

}else{

trendBox.className="trend down";

trendIcon.className=
"fa-solid fa-arrow-trend-down";

trendText.innerHTML=
`-${percent}% Today`;

}

}else{

trendBox.className="trend up";

trendIcon.className=
"fa-solid fa-minus";

trendText.innerHTML=
"0.00% Today";

}

localStorage.setItem(currency,currentRate);

updated.innerHTML=
"Updated "+
new Date().toLocaleTimeString([],{
hour:"2-digit",
minute:"2-digit"
});

}

});

}


// ---------- Search ----------

search.addEventListener("keyup",()=>{

let value=
search.value.toLowerCase();

document.querySelectorAll(".card").forEach(card=>{

card.style.display=

card.innerText
.toLowerCase()
.includes(value)

?

"block"

:

"none";

});

});



// ---------- Last Updated ----------

function updateTime(){

let now=
new Date();

lastUpdated.innerHTML=

"Last Updated : "

+

now.toLocaleString();

}

updateTime();

setInterval(updateTime,1000);



// ---------- Dark Mode ----------

themeBtn.onclick=()=>{

document.body.classList.toggle("light");

if(document.body.classList.contains("light")){

themeBtn.innerHTML="☀️";

}else{

themeBtn.innerHTML="🌙";

}

};

// Mobile Menu

const menuBtn = document.getElementById("menuBtn");
const closeMenu = document.getElementById("closeMenu");
const mobileMenu = document.getElementById("mobileMenu");

if (menuBtn) {

menuBtn.addEventListener("click", () => {

mobileMenu.classList.add("active");

});

}

if (closeMenu) {

closeMenu.addEventListener("click", () => {

mobileMenu.classList.remove("active");

});

}

// ---------- Auto Refresh ----------

setInterval(()=>{

loadRates();

},30000);
