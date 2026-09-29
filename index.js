const screenCategories = document.getElementById('screen-categories');
const screenRecipes = document.getElementById('screen-recipes');
const screenDetail = document.getElementById('screen-detail');

function showCategory(categoryKey) {
    const categoryData = database[categoryKey];
    document.getElementById('category-title').innerText = categoryData.title;
    
    const container = document.getElementById('recipes-container');
    container.innerHTML = ''; 

    if (categoryData && categoryData.items) {
        categoryData.items.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'recipe-card';
            card.onclick = function() { showRecipeDetail(recipe); };
            
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

    screenCategories.classList.add('hidden');
    screenRecipes.classList.remove('hidden');
    screenDetail.classList.add('hidden');
}

function showRecipeDetail(recipe) {
    const container = document.getElementById('recipe-detail-container');
    
    document.getElementById('btn-to-recipes').onclick = function() {
        screenDetail.classList.add('hidden');
        screenRecipes.classList.remove('hidden');
    };

    const ingredientsHTML = recipe.ingredients.map(ing => `<li>${ing}</li>`).join('');
    const stepsHTML = recipe.steps.map((step, idx) => `
        <div class="step-item">
            <span class="step-number">${idx + 1}</span> ${step}
        </div>
    `).join('');

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

    screenRecipes.classList.add('hidden');
    screenDetail.classList.remove('hidden');
}

function goToCategories() {
    screenRecipes.classList.add('hidden');
    screenCategories.classList.remove('hidden');
}
