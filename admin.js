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
dashboard.style.display = "block";

loadCurrencies();

} else {

if (dashboard)
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

            <tr>

                <td>${rate.currency}</td>

                <td>${rate.flag}</td>

                <td class="auto-rate">Auto</td>

                <td class="auto-rate">Auto</td>

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

    const blackBuy = Number(
        document.getElementById(`buy-${currency}`).value
    );

    const blackSell = Number(
        document.getElementById(`sell-${currency}`).value
    );

    try {

        await setDoc(
            doc(db, "rates", currency),
            {
                currency: currency,
                flag: flag,
                blackBuy: blackBuy,
                blackSell: blackSell
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
