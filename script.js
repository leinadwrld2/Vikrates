import { db } from "./firebase-config.js";

import {
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

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

const snapshot =
await getDocs(collection(db,"rates"));

officialContainer.innerHTML="";
blackContainer.innerHTML="";

snapshot.forEach(doc=>{

const rate=doc.data();

const card=`

<div class="card">

<div class="flag">${rate.flag}</div>

<div class="currency">${rate.currency}</div>

<div class="rate-title">

Official Buy

</div>

<div class="buy">

₦${rate.officialBuy}

</div>

<div class="rate-title">

Official Sell

</div>

<div class="sell">

₦${rate.officialSell}

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

}
catch(error){

officialContainer.innerHTML=
"<h3>Unable to load rates.</h3>";

blackContainer.innerHTML="";

console.log(error);

}

}

loadRates();



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



// ---------- Auto Refresh ----------

setInterval(()=>{

loadRates();

},30000);
