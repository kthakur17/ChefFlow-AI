/**
 * ChefFlow AI - Application Controller
 * Handles UI interactions, state management, Gemini API communication,
 * and high-fidelity mock data fallback.
 */

// Application State
let appState = {
    apiKey: '',
    preferences: {
        diet: 'vegetarian',
        cuisine: 'indian',
        budget: 600,
        servings: 2,
        exclude: ''
    },
    mealPlan: null, // Holds the generated JSON structure
    activeMeal: 'breakfast', // breakfast | lunch | dinner
    timer: {
        intervalId: null,
        durationSeconds: 0,
        remainingSeconds: 0,
        isRunning: false,
        activeStepIndex: -1
    },
    checkedIngredients: {}, // Format: { "breakfast": [0, 2], "lunch": [1] }
    completedSteps: {}, // Format: { "breakfast": [0], "lunch": [] }
    checkedGroceryItems: [] // Array of grocery item names
};

// Mock Database for intelligent fallback demo modes
const mockDatabase = {
    // 1. Indian Vegetarian
    'indian_vegetarian': {
        "meals": {
            "breakfast": {
                "title": "Masala Oats & Spiced Chai",
                "description": "A warm, fiber-rich Indian style oatmeal infused with green peas, carrots, cumin, and turmeric, paired with classic cardamom chai.",
                "time": "15m",
                "cost": 80,
                "ingredients": [
                    {"name": "Rolled Oats", "quantity": "1 cup"},
                    {"name": "Mixed Vegetables (Peas, Carrots, Beans)", "quantity": "1/2 cup"},
                    {"name": "Mustard Seeds & Cumin", "quantity": "1 tsp"},
                    {"name": "Turmeric & Garam Masala", "quantity": "1/2 tsp"},
                    {"name": "Cardamom & Ginger (for tea)", "quantity": "1 tbsp"}
                ],
                "steps": [
                    {"num": 1, "title": "Prep Veggies & Oats", "instruction": "Finely chop carrots and beans. Rinse peas and set aside.", "durationSeconds": 180},
                    {"num": 2, "title": "Temper Spices", "instruction": "Heat 1 tsp oil in a pan, add mustard seeds and cumin until they splutter.", "durationSeconds": 120},
                    {"num": 3, "title": "Cook Vegetables", "instruction": "Sauté the chopped vegetables with turmeric and salt for 3 minutes.", "durationSeconds": 180},
                    {"num": 4, "title": "Simmer Oats", "instruction": "Add oats, 2.5 cups of water, and garam masala. Cover and cook on low heat for 5 minutes.", "durationSeconds": 300},
                    {"num": 5, "title": "Brew Spiced Chai", "instruction": "Boil 1 cup water with crushed cardamom and ginger. Add tea leaves, simmer, then add milk and boil.", "durationSeconds": 240}
                ]
            },
            "lunch": {
                "title": "Jeera Rice, Yellow Dal Tadka & Aloo Gobi",
                "description": "Classic home-style comfort food: fragrant cumin rice, tempered split pigeon pea dal, and dry-spiced cauliflower and potatoes.",
                "time": "35m",
                "cost": 180,
                "ingredients": [
                    {"name": "Toor Dal (Split Pigeon Peas)", "quantity": "1 cup"},
                    {"name": "Basmati Rice", "quantity": "1.5 cups"},
                    {"name": "Cauliflower Florets & Potatoes", "quantity": "2 cups"},
                    {"name": "Onion, Tomatoes, Ginger-Garlic paste", "quantity": "1 cup"},
                    {"name": "Ghee, Cumin Seeds, Dried Red Chillies", "quantity": "2 tbsp"}
                ],
                "steps": [
                    {"num": 1, "title": "Boil Rice & Dal", "instruction": "Pressure cook toor dal with turmeric and salt (3 whistles). Boil basmati rice separately with 1 tsp cumin seeds.", "durationSeconds": 900},
                    {"num": 2, "title": "Cook Aloo Gobi", "instruction": "Sauté cauliflower and potato wedges with turmeric, red chilli powder, and coriander powder until fork-tender (15 minutes).", "durationSeconds": 900},
                    {"num": 3, "title": "Prepare Dal Tempering (Tadka)", "instruction": "Heat ghee, add cumin, garlic, chopped onion, tomatoes, and dried red chillies. Cook until mushy.", "durationSeconds": 300},
                    {"num": 4, "title": "Assemble Dal", "instruction": "Pour the tadka into the cooked dal, stir well, garnish with chopped coriander.", "durationSeconds": 120}
                ]
            },
            "dinner": {
                "title": "Paneer Butter Masala with Tawa Roti",
                "description": "Soft cottage cheese cubes cooked in a rich, creamy, tomato-cashew gravy served with fresh, whole wheat rotis.",
                "time": "30m",
                "cost": 220,
                "ingredients": [
                    {"name": "Paneer (Cottage Cheese)", "quantity": "200g"},
                    {"name": "Tomatoes & Cashews (for gravy paste)", "quantity": "1 cup"},
                    {"name": "Kasturi Methi (Dried Fenugreek Leaves)", "quantity": "1 tsp"},
                    {"name": "Whole Wheat Flour (Atta) for Roti", "quantity": "1.5 cups"},
                    {"name": "Cream & Butter", "quantity": "2 tbsp"}
                ],
                "steps": [
                    {"num": 1, "title": "Knead Roti Dough", "instruction": "Mix whole wheat flour with water and a pinch of salt. Knead into soft dough, cover and set aside.", "durationSeconds": 480},
                    {"num": 2, "title": "Make Gravy Base", "instruction": "Boil tomatoes, onions, and cashews together. Blend into a silky-smooth puree.", "durationSeconds": 420},
                    {"num": 3, "title": "Cook Paneer Gravy", "instruction": "Melt butter, sauté ginger paste, add tomato-cashew puree and spices. Simmer for 8 minutes, add paneer cubes.", "durationSeconds": 600},
                    {"num": 4, "title": "Roll and Cook Rotis", "instruction": "Roll dough into flat circles and cook on a hot tawa (griddle) until puffed and spotted.", "durationSeconds": 480},
                    {"num": 5, "title": "Finish Gravy", "instruction": "Sprinkle crushed kasturi methi and stir in cream. Garnish paneer masala.", "durationSeconds": 120}
                ]
            }
        },
        "groceryList": [
            {
                "category": "Produce",
                "items": [
                    {"name": "Cauliflower & Potatoes", "quantity": "1 small head, 3 potatoes", "priceEst": 60},
                    {"name": "Tomatoes, Onions, Coriander", "quantity": "500g mix", "priceEst": 50},
                    {"name": "Mixed Vegetables (Peas, Carrots)", "quantity": "250g", "priceEst": 30}
                ]
            },
            {
                "category": "Dairy & Proteins",
                "items": [
                    {"name": "Paneer (Cottage Cheese)", "quantity": "200g", "priceEst": 100},
                    {"name": "Ghee, Butter & Cream", "quantity": "Small packs", "priceEst": 90},
                    {"name": "Milk", "quantity": "500ml", "priceEst": 30}
                ]
            },
            {
                "category": "Grains & Pantry",
                "items": [
                    {"name": "Basmati Rice & Wheat Flour", "quantity": "1kg each", "priceEst": 80},
                    {"name": "Toor Dal (Split Pigeon Peas)", "quantity": "500g", "priceEst": 60},
                    {"name": "Rolled Oats", "quantity": "250g", "priceEst": 40}
                ]
            }
        ],
        "substitutions": [
            {"original": "Paneer", "replacement": "Tofu", "reason": "Saves ₹40 and lowers saturated fat count.", "type": "cost"},
            {"original": "Basmati Rice", "replacement": "Brown Rice", "reason": "Higher fiber contents, better glycemic index.", "type": "diet"},
            {"original": "Cashews", "replacement": "Melon Seeds (Magaz)", "reason": "A nut-free and budget-friendly thickener for the curry gravy.", "type": "allergy"}
        ],
        "budgetFeasibility": {
            "status": "feasible",
            "totalEstimatedCost": 480,
            "costPerServing": 240,
            "savings": 120,
            "tips": [
                "Using seasonal local vegetables for Aloo Gobi helps keep produce costs under ₹60.",
                "Bulk buying dry lentils and basmati rice reduces the single-meal cost significantly.",
                "Replace cream with whisked home curd to save on fat and extra grocery shopping cost."
            ]
        }
    },
    // 2. Mediterranean/Italian Vegetarian
    'italian_vegetarian': {
        "meals": {
            "breakfast": {
                "title": "Avocado Tomato Toast & Olive Oil Drizzle",
                "description": "Toasted sourdough slices topped with mashed avocado, cherry tomatoes, extra virgin olive oil, and a dash of sea salt.",
                "time": "10m",
                "cost": 120,
                "ingredients": [
                    {"name": "Sourdough Bread", "quantity": "2 slices"},
                    {"name": "Ripe Avocado", "quantity": "1 piece"},
                    {"name": "Cherry Tomatoes", "quantity": "6-8 pieces"},
                    {"name": "Extra Virgin Olive Oil", "quantity": "1 tbsp"}
                ],
                "steps": [
                    {"num": 1, "title": "Toast Bread", "instruction": "Toast sourdough slices until crispy brown.", "durationSeconds": 120},
                    {"num": 2, "title": "Prep Avocado", "instruction": "Slice avocado, mash with a fork, season with lemon juice, salt, and pepper.", "durationSeconds": 180},
                    {"num": 3, "title": "Slice Tomatoes", "instruction": "Cut cherry tomatoes into halves.", "durationSeconds": 120},
                    {"num": 4, "title": "Assemble Toast", "instruction": "Spread mashed avocado on sourdough, top with tomatoes, drizzle olive oil, and sprinkle sea salt.", "durationSeconds": 180}
                ]
            },
            "lunch": {
                "title": "Pesto Pasta Salad with Chickpeas & Spinach",
                "description": "Al dente penne pasta tossed in aromatic basil pesto, with protein-packed chickpeas, fresh baby spinach, and parmesan cheese.",
                "time": "20m",
                "cost": 180,
                "ingredients": [
                    {"name": "Penne Pasta", "quantity": "1.5 cups"},
                    {"name": "Basil Pesto", "quantity": "3 tbsp"},
                    {"name": "Canned Chickpeas (Rinsed)", "quantity": "1 cup"},
                    {"name": "Baby Spinach", "quantity": "1 cup"},
                    {"name": "Grated Parmesan", "quantity": "2 tbsp"}
                ],
                "steps": [
                    {"num": 1, "title": "Boil Pasta", "instruction": "Boil water in a large pot. Cook penne pasta with salt for 10-12 minutes until al dente.", "durationSeconds": 720},
                    {"num": 2, "title": "Rinse & Wash", "instruction": "Rinse canned chickpeas and drain the water. Wash baby spinach thoroughly.", "durationSeconds": 180},
                    {"num": 3, "title": "Toss Ingredients", "instruction": "Drain pasta, let it cool slightly. Toss in a large bowl with pesto, spinach, chickpeas, and grated parmesan.", "durationSeconds": 300}
                ]
            },
            "dinner": {
                "title": "Rustic Tomato Soup with Cheese Quesadilla",
                "description": "A velvety tomato basil soup paired with a crispy, melted cheese quesadilla for absolute comforting satisfaction.",
                "time": "25m",
                "cost": 150,
                "ingredients": [
                    {"name": "Canned Tomatoes (Pureed)", "quantity": "1 can (400g)"},
                    {"name": "Onion, Garlic, Italian Herbs", "quantity": "1/2 cup mix"},
                    {"name": "Tortillas", "quantity": "2 pieces"},
                    {"name": "Shredded Mozzarella Cheese", "quantity": "1/2 cup"},
                    {"name": "Vegetable Stock", "quantity": "1 cup"}
                ],
                "steps": [
                    {"num": 1, "title": "Sauté Aromatics", "instruction": "Sauté chopped onion and minced garlic in olive oil until translucent.", "durationSeconds": 180},
                    {"num": 2, "title": "Simmer Soup", "instruction": "Add tomato puree, vegetable stock, dried Italian herbs, salt, and pepper. Simmer for 15 minutes.", "durationSeconds": 900},
                    {"num": 3, "title": "Grill Quesadilla", "instruction": "Place cheese between two tortillas and toast on a hot griddle until cheese melts and tortilla is golden brown.", "durationSeconds": 300},
                    {"num": 4, "title": "Blend Soup", "instruction": "Use an immersion blender to smooth the soup. Garnish with basil and serve.", "durationSeconds": 120}
                ]
            }
        },
        "groceryList": [
            {
                "category": "Produce",
                "items": [
                    {"name": "Avocado & Cherry Tomatoes", "quantity": "1 avocado, 200g tomatoes", "priceEst": 110},
                    {"name": "Baby Spinach & Garlic", "quantity": "150g spinach, 1 head garlic", "priceEst": 40}
                ]
            },
            {
                "category": "Dairy & Pantry",
                "items": [
                    {"name": "Penne Pasta & Canned Tomatoes", "quantity": "500g pasta, 1 can tomatoes", "priceEst": 85},
                    {"name": "Basil Pesto & Olive Oil", "quantity": "1 jar pesto, small olive oil bottle", "priceEst": 150},
                    {"name": "Cheese (Mozzarella & Parmesan)", "quantity": "150g mix", "priceEst": 110},
                    {"name": "Tortillas & Chickpeas", "quantity": "1 pack tortillas, 1 can chickpeas", "priceEst": 65}
                ]
            }
        ],
        "substitutions": [
            {"original": "Sourdough", "replacement": "Whole Wheat Bread", "reason": "More budget-friendly and widely available.", "type": "cost"},
            {"original": "Mozzarella", "replacement": "Low-fat Cheddar", "reason": "Slightly fewer calories and saturated fat.", "type": "diet"},
            {"original": "Basil Pesto", "replacement": "Parsley Oil Paste", "reason": "Nut-free alternative if pesto contains walnuts/pine nuts.", "type": "allergy"}
        ],
        "budgetFeasibility": {
            "status": "feasible",
            "totalEstimatedCost": 560,
            "costPerServing": 280,
            "savings": 40,
            "tips": [
                "Buying house-brand pasta and canned chickpeas saves up to ₹30 compared to import brands.",
                "Making basil pesto at home is 3x cheaper than buying jarred pesto.",
                "Use seasonal greens instead of spinach if local prices fluctuate."
            ]
        }
    }
};

// Generic fallback recipe structure when specific combination isn't pre-coded
const defaultRecipeFallback = {
    "meals": {
        "breakfast": {
            "title": "Healthy AI Choice Fruit Bowl & Oats",
            "description": "Rolled oats simmered in plant milk topped with seasonal berries, sliced banana, and mixed seeds.",
            "time": "10m",
            "cost": 100,
            "ingredients": [
                {"name": "Rolled Oats", "quantity": "1 cup"},
                {"name": "Banana & Berries", "quantity": "1 cup"},
                {"name": "Almond/Soy Milk", "quantity": "1 cup"},
                {"name": "Chia Seeds", "quantity": "1 tsp"}
            ],
            "steps": [
                {"num": 1, "title": "Cook Oats", "instruction": "Boil oats in plant milk for 5 minutes until soft.", "durationSeconds": 300},
                {"num": 2, "title": "Top Fruits", "instruction": "Slice banana, rinse berries, and place on top of warm oatmeal along with chia seeds.", "durationSeconds": 180}
            ]
        },
        "lunch": {
            "title": "Stir-fried Tofu & Seasonal Vegetables",
            "description": "Crispy tofu blocks tossed with broccoli, bell peppers, carrots in a light soy-ginger glaze.",
            "time": "20m",
            "cost": 180,
            "ingredients": [
                {"name": "Tofu Blocks", "quantity": "200g"},
                {"name": "Broccoli & Bell Peppers", "quantity": "2 cups"},
                {"name": "Soy Sauce & Ginger", "quantity": "2 tbsp"},
                {"name": "Sesame Oil", "quantity": "1 tbsp"}
            ],
            "steps": [
                {"num": 1, "title": "Crisp Tofu", "instruction": "Cube tofu and pan-fry in sesame oil until golden-brown.", "durationSeconds": 360},
                {"num": 2, "title": "Stir-Fry Veggies", "instruction": "Add broccoli, carrots, and peppers. Cook on high heat for 6 minutes.", "durationSeconds": 360},
                {"num": 3, "title": "Glaze", "instruction": "Pour soy sauce and grated ginger over, toss for 2 minutes and serve.", "durationSeconds": 120}
            ]
        },
        "dinner": {
            "title": "AI Curated Hearty Vegetable Soup & Rice",
            "description": "A rustic vegetable broth cooked with carrots, beans, celery, served with steamed brown rice.",
            "time": "25m",
            "cost": 150,
            "ingredients": [
                {"name": "Mixed Soup Vegetables", "quantity": "2.5 cups"},
                {"name": "Vegetable Broth", "quantity": "2 cups"},
                {"name": "Brown Rice", "quantity": "1 cup"}
            ],
            "steps": [
                {"num": 1, "title": "Cook Rice", "instruction": "Boil brown rice in 2 cups water for 20 minutes.", "durationSeconds": 1200},
                {"num": 2, "title": "Simmer Soup", "instruction": "Boil mixed vegetables in vegetable broth with salt, pepper and dry herbs for 15 minutes.", "durationSeconds": 900}
            ]
        }
    },
    "groceryList": [
        {
            "category": "Produce",
            "items": [
                {"name": "Banana, Berries & Mixed Veggies", "quantity": "Assorted", "priceEst": 150},
                {"name": "Broccoli & Peppers", "quantity": "250g", "priceEst": 70}
            ]
        },
        {
            "category": "Dairy & Pantry",
            "items": [
                {"name": "Oats, Plant Milk, Brown Rice", "quantity": "Pantry Staples", "priceEst": 110},
                {"name": "Tofu & Sauces", "quantity": "200g tofu, spices", "priceEst": 100}
            ]
        }
    ],
    "substitutions": [
        {"original": "Almond Milk", "replacement": "Regular Dairy Milk", "reason": "Lower cost option.", "type": "cost"},
        {"original": "Tofu", "replacement": "Chicken Breast", "reason": "High protein substitute.", "type": "diet"},
        {"original": "Soy Sauce", "replacement": "Coconut Aminos", "reason": "Gluten-free/Soy-free alternative.", "type": "allergy"}
    ],
    "budgetFeasibility": {
        "status": "feasible",
        "totalEstimatedCost": 430,
        "costPerServing": 215,
        "savings": 170,
        "tips": [
            "Cook in bulk to reduce fuel consumption and optimize ingredient usage.",
            "Utilize market fresh greens instead of expensive exotic produce."
        ]
    }
};

// UI Elements References
const elements = {
    apiKeyInput: document.getElementById('gemini-api-key'),
    toggleKeyVisibility: document.getElementById('toggle-key-visibility'),
    saveApiKeyBtn: document.getElementById('save-api-key'),
    apiStatus: document.getElementById('api-status'),
    
    preferencesForm: document.getElementById('preferences-form'),
    btnGenerate: document.getElementById('btn-generate'),
    servingsDec: document.getElementById('servings-dec'),
    servingsInc: document.getElementById('servings-inc'),
    servingsVal: document.getElementById('pref-servings'),
    
    welcomeView: document.getElementById('welcome-view'),
    loadingView: document.getElementById('loading-view'),
    dashboardView: document.getElementById('dashboard-view'),
    btnQuickStart: document.getElementById('btn-quick-start'),
    loadingTip: document.getElementById('loading-tip'),
    
    // Budget
    budgetStatusBadge: document.getElementById('budget-status-badge'),
    gaugeFillArc: document.getElementById('gauge-fill-arc'),
    totalEstimatedCost: document.getElementById('total-estimated-cost'),
    targetBudgetDisplay: document.getElementById('target-budget-display'),
    metricEstCost: document.getElementById('metric-est-cost'),
    metricCostPerServing: document.getElementById('metric-cost-per-serving'),
    metricSavings: document.getElementById('metric-savings'),
    aiBudgetTips: document.getElementById('ai-budget-tips'),
    
    // Tabs & Meal
    mealTabs: document.querySelectorAll('.meal-tab'),
    mealTitle: document.getElementById('meal-title'),
    mealDescription: document.getElementById('meal-description'),
    mealTime: document.getElementById('meal-time'),
    mealCost: document.getElementById('meal-cost'),
    mealIngredients: document.getElementById('meal-ingredients'),
    ingredientsProgress: document.getElementById('ingredients-progress'),
    ingredientsBarFill: document.getElementById('ingredients-bar-fill'),
    
    // Cooking Step Checklist
    mealSteps: document.getElementById('meal-steps'),
    stepsProgressText: document.getElementById('steps-progress-text'),
    stepsBarFill: document.getElementById('steps-bar-fill'),
    
    // Timer
    timerDisplay: document.getElementById('timer-display'),
    timerStepNum: document.getElementById('timer-step-num'),
    btnTimerToggle: document.getElementById('btn-timer-toggle'),
    btnTimerReset: document.getElementById('btn-timer-reset'),
    timerPlayIcon: document.getElementById('timer-play-icon'),
    timerPauseIcon: document.getElementById('timer-pause-icon'),
    timerBell: document.getElementById('timer-bell'),
    
    // Bottom Section
    groceryListContainer: document.getElementById('grocery-list-container'),
    btnCopyGrocery: document.getElementById('btn-copy-grocery'),
    subSearchInput: document.getElementById('sub-search-input'),
    substitutionListContainer: document.getElementById('substitution-list-container')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    loadApiKey();
    setupEventListeners();
});

// Load API Key from local storage
function loadApiKey() {
    const defaultKey = 'AQ.Ab8RN6JXj_vShcasVD8pWQoBfBWSILw4Z3x1AIf2skXbO_nNZQ';
    const savedKey = localStorage.getItem('gemini_api_key') || defaultKey;
    if (savedKey && savedKey.startsWith('AIzaSy')) {
        appState.apiKey = savedKey;
        elements.apiKeyInput.value = savedKey;
        updateApiStatus(true);
    } else {
        appState.apiKey = savedKey;
        elements.apiKeyInput.value = (savedKey === defaultKey) ? '' : savedKey;
        updateApiStatus(false);
    }
}

// Update API Connected indicator badge
function updateApiStatus(connected) {
    const indicator = elements.apiStatus.querySelector('.status-indicator');
    const label = elements.apiStatus.querySelector('.status-label');
    
    if (connected) {
        indicator.className = "status-indicator status-online";
        label.textContent = "AI Live Connected";
        elements.apiStatus.style.border = "1px solid rgba(16, 185, 129, 0.4)";
    } else {
        indicator.className = "status-indicator status-offline";
        label.textContent = "Demo Mode (Free)";
        elements.apiStatus.style.border = "1px solid rgba(245, 158, 11, 0.4)";
    }
}

// Event Listeners Setup
function setupEventListeners() {
    // API Key Actions
    elements.saveApiKeyBtn.addEventListener('click', () => {
        const key = elements.apiKeyInput.value.trim();
        if (key) {
            appState.apiKey = key;
            localStorage.setItem('gemini_api_key', key);
            updateApiStatus(true);
            showNotification('Successfully connected Gemini API!');
        } else {
            appState.apiKey = '';
            localStorage.removeItem('gemini_api_key');
            updateApiStatus(false);
            showNotification('Cleared API Key. Demo Mode Activated.');
        }
    });

    elements.toggleKeyVisibility.addEventListener('click', () => {
        const isPassword = elements.apiKeyInput.type === 'password';
        elements.apiKeyInput.type = isPassword ? 'text' : 'password';
    });

    // Servings selectors
    elements.servingsDec.addEventListener('click', () => {
        let val = parseInt(elements.servingsVal.value);
        if (val > 1) {
            elements.servingsVal.value = val - 1;
        }
    });

    elements.servingsInc.addEventListener('click', () => {
        let val = parseInt(elements.servingsVal.value);
        if (val < 10) {
            elements.servingsVal.value = val + 1;
        }
    });

    // Quick start button
    elements.btnQuickStart.addEventListener('click', () => {
        document.getElementById('pref-diet').value = 'vegetarian';
        document.getElementById('pref-cuisine').value = 'indian';
        generatePlan();
    });

    // Form Submit (Meal Plan Generation)
    elements.preferencesForm.addEventListener('submit', (e) => {
        e.preventDefault();
        generatePlan();
    });

    // Meal Plan Tabs navigation
    elements.mealTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            elements.mealTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const selectedMeal = tab.getAttribute('data-meal');
            switchMeal(selectedMeal);
        });
    });

    // Kitchen Timer Actions
    elements.btnTimerToggle.addEventListener('click', toggleTimer);
    elements.btnTimerReset.addEventListener('click', resetTimer);

    // Copy Grocery List
    elements.btnCopyGrocery.addEventListener('click', copyGroceryToClipboard);

    // Substitution Hub search filter
    elements.subSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        filterSubstitutions(query);
    });
}

// Custom simple toast notification builder
function showNotification(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.position = 'fixed';
    toast.style.bottom = '30px';
    toast.style.right = '30px';
    toast.style.backgroundColor = '#131b2e';
    toast.style.border = '1px solid #10b981';
    toast.style.color = '#f8fafc';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.4)';
    toast.style.fontFamily = 'Outfit, sans-serif';
    toast.style.fontWeight = '600';
    toast.style.fontSize = '14px';
    toast.style.zIndex = '9999';
    toast.style.transition = 'all 0.3s ease';
    toast.textContent = msg;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Primary Core Method: Generate Daily Meal Plan
async function generatePlan() {
    // Gather Preferences
    appState.preferences = {
        diet: document.getElementById('pref-diet').value,
        cuisine: document.getElementById('pref-cuisine').value,
        budget: parseFloat(elements.preferencesForm.querySelector('#pref-budget').value) || 600,
        servings: parseInt(elements.servingsVal.value),
        exclude: document.getElementById('pref-exclude').value.trim()
    };

    // Transition view states (Show Loader)
    elements.welcomeView.classList.add('hidden');
    elements.dashboardView.classList.add('hidden');
    elements.loadingView.classList.remove('hidden');

    // Cycle custom loading texts for rich visual effect
    const tipsList = [
        "Sourcing recipe ideas based on your diet...",
        "Evaluating grocery item prices and quantities...",
        "Double-checking daily budget constraint compatibility...",
        "Creating step-by-step to-do lists and active timers..."
    ];
    let tipIdx = 0;
    const interval = setInterval(() => {
        elements.loadingTip.textContent = tipsList[tipIdx];
        tipIdx = (tipIdx + 1) % tipsList.length;
    }, 2000);

    try {
        if (appState.apiKey && appState.apiKey.startsWith('AIzaSy')) {
            try {
                // Live Gemini API request
                appState.mealPlan = await fetchFromGemini();
            } catch (apiErr) {
                console.warn("Gemini API call failed, falling back to Demo Mode", apiErr);
                appState.mealPlan = await fetchMockData();
                showNotification('AI Engine offline. Loaded local culinary simulation.');
            }
        } else {
            // High fidelity Mock generation
            appState.mealPlan = await fetchMockData();
        }

        // Initialize state variables for progress tracking
        appState.checkedIngredients = { breakfast: [], lunch: [], dinner: [] };
        appState.completedSteps = { breakfast: [], lunch: [], dinner: [] };
        appState.checkedGroceryItems = [];

        // Clear existing active timers
        if (appState.timer.intervalId) {
            clearInterval(appState.timer.intervalId);
            appState.timer.intervalId = null;
        }
        appState.timer.isRunning = false;
        appState.timer.activeStepIndex = -1;

        // Render sections
        renderBudgetFeasibility();
        renderGroceryList();
        renderSubstitutions();
        
        // Load default tab (Breakfast)
        elements.mealTabs.forEach(t => t.classList.remove('active'));
        elements.mealTabs[0].classList.add('active');
        appState.activeMeal = 'breakfast';
        switchMeal('breakfast');

        // Transition view states (Show Dashboard)
        clearInterval(interval);
        elements.loadingView.classList.add('hidden');
        elements.dashboardView.classList.remove('hidden');
        showNotification('Daily Meal Plan Created successfully!');
    } catch (err) {
        clearInterval(interval);
        console.error("Plan Generation Error: ", err);
        elements.loadingView.classList.add('hidden');
        elements.welcomeView.classList.remove('hidden');
        alert("Failed to generate meal plan. Error details: " + err.message);
    }
}

// Fetch from Google Gemini API Beta endpoint
async function fetchFromGemini() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${appState.apiKey}`;
    
    // Design strict engineering prompt to get formatted JSON output
    const prompt = `
Generate a structured, budget-conscious daily meal plan (Breakfast, Lunch, Dinner) based on these constraints:
- Dietary focus: ${appState.preferences.diet}
- Cuisine Style: ${appState.preferences.cuisine}
- Target Daily Budget Limit: ₹${appState.preferences.budget} (INR)
- Servings (For how many people): ${appState.preferences.servings} people
- Ingredients to Avoid/Allergies: ${appState.preferences.exclude || "None"}

You MUST respond with a single valid JSON block ONLY. Do NOT wrap it in any Markdown formatting (no triple backticks), and do not add any conversational text. Simply output the raw JSON string matching this exact schema:

{
  "meals": {
    "breakfast": {
      "title": "Title of Breakfast",
      "description": "Short delicious description",
      "time": "e.g., 15m",
      "cost": 100,
      "ingredients": [
        {"name": "Ingredient Name", "quantity": "e.g., 2 pieces"}
      ],
      "steps": [
        {"num": 1, "title": "Step Heading", "instruction": "Clear detailed instruction", "durationSeconds": 180}
      ]
    },
    "lunch": {
      "title": "Title of Lunch",
      "description": "Short delicious description",
      "time": "e.g., 30m",
      "cost": 200,
      "ingredients": [
         {"name": "Ingredient Name", "quantity": "e.g., 1 cup"}
      ],
      "steps": [
        {"num": 1, "title": "Step Heading", "instruction": "Clear detailed instruction", "durationSeconds": 240}
      ]
    },
    "dinner": {
      "title": "Title of Dinner",
      "description": "Short delicious description",
      "time": "e.g., 25m",
      "cost": 180,
      "ingredients": [
         {"name": "Ingredient Name", "quantity": "e.g., 200g"}
      ],
      "steps": [
        {"num": 1, "title": "Step Heading", "instruction": "Clear detailed instruction", "durationSeconds": 300}
      ]
    }
  },
  "groceryList": [
    {
      "category": "Produce",
      "items": [
        {"name": "Item name", "quantity": "e.g., 500g", "priceEst": 60}
      ]
    },
    {
      "category": "Dairy & Pantry",
      "items": [
        {"name": "Item name", "quantity": "e.g., 1 packet", "priceEst": 40}
      ]
    }
  ],
  "substitutions": [
    {
      "original": "Name of ingredient",
      "replacement": "Alternative swap item",
      "reason": "Detailed benefit for swapping (e.g. saves ₹30, makes it dairy-free)",
      "type": "diet" or "cost" or "allergy"
    }
  ],
  "budgetFeasibility": {
    "status": "feasible" or "tight" or "over_budget",
    "totalEstimatedCost": 480,
    "costPerServing": 240,
    "savings": 120,
    "tips": [
      "AI financial optimization tip 1",
      "AI financial optimization tip 2"
    ]
  }
}
`;

    const requestBody = {
        contents: [
            {
                parts: [
                    { text: prompt }
                ]
            }
        ],
        generationConfig: {
            responseMimeType: "application/json"
        }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API Error status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    let responseText = data.candidates[0].content.parts[0].text;

    // Clean JSON response (handling any possible markdown wrapping fallback)
    responseText = cleanJsonString(responseText);

    try {
        return JSON.parse(responseText);
    } catch (parseErr) {
        console.warn("JSON Parse direct fail. Attempting manual regex capture...", parseErr);
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Could not parse structured JSON from AI response: " + responseText.substring(0, 100));
    }
}

// Utility to clean model output wrapper backticks
function cleanJsonString(str) {
    let clean = str.trim();
    if (clean.startsWith('```json')) {
        clean = clean.substring(7);
    } else if (clean.startsWith('```')) {
        clean = clean.substring(3);
    }
    if (clean.endsWith('```')) {
        clean = clean.substring(0, clean.length - 3);
    }
    return clean.trim();
}

// Simulates API fetching with customized mock payloads
function fetchMockData() {
    return new Promise((resolve) => {
        setTimeout(() => {
            const key = `${appState.preferences.cuisine}_${appState.preferences.diet}`;
            let result = mockDatabase[key];
            
            if (!result) {
                // If specific combination not matched, use default fallback and adjust titles to input preferences
                result = JSON.parse(JSON.stringify(defaultRecipeFallback));
                
                // Capitalize inputs for titles
                const capitalizedDiet = appState.preferences.diet.charAt(0).toUpperCase() + appState.preferences.diet.slice(1);
                const capitalizedCuisine = appState.preferences.cuisine.charAt(0).toUpperCase() + appState.preferences.cuisine.slice(1);
                
                result.meals.breakfast.title = `${capitalizedCuisine} ${capitalizedDiet} breakfast Skillet`;
                result.meals.lunch.title = `${capitalizedCuisine} ${capitalizedDiet} lunch Bowl`;
                result.meals.dinner.title = `${capitalizedCuisine} Rustic Stew`;
            }
            
            // Scaled estimated prices based on servings preference dynamically!
            const servingsScale = appState.preferences.servings / 2;
            const updated = JSON.parse(JSON.stringify(result));
            
            let total = 0;
            // Adjust costs inside the active meals
            Object.keys(updated.meals).forEach(mKey => {
                updated.meals[mKey].cost = Math.round(updated.meals[mKey].cost * servingsScale);
                total += updated.meals[mKey].cost;
            });
            
            // Adjust costs in grocery list
            updated.groceryList.forEach(category => {
                category.items.forEach(item => {
                    item.priceEst = Math.round(item.priceEst * servingsScale);
                });
            });

            // Recalculate feasibility logic values
            updated.budgetFeasibility.totalEstimatedCost = total;
            updated.budgetFeasibility.costPerServing = Math.round(total / appState.preferences.servings);
            updated.budgetFeasibility.savings = Math.max(0, appState.preferences.budget - total);
            
            if (total > appState.preferences.budget) {
                updated.budgetFeasibility.status = 'over_budget';
            } else if (total > appState.preferences.budget * 0.85) {
                updated.budgetFeasibility.status = 'tight';
            } else {
                updated.budgetFeasibility.status = 'feasible';
            }

            resolve(updated);
        }, 1500); // Visual delay for realism
    });
}

// Render Section: Budget Feasibility Indicator Dashboard
function renderBudgetFeasibility() {
    const feat = appState.mealPlan.budgetFeasibility;
    const target = appState.preferences.budget;
    
    elements.totalEstimatedCost.textContent = `₹${feat.totalEstimatedCost}`;
    elements.targetBudgetDisplay.textContent = target;
    
    elements.metricEstCost.textContent = `₹${feat.totalEstimatedCost}`;
    elements.metricCostPerServing.textContent = `₹${feat.costPerServing}`;
    elements.metricSavings.textContent = `₹${feat.savings}`;
    
    // Set colors per metric status
    if (feat.totalEstimatedCost > target) {
        elements.metricSavings.className = "metric-value text-red";
        elements.metricSavings.textContent = `-₹${Math.abs(feat.savings)}`;
    } else {
        elements.metricSavings.className = "metric-value text-green";
    }

    // Set Status Badge
    let statusClass = 'badge';
    let statusLabel = 'Feasible';
    
    if (feat.status === 'over_budget' || feat.totalEstimatedCost > target) {
        statusClass = 'badge danger';
        statusLabel = 'Budget Exceeded';
    } else if (feat.status === 'tight') {
        statusClass = 'badge warning';
        statusLabel = 'Tight Budget';
    }
    elements.budgetStatusBadge.className = statusClass;
    elements.budgetStatusBadge.textContent = statusLabel;

    // Calculate circular gauge angle
    const percentage = Math.min(100, (feat.totalEstimatedCost / target) * 100);
    // Gauge stroke-dashoffset: total length of path is 125.6 (circumference of arc)
    // 0% = 125.6 offset (empty), 100% = 0 offset (full)
    const strokeDash = 125.6;
    const offset = strokeDash - (percentage / 100) * strokeDash;
    elements.gaugeFillArc.setAttribute('stroke-dashoffset', offset);
    
    // Apply gauge coloring gradient dynamically
    if (percentage > 100) {
        elements.gaugeFillArc.style.stroke = 'var(--danger)';
    } else if (percentage > 85) {
        elements.gaugeFillArc.style.stroke = 'var(--warning)';
    } else {
        elements.gaugeFillArc.style.stroke = 'var(--accent)';
    }

    // Render Tips list
    elements.aiBudgetTips.innerHTML = '';
    feat.tips.forEach(tip => {
        const li = document.createElement('li');
        li.textContent = tip;
        elements.aiBudgetTips.appendChild(li);
    });
}

// Render Section: Interactive Meal detail switches
function switchMeal(mealKey) {
    appState.activeMeal = mealKey;
    const meal = appState.mealPlan.meals[mealKey];
    
    // Populate simple texts
    elements.mealTitle.textContent = meal.title;
    elements.mealDescription.textContent = meal.description;
    elements.mealTime.textContent = meal.time;
    elements.mealCost.textContent = `Est: ₹${meal.cost}`;
    
    // Reset timer display details
    elements.timerStepNum.textContent = `Step 1`;
    const firstStepDuration = meal.steps[0]?.durationSeconds || 0;
    elements.timerDisplay.textContent = formatTime(firstStepDuration);
    appState.timer.durationSeconds = firstStepDuration;
    appState.timer.remainingSeconds = firstStepDuration;
    appState.timer.activeStepIndex = 0;
    
    // Pause any active ticking clock
    if (appState.timer.isRunning) {
        toggleTimer(); 
    }

    // Load Ingredients List
    renderMealIngredients(mealKey);
    
    // Load Instructions Checklist
    renderMealSteps(mealKey);
}

// Render Ingredient List for the active selected tab
function renderMealIngredients(mealKey) {
    const meal = appState.mealPlan.meals[mealKey];
    elements.mealIngredients.innerHTML = '';
    
    const checked = appState.checkedIngredients[mealKey] || [];
    
    meal.ingredients.forEach((ing, idx) => {
        const li = document.createElement('li');
        li.className = 'ingredient-item';
        
        const isChecked = checked.includes(idx);
        
        li.innerHTML = `
            <label class="ingredient-checkbox-wrap">
                <input type="checkbox" data-index="${idx}" ${isChecked ? 'checked' : ''} />
                <div class="checkbox-custom">
                    <svg viewBox="0 0 24 24" width="12" height="12"><path fill="none" stroke="currentColor" stroke-width="3" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                </div>
                <span class="item-name">${ing.name}</span>
            </label>
            <div style="display: flex; align-items: center; gap: 8px;">
                <span class="item-quantity">${ing.quantity}</span>
                <button class="btn-swap-trigger" data-ingredient="${ing.name}">Swap</button>
            </div>
        `;
        
        // Listen to check event to recalculate progress
        const cb = li.querySelector('input[type="checkbox"]');
        cb.addEventListener('change', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            let currentChecked = appState.checkedIngredients[mealKey];
            
            if (e.target.checked) {
                if (!currentChecked.includes(index)) currentChecked.push(index);
            } else {
                appState.checkedIngredients[mealKey] = currentChecked.filter(i => i !== index);
            }
            
            updateIngredientsProgress(mealKey);
        });

        // Swap button trigger
        const swapBtn = li.querySelector('.btn-swap-trigger');
        swapBtn.addEventListener('click', () => {
            const ingName = swapBtn.getAttribute('data-ingredient');
            elements.subSearchInput.value = ingName;
            elements.subSearchInput.focus();
            filterSubstitutions(ingName.toLowerCase());
            
            // Smooth scroll down to substitutions section on mobile
            elements.substitutionListContainer.scrollIntoView({ behavior: 'smooth' });
        });

        elements.mealIngredients.appendChild(li);
    });
    
    updateIngredientsProgress(mealKey);
}

// Update gathered status counts & bar widths
function updateIngredientsProgress(mealKey) {
    const meal = appState.mealPlan.meals[mealKey];
    const total = meal.ingredients.length;
    const currentChecked = appState.checkedIngredients[mealKey] || [];
    const count = currentChecked.length;
    
    elements.ingredientsProgress.textContent = `${count}/${total} gathered`;
    
    const percentage = total > 0 ? (count / total) * 100 : 0;
    elements.ingredientsBarFill.style.width = `${percentage}%`;
}

// Render active meal cooking checklist steps
function renderMealSteps(mealKey) {
    const meal = appState.mealPlan.meals[mealKey];
    elements.mealSteps.innerHTML = '';
    
    const completed = appState.completedSteps[mealKey] || [];
    
    meal.steps.forEach((step, idx) => {
        const card = document.createElement('div');
        const isActive = appState.timer.activeStepIndex === idx;
        const isCompleted = completed.includes(idx);
        
        let cardClass = 'step-card';
        if (isActive) cardClass += ' active';
        if (isCompleted) cardClass += ' completed';
        
        card.className = cardClass;
        card.setAttribute('data-index', idx);
        
        card.innerHTML = `
            <div class="step-number-badge">
                ${isCompleted ? '✓' : step.num}
            </div>
            <div class="step-content">
                <h6>${step.title}</h6>
                <p>${step.instruction}</p>
                <div class="step-timer-tag">
                    ⏱️ ${formatTime(step.durationSeconds)}
                </div>
            </div>
        `;
        
        // Settle active step by clicking the card
        card.addEventListener('click', () => {
            selectActiveStep(idx);
        });

        elements.mealSteps.appendChild(card);
    });
    
    updateStepsProgress(mealKey);
}

// Highlight the selected step and load into timer
function selectActiveStep(stepIndex) {
    const mealKey = appState.activeMeal;
    const meal = appState.mealPlan.meals[mealKey];
    const step = meal.steps[stepIndex];
    
    appState.timer.activeStepIndex = stepIndex;
    elements.timerStepNum.textContent = `Step ${stepIndex + 1}`;
    
    // Stop previous ticks
    if (appState.timer.isRunning) {
        toggleTimer();
    }
    
    // Load duration
    appState.timer.durationSeconds = step.durationSeconds;
    appState.timer.remainingSeconds = step.durationSeconds;
    elements.timerDisplay.textContent = formatTime(step.durationSeconds);
    
    // Re-render checklist to update classes
    renderMealSteps(mealKey);
}

// Track cooking step progress metrics
function updateStepsProgress(mealKey) {
    const meal = appState.mealPlan.meals[mealKey];
    const total = meal.steps.length;
    const completed = appState.completedSteps[mealKey] || [];
    const count = completed.length;
    
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    elements.stepsProgressText.textContent = `${percentage}% Complete`;
    elements.stepsBarFill.style.width = `${percentage}%`;
}

// Active Cooking Kitchen Timer Actions
function toggleTimer() {
    if (appState.timer.isRunning) {
        // Pause timer
        clearInterval(appState.timer.intervalId);
        appState.timer.intervalId = null;
        appState.timer.isRunning = false;
        
        elements.timerPlayIcon.classList.remove('hidden');
        elements.timerPauseIcon.classList.add('hidden');
    } else {
        // Start timer
        if (appState.timer.remainingSeconds <= 0) return;
        
        appState.timer.isRunning = true;
        elements.timerPlayIcon.classList.add('hidden');
        elements.timerPauseIcon.classList.remove('hidden');
        
        appState.timer.intervalId = setInterval(() => {
            appState.timer.remainingSeconds--;
            elements.timerDisplay.textContent = formatTime(appState.timer.remainingSeconds);
            
            if (appState.timer.remainingSeconds <= 0) {
                // Done!
                clearInterval(appState.timer.intervalId);
                appState.timer.intervalId = null;
                appState.timer.isRunning = false;
                
                elements.timerPlayIcon.classList.remove('hidden');
                elements.timerPauseIcon.classList.add('hidden');
                
                triggerTimerCompletionAlert();
            }
        }, 1000);
    }
}

// Play notification ring and check off the active step
function triggerTimerCompletionAlert() {
    playTimerDoneBeep();
    
    const mealKey = appState.activeMeal;
    const stepIdx = appState.timer.activeStepIndex;
    
    let completed = appState.completedSteps[mealKey] || [];
    if (!completed.includes(stepIdx)) {
        completed.push(stepIdx);
        appState.completedSteps[mealKey] = completed;
    }
    
    // Automatically select next step if available
    const meal = appState.mealPlan.meals[mealKey];
    if (stepIdx < meal.steps.length - 1) {
        setTimeout(() => {
            selectActiveStep(stepIdx + 1);
            showNotification(`Step ${stepIdx + 1} Done! Moving to Step ${stepIdx + 2}`);
        }, 1200);
    } else {
        renderMealSteps(mealKey);
        showNotification('Wonderful! You finished cooking this meal!');
    }
}

// Reset kitchen timer back to active step standard duration
function resetTimer() {
    if (appState.timer.isRunning) {
        toggleTimer();
    }
    appState.timer.remainingSeconds = appState.timer.durationSeconds;
    elements.timerDisplay.textContent = formatTime(appState.timer.durationSeconds);
}

// Premium synthesised beep using Web Audio API (cross-device offline support)
function playTimerDoneBeep() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Multi-frequency chime pattern (Beep double sound)
        const playTone = (freq, delay, length) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
            gain.gain.setValueAtTime(0.5, audioCtx.currentTime + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + length);
            
            osc.start(audioCtx.currentTime + delay);
            osc.stop(audioCtx.currentTime + delay + length);
        };
        
        playTone(660, 0, 0.3);
        playTone(880, 0.3, 0.6);
    } catch (e) {
        console.warn("AudioContext alert failed, using standard sound element fallback.", e);
        if (elements.timerBell) {
            elements.timerBell.play().catch(err => console.log("Sound bell failed to play: ", err));
        }
    }
}

// Render Section: Categorized Grocery List
function renderGroceryList() {
    elements.groceryListContainer.innerHTML = '';
    const list = appState.mealPlan.groceryList;
    
    list.forEach(category => {
        const catBox = document.createElement('div');
        catBox.className = 'grocery-category';
        
        let itemsHtml = '';
        category.items.forEach(item => {
            const isChecked = appState.checkedGroceryItems.includes(item.name);
            
            itemsHtml += `
                <div class="grocery-item">
                    <label class="ingredient-checkbox-wrap">
                        <input type="checkbox" data-name="${item.name}" ${isChecked ? 'checked' : ''} />
                        <div class="checkbox-custom">
                            <svg viewBox="0 0 24 24" width="12" height="12"><path fill="none" stroke="currentColor" stroke-width="3" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                        </div>
                        <span class="item-name">${item.name}</span>
                    </label>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span class="item-quantity">${item.quantity}</span>
                        <span class="price-est">₹${item.priceEst}</span>
                    </div>
                </div>
            `;
        });
        
        catBox.innerHTML = `
            <h5>${category.category}</h5>
            <div class="grocery-items-grid">
                ${itemsHtml}
            </div>
        `;
        
        // Hook category checkbox triggers
        catBox.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const name = e.target.getAttribute('data-name');
                if (e.target.checked) {
                    if (!appState.checkedGroceryItems.includes(name)) {
                        appState.checkedGroceryItems.push(name);
                    }
                } else {
                    appState.checkedGroceryItems = appState.checkedGroceryItems.filter(i => i !== name);
                }
            });
        });

        elements.groceryListContainer.appendChild(catBox);
    });
}

// Copy shopping list to clipboard
function copyGroceryToClipboard() {
    let text = `🛒 ChefFlow AI Shopping List\n\n`;
    appState.mealPlan.groceryList.forEach(cat => {
        text += `• ${cat.category.toUpperCase()}\n`;
        cat.items.forEach(item => {
            const checkbox = appState.checkedGroceryItems.includes(item.name) ? ' [x] ' : ' [ ] ';
            text += `${checkbox}${item.name} (${item.quantity}) - Est: ₹${item.priceEst}\n`;
        });
        text += '\n';
    });
    text += `Generated by ChefFlow AI. Target Daily Budget limit ₹${appState.preferences.budget}.`;
    
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Shopping List copied to Clipboard!');
    }).catch(err => {
        console.error('Clipboard copy failed: ', err);
    });
}

// Render Section: Substitution Hub Cards
function renderSubstitutions() {
    elements.substitutionListContainer.innerHTML = '';
    const subs = appState.mealPlan.substitutions;
    
    if (!subs || subs.length === 0) {
        elements.substitutionListContainer.innerHTML = `<p style="text-align: center; color: var(--text-muted); font-size: 13px; margin-top: 20px;">No substitutions requested.</p>`;
        return;
    }

    subs.forEach(sub => {
        const card = document.createElement('div');
        card.className = 'substitution-card';
        card.setAttribute('data-original', sub.original.toLowerCase());
        card.setAttribute('data-replacement', sub.replacement.toLowerCase());
        
        let typeLabel = sub.type || 'diet';
        let badgeClass = 'sub-badge diet';
        if (sub.type === 'cost') badgeClass = 'sub-badge cost';
        if (sub.type === 'allergy') badgeClass = 'sub-badge allergy';
        
        card.innerHTML = `
            <div class="sub-title-wrap">
                <div>
                    <span class="sub-original">${sub.original}</span>
                    <span class="sub-arrow">➔</span>
                    <span class="sub-replacement">${sub.replacement}</span>
                </div>
                <span class="${badgeClass}">${typeLabel}</span>
            </div>
            <p class="sub-reason">${sub.reason}</p>
        `;
        
        elements.substitutionListContainer.appendChild(card);
    });
}

// Filter substitution card lists on searches
function filterSubstitutions(query) {
    const cards = elements.substitutionListContainer.querySelectorAll('.substitution-card');
    cards.forEach(card => {
        const orig = card.getAttribute('data-original');
        const repl = card.getAttribute('data-replacement');
        
        if (orig.includes(query) || repl.includes(query) || query === '') {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

// Formatting seconds into clean standard MM:SS format
function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
