// Green Earth - Plant Tree Application
// Vanilla JavaScript Implementation

// Global variables
let allPlants = [];
let allCategories = [];
let cart = [];
let currentCategoryId = null;
let activeCard = null; // Track the currently active card

// Category name mapping to ensure proper display names
const categoryNameMapping = {
    1: 'Fruit Trees',
    2: 'Flowering Trees',
    3: 'Shade Trees',
    4: 'Medicinal Trees',
    5: 'Timber Trees',
    6: 'Evergreen Trees',
    7: 'Ornamental Plants',
    8: 'Bamboo',
    9: 'Climbers',
    10: 'Aquatic Plants'
};

// API endpoints
const API_ENDPOINTS = {
    plants: 'https://openapi.programming-hero.com/api/plants',
    categories: 'https://openapi.programming-hero.com/api/categories',
    categoryPlants: (id) => `https://openapi.programming-hero.com/api/category/${id}`,
    plantDetails: (id) => `https://openapi.programming-hero.com/api/plant/${id}`
};

// DOM elements - will be initialized after DOM loads
let categoryContainer;
let plantsContainer;
let cartContainer;
let cartTotal;
let loadingSpinner;
let plantModal;
let modalContent;

// Utility Functions
const showLoading = () => {
    if (loadingSpinner) {
        loadingSpinner.classList.remove('hidden');
    }
    if (plantsContainer) {
        plantsContainer.style.display = 'none';
    }
};

const hideLoading = () => {
    if (loadingSpinner) {
        loadingSpinner.classList.add('hidden');
    }
    if (plantsContainer) {
        plantsContainer.style.display = 'grid';
    }
};

const showError = (message) => {
    console.error('Error:', message);
    alert('An error occurred: ' + message);
};

// API Functions
const fetchData = async (url) => {
    try {
        console.log('Fetching from URL:', url);
        showLoading();
        const response = await fetch(url);
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Data received:', data);
        hideLoading();
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        hideLoading();
        showError(`Failed to fetch data: ${error.message}`);
        return null;
    }
};

const fetchAllPlants = async () => {
    try {
        console.log('Fetching all plants...');
        
        // Clear any active card zoom when loading all plants
        clearActiveCard();
        
        const data = await fetchData(API_ENDPOINTS.plants);
        if (data && data.plants) {
            allPlants = data.plants;
            displayPlants(allPlants);
            currentCategoryId = null;
            console.log(`Displayed ${allPlants.length} total plants`);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error fetching plants:', error);
        return false;
    }
};

const fetchAllCategories = async () => {
    try {
        console.log('📂 fetchAllCategories called...');
        
        // Use predefined categories with proper names to ensure they display correctly
        const predefinedCategories = [
            { id: 1, name: 'Fruit Trees' },
            { id: 2, name: 'Flowering Trees' },
            { id: 3, name: 'Shade Trees' },
            { id: 4, name: 'Medicinal Trees' },
            { id: 5, name: 'Timber Trees' },
            { id: 6, name: 'Evergreen Trees' },
            { id: 7, name: 'Ornamental Plants' },
            { id: 8, name: 'Bamboo' },
            { id: 9, name: 'Climbers' },
            { id: 10, name: 'Aquatic Plants' }
        ];
        
        allCategories = predefinedCategories;
        console.log(' Categories ready to display:', predefinedCategories);
        console.log(' Calling displayCategories...');
        displayCategories(predefinedCategories);
        console.log(' fetchAllCategories completed successfully');
        return true;
        
    } catch (error) {
        console.error(' Error in fetchAllCategories:', error);
        return false;
    }
};

const fetchPlantsByCategory = async (categoryId) => {
    try {
        console.log('Fetching plants for category:', categoryId);
        
        // Clear any active card zoom when switching categories
        clearActiveCard();
        
        const data = await fetchData(API_ENDPOINTS.categoryPlants(categoryId));
        console.log('Category plants data:', data);
        
        if (data && data.plants) {
            displayPlants(data.plants);
            currentCategoryId = categoryId;
            console.log(`Displayed ${data.plants.length} plants for category ${categoryId}`);
        } else {
            // If no plants found for this category, show message
            if (plantsContainer) {
                plantsContainer.innerHTML = '<p class="text-center text-gray-500 col-span-full">No plants found in this category.</p>';
            }
            console.log('No plants found for category:', categoryId);
        }
    } catch (error) {
        console.error('Error fetching plants by category:', error);
        if (plantsContainer) {
            plantsContainer.innerHTML = '<p class="text-center text-red-500 col-span-full">Error loading plants for this category.</p>';
        }
    }
};

const fetchPlantDetails = async (plantId) => {
    try {
        // Show loading in modal
        if (plantModal && modalContent) {
            modalContent.innerHTML = `
                <div class="bg-white rounded-lg p-6 max-w-2xl mx-auto text-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#15803D] mx-auto mb-4"></div>
                    <p class="text-gray-600">Loading plant details...</p>
                </div>
            `;
            plantModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
        
        const data = await fetchData(API_ENDPOINTS.plantDetails(plantId));
        if (data && data.plant) {
            showPlantModal(data.plant);
        } else {
            if (plantModal) {
                plantModal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }
            showError('Plant details not found');
        }
    } catch (error) {
        if (plantModal) {
            plantModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
        showError('Failed to load plant details');
    }
};

// Display Functions
const displayCategories = (categories) => {
    console.log(' displayCategories called with:', categories);
    console.log(' categoryContainer element:', categoryContainer);
    
    if (!categoryContainer) {
        console.error(' Category container not found!');
        return;
    }
    
    console.log(' Category container found, clearing existing content...');
    categoryContainer.innerHTML = '';
    
    // Add "All Trees" button at the top
    console.log('  Creating "All Trees" button...');
    const allButton = createCategoryButton('all', 'All Trees', true);
    categoryContainer.appendChild(allButton);
    console.log('  "All Trees" button added');
    
    // Add category buttons with proper names
    categories.forEach((category, index) => {
        const categoryName = category.name || categoryNameMapping[category.id] || `Category ${category.id}`;
        console.log(`🏷️  Creating button ${index + 1}: "${categoryName}" (ID: ${category.id})`);
        const button = createCategoryButton(category.id, categoryName, false);
        categoryContainer.appendChild(button);
        console.log(` Button "${categoryName}" added to container`);
    });
    
    console.log(`🎉 Total categories displayed: ${categories.length + 1}`);
    console.log('📊 Final categoryContainer innerHTML length:', categoryContainer.innerHTML.length);
};

const createCategoryButton = (id, name, isActive) => {
    console.log(`🔧 createCategoryButton: ID="${id}", Name="${name}", Active=${isActive}`);
    
    const li = document.createElement('li');
    const button = document.createElement('button');
    
    button.textContent = name;
    button.setAttribute('data-category-id', id);
    
    // Styling to match the screenshot exactly
    button.className = `w-full text-left px-4 py-3 rounded-lg transition-colors ${
        isActive 
            ? 'bg-green-600 text-white font-semibold' 
            : 'text-gray-800 bg-transparent hover:bg-gray-100'
    }`;
    
    console.log(` Button created with text: "${button.textContent}" and classes: "${button.className}"`);
    
    button.addEventListener('click', () => {
        console.log(`🖱️  Category clicked: "${name}" (ID: ${id})`);
        setActiveCategory(button);
        if (id === 'all') {
            currentCategoryId = null;
            fetchAllPlants();
        } else {
            currentCategoryId = id;
            fetchPlantsByCategory(id);
        }
    });
    
    li.appendChild(button);
    return li;
};

const setActiveCategory = (activeButton) => {
    if (!categoryContainer) return;
    
    // Remove active class from all buttons - match screenshot styling
    const allButtons = categoryContainer.querySelectorAll('button');
    allButtons.forEach(btn => {
        btn.className = 'w-full text-left px-4 py-3 rounded-lg transition-colors text-gray-800 bg-transparent hover:bg-gray-100';
    });
    
    // Add active class to clicked button
    if (activeButton) {
        activeButton.className = 'w-full text-left px-4 py-3 rounded-lg transition-colors bg-green-600 text-white font-semibold';
    }
};

const setActiveCategoryById = (categoryId) => {
    if (!categoryContainer) return;
    
    const targetButton = categoryContainer.querySelector(`button[data-category-id="${categoryId}"]`);
    if (targetButton) {
        setActiveCategory(targetButton);
    }
};

// Card zoom effect function using only Tailwind classes
const setActiveCard = (clickedCard) => {
    if (!plantsContainer) return;
    
    console.log('🔍 Applying zoom effect to card:', clickedCard);
    
    // Remove zoom effect from all cards using Tailwind classes
    const allCards = plantsContainer.querySelectorAll('[data-plant-id]');
    allCards.forEach(card => {
        // Remove active zoom classes and restore normal state
        card.classList.remove('scale-110', 'shadow-2xl', 'shadow-green-200', 'z-20', 'relative');
        card.classList.add('transition-all', 'duration-300', 'ease-out');
    });
    
    // Add enhanced zoom effect to clicked card using Tailwind classes
    if (clickedCard) {
        clickedCard.classList.add('scale-110', 'shadow-2xl', 'shadow-green-200', 'z-20', 'relative');
        activeCard = clickedCard;
        console.log(' Zoom effect applied to card using Tailwind classes');
    }
};

// Remove zoom effect from all cards using Tailwind classes
const clearActiveCard = () => {
    if (!plantsContainer) return;
    
    console.log('Clearing zoom effects from all cards');
    const allCards = plantsContainer.querySelectorAll('[data-plant-id]');
    allCards.forEach(card => {
        // Remove all zoom-related classes
        card.classList.remove('scale-110', 'shadow-2xl', 'shadow-green-200', 'z-20', 'relative');
    });
    activeCard = null;
};

const displayPlants = (plants) => {
    if (!plantsContainer) return;
    
    // Ensure loading is hidden and container is visible
    hideLoading();
    
    // Clear active card reference
    activeCard = null;
    
    plantsContainer.innerHTML = '';
    
    if (!plants || plants.length === 0) {
        plantsContainer.innerHTML = '<p class="text-center text-gray-500 col-span-full">No plants found in this category.</p>';
        return;
    }
    
    plants.forEach(plant => {
        const plantCard = createPlantCard(plant);
        plantsContainer.appendChild(plantCard);
    });
};

const createPlantCard = (plant) => {
    const card = document.createElement('div');
    // Using only Tailwind classes for plant card styling and effects
    card.className = 'bg-white rounded-lg shadow-sm p-4 cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-xl hover:shadow-gray-200';
    card.setAttribute('data-plant-id', plant.id);
    
    // Truncate description to 100 characters
    const shortDescription = plant.description && plant.description.length > 100 
        ? plant.description.substring(0, 100) + '...' 
        : plant.description || 'No description available';
    
    card.innerHTML = `
        <img class="w-full h-48 object-cover rounded-lg mb-4" 
             src="${plant.image || 'https://via.placeholder.com/300x200?text=Plant+Image'}" 
             alt="${plant.name}" 
             onerror="this.src='https://via.placeholder.com/300x200?text=Plant+Image'" />
        <h3 class="text-lg font-semibold text-gray-800 mb-2 hover:text-green-600 transition-colors">${plant.name}</h3>
        <p class="text-gray-600 text-sm mb-3">${shortDescription}</p>
        <div class="flex justify-between items-center mb-3">
            <span class="bg-green-100 text-green-600 text-xs px-3 py-1 rounded-full">${plant.category || 'Plant'}</span>
            <span class="text-lg font-bold text-gray-800">৳${plant.price || 500}</span>
        </div>
        <button class="add-to-cart-btn w-full bg-[#15803D] text-white py-2 rounded-lg hover:bg-green-800 transition-colors" 
                data-plant-id="${plant.id}" data-plant-name="${plant.name}" data-plant-price="${plant.price || 500}">
            Add to Cart
        </button>
    `;
    
    // Add click event for card zoom and modal
    card.addEventListener('click', (e) => {
        // Don't trigger card click if add to cart button is clicked
        if (e.target.classList.contains('add-to-cart-btn')) {
            e.stopPropagation();
            const plantId = e.target.getAttribute('data-plant-id');
            const plantName = e.target.getAttribute('data-plant-name');
            const plantPrice = parseInt(e.target.getAttribute('data-plant-price'));
            addToCart(plantId, plantName, plantPrice);
            return;
        }
        
        console.log(`🖱️ Card clicked: ${plant.name}`);
        
        // Apply zoom effect to clicked card first
        setActiveCard(card);
        
        // Add a small delay to show the zoom effect before opening modal
        setTimeout(() => {
            console.log('🚀 Opening modal after zoom effect');
            fetchPlantDetails(plant.id);
        }, 150); // 150ms delay to see the zoom effect
    });
    
    // Add click event specifically for add to cart button
    const addToCartBtn = card.querySelector('.add-to-cart-btn');
    addToCartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const plantId = e.target.getAttribute('data-plant-id');
        const plantName = e.target.getAttribute('data-plant-name');
        const plantPrice = parseInt(e.target.getAttribute('data-plant-price'));
        addToCart(plantId, plantName, plantPrice);
    });
    
    return card;
};

// Cart Functions
const addToCart = (plantId, plantName, price) => {
    const existingItem = cart.find(item => item.id === plantId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: plantId,
            name: plantName,
            price: price,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    
    // Show success feedback
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = 'Added!';
    button.style.backgroundColor = '#059669';
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '';
    }, 1000);
};

const removeFromCart = (plantId) => {
    cart = cart.filter(item => item.id !== plantId);
    updateCartDisplay();
};

const updateCartDisplay = () => {
    if (!cartContainer || !cartTotal) return;
    
    cartContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="text-gray-500 text-center">Your cart is empty</p>';
        cartTotal.textContent = '৳0';
        return;
    }
    
    let total = 0;
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'flex justify-between items-center p-2 border-b border-gray-200';
        
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        cartItem.innerHTML = `
            <div class="flex-1">
                <p class="text-sm font-medium text-gray-800">${item.name}</p>
                <p class="text-xs text-gray-600">৳${item.price} × ${item.quantity}</p>
            </div>
            <button class="text-red-500 hover:text-red-700 ml-2 px-2 py-1" 
                    onclick="removeFromCart('${item.id}')">×</button>
        `;
        
        cartContainer.appendChild(cartItem);
    });
    
    cartTotal.textContent = `৳${total}`;
};

// Modal Functions using only Tailwind CSS
const showPlantModal = (plant) => {
    if (!plantModal || !modalContent) return;
    
    // Add blur and dim effect to main content using Tailwind classes
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.classList.add('blur-sm', 'brightness-50', 'pointer-events-none');
    }
    
    // Add modal-open class to body
    document.body.classList.add('overflow-hidden');
    
    modalContent.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-2xl mx-auto max-h-[90vh] overflow-y-auto relative shadow-2xl transform transition-all duration-300 ease-out scale-95 opacity-0 animate-pulse">
            <!-- Close button -->
            <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold z-10 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md transition-colors hover:bg-gray-100" 
                    onclick="closePlantModal()">&times;</button>
            
            <!-- Plant Details -->
            <div class="pr-8">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">${plant.name}</h2>
                
                <img class="w-full h-64 object-cover rounded-lg mb-4 shadow-lg transition-transform duration-300 hover:scale-105" 
                     src="${plant.image || 'https://via.placeholder.com/400x300?text=Plant+Image'}" 
                     alt="${plant.name}"
                     onerror="this.src='https://via.placeholder.com/400x300?text=Plant+Image'" />
                
                <div class="space-y-4">
                    <div>
                        <h3 class="font-semibold text-gray-800 mb-2">Description</h3>
                        <p class="text-gray-600 leading-relaxed">${plant.description || 'No description available'}</p>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <h4 class="font-semibold text-gray-800">Category</h4>
                            <p class="text-gray-600">${plant.category || 'Not specified'}</p>
                        </div>
                        <div>
                            <h4 class="font-semibold text-gray-800">Price</h4>
                            <p class="text-green-600 font-bold text-xl">৳${plant.price || 500}</p>
                        </div>
                    </div>
                    
                    ${plant.scientificName ? `
                        <div>
                            <h4 class="font-semibold text-gray-800">Scientific Name</h4>
                            <p class="text-gray-600 italic">${plant.scientificName}</p>
                        </div>
                    ` : ''}
                    
                    ${plant.origin ? `
                        <div>
                            <h4 class="font-semibold text-gray-800">Origin</h4>
                            <p class="text-gray-600">${plant.origin}</p>
                        </div>
                    ` : ''}
                    
                    <!-- Action buttons -->
                    <div class="flex gap-3 mt-6">
                        <button class="flex-1 bg-[#15803D] text-white py-3 rounded-lg hover:bg-green-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105" 
                                onclick="addToCart('${plant.id}', '${plant.name}', ${plant.price || 500}); closePlantModal();">
                            Add to Cart - ৳${plant.price || 500}
                        </button>
                        <button class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 hover:shadow-md" 
                                onclick="closePlantModal()">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Show modal with Tailwind classes
    plantModal.classList.remove('hidden');
    plantModal.classList.add('backdrop-blur-md');
    document.body.style.overflow = 'hidden';
    
    // Animate modal content entry using Tailwind classes
    setTimeout(() => {
        const modalContentDiv = modalContent.querySelector('div');
        if (modalContentDiv) {
            modalContentDiv.classList.remove('scale-95', 'opacity-0', 'animate-pulse');
            modalContentDiv.classList.add('scale-100', 'opacity-100');
        }
    }, 50);
};

const closePlantModal = () => {
    if (plantModal) {
        // Animate modal exit using Tailwind classes
        const modalContentDiv = modalContent.querySelector('div');
        if (modalContentDiv) {
            modalContentDiv.classList.add('scale-95', 'opacity-0');
            modalContentDiv.classList.remove('scale-100', 'opacity-100');
        }
        
        // Hide modal after animation
        setTimeout(() => {
            plantModal.classList.add('hidden');
            plantModal.classList.remove('backdrop-blur-md');
        }, 200);
        
        document.body.style.overflow = 'auto';
        document.body.classList.remove('overflow-hidden');
        
        // Remove blur and dim effect from main content using Tailwind classes
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.classList.remove('blur-sm', 'brightness-50', 'pointer-events-none');
        }
    }
    
    // Clear active card zoom effect when modal closes
    clearActiveCard();
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Starting initialization...');
    // Initialize the application
    initializeApp();
});

const initializeApp = async () => {
    try {
        console.log('Initializing Green Earth app...');
        
        // Initialize DOM elements
        categoryContainer = document.getElementById('category-container');
        plantsContainer = document.getElementById('plants-container');
        cartContainer = document.getElementById('cart-container');
        cartTotal = document.getElementById('cart-total');
        loadingSpinner = document.getElementById('loading-spinner');
        plantModal = document.getElementById('plant-modal');
        modalContent = document.getElementById('modal-content');
        
        console.log('DOM elements check:', {
            categoryContainer: !!categoryContainer,
            plantsContainer: !!plantsContainer,
            cartContainer: !!cartContainer,
            loadingSpinner: !!loadingSpinner
        });
        
        // Check if essential elements exist
        if (!categoryContainer || !plantsContainer) {
            console.error('Essential DOM elements not found');
            console.error('Category container:', categoryContainer);
            console.error('Plants container:', plantsContainer);
            return;
        }
        
        console.log('Essential DOM elements found');
        
        // Show initial loading
        showLoading();
        
        // Load categories first
        console.log(' Loading categories...');
        await fetchAllCategories();
        
        // Load all plants and set "All Trees" as active
        console.log(' Loading all plants...');
        await fetchAllPlants();
        
        // Set "All Trees" as the active category
        setTimeout(() => {
            setActiveCategoryById('all');
        }, 100);
        
        // Initialize cart display
        updateCartDisplay();
        
        // Setup event listeners
        setupEventListeners();
        
        // Setup impact cards hover effects
        setupImpactCardsEffects();
        
        console.log('App initialization complete!');
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
        hideLoading();
    }
};

const setupEventListeners = () => {
    // Close modal when clicking outside
    if (plantModal) {
        plantModal.addEventListener('click', (e) => {
            if (e.target === plantModal) {
                closePlantModal();
            }
        });
    }
    
    // Handle form submission
    const plantForm = document.querySelector('form');
    if (plantForm) {
        plantForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thank you for your interest in planting trees! This is a demo application.');
        });
    }
};

// Keyboard accessibility
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && plantModal && !plantModal.classList.contains('hidden')) {
        closePlantModal();
    }
});

// Export functions for global access (if needed)
window.fetchPlantDetails = fetchPlantDetails;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.closePlantModal = closePlantModal;

// Impact Cards Hover Effects with JavaScript
const setupImpactCardsEffects = () => {
    console.log('Setting up impact cards hover effects...');
    
    const impactCards = document.querySelectorAll('.impact-card');
    
    impactCards.forEach((card, index) => {
        const number = card.querySelector('.impact-number');
        const text = card.querySelector('.impact-text');
        
        // Mouse enter effect
        card.addEventListener('mouseenter', () => {
            console.log(`🖱️ Hovering impact card ${index + 1}`);
            
            // Enhanced number styling
            if (number) {
                number.classList.remove('text-[#15803D]');
                number.classList.add('text-green-600', 'scale-110');
            }
            
            // Enhanced text styling
            if (text) {
                text.classList.remove('text-[#1F2937]');
                text.classList.add('text-green-800', 'font-semibold');
            }
            
            // Add enhanced background effect
            card.classList.add('bg-gradient-to-br', 'from-white', 'to-green-50');
            card.classList.remove('bg-white');
        });
        
        // Mouse leave effect
        card.addEventListener('mouseleave', () => {
            console.log(`🖱️ Leaving impact card ${index + 1}`);
            
            // Reset number styling
            if (number) {
                number.classList.add('text-[#15803D]');
                number.classList.remove('text-green-600', 'scale-110');
            }
            
            // Reset text styling
            if (text) {
                text.classList.add('text-[#1F2937]');
                text.classList.remove('text-green-800', 'font-semibold');
            }
            
            // Reset background
            card.classList.remove('bg-gradient-to-br', 'from-white', 'to-green-50');
            card.classList.add('bg-white');
        });
        
        // Optional: Add click effect for better interactivity
        card.addEventListener('click', () => {
            console.log(`🎯 Impact card ${index + 1} clicked`);
            
            // Brief pulse effect
            card.classList.add('animate-pulse');
            setTimeout(() => {
                card.classList.remove('animate-pulse');
            }, 600);
        });
    });
    
    console.log(`✅ Impact cards effects setup complete for ${impactCards.length} cards`);
};