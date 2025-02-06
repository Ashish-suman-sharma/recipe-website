class APIHandler {
    // Weather API Methods
    static async getWeatherByLocation(lat, lon) {
        try {
            const response = await fetch(
                `${CONFIG.OPENWEATHER.BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${CONFIG.OPENWEATHER.API_KEY}&units=metric`
            );
            return await response.json();
        } catch (error) {
            console.error('Weather API Error:', error);
            throw error;
        }
    }

    // Unsplash API Methods
    static async getRecipeImage(query) {
        try {
            const response = await fetch(
                `${CONFIG.UNSPLASH.BASE_URL}/search/photos?query=${query}&client_id=${CONFIG.UNSPLASH.ACCESS_KEY}`
            );
            const data = await response.json();
            return data.results[0]?.urls?.regular || 'default-image-url.jpg';
        } catch (error) {
            console.error('Unsplash API Error:', error);
            throw error;
        }
    }

    // Spoonacular API Methods
    static async searchRecipesByIngredients(ingredients) {
        try {
            const response = await fetch(
                `${CONFIG.SPOONACULAR.BASE_URL}/findByIngredients?apiKey=${CONFIG.SPOONACULAR.API_KEY}&ingredients=${ingredients}&number=6`
            );
            return await response.json();
        } catch (error) {
            console.error('Spoonacular API Error:', error);
            throw error;
        }
    }

    static async getRecipeById(id) {
        try {
            const response = await fetch(
                `${CONFIG.SPOONACULAR.BASE_URL}/${id}/information?apiKey=${CONFIG.SPOONACULAR.API_KEY}`
            );
            return await response.json();
        } catch (error) {
            console.error('Spoonacular API Error:', error);
            throw error;
        }
    }

    static async searchRecipes(query) {
        try {
            const response = await fetch(
                `${CONFIG.SPOONACULAR.BASE_URL}/complexSearch?apiKey=${CONFIG.SPOONACULAR.API_KEY}&query=${query}&number=6`
            );
            return await response.json();
        } catch (error) {
            console.error('Spoonacular API Error:', error);
            throw error;
        }
    }

    // Gemini AI API Methods
    static async getMoodBasedSuggestions(mood) {
        try {
            const prompt = `Suggest 3 recipes that would be good for someone feeling ${mood}. Format the response as JSON with recipe names and brief descriptions.`;
            const response = await fetch(`${CONFIG.GEMINI.BASE_URL}?key=${CONFIG.GEMINI.API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Gemini AI API Error:', error);
            throw error;
        }
    }
}