class App {
    constructor() {
        this.currentLocation = null;
        this.weatherData = null;
        this.init();
    }

    async init() {
        // Initialize animations
        Animations.init();

        // Get user's location and weather
        await this.setupWeather();

        // Setup event listeners
        this.setupEventListeners();

        // Load initial content
        this.loadInitialContent();
    }

    async setupWeather() {
        try {
            const position = await this.getCurrentLocation();
            const weather = await APIHandler.getWeatherByLocation(
                position.coords.latitude,
                position.coords.longitude
            );
            this.updateWeatherWidget(weather);
        } catch (error) {
            console.error('Weather setup error:', error);
        }
    }

    getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            } else {
                reject(new Error('Geolocation is not supported'));
            }
        });
    }

    updateWeatherWidget(weather) {
        document.getElementById('temperature').textContent = `${Math.round(weather.main.temp)}°C`;
        document.getElementById('location').textContent = weather.name;
    }

    setupEventListeners() {
        // Main search functionality
        document.querySelector('.main-search').addEventListener('input', this.debounce(this.handleSearch.bind(this), 500));
        
        // Add event listener for Enter key press
        document.querySelector('.main-search').addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                this.handleSearch(event);
            }
        });

        document.querySelector('.search-btn').addEventListener('click', (event) => {
            this.handleSearch({ target: document.querySelector('.main-search') });
        });

        // Feature card clicks
        document.querySelectorAll('.feature-card').forEach(card => {
            card.addEventListener('click', () => {
                const feature = card.dataset.feature;
                this.loadFeatureContent(feature);
            });
        });
    }

    async handleSearch(event) {
        const query = event.target.value.trim();
        if (query.length < 3) return;

        try {
            Animations.showLoading();
            const results = await APIHandler.searchRecipes(query);
            this.displaySearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            Animations.hideLoading();
        }
    }

    displaySearchResults(results) {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="search-results">
                <h2>Search Results</h2>
                <div class="results-container"></div>
            </div>
        `;
        this.displayRecipeResults(results.results, mainContent.querySelector('.results-container'));
    }

    async loadFeatureContent(feature) {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = '';

        switch (feature) {
            case 'ingredients':
                this.loadIngredientsSearch(mainContent);
                break;
            case 'recipe-search':
                this.loadRecipeSearch(mainContent);
                break;
            case 'mood-food':
                this.loadMoodFood(mainContent);
                break;
        }
    }

    async loadIngredientsSearch(container) {
        const template = `
            <div class="ingredients-search glass-effect">
                <h2>Search by Ingredients</h2>
                <div class="ingredients-input">
                    <input type="text" placeholder="Enter ingredients (comma separated)">
                    <button class="search-btn"><i class="fas fa-search"></i></button>
                </div>
                <div class="results-container"></div>
            </div>
        `;
        container.innerHTML = template;

        const searchBtn = container.querySelector('.search-btn');
        searchBtn.addEventListener('click', async () => {
            const ingredients = container.querySelector('input').value;
            if (!ingredients) return;

            try {
                Animations.showLoading();
                const recipes = await APIHandler.searchRecipesByIngredients(ingredients);
                this.displayRecipeResults(recipes, container.querySelector('.results-container'));
            } catch (error) {
                console.error('Ingredient search error:', error);
            } finally {
                Animations.hideLoading();
            }
        });
    }

    async loadRecipeSearch(container) {
        const template = `
            <div class="recipe-search glass-effect">
                <h2>Search Recipes</h2>
                <div class="search-input">
                    <input type="text" placeholder="Enter recipe name">
                    <button class="search-btn"><i class="fas fa-search"></i></button>
                </div>
                <div class="results-container"></div>
            </div>
        `;
        container.innerHTML = template;

        const input = container.querySelector('input');
        input.addEventListener('input', this.debounce(async (e) => {
            const query = e.target.value;
            if (query.length < 3) return;

            try {
                Animations.showLoading();
                const recipes = await APIHandler.searchRecipes(query);
                this.displayRecipeResults(recipes.results, container.querySelector('.results-container'));
            } catch (error) {
                console.error('Recipe search error:', error);
            } finally {
                Animations.hideLoading();
            }
        }, 500));
    }

    async loadMoodFood(container) {
        const template = `
            <div class="mood-food glass-effect">
                <h2>Food for Your Mood</h2>
                <div class="mood-selector">
                    <button data-mood="happy">😊 Happy</button>
                    <button data-mood="sad">😢 Sad</button>
                    <button data-mood="stressed">😰 Stressed</button>
                    <button data-mood="energetic">⚡ Energetic</button>
                    <button data-mood="relaxed">😌 Relaxed</button>
                </div>
                <div class="results-container"></div>
            </div>
        `;
        container.innerHTML = template;

        container.querySelectorAll('.mood-selector button').forEach(btn => {
            btn.addEventListener('click', async () => {
                const mood = btn.dataset.mood;
                try {
                    Animations.showLoading();
                    const suggestions = await APIHandler.getMoodBasedSuggestions(mood);
                    this.displayMoodBasedResults(suggestions, container.querySelector('.results-container'));
                } catch (error) {
                    console.error('Mood food error:', error);
                } finally {
                    Animations.hideLoading();
                }
            });
        });
    }

    displayRecipeResults(recipes, container) {
        const html = recipes.map(recipe => `
            <div class="recipe-card glass-effect">
                <img src="${recipe.image}" alt="${recipe.title}">
                <h3>${recipe.title}</h3>
                <button class="view-recipe" data-id="${recipe.id}">View Recipe</button>
            </div>
        `).join('');

        container.innerHTML = html;
        Animations.animateRecipeCards(container);

        // Add click handlers for recipe cards
        container.querySelectorAll('.view-recipe').forEach(btn => {
            btn.addEventListener('click', async () => {
                const recipeId = btn.dataset.id;
                try {
                    Animations.showLoading();
                    const recipe = await APIHandler.getRecipeById(recipeId);
                    this.displayRecipeDetail(recipe);
                } catch (error) {
                    console.error('Recipe detail error:', error);
                } finally {
                    Animations.hideLoading();
                }
            });
        });
    }

    displayMoodBasedResults(suggestions, container) {
        const recipes = suggestions.candidates[0].content.parts[0].text;
        try {
            const parsedRecipes = JSON.parse(recipes);
            const html = parsedRecipes.map(recipe => `
                <div class="recipe-card glass-effect">
                    <h3>${recipe.name}</h3>
                    <p>${recipe.description}</p>
                    <button class="search-recipe" data-name="${recipe.name}">Find Recipe</button>
                </div>
            `).join('');

            container.innerHTML = html;
            Animations.animateRecipeCards(container);

            // Add click handlers for recipe search
            container.querySelectorAll('.search-recipe').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const recipeName = btn.dataset.name;
                    try {
                        Animations.showLoading();
                        const searchResults = await APIHandler.searchRecipes(recipeName);
                        this.displayRecipeResults(searchResults.results, container);
                    } catch (error) {
                        console.error('Recipe search error:', error);
                    } finally {
                        Animations.hideLoading();
                    }
                });
            });
        } catch (error) {
            console.error('Error parsing mood suggestions:', error);
            container.innerHTML = '<p>Unable to load mood-based suggestions. Please try again.</p>';
        }
    }

    displayRecipeDetail(recipe) {
        const modal = document.createElement('div');
        modal.className = 'recipe-modal glass-effect';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>${recipe.title}</h2>
                <img src="${recipe.image}" alt="${recipe.title}">
                <div class="recipe-info">
                    <p><i class="fas fa-clock"></i> Ready in ${recipe.readyInMinutes} minutes
                                        <p><i class="fas fa-users"></i> Serves ${recipe.servings}</p>
                </div>
                <div class="ingredients-section">
                    <h3>Ingredients</h3>
                    <ul>
                        ${recipe.extendedIngredients.map(ing => 
                            `<li>${ing.original}</li>`
                        ).join('')}
                    </ul>
                </div>
                <div class="instructions-section">
                    <h3>Instructions</h3>
                    <ol>
                        ${recipe.analyzedInstructions[0]?.steps.map(step => 
                            `<li>${step.step}</li>`
                        ).join('') || 'No instructions available'}
                    </ol>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add close functionality
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    loadInitialContent() {
        // Load weather-based recommendations
        this.loadWeatherBasedRecipes();
    }

    async loadWeatherBasedRecipes() {
        if (!this.weatherData) return;

        const temp = this.weatherData.main.temp;
        let foodType;

        // Determine food type based on temperature
        if (temp < 10) {
            foodType = 'soup,stew,hot';
        } else if (temp < 20) {
            foodType = 'comfort food,pasta,warm';
        } else if (temp < 30) {
            foodType = 'salad,fresh,light';
        } else {
            foodType = 'cold,refreshing,ice cream';
        }

        try {
            Animations.showLoading();
            const recipes = await APIHandler.searchRecipes(foodType);
            const mainContent = document.getElementById('main-content');
            mainContent.innerHTML = `
                <div class="weather-recommendations">
                    <h2>Weather-Based Recommendations</h2>
                    <p>Based on the current temperature of ${Math.round(temp)}°C</p>
                    <div class="results-container"></div>
                </div>
            `;
            this.displayRecipeResults(recipes.results, mainContent.querySelector('.results-container'));
        } catch (error) {
            console.error('Weather-based recommendations error:', error);
        } finally {
            Animations.hideLoading();
        }
    }

    // Utility function for debouncing
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});