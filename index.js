const screenCategories = document.getElementById('screen-categories');
const screenRecipes = document.getElementById('screen-recipes');
const screenDetail = document.getElementById('screen-detail');
const modalOrder = document.getElementById('modal-order');
const modalPayment = document.getElementById('modal-payment');
const toastNotification = document.getElementById('notification-toast');
let cart = [];
let scanIntervalAudio = null;

// --- СТАБИЛЬНЫЙ ЗВУКОВОЙ ДВИЖОК (WEB AUDIO API) ---
function playSound(frequency, type, duration, volume = 0.25) {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = type; oscillator.frequency.value = frequency;
        gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
        oscillator.connect(gainNode); gainNode.connect(audioCtx.destination);
        oscillator.start(); oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) { console.log("Звук требует клика по экрану"); }
}

function playHoverSound() { playSound(450, 'triangle', 0.05, 0.2); } 
function playClickSound() { playSound(550, 'sine', 0.08, 0.25); } 
function playCartSound() { playSound(900, 'sine', 0.12, 0.3); } 
function playInputSound() { playSound(600, 'sine', 0.02, 0.03); } 
function playErrorSound() { playSound(170, 'sawtooth', 0.2, 0.35); setTimeout(() => playSound(140, 'sawtooth', 0.25, 0.35), 120); } 

function playSuccessSound() { 
    playSound(1046.50, 'sine', 0.10, 0.2); 
    setTimeout(() => { 
        playSound(1318.51, 'sine', 0.12, 0.2); 
        setTimeout(() => {
            playSound(1975.53, 'sine', 0.7, 0.45); 
            playSound(2637.02, 'sine', 0.4, 0.25); 
        }, 140);
    }, 120);
} 

// УЛЬТРА-ЗВОНКИЙ И ГРОМКИЙ ДЗЫНЬ КАССЫ ПРИ ОПЛАТЕ
function playMoneySound() {
    // Высокая чистая нота на максимальной громкости (0.9)
    playSound(2637.02, 'sine', 0.8, 0.9); 
    
    // Эффект хрустального эха через 50мс
    setTimeout(() => {
        playSound(3135.96, 'sine', 0.5, 0.6);
    }, 50);
}

function startScanningSound() {
    scanIntervalAudio = setInterval(() => { playSound(330, 'triangle', 0.15, 0.15); }, 150);
}
function stopScanningSound() {
    if (scanIntervalAudio) { clearInterval(scanIntervalAudio); scanIntervalAudio = null; }
}
// --- НАВІГАЦІЯ ТА ІНТЕРФЕЙС ЕКРАНІВ ---
function toggleTheme() { document.body.classList.toggle('dark-mode'); playClickSound(); }
function goToCategories() { playClickSound(); screenRecipes.classList.add('hidden'); screenCategories.classList.remove('hidden'); }
function closeOrderModal() { playClickSound(); modalOrder.classList.add('hidden'); }
function closePaymentModal() { playClickSound(); modalPayment.classList.add('hidden'); }

function showNotificationToast() {
    playErrorSound(); toastNotification.classList.remove('hidden');
    setTimeout(() => toastNotification.classList.add('hidden'), 4500);
}

function showCategory(categoryKey) {
    playCartSound();
    const categoryData = database[categoryKey];
    document.getElementById('category-title').innerText = categoryData.title;
    const container = document.getElementById('recipes-container'); container.innerHTML = ''; 
    if (categoryData && categoryData.items) {
        categoryData.items.forEach(recipe => {
            const card = document.createElement('div'); card.className = 'recipe-card';
            card.onclick = function() { showRecipeDetail(recipe); };
            card.innerHTML = `<div class="recipe-img"><img src="${recipe.imgUrl}"></div><div class="recipe-info"><h3>${recipe.name}</h3></div>`;
            container.appendChild(card);
        });
    }
    screenCategories.classList.add('hidden'); screenRecipes.classList.remove('hidden'); screenDetail.classList.add('hidden');
}

function showRecipeDetail(recipe) {
    playCartSound();
    const container = document.getElementById('recipe-detail-container');
    document.getElementById('btn-to-recipes').onclick = function() { playClickSound(); screenDetail.classList.add('hidden'); screenRecipes.classList.remove('hidden'); };
    const ingredientsHTML = recipe.ingredients.map(ing => `<li>${ing}</li>`).join('');
    const stepsHTML = recipe.steps.map((step, idx) => `<div class="step-item"><span class="step-number">${idx + 1}</span> ${step}</div>`).join('');
    container.innerHTML = `<div class="main-recipe-img"><img src="${recipe.imgUrl}"></div><h2>${recipe.name}</h2><div class="ingredients-section"><h4>Ингредиенты:</h4><ul>${ingredientsHTML}</ul></div><div class="steps-section"><h4>Пошаговое приготовление:</h4><div>${stepsHTML}</div></div>`;
    screenRecipes.classList.add('hidden'); screenDetail.classList.remove('hidden');
}

// --- КОШИК ТА ОНЛАЙН-МАГАЗИН ІЗ ФІКСОМ ЗНИЖКИ ---
function openOrderModal() {
    playCartSound();
    const container = document.getElementById('modal-menu-container'); container.innerHTML = ''; 
    for (let key in database) {
        database[key].items.forEach(recipe => {
            let uah = recipe.price;
            
            // Перевірка на реберця для відображення ціни зі знижкою 552 ₴ замість 690 ₴
            if (recipe.id === "ribs" || recipe.name.toLowerCase() === "свиные ребрышки барбекю") {
                uah = 552;
            }
            
            const usd = (uah / 40).toFixed(2); 
            const itemCard = document.createElement('div'); itemCard.className = 'modal-item-card';
            itemCard.innerHTML = `<div class="modal-item-img" style="background-image: url('${recipe.imgUrl}')"></div><div class="modal-item-info"><h4>${recipe.name}</h4><div class="modal-item-meta"><div class="modal-item-price"><span>${uah} ₴</span><span style="font-size:0.8rem; color:#a0aec0;">$${usd}</span></div><button class="btn-modal-add" onclick="addToCart('${recipe.name}', ${uah})">В корзину</button></div></div>`;
            container.appendChild(itemCard);
        });
    }
    modalOrder.classList.remove('hidden');
}

function addToCart(name, uahPrice) { 
    playCartSound(); 
    let finalPrice = uahPrice;
    
    // Перехоплення ціни акційних реберець при кліку
    if (name.toLowerCase() === "свиные ребрышки барбекю" || name.toLowerCase() === "свиные ребрышки bbq") {
        finalPrice = 552;
    }
    
    cart.push({ name: name, price: finalPrice }); 
    updateCartUI(); 
}

function updateCartUI() {
    const container = document.getElementById('cart-items-container'), totalSpan = document.getElementById('cart-total-price');
    if (cart.length === 0) { container.innerHTML = '<p class="empty-cart-msg">Корзина пуста.</p>'; totalSpan.innerText = '0 ₴ / \$0.00'; return; }
    container.innerHTML = ''; let totalUah = 0;
    cart.forEach(item => {
        totalUah += item.price;
        const div = document.createElement('div'); div.className = 'cart-item';
        div.innerHTML = `<span>${item.name}</span><span class="cart-item-price">${item.price} ₴ / $${(item.price / 40).toFixed(2)}</span>`;
        container.appendChild(div);
    });
    totalSpan.innerText = `${totalUah} ₴ / $${(totalUah / 40).toFixed(2)}`;
}
// --- ВІКНО ОБШИРНОЇ ОПЛАТИ ТА ІМІТАЦІЯ БАНКУ З ПОВНИМ ЦИКЛОМ АНІМАЦІЇ ---
function openPaymentModal() {
    if (cart.length === 0) { showNotificationToast(); return; }
    playClickSound();
    const totalUah = cart.reduce((sum, item) => sum + item.price, 0), totalUsd = (totalUah / 40).toFixed(2);
    modalPayment.querySelector('.modal-content').innerHTML = `
        <div class="modal-header-box"><h2>Оплата картой 💳</h2><span class="close-modal" onclick="closePaymentModal()">&times;</span></div>
        <div class="payment-layout-container">
            <div class="receipt-box"><h4>Ваш чек:</h4><div class="receipt-list" id="modal-receipt-items"></div><div class="receipt-total"><span>Итого:</span><span>${totalUah} ₴ / $${totalUsd}</span></div></div>
            <div class="payment-form">
                <div class="form-group"><label>Номер карты</label><input type="text" id="card-number" placeholder="4400 5511 2233 4455" maxlength="19"></div>
                <div style="display:flex; gap:1rem;"><div class="form-group" style="flex:1;"><label>Срок</label><input type="text" id="card-expiry" placeholder="MM/YY" maxlength="5"></div><div class="form-group" style="flex:1;"><label>CVC</label><input type="password" id="card-cvv" placeholder="•••" maxlength="3"></div></div>
                <div class="form-group"><label>Имя</label><input type="text" id="card-name" placeholder="IVAN IVANOV" style="text-transform:uppercase;"></div>
                <button class="btn-pay-submit" id="btn-submit-payment-action" onclick="processCardPayment()"><span class="spinner-icon"></span><span class="btn-text-content">Оплатить заказ</span></button>
            </div>
        </div>`;
    const receiptList = document.getElementById('modal-receipt-items');
    cart.forEach(item => {
        const itemDiv = document.createElement('div'); itemDiv.className = 'receipt-item';
        itemDiv.innerHTML = `<span>${item.name}</span><strong>${item.price} ₴ / $${(item.price / 40).toFixed(2)}</strong>`;
        receiptList.appendChild(itemDiv);
    });
    setupCardMasks(); modalPayment.classList.remove('hidden');
}

function setupCardMasks() {
    document.getElementById('card-number').addEventListener('input', e => { let v = e.target.value.replace(/\D/g, '').match(/(\d{1,4})/g); e.target.value = v ? v.join(' ') : ''; playInputSound(); });
    document.getElementById('card-expiry').addEventListener('input', e => { let v = e.target.value.replace(/\D/g, ''); e.target.value = v.length >= 2 ? v.substring(0, 2) + '/' + v.substring(2, 4) : v; playInputSound(); });
    document.getElementById('card-cvv').addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, ''); playInputSound(); });
    document.getElementById('card-name').addEventListener('input', () => playInputSound());
}

function processCardPayment() {
    const n = document.getElementById('card-number').value, e = document.getElementById('card-expiry').value, c = document.getElementById('card-cvv').value, m = document.getElementById('card-name').value;
    if (n.length < 19 || e.length < 5 || c.length < 3 || m.trim() === '') { playErrorSound(); alert('❌ Заполните карту корректно!'); return; }
    
    const btn = document.getElementById('btn-submit-payment-action'); 
    btn.classList.add('processing'); 
    btn.querySelector('.btn-text-content').innerText = 'Проверка карты...'; 
    
    playClickSound(); 
    startScanningSound(); // Вмикаємо звук очікування відповіді банку
    
    // ЕТАП 1: Через 2 секунди з'являється вікно авторизації з синім пульсуючим колом
    setTimeout(() => {
        const overlay = document.createElement('div'); 
        overlay.className = 'payment-status-overlay';
        overlay.innerHTML = `
            <div class="pulse-circle"></div>
            <div class="status-text-anim" id="overlay-status-title">Авторизация банка...</div>
        `;
        modalPayment.querySelector('.payment-layout-container').appendChild(overlay);
        
        // ЕТАП 2: Ще через 2.5 секунди банк дає згоду — коло стає зеленим і лунає гучний ДЗИНЬ!
        setTimeout(() => {
            stopScanningSound(); // Вимикаємо звук сканування
            
            // КРИСТАЛЬНО ГУЧНИЙ ТА ДЗВІНКИЙ ДЗИНЬ КАСИ!
            playMoneySound(); 
            
            // Фарбуємо коло в зелений колір успіху
            const circle = overlay.querySelector('.pulse-circle');
            if (circle) circle.style.backgroundColor = '#1ebd5a';
            
            // Змінюємо текст на успішне завершення
            const title = document.getElementById('overlay-status-title');
            if (title) {
                title.innerHTML = `
                    ✅ Оплата успешно завершена!<br>
                    <span style="font-size:0.9rem; font-weight:normal; color:#718096;">Ресторан готовит заказ. Курьер будет через 30 минут.</span>
                `;
            }
            
            // Очищаємо кошик і закриваємо модалку
            setTimeout(() => { cart = []; updateCartUI(); closePaymentModal(); }, 3000);
        }, 2500);
    }, 2000);
}

// --- ЧАСОВИЙ МОНІТОРИНГ ТА ІМІТАЦІЯ ПОКУПЦІВ З ФІКСАЦІЄЮ ЦІНИ ---
function startLiveTracker() {
    const fakeNames = ["Богдан", "Оксана", "Ярослав", "София", "Тарас", "Марьяна", "Максим", "Наталья", "Виталий", "Юлия", "Арсен", "Кристина"];
    const fakeDishes = [];
    
    if (typeof database !== 'undefined') {
        for (let key in database) {
            database[key].items.forEach(item => { fakeDishes.push(item.name); });
        }
    }
    if (fakeDishes.length === 0) {
        fakeDishes.push("пасту карбонара", "классический украинский борщ", "тыквенный крем-суп", "домашние сырники с джемом", "стейк рибай");
    }

    setInterval(() => {
        const now = new Date();
        const timeString = now.toLocaleTimeString('uk-UA', { timeZone: 'Europe/Kyiv', hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const clockEl = document.getElementById('live-clock-time');
        if (clockEl) clockEl.innerText = timeString;
    }, 1000);

    setInterval(() => {
        const name = fakeNames[Math.floor(Math.random() * fakeNames.length)];
        let dish = fakeDishes[Math.floor(Math.random() * fakeDishes.length)];
        
        if (dish.toLowerCase() === "свиные ребрышки барбекю") {
            dish = "свиные ребрышки барбекю за 🔥 552 ₴";
        }
        
        const trackerText = document.getElementById('live-tracker-text');
        if (trackerText) {
            trackerText.style.opacity = 0;
            setTimeout(() => {
                trackerText.innerHTML = `🔥 <strong>${name}</strong> только что заказал(а) <em style="color:#ff6b6b; font-style:normal; font-weight:600;">${dish}</em>.`;
                trackerText.style.opacity = 1; playSound(650, 'sine', 0.05, 0.05);
            }, 400);
        }
    }, 8000);
}
document.addEventListener('DOMContentLoaded', startLiveTracker);
