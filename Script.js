const officialRates = [
{
flag:"🇺🇸",
currency:"USD",
rate:"₦1,585",
change:"+₦5",
up:true
},
{
flag:"🇬🇧",
currency:"GBP",
rate:"₦2,145",
change:"+₦8",
up:true
},
{
flag:"🇪🇺",
currency:"EUR",
rate:"₦1,850",
change:"-₦3",
up:false
},
{
flag:"🇵🇱",
currency:"PLN",
rate:"₦435",
change:"+₦2",
up:true
},
{
flag:"🇨🇦",
currency:"CAD",
rate:"₦1,150",
change:"+₦4",
up:true
},
{
flag:"🇦🇪",
currency:"AED",
rate:"₦430",
change:"-₦1",
up:false
},
{
flag:"🇨🇳",
currency:"CNY",
rate:"₦225",
change:"+₦1",
up:true
}
];

const blackRates = [
{
flag:"🇺🇸",
currency:"USD",
rate:"₦1,620",
change:"+₦10",
up:true
},
{
flag:"🇬🇧",
currency:"GBP",
rate:"₦2,180",
change:"+₦12",
up:true
},
{
flag:"🇪🇺",
currency:"EUR",
rate:"₦1,890",
change:"+₦5",
up:true
},
{
flag:"🇵🇱",
currency:"PLN",
rate:"₦445",
change:"-₦2",
up:false
},
{
flag:"🇨🇦",
currency:"CAD",
rate:"₦1,180",
change:"+₦6",
up:true
},
{
flag:"🇦🇪",
currency:"AED",
rate:"₦445",
change:"+₦2",
up:true
},
{
flag:"🇨🇳",
currency:"CNY",
rate:"₦235",
change:"+₦1",
up:true
}
];

function createCards(data, container){

container.innerHTML="";

data.forEach(item=>{

container.innerHTML += `

<div class="card">

<div class="card-top">

<div>

<div class="flag">${item.flag}</div>

<div class="currency">${item.currency}</div>

</div>

</div>

<div class="rate">${item.rate}</div>

<div class="change ${item.up ? "up":"down"}">

${item.up ? "▲":"▼"} ${item.change}

</div>

</div>

`;

});

}

createCards(
officialRates,
document.getElementById("officialRates")
);

createCards(
blackRates,
document.getElementById("blackRates")
);


const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("keyup",()=>{

const text = searchInput.value.toLowerCase();

document.querySelectorAll(".card").forEach(card=>{

card.style.display =
card.innerText.toLowerCase().includes(text)
?
"block"
:
"none";

});

});


function updateTime(){

const now = new Date();

document.getElementById("time").innerHTML =
now.toLocaleString();

}

updateTime();

setInterval(updateTime,1000);


const themeBtn =
document.getElementById("themeBtn");

themeBtn.onclick=()=>{

document.body.classList.toggle("light");

if(document.body.classList.contains("light")){

themeBtn.innerHTML =
'<i class="fa-solid fa-sun"></i>';

}else{

themeBtn.innerHTML =
'<i class="fa-solid fa-moon"></i>';

}

};


document.querySelectorAll(".card").forEach(card=>{

card.addEventListener("mouseenter",()=>{

card.style.transform="translateY(-8px)";

});

card.addEventListener("mouseleave",()=>{

card.style.transform="translateY(0px)";

});

});
