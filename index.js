javascript

// СВЯЗЫВАНИЕ С HTML ЭЛЕМЕНТАМИ ЭКРАНОВ
const screenCategories = document.getElementById('screen-categories');
const screenRecipes = document.getElementById('screen-recipes');
const screenDetail = document.getElementById('screen-detail');

// ФУНКЦИЯ 1: ПОКАЗАТЬ РЕЦЕПТЫ ВЫБРАННОЙ КАТЕГОРИИ (ЭКРАН 2)
function showCategory(categoryKey) {
    const categoryData = database[categoryKey];
    document.getElementById('category-title').innerText = categoryData.title;
    
    const container = document.getElementById('recipes-container');
    container.innerHTML = ''; // Полная очистка контейнера перед генерацией

    if (!categoryData || categoryData.items.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#868e96;">Рецепты для этой категории скоро появятся!</p>';
    } else {
        categoryData.items.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'recipe-card';
            card.onclick = () => showRecipeDetail(recipe);
            
            // Чистая разметка карточки с локальным путем до картинки
            card.innerHTML = `
                <div class="recipe-img">
                    <img src="${recipe.imgUrl}" alt="${recipe.name}">
                </div>
                <div class="recipe-info">
                    <h3>${recipe.name}</h3>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // Логика переключения видимости экранов
    screenCategories.classList.add('hidden');
    screenRecipes.classList.remove('hidden');
    screenDetail.classList.add('hidden');
}

// ФУНКЦИЯ 2: ПОКАЗАТЬ ПОШАГОВЫЙ РЕЦЕПТ КОНКРЕТНОГО БЛЮДА (ЭКРАН 3)
function showRecipeDetail(recipe) {
    const container = document.getElementById('recipe-detail-container');
    
    // Настройка кнопки возврата назад к списку блюд текущей категории
    document.getElementById('btn-to-recipes').onclick = () => {
        screenDetail.classList.add('hidden');
        screenRecipes.classList.remove('hidden');
    };

    // Генерируем элементы списка ингредиентов
    const ingredientsHTML = recipe.ingredients.map(ing => `<li>${ing}</li>`).join('');
    
    // Генерируем элементы пошаговой инструкции приготовления
    const stepsHTML = recipe.steps.map((step, idx) => `
        <div class="step-item">
            <span class="step-number">${idx + 1}</span> ${step}
        </div>
    `).join('');

    // Рендерим всю страницу рецепта целиком
    container.innerHTML = `
        <div class="main-recipe-img">
            <img src="${recipe.imgUrl}" alt="${recipe.name}">
        </div>
        <h2>${recipe.name}</h2>
        
        <div class="ingredients-section">
            <h4>Ингредиенты:</h4>
            <ul>${ingredientsHTML}</ul>
        </div>

        <div class="steps-section">
            <h4>Пошаговое приготовление:</h4>
            <div>${stepsHTML}</div>
        </div>
    `;

    // Показываем экран детального рецепта
    screenRecipes.classList.add('hidden');
    screenDetail.classList.remove('hidden');
}

// ФУНКЦИЯ 3: ВЕРНУТЬСЯ НА ГЛАВНУЮ СТРАНИЦУ К КАТЕГОРИЯМ
function goToCategories() {
    screenRecipes.classList.add('hidden');
    screenCategories.classList.remove('hidden');
}

Use code with caution.