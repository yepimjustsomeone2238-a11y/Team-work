// =========================================================
// ТВОЙ РОДНОЙ ИСХОДНЫЙ КОД ИЗ ФАЙЛА INDEX.JS (ЧАСТЬ 1)
// =========================================================

// Связывание с HTML элементами экранов и модалок
const screenCategories = document.getElementById('screen-categories');
const screenRecipes = document.getElementById('screen-recipes');
const screenDetail = document.getElementById('screen-detail');
const modalOrder = document.getElementById('modal-order');
const modalPayment = document.getElementById('modal-payment');
const toastNotification = document.getElementById('notification-toast');

// Массив для хранения выбранных позиций в корзине
let cart = [];

// 1. ФУНКЦИЯ: Переключение ТЕМНОЙ / СВЕТЛОЙ темы сайта
function toggleTheme() { 
    document.body.classList.toggle('dark-mode'); 
}

// Вспомогательные функции закрытия окон и навигации назад
function goToCategories() { 
    screenRecipes.classList.add('hidden'); 
    screenCategories.classList.remove('hidden'); 
}
function closeOrderModal() { 
    modalOrder.classList.add('hidden'); 
}
function closePaymentModal() { 
    modalPayment.classList.add('hidden'); 
}

// 2. ФУНКЦИЯ: Красивое всплывающее уведомление вместо системного alert
function showNotificationToast() {
    toastNotification.classList.remove('hidden');
    // Ровно через 3.5 секунды плашка сама мягко уберется с экрана
    setTimeout(() => {
        toastNotification.classList.add('hidden');
    }, 3500);
}

// 3. ФУНКЦИЯ: Показать список блюд внутри выбранной категории (Экран 2)
function showCategory(categoryKey) {
    const categoryData = database[categoryKey];
    if (!categoryData) return;
    
    document.getElementById('category-title').innerText = categoryData.title;
    const container = document.getElementById('recipes-container');
    container.innerHTML = ''; 

    if (categoryData && categoryData.items) {
        categoryData.items.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'recipe-card';
            card.onclick = function() { showRecipeDetail(recipe); };
            card.innerHTML = `
                <div class="recipe-img"><img src="${recipe.imgUrl}" alt="${recipe.name}"></div>
                <div class="recipe-info"><h3>${recipe.name}</h3></div>
            `;
            container.appendChild(card);
        });
    }
    screenCategories.classList.add('hidden'); 
    screenRecipes.classList.remove('hidden'); 
    screenDetail.classList.add('hidden');
}

// 4. ФУНКЦИЯ: Показать экран подробного пошагового рецепта (Экран 3)
function showRecipeDetail(recipe) {
    const container = document.getElementById('recipe-detail-container');
    document.getElementById('btn-to-recipes').onclick = function() {
        screenDetail.classList.add('hidden'); 
        screenRecipes.classList.remove('hidden');
    };
    const ingredientsHTML = recipe.ingredients.map(ing => `<li>${ing}</li>`).join('');
    const stepsHTML = recipe.steps.map((step, idx) => `
        <div class="step-item"><span class="step-number">${idx + 1}</span> ${step}</div>
    `).join('');

    container.innerHTML = `
        <div class="main-recipe-img"><img src="${recipe.imgUrl}" alt="${recipe.name}"></div>
        <h2>${recipe.name}</h2>
        <div class="ingredients-section"><h4>Ингредиенты:</h4><ul>${ingredientsHTML}</ul></div>
        <div class="steps-section"><h4>Пошаговое приготовление:</h4><div>${stepsHTML}</div></div>
    `;
    screenRecipes.classList.add('hidden'); 
    screenDetail.classList.remove('hidden');
}
// =========================================================
// ТВОЙ РОДНОЙ ИСХОДНЫЙ КОД ИЗ ФАЙЛА INDEX.JS (ЧАСТЬ 2)
// =========================================================

// 5. ФУНКЦИЯ: Открыть всплывающее окно онлайн-заказа блюд с мультивалютными ценами
function openOrderModal() {
    const container = document.getElementById('modal-menu-container');
    if (!container) return;
    container.innerHTML = ''; 
    for (let categoryKey in database) {
        database[categoryKey].items.forEach(recipe => {
            const uah = recipe.price;
            const usd = (uah / 40).toFixed(2); 
            const itemCard = document.createElement('div');
            itemCard.className = 'modal-item-card';
            itemCard.innerHTML = `
                <div class="modal-item-img" style="background-image: url('${recipe.imgUrl}')"></div>
                <div class="modal-item-info">
                    <h4>${recipe.name}</h4>
                    <div class="modal-item-meta">
                        <div class="modal-item-price">
                            <span>${uah} ₴</span>
                            <span style="font-size:0.8rem; color:#a0aec0;">$${usd}</span>
                        </div>
                        <button class="btn-modal-add" onclick="addToCart('${recipe.name}', ${uah})">В корзину</button>
                    </div>
                </div>
            `;
            container.appendChild(itemCard);
        });
    }
    modalOrder.classList.remove('hidden');
}

// 6. ФУНКЦИЯ: Добавление выбранного блюда в корзину
function addToCart(name, uahPrice) { 
    cart.push({ name: name, price: uahPrice }); 
    updateCartUI(); 
}

// 7. ФУНКЦИЯ: Обновление интерфейса правой боковой рамки заказа
function updateCartUI() {
    const container = document.getElementById('cart-items-container');
    const totalSpan = document.getElementById('cart-total-price');
    if (!container || !totalSpan) return;
    
    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-cart-msg">Корзина пуста.</p>'; 
        totalSpan.innerText = '0 ₴ / \$0.00'; 
        return;
    }
    container.innerHTML = ''; 
    let totalUah = 0;
    cart.forEach(item => {
        totalUah += item.price;
        const div = document.createElement('div'); 
        div.className = 'cart-item';
        div.innerHTML = `<span>${item.name}</span><span class="cart-item-price">${item.price} ₴</span>`;
        container.appendChild(div);
    });
    totalSpan.innerText = `${totalUah} ₴ / $${(totalUah / 40).toFixed(2)}`;
}

// 8. СИСТЕМА ОБШИРНОГО ОКНА ОПЛАТЫ КАРТОЙ С ЧЕКОМ ЗАКАЗА
function openPaymentModal() {
    if (cart.length === 0) { 
        showNotificationToast(); 
        return; 
    }
    const totalUah = cart.reduce((sum, item) => sum + item.price, 0);
    const totalUsd = (totalUah / 40).toFixed(2);
    
    modalPayment.querySelector('.modal-content').innerHTML = `
        <div class="modal-header-box"><h2>Оплата картой 💳</h2><span class="close-modal" onclick="closePaymentModal()">&times;</span></div>
        <div class="payment-layout-container">
            <div class="receipt-box">
                <h4>Ваш чек детализации:</h4>
                <div class="receipt-list" id="modal-receipt-items"></div>
                <div class="receipt-total"><span>Итого:</span><span>${totalUah} ₴ / $${totalUsd}</span></div>
            </div>
            <div class="payment-form">
                <div class="form-group"><label>Номер банковской карты</label><input type="text" id="card-number" placeholder="4400 5511 2233 4455" maxlength="19"></div>
                <div style="display:flex; gap:1rem;">
                    <div class="form-group" style="flex:1;"><label>Срок (ММ/ГГ)</label><input type="text" id="card-expiry" placeholder="MM/YY" maxlength="5"></div>
                    <div class="form-group" style="flex:1;"><label>CVC / CVV</label><input type="password" id="card-cvv" placeholder="•••" maxlength="3"></div>
                </div>
                <div class="form-group"><label>Имя держателя карты</label><input type="text" id="card-name" placeholder="IVAN IVANOV" style="text-transform:uppercase;"></div>
                <button class="btn-pay-submit" id="btn-submit-payment-action" onclick="processCardPayment()"><span class="spinner-icon"></span><span class="btn-text-content">Оплатить заказ</span></button>
            </div>
        </div>
    `;

    const receiptList = document.getElementById('modal-receipt-items');
    cart.forEach(item => {
        const itemDiv = document.createElement('div'); 
        itemDiv.className = 'receipt-item';
        itemDiv.innerHTML = `<span>${item.name}</span><strong>${item.price} ₴</strong>`;
        receiptList.appendChild(itemDiv);
    });

    setupCardMasks();
    modalPayment.classList.remove('hidden');
}

function setupCardMasks() {
    document.getElementById('card-number').addEventListener('input', function (e) {
        let v = e.target.value.replace(/\D/g, '').match(/(\d{1,4})/g);
        e.target.value = v ? v.join(' ') : '';
    });
    document.getElementById('card-expiry').addEventListener('input', function (e) {
        let v = e.target.value.replace(/\D/g, '');
        e.target.value = v.length >= 2 ? v.substring(0, 2) + '/' + v.substring(2, 4) : v;
    });
    document.getElementById('card-cvv').addEventListener('input', function (e) { 
        e.target.value = e.target.value.replace(/\D/g, ''); 
    });
}

function processCardPayment() {
    const n = document.getElementById('card-number').value, e = document.getElementById('card-expiry').value, c = document.getElementById('card-cvv').value, m = document.getElementById('card-name').value;
    if (n.length < 19 || e.length < 5 || c.length < 3 || m.trim() === '') { 
        alert('❌ Заполните данные карты корректно!'); 
        return; 
    }

    const btn = document.getElementById('btn-submit-payment-action');
    btn.classList.add('processing'); 
    btn.querySelector('.btn-text-content').innerText = 'Проверка карты...';

    setTimeout(() => {
        const overlay = document.createElement('div'); 
        overlay.className = 'payment-status-overlay';
        overlay.innerHTML = `<div class="pulse-circle"></div><div class="status-text-anim">Авторизация банка...</div>`;
        modalPayment.querySelector('.payment-layout-container').appendChild(overlay);

        setTimeout(() => {
            overlay.querySelector('.pulse-circle').style.backgroundColor = '#1ebd5a';
            overlay.querySelector('.status-text-anim').innerHTML = `
                ✅ Оплата завершена!<br>
                <span style="font-size:0.9rem; font-weight:normal; color:#718096;">
                    Ресторан готовит заказ. Курьер будет через 30 минут.
                </span>
            `;
            
            setTimeout(() => { 
                cart = []; 
                updateCartUI(); 
                closePaymentModal(); 
            }, 2500);
        }, 2500);
    }, 2000);
}

// =========================================================
// АВТОМАТИЧЕСКИЙ ФИКС ДЛЯ ОТОБРАЖЕНИЯ КАРТИНОК И ЧАСОВ
// =========================================================
function initProjectFixes() {
    // 1. Запуск бегущих часов в левой панели
    const clockTime = document.getElementById("live-clock-time");
    if (clockTime) {
        setInterval(() => {
            const now = new Date();
            clockTime.textContent = now.toTimeString().split(' ')[0];
        }, 1000);
    }

    // 2. Находим на странице пустые карточки и динамически ставим картинки из базы
    const cards = document.querySelectorAll(".category-card");
    cards.forEach(card => {
        const onClickAttr = card.getAttribute("onclick");
        if (onClickAttr) {
            // Вытаскиваем ключ категории, например: 'seafood' из "showCategory('seafood')"
            const match = onClickAttr.match(/'([^']+)'/);
            if (match && match[1]) {
                const key = match[1];
                const imgContainer = card.querySelector(".category-img");
                // Если картинка пустая (серый градиент) — ставим обложку из recipes-data.js
                if (imgContainer && database[key] && database[key].items && database[key].items.length > 0) {
                    imgContainer.style.backgroundImage = `url('${database[key].items[0].imgUrl}')`;
                }
            }
        }
    });
}

// Запускаем фикс сразу после загрузки страницы
document.addEventListener("DOMContentLoaded", initProjectFixes);
