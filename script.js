document.addEventListener('DOMContentLoaded', function() {
    const mapWrapper = document.getElementById('mapWrapper');
    const splashEffect = document.getElementById('splashEffect');
    const tooltip = document.getElementById('stateTooltip');
    
    // Select all path elements in the SVG (works with MapSVG format)
    const states = document.querySelectorAll('#indiaMap path, #indiaMap .state');
    
    let isHoveringState = false;
    let currentHoveredState = null;

    // State information database
    const stateInfo = {
        'Uttar Pradesh': 'Most populous state of India. Home to the Taj Mahal in Agra and the holy city of Varanasi.',
        'Maharashtra': 'Economic powerhouse of India. Mumbai is the financial capital and home to Bollywood.',
        'Tamil Nadu': 'Known for its ancient temples, classical dance Bharatanatyam, and rich cultural heritage.',
        'Karnataka': 'Silicon Valley of India. Bangalore is the IT capital with rich history and beautiful palaces.',
        'Gujarat': 'Birthplace of Mahatma Gandhi. Major industrial and business hub with vibrant culture.',
        'Rajasthan': 'Land of Kings. Famous for its deserts, palaces, forts, and colorful culture.',
        'West Bengal': 'Cultural capital of India. Known for literature, art, and the festival of Durga Puja.',
        'Andhra Pradesh': 'Known for its spicy cuisine, classical dance Kuchipudi, and historical sites.',
        'Madhya Pradesh': 'Heart of India. Known for its wildlife sanctuaries and ancient temples.',
        'Odisha': 'Famous for the Jagannath Temple in Puri and classical dance Odissi.',
        'Kerala': 'God\'s Own Country. Known for backwaters, spices, Ayurveda, and high literacy rate.',
        'Punjab': 'Land of five rivers. Heart of Sikh culture with the Golden Temple in Amritsar.',
        'Haryana': 'Known for agriculture and being the birthplace of the Bhagavad Gita.',
        'Bihar': 'Birthplace of Buddhism and Jainism. Rich in ancient history and culture.',
        'Assam': 'Gateway to Northeast India. Famous for tea gardens and one-horned rhinoceros.',
        'Jharkhand': 'Rich in mineral resources. Known for its tribal culture and waterfalls.',
        'Himachal Pradesh': 'Land of gods. Famous for hill stations and adventure tourism.',
        'Uttarakhand': 'Devbhoomi (Land of Gods). Home to the sources of Ganges and Yamuna rivers.',
        'Chhattisgarh': 'Known for its forests, waterfalls, and tribal culture.',
        'Goa': 'Smallest state by area. Famous for beaches, Portuguese heritage, and tourism.',
        'Tripura': 'Known for its bamboo products and handloom industry.',
        'Manipur': 'Jewel of India. Known for classical dance Manipuri and natural beauty.',
        'Meghalaya': 'Abode of clouds. Famous for living root bridges and high rainfall.',
        'Nagaland': 'Land of festivals. Known for its tribal culture and Hornbill Festival.',
        'Mizoram': 'Land of highlanders. Known for its scenic beauty and bamboo dance.',
        'Arunachal Pradesh': 'Land of rising sun. Known for its diverse tribes and natural beauty.',
        'Sikkim': 'Himalayan state. Famous for Kanchenjunga mountain and Buddhist monasteries.',
        'Telangana': 'Youngest state of India. Known for IT industry and Hyderabadi cuisine.',
        'Delhi': 'National capital territory. Political center with rich Mughal heritage.',
        'Jammu and Kashmir': 'Paradise on Earth. Known for its stunning landscapes and culture.',
        'Ladakh': 'Land of high passes. Famous for monasteries and adventure tourism.'
    };

    // Utility functions
    function getStateName(element) {
        return element.getAttribute('title') || 
               element.getAttribute('data-name') || 
               element.id.replace('IN-', '').replace(/[-_]/g, ' ') ||
               'Unknown State';
    }

    function showTooltip(stateName, clientX, clientY) {
        tooltip.textContent = stateName;
        tooltip.style.display = 'block';
        
        // Position tooltip
        const offsetX = 15;
        const offsetY = -40;
        let left = clientX + offsetX;
        let top = clientY + offsetY;
        
        // Adjust if tooltip goes off screen
        const tooltipRect = tooltip.getBoundingClientRect();
        if (left + tooltipRect.width > window.innerWidth) {
            left = clientX - tooltipRect.width - offsetX;
        }
        if (top < 0) {
            top = clientY + 20;
        }
        
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
        tooltip.classList.add('show');
    }

    function hideTooltip() {
        tooltip.classList.remove('show');
        setTimeout(() => {
            if (!tooltip.classList.contains('show')) {
                tooltip.style.display = 'none';
            }
        }, 300);
    }

    function showStateDetails(stateName) {
        const info = stateInfo[stateName] || `${stateName} - One of India's diverse states with unique culture and heritage.`;
        
        // Create enhanced modal
        const existingModal = document.getElementById('stateModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'stateModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(8px);
            z-index: 300;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            border-radius: 20px;
            max-width: 500px;
            color: white;
            position: relative;
            box-shadow: 0 15px 50px rgba(0,0,0,0.4);
            transform: scale(0.7);
            transition: transform 0.3s ease;
            border: 2px solid rgba(255,255,255,0.2);
            margin: 20px;
        `;

        modalContent.innerHTML = `
            <span style="position: absolute; right: 15px; top: 10px; font-size: 28px; cursor: pointer; color: #ff6b6b;" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2 style="color: #4ecdc4; margin-bottom: 20px; font-size: 24px;">${stateName}</h2>
            <p style="line-height: 1.6; font-size: 16px;">${info}</p>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Animate modal appearance
        setTimeout(() => {
            modal.style.opacity = '1';
            modalContent.style.transform = 'scale(1)';
        }, 10);

        // Close on backdrop click
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Enhanced state hover effects with splash
    states.forEach(state => {
        state.addEventListener('mouseenter', function(e) {
            isHoveringState = true;
            currentHoveredState = this;
            
            // Show splash effect
            splashEffect.style.opacity = '1';
            
            // Get state name
            const stateName = getStateName(this);
            
            // Show tooltip
            showTooltip(stateName, e.clientX, e.clientY);
            
            // Add active class for enhanced effects
            this.classList.add('state-active');
        });

        state.addEventListener('mousemove', function(e) {
            if (isHoveringState && currentHoveredState === this) {
                // Update splash effect position
                const rect = mapWrapper.getBoundingClientRect();
                const x = e.clientX - rect.left - 60; // Center the splash effect
                const y = e.clientY - rect.top - 60;
                
                // Smooth movement with CSS transforms
                splashEffect.style.transform = `translate(${x}px, ${y}px)`;
                
                // Add rotation for more dynamic effect
                const rotation = (x + y) * 0.1;
                splashEffect.style.transform += ` rotate(${rotation}deg)`;
                
                // Update tooltip position
                const stateName = getStateName(this);
                showTooltip(stateName, e.clientX, e.clientY);
            }
        });

        state.addEventListener('mouseleave', function() {
            isHoveringState = false;
            currentHoveredState = null;
            
            // Hide splash effect with delay for smooth transition
            setTimeout(() => {
                if (!isHoveringState) {
                    splashEffect.style.opacity = '0';
                }
            }, 200);
            
            // Hide tooltip
            hideTooltip();
            
            // Remove active class
            this.classList.remove('state-active');
        });

        state.addEventListener('click', function() {
            const stateName = getStateName(this);
            showStateDetails(stateName);
        });
    });

    // Map wrapper hover detection
    mapWrapper.addEventListener('mouseenter', function() {
        if (isHoveringState) {
            splashEffect.style.opacity = '1';
        }
    });

    mapWrapper.addEventListener('mouseleave', function() {
        splashEffect.style.opacity = '0';
        isHoveringState = false;
        currentHoveredState = null;
        hideTooltip();
    });

    // Add entrance animations for fact items
    const factItems = document.querySelectorAll('.facts-sidebar li');
    factItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
    });
});

// About Modal Functions
function openAboutModal() {
    document.getElementById('aboutModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeAboutModal() {
    document.getElementById('aboutModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modals when clicking outside or pressing escape
window.addEventListener('click', function(event) {
    const modal = document.getElementById('aboutModal');
    if (event.target === modal) {
        closeAboutModal();
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeAboutModal();
        const stateModal = document.getElementById('stateModal');
        if (stateModal) {
            stateModal.remove();
        }
    }
});

// Add smooth scroll for sidebars
document.querySelectorAll('.facts-sidebar').forEach(sidebar => {
    sidebar.style.scrollBehavior = 'smooth';
});
