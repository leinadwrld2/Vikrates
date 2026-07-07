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

async function loadOfficialRates() {

    try {

        const response = await fetch(API_URL);

        const data = await response.json();

        officialRates = data.conversion_rates;

        console.log("✅ Official Rates Loaded");

    } catch (error) {

        console.error(error);

        alert("Unable to connect to ExchangeRate API");

    }

}
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const dashboard = document.getElementById("dashboard");
const rateTable = document.getElementById("rateTable");
const addCurrencyBtn = document.getElementById("addCurrency");

// -------------------- LOGIN --------------------

if (loginBtn) {

loginBtn.addEventListener("click", async () => {

const email = document.getElementById("email").value;

const password = document.getElementById("password").value;

try {

await signInWithEmailAndPassword(auth, email, password);

alert("Login Successful");

} catch (error) {

alert(error.message);

}

});

}

// -------------------- CHECK LOGIN --------------------

onAuthStateChanged(auth, (user) => {

if (user) {

if (dashboard)
document.getElementById("loginPage").style.display = "none";
dashboard.style.display = "flex";

await loadOfficialRates();

loadCurrencies();

} else {

if (dashboard)
document.getElementById("loginPage").style.display = "block";
dashboard.style.display = "none";

}

});
// -------------------- LOAD CURRENCIES --------------------

async function loadCurrencies() {

    if (!rateTable) return;

    rateTable.innerHTML = "";

    try {

        const snapshot = await getDocs(collection(db, "rates"));

        document.getElementById("currencyCount").innerText =
            snapshot.size;

        snapshot.forEach((document) => {

            const rate = document.data();

            rateTable.innerHTML += `
            // Wait for the row to be added
setTimeout(() => {

    const percent =
        document.getElementById(`percent-${rate.currency}`);

    const calculated =
        document.getElementById(`calculated-${rate.currency}`);

    if (!percent || !calculated) return;

    percent.addEventListener("change", () => {

        const official =
            officialRates[rate.currency]
                ? (1 / officialRates[rate.currency])
                : 0;

        const markup =
            Number(percent.value);

        const result =
            official + (official * markup / 100);

        calculated.innerHTML =
            "₦" + result.toFixed(2);

    });

}, 100);

            <tr>

                <td>${rate.currency}</td>

                <td>${rate.flag}</td>

                <<td>

<span class="auto-rate">

₦${officialRates[rate.currency]
? (1 / officialRates[rate.currency]).toFixed(2)
: "N/A"}

</span>

</td>

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

<span id="calculated-${rate.currency}">

--

</span>

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

    } catch (error) {

        console.error(error);

        alert("Unable to load currencies.");

    }

}
// -------------------- SAVE RATE --------------------

window.saveRate = async function (currency, flag) {

    const percentDropdown =
document.getElementById(`percent-${currency}`);

let blackBuy;
let blackSell;

if (percentDropdown && Number(percentDropdown.value) > 0) {

    const official =
        officialRates[currency]
            ? (1 / officialRates[currency])
            : 0;

    const markup =
        Number(percentDropdown.value);

    const calculated =
        official + (official * markup / 100);

    blackBuy = Number(calculated.toFixed(2));
    blackSell = Number(calculated.toFixed(2));

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
            doc(db, "rates", {
    currency: currency,
    flag: flag,
    blackBuy: blackBuy,
    blackSell: blackSell,
    markupPercent: percentDropdown
        ? Number(percentDropdown.value)
        : 0
},
            { merge: true }
        );

        alert(currency + " updated successfully.");

    } catch (error) {

        console.error(error);

        alert("Failed to save " + currency);

    }

};

// -------------------- DELETE RATE --------------------

window.deleteRate = async function (currency) {

    const confirmDelete = confirm(
        "Delete " + currency + "?"
    );

    if (!confirmDelete) return;

    try {

        await deleteDoc(
            doc(db, "rates", currency)
        );

        loadCurrencies();

        alert(currency + " deleted.");

    } catch (error) {

        console.error(error);

        alert("Unable to delete " + currency);

    }

};

// -------------------- ADD NEW CURRENCY --------------------

if (addCurrencyBtn) {

    addCurrencyBtn.addEventListener("click", async () => {

        const currency = prompt("Currency Code (e.g. CAD)")
            ?.toUpperCase();

        if (!currency) return;

        const flag = prompt("Flag Emoji (e.g. 🇨🇦)");

        if (!flag) return;

        try {

            await setDoc(doc(db, "rates", currency), {

                currency: currency,
                flag: flag,
                blackBuy: 0,
                blackSell: 0

            });

            loadCurrencies();

            alert(currency + " added.");

        } catch (error) {

            console.error(error);

            alert("Failed to add currency.");

        }

    });

}
// -------------------- LOGOUT --------------------

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        try {

            await signOut(auth);

            alert("Logged out successfully.");

            window.location.reload();

        } catch (error) {

            console.error(error);

            alert("Unable to logout.");

        }

    });

}

// -------------------- AUTO REFRESH --------------------

setInterval(() => {

    if (auth.currentUser) {

        loadCurrencies();

    }

}, 30000);

// -------------------- PAGE READY --------------------

console.log("✅ VikStock Admin Loaded");
// Sidebar Navigation

const ratesBtn = document.getElementById("ratesBtn");

if (ratesBtn) {

    ratesBtn.addEventListener("click", () => {

        document
            .getElementById("ratesSection")
            .scrollIntoView({
                behavior: "smooth"
            });

    });

}
