import { db, auth } from "./firebase-config.js";

import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
    collection,
    getDocs,
    doc,
    setDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const API_KEY = "873659d253950812b2f2a182";

const API_URL =
`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/NGN`;

let officialRates = {};

const loginBtn =
document.getElementById("loginBtn");

const logoutBtn =
document.getElementById("logoutBtn");

const dashboard =
document.getElementById("dashboard");

const loginPage =
document.getElementById("loginPage");

const rateTable =
document.getElementById("rateTable");

const addCurrencyBtn =
document.getElementById("addCurrency");

const currencyCount =
document.getElementById("currencyCount");

// ----------------------
// LOAD OFFICIAL RATES
// ----------------------

async function loadOfficialRates() {

    try {

        const response =
            await fetch(API_URL);

        const data =
            await response.json();

        if (data.result !== "success") {

            throw new Error("Exchange API failed.");

        }

        officialRates =
            data.conversion_rates;

        console.log("✅ Official Rates Loaded");

    }

    catch (error) {

        console.error(error);

        alert("Unable to load official exchange rates.");

    }

}

// ----------------------
// LOGIN
// ----------------------

if (loginBtn) {

    loginBtn.addEventListener("click", async () => {

        const email =
            document.getElementById("email").value;

        const password =
            document.getElementById("password").value;

        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            alert("Login Successful");

        }

        catch (error) {

            alert(error.message);

        }

    });

}

// ----------------------
// AUTH STATE
// ----------------------

onAuthStateChanged(auth, async (user) => {

    if (user) {

        if (loginPage)
            loginPage.style.display = "none";

        if (dashboard)
            dashboard.style.display = "flex";

        await loadOfficialRates();

        await loadCurrencies();

    } else {

        if (loginPage)
            loginPage.style.display = "block";

        if (dashboard)
            dashboard.style.display = "none";

    }

});

// ----------------------
// LOAD CURRENCIES
// ----------------------

async function loadCurrencies() {

    if (!rateTable) return;

    rateTable.innerHTML = "";

    try {

        const snapshot =
            await getDocs(collection(db, "rates"));

        if (currencyCount) {

            currencyCount.innerText =
                snapshot.size;

        }
        // ----------------------
// PERCENTAGE CALCULATOR
// ----------------------

function attachPercentageEvents() {

    const rows = rateTable.querySelectorAll("tr");

    rows.forEach((row) => {

        const currency = row.cells[0]?.innerText;

        if (!currency) return;

        const percent =
            document.getElementById(`percent-${currency}`);

        const calculated =
            document.getElementById(`calculated-${currency}`);

        const buy =
            document.getElementById(`buy-${currency}`);

        const sell =
            document.getElementById(`sell-${currency}`);

        if (!percent || !calculated) return;

        percent.addEventListener("change", () => {

            const official =
                officialRates[currency]
                    ? (1 / officialRates[currency])
                    : 0;

            const markup = Number(percent.value);

            if (markup === 0) {

                calculated.innerHTML = "--";

                return;

            }

            const result =
                official + (official * markup / 100);

            calculated.innerHTML =
                "₦" + result.toFixed(2);

            if (buy) buy.value = result.toFixed(2);
            if (sell) sell.value = result.toFixed(2);

        });

    });

}

        snapshot.forEach((docSnap) => {

            const rate = docSnap.data();

            const official =
                officialRates[rate.currency]
                ? (1 / officialRates[rate.currency]).toFixed(2)
                : "N/A";

            rateTable.innerHTML += `

<tr>

<td>${rate.currency}</td>

<td>${rate.flag}</td>

<td>₦${official}</td>

<td>

<select id="percent-${rate.currency}">

<option value="0">Manual</option>

<option value="5">5%</option>

<option value="10">10%</option>

<option value="15">15%</option>

<option value="20">20%</option>

<option value="25">25%</option>

<option value="30">30%</option>

</select>

<br><br>

<span id="calculated-${rate.currency}">--</span>

</td>

<td>

<input
type="number"
id="buy-${rate.currency}"
value="${rate.blackBuy || ""}">

</td>

<td>

<input
type="number"
id="sell-${rate.currency}"
value="${rate.blackSell || ""}">

</td>

<td>

<button
class="save-btn"
onclick="saveRate('${rate.currency}','${rate.flag}')">

💾 Save

</button>

<button
class="logout-btn"
onclick="deleteRate('${rate.currency}')">

🗑 Delete

</button>

</td>

</tr>

`;

        });
attachPercentageEvents();
        // ----------------------
// SAVE RATE
// ----------------------

window.saveRate = async function (currency, flag) {

    const percent =
        document.getElementById(`percent-${currency}`);

    let blackBuy;
    let blackSell;

    if (percent && Number(percent.value) > 0) {

        const official =
            officialRates[currency]
                ? (1 / officialRates[currency])
                : 0;

        const result =
            official + (official * Number(percent.value) / 100);

        blackBuy = Number(result.toFixed(2));
        blackSell = Number(result.toFixed(2));

    } else {

        blackBuy = Number(
            document.getElementById(`buy-${currency}`).value
        );

        blackSell = Number(
            document.getElementById(`sell-${currency}`).value
        );

    }

    try {

        await setDoc(
            doc(db, "rates", currency),
            {
                currency,
                flag,
                blackBuy,
                blackSell,
                markupPercent: percent
                    ? Number(percent.value)
                    : 0
            },
            { merge: true }
        );

        alert(currency + " updated successfully.");

    } catch (error) {

        console.error(error);

        alert("Unable to save.");

    }

};

// ----------------------
// DELETE RATE
// ----------------------

window.deleteRate = async function (currency) {

    if (!confirm(`Delete ${currency}?`))
        return;

    try {

        await deleteDoc(
            doc(db, "rates", currency)
        );

        await loadCurrencies();

    } catch (error) {

        console.error(error);

        alert("Unable to delete currency.");

    }

};

// ----------------------
// ADD CURRENCY
// ----------------------

if (addCurrencyBtn) {

    addCurrencyBtn.addEventListener("click", async () => {

        const currency =
            prompt("Currency Code (e.g. CAD)")
                ?.toUpperCase();

        if (!currency) return;

        const flag =
            prompt("Flag Emoji (e.g. 🇨🇦)");

        if (!flag) return;

        try {

            await setDoc(
                doc(db, "rates", currency),
                {
                    currency,
                    flag,
                    blackBuy: 0,
                    blackSell: 0,
                    markupPercent: 0
                }
            );

            await loadCurrencies();

            alert(currency + " added.");

        } catch (error) {

            console.error(error);

            alert("Unable to add currency.");

        }

    });

}

// ----------------------
// LOGOUT
// ----------------------

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        await signOut(auth);

        location.reload();

    });

}

// ----------------------
// AUTO REFRESH
// ----------------------

setInterval(async () => {

    if (auth.currentUser) {

        await loadOfficialRates();

        await loadCurrencies();

    }

}, 30000);

// ----------------------
// READY
// ----------------------

console.log("✅ VikStock Admin V2 Loaded");
    } catch (error) {

        console.error(error);

        alert("Unable to load currencies.");

    }

}
