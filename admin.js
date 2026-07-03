import { db, auth } from "./firebase-config.js";

import {
signInWithEmailAndPassword,
signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
doc,
setDoc,
deleteDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const saveBtn = document.getElementById("saveBtn");
const deleteBtn = document.getElementById("deleteBtn");

const dashboard = document.getElementById("dashboard");

// ---------- LOGIN ----------

loginBtn.onclick = async ()=>{

const email =
document.getElementById("email").value;

const password =
document.getElementById("password").value;

try{

await signInWithEmailAndPassword(
auth,
email,
password
);

dashboard.style.display="block";

alert("Welcome to VikStock");

}catch(error){

alert(error.message);

}

};

// ---------- SAVE ----------

saveBtn.onclick = async ()=>{

const currency =
document.getElementById("currency").value.toUpperCase();

await setDoc(doc(db,"rates",currency),{

currency:currency,

flag:
document.getElementById("flag").value,

officialBuy:Number(
document.getElementById("officialBuy").value
),

officialSell:Number(
document.getElementById("officialSell").value
),

blackBuy:Number(
document.getElementById("blackBuy").value
),

blackSell:Number(
document.getElementById("blackSell").value

)

});

alert("Saved Successfully");

};

// ---------- DELETE ----------

deleteBtn.onclick = async ()=>{

const currency =
document.getElementById("deleteCurrency").value.toUpperCase();

await deleteDoc(doc(db,"rates",currency));

alert("Currency Deleted");

};

// ---------- LOGOUT ----------

logoutBtn.onclick = async ()=>{

await signOut(auth);

dashboard.style.display="none";

alert("Logged Out");

};
