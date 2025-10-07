// Variables globales
let cart = [];
let currentImageIndex = 0;
let galleryImages = [];

// Inicialización cuando se carga el DOM
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeTicketModal();
    initializeGallery();
    initializeMerchStore();
    initializeCart();
    initializeLightbox();
    initializeImageModal();
    initializeAudioPlayer();
    
    // Agregar efectos de sonido simulados
    addSoundEffects();
});

// ==================== NAVEGACIÓN ====================
function initializeNavigation() {
    // Prevenir múltiples inicializaciones
    if (window.navigationInitialized) {
        console.log('⚠️ Navegación ya inicializada, saltando...');
        return;
    }
    
    console.log('🚀 Inicializando navegación...');
    
    const hamburger = document.getElementById('hamburger-menu') || document.querySelector('.hamburger');
    const navMenu = document.getElementById('nav-menu') || document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    console.log('🔍 Elementos encontrados:', {
        hamburger: !!hamburger,
        navMenu: !!navMenu,
        navLinksCount: navLinks.length,
        hamburgerDisplay: hamburger ? window.getComputedStyle(hamburger).display : 'N/A'
    });

    if (hamburger && navMenu) {
        console.log('⚙️ Configurando hamburger menu...');
        
        // Función para toggle del menú
        function toggleMenu(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🎯 Toggle menu triggered!');
            
            const wasActive = navMenu.classList.contains('active');
            
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
            
            const isActive = navMenu.classList.contains('active');
            
            console.log(`📱 Estado del menú: ${wasActive ? 'ABIERTO' : 'CERRADO'} → ${isActive ? 'ABIERTO' : 'CERRADO'}`);
            
            // Forzar repaint
            hamburger.offsetHeight;
            navMenu.offsetHeight;
        }
        
        // Remover event listeners existentes si los hay
        hamburger.removeEventListener('click', toggleMenu);
        hamburger.removeEventListener('touchend', toggleMenu);
        
        // Agregar event listeners
        hamburger.addEventListener('click', toggleMenu, { passive: false });
        hamburger.addEventListener('touchend', toggleMenu, { passive: false });
        
        // Prevenir comportamiento touch por defecto
        hamburger.addEventListener('touchstart', function(e) {
            console.log('👆 Touch start detectado');
            e.preventDefault();
        }, { passive: false });

        // Cerrar menú al hacer click en un enlace
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });

        // Cerrar menú al hacer scroll
        window.addEventListener('scroll', function() {
            if (navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }

    // Scroll suave para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Marcar como inicializado
    window.navigationInitialized = true;
    console.log('✅ Navegación inicializada correctamente');
}

// ==================== MODAL DE TICKETS ====================
function initializeTicketModal() {
    const modal = document.getElementById('ticketModal');
    const ticketBtns = document.querySelectorAll('.ticket-btn:not(.disabled)');
    const closeModal = document.querySelector('.close');
    const modalVenue = document.getElementById('modalVenue');
    const quantitySpan = document.querySelector('.quantity');
    const totalPriceSpan = document.getElementById('totalPrice');
    const minusBtn = document.querySelector('.qty-btn.minus');
    const plusBtn = document.querySelector('.qty-btn.plus');
    const buyBtn = document.querySelector('.buy-btn');

    let currentPrice = 0;
    let quantity = 1;

    if (modal && ticketBtns.length > 0) {
        // Abrir modal
        ticketBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const venue = this.getAttribute('data-venue');
                const price = parseInt(this.closest('.date-card').querySelector('.price').textContent.replace('$', ''));
                
                modalVenue.textContent = venue;
                currentPrice = price;
                quantity = 1;
                
                updateModalPrice();
                modal.style.display = 'block';
                
                // Efecto de aparición
                setTimeout(() => {
                    modal.querySelector('.modal-content').style.transform = 'scale(1)';
                }, 10);
            });
        });

        // Cerrar modal
        if (closeModal) {
            closeModal.addEventListener('click', function() {
                closeTicketModal();
            });
        }

        // Cerrar modal al hacer click fuera
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeTicketModal();
            }
        });

        // Controles de cantidad
        if (minusBtn) {
            minusBtn.addEventListener('click', function() {
                if (quantity > 1) {
                    quantity--;
                    updateModalPrice();
                }
            });
        }

        if (plusBtn) {
            plusBtn.addEventListener('click', function() {
                if (quantity < 10) {
                    quantity++;
                    updateModalPrice();
                }
            });
        }

        // Botón de compra
        if (buyBtn) {
            buyBtn.addEventListener('click', function() {
                // Simular proceso de pago
                showPurchaseAnimation();
                setTimeout(() => {
                    alert(`¡Compra exitosa! Has adquirido ${quantity} ticket(s) para ${modalVenue.textContent}. Total: $${currentPrice * quantity}`);
                    closeTicketModal();
                }, 2000);
            });
        }
    }

    function updateModalPrice() {
        if (quantitySpan && totalPriceSpan) {
            quantitySpan.textContent = quantity;
            totalPriceSpan.textContent = currentPrice * quantity;
        }
    }

    function closeTicketModal() {
        modal.style.display = 'none';
        modal.querySelector('.modal-content').style.transform = 'scale(0.8)';
    }
}

// ==================== GALERÍA ====================
function initializeGallery() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    if (filterBtns.length > 0 && galleryItems.length > 0) {
        // Crear array de imágenes para el lightbox con soporte para alta resolución
        galleryImages = Array.from(galleryItems).map((item, index) => {
            const imgElement = item.querySelector('.gallery-img');
            const baseSrc = imgElement?.src || '';
            
            // Generar URL de alta resolución (asumiendo que existe una versión HD)
            const hdSrc = baseSrc.replace(/\.(jpg|jpeg|png|webp)$/i, '_hd.$1');
            
            return {
                index: index,
                src: baseSrc,
                hdSrc: hdSrc,
                title: item.querySelector('.photo-info h3')?.textContent || 'Sin título',
                description: item.querySelector('.photo-info p')?.textContent || 'Sin descripción',
                category: item.getAttribute('data-category'),
                hdLoaded: false
            };
        });

        // Filtros de galería
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                
                // Actualizar botón activo
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Filtrar elementos
                galleryItems.forEach(item => {
                    const category = item.getAttribute('data-category');
                    
                    if (filter === 'all' || category === filter) {
                        item.classList.remove('hidden');
                        // Animación de aparición
                        setTimeout(() => {
                            item.style.opacity = '0.05';
                            item.style.transform = 'translateY(0)';
                        }, 100);
                    } else {
                        item.style.opacity = '0';
                        item.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            item.classList.add('hidden');
                        }, 300);
                    }
                });
            });
        });

        // Botones de ver imagen
        const viewBtns = document.querySelectorAll('.view-btn');
        viewBtns.forEach((btn, index) => {
            btn.addEventListener('click', function() {
                currentImageIndex = index;
                openLightbox();
            });
        });
    }

    // Videos
    const videoCards = document.querySelectorAll('.video-card .video-placeholder');
    videoCards.forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('.video-title').textContent;
            alert(`Reproduciendo: ${title}\n\n(En una implementación real, aquí se abriría el reproductor de video)`);
        });
    });
}

// ==================== TIENDA DE MERCHANDISE ====================
function initializeMerchStore() {
    const filterBtns = document.querySelectorAll('.merch-page .filter-btn');
    const productCards = document.querySelectorAll('.product-card');
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');

    // Filtros de productos
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                
                // Actualizar botón activo
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Filtrar productos
                productCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    
                    if (filter === 'all' || category === filter) {
                        card.classList.remove('hidden');
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            card.classList.add('hidden');
                        }, 300);
                    }
                });
            });
        });
    }

    // Agregar al carrito
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const name = this.getAttribute('data-name');
            const price = parseInt(this.getAttribute('data-price'));
            const sizeSelect = this.closest('.product-card').querySelector('.size-select');
            let size = null;
            
            // Verificar si necesita talla
            if (sizeSelect) {
                size = sizeSelect.value;
                if (!size) {
                    alert('Por favor selecciona una talla');
                    sizeSelect.focus();
                    return;
                }
            }
            
            // Agregar al carrito
            addToCart({
                id: id,
                name: name,
                price: price,
                size: size,
                quantity: 1
            });
            
            // Feedback visual
            showAddToCartAnimation(this);
        });
    });
}

// ==================== CARRITO DE COMPRAS ====================
function initializeCart() {
    const cartIcon = document.querySelector('.cart-icon');
    const cartModal = document.getElementById('cartModal');
    const cartClose = document.querySelector('.cart-close');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (cartIcon && cartModal) {
        // Abrir carrito
        cartIcon.addEventListener('click', function() {
            updateCartDisplay();
            cartModal.style.display = 'block';
        });

        // Cerrar carrito
        if (cartClose) {
            cartClose.addEventListener('click', function() {
                cartModal.style.display = 'none';
            });
        }

        // Cerrar carrito al hacer click fuera
        window.addEventListener('click', function(event) {
            if (event.target === cartModal) {
                cartModal.style.display = 'none';
            }
        });

        // Billeteras Virtuales Argentinas
        const walletButtons = document.querySelectorAll('.wallet-btn');
        walletButtons.forEach(button => {
            button.addEventListener('click', function() {
                if (cart.length === 0) {
                    alert('El carrito está vacío');
                    return;
                }
                
                const wallet = this.getAttribute('data-wallet');
                const total = calculateCartTotal();
                
                processWalletPayment(wallet, total);
            });
        });

        // Checkout tradicional con tarjeta
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', function() {
                if (cart.length === 0) {
                    alert('El carrito está vacío');
                    return;
                }
                
                const total = calculateCartTotal();
                alert(`Procesando pago con tarjeta por $${total}...\n\n(En una implementación real, aquí se redirigiría a la pasarela de pago tradicional)`);
                
                // Vaciar carrito después del checkout simulado
                setTimeout(() => {
                    cart = [];
                    updateCartDisplay();
                    updateCartCount();
                    alert('¡Compra exitosa! Gracias por tu pedido.');
                    cartModal.style.display = 'none';
                }, 1500);
            });
        }
    }
}

function addToCart(product) {
    const existingItem = cart.find(item => 
        item.id === product.id && item.size === product.size
    );
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push(product);
    }
    
    updateCartCount();
    
    // Mostrar notificación
    showNotification(`${product.name} agregado al carrito`);
}

function removeFromCart(productId, size = null) {
    const index = cart.findIndex(item => 
        item.id === productId && item.size === size
    );
    
    if (index > -1) {
        cart.splice(index, 1);
        updateCartCount();
        updateCartDisplay();
    }
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
        
        // Animación del contador
        if (totalItems > 0) {
            cartCount.style.transform = 'scale(1.3)';
            setTimeout(() => {
                cartCount.style.transform = 'scale(1)';
            }, 200);
        }
    }
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItems || !cartEmpty || !cartTotal) return;
    
    if (cart.length === 0) {
        cartItems.style.display = 'none';
        cartEmpty.style.display = 'block';
        cartTotal.textContent = '0';
    } else {
        cartItems.style.display = 'block';
        cartEmpty.style.display = 'none';
        
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>${item.size ? `Talla: ${item.size}` : ''} - $${item.price}</p>
                </div>
                <div class="item-controls">
                    <input type="number" class="item-qty" value="${item.quantity}" 
                           min="1" max="10" onchange="updateItemQuantity('${item.id}', '${item.size}', this.value)">
                    <button class="remove-item" onclick="removeFromCart('${item.id}', '${item.size}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        cartTotal.textContent = calculateCartTotal();
    }
}

function updateItemQuantity(productId, size, newQuantity) {
    const item = cart.find(item => 
        item.id === productId && item.size === size
    );
    
    if (item) {
        item.quantity = parseInt(newQuantity);
        updateCartCount();
        updateCartDisplay();
    }
}

function calculateCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// ==================== LIGHTBOX ====================

function initializeLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxClose = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const zoomInBtn = document.querySelector('.zoom-in-btn');
    const zoomOutBtn = document.querySelector('.zoom-out-btn');
    const zoomResetBtn = document.querySelector('.zoom-reset-btn');
    
    if (lightbox) {
        // Cerrar lightbox
        if (lightboxClose) {
            lightboxClose.addEventListener('click', function() {
                closeLightbox();
            });
        }
        
        // Navegación
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                navigateLightbox(-1);
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                navigateLightbox(1);
            });
        }

        // Controles de zoom
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', function() {
                zoomImage(1.2);
            });
        }

        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', function() {
                zoomImage(0.8);
            });
        }

        if (zoomResetBtn) {
            zoomResetBtn.addEventListener('click', function() {
                resetZoom();
            });
        }

        // Zoom con rueda del ratón
        const lightboxImg = document.getElementById('lightboxImg');
        if (lightboxImg) {
            lightboxImg.addEventListener('wheel', function(e) {
                e.preventDefault();
                const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
                zoomImage(zoomFactor);
            });

            // Drag para mover la imagen cuando está ampliada
            let isDragging = false;
            let startX = 0, startY = 0;
            let initialX = 0, initialY = 0;

            lightboxImg.addEventListener('mousedown', function(e) {
                if (lightboxImg.style.transform && lightboxImg.style.transform.includes('scale')) {
                    isDragging = true;
                    startX = e.clientX;
                    startY = e.clientY;
                    
                    // Obtener posición actual
                    const transform = lightboxImg.style.transform;
                    const translateMatch = transform.match(/translate\(([^)]+)\)/);
                    if (translateMatch) {
                        const values = translateMatch[1].split(',');
                        initialX = parseFloat(values[0]) || 0;
                        initialY = parseFloat(values[1]) || 0;
                    }
                    
                    lightboxImg.style.cursor = 'grabbing';
                }
            });

            document.addEventListener('mousemove', function(e) {
                if (isDragging) {
                    const deltaX = e.clientX - startX;
                    const deltaY = e.clientY - startY;
                    const newX = initialX + deltaX;
                    const newY = initialY + deltaY;
                    
                    const currentTransform = lightboxImg.style.transform;
                    const scaleMatch = currentTransform.match(/scale\(([^)]+)\)/);
                    const scale = scaleMatch ? scaleMatch[1] : '1';
                    
                    lightboxImg.style.transform = `scale(${scale}) translate(${newX}px, ${newY}px)`;
                }
            });

            document.addEventListener('mouseup', function() {
                isDragging = false;
                lightboxImg.style.cursor = lightboxImg.style.transform.includes('scale') ? 'grab' : 'default';
            });
        }
        
        // Cerrar con ESC y zoom con teclado
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && lightbox.style.display === 'block') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft' && lightbox.style.display === 'block') {
                navigateLightbox(-1);
            } else if (e.key === 'ArrowRight' && lightbox.style.display === 'block') {
                navigateLightbox(1);
            } else if (e.key === '+' && lightbox.style.display === 'block') {
                zoomImage(1.2);
            } else if (e.key === '-' && lightbox.style.display === 'block') {
                zoomImage(0.8);
            } else if (e.key === '0' && lightbox.style.display === 'block') {
                resetZoom();
            }
        });
        
        // Cerrar al hacer click fuera
        window.addEventListener('click', function(event) {
            if (event.target === lightbox) {
                closeLightbox();
            }
        });
    }
}

function openLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxDescription = document.getElementById('lightboxDescription');
    
    if (lightbox && galleryImages[currentImageIndex]) {
        const image = galleryImages[currentImageIndex];
        
        // Actualizar imagen
        if (lightboxImg) {
            // Precargar imagen para mejor calidad
            const img = new Image();
            img.onload = function() {
                lightboxImg.src = this.src;
                lightboxImg.alt = image.title;
                
                // Configurar propiedades iniciales para máxima calidad
                lightboxImg.style.imageRendering = 'auto';
                lightboxImg.style.filter = '';
                lightboxImg.style.willChange = 'transform';
                lightboxImg.style.transformOrigin = 'center center';
                
                // Resetear zoom al cambiar de imagen
                resetZoom();
            };
            img.src = image.src;
        }
        
        lightboxTitle.textContent = image.title;
        lightboxDescription.textContent = image.description;
        
        lightbox.style.display = 'block';
        
        // Animación de apertura
        setTimeout(() => {
            lightbox.querySelector('.lightbox-content').style.opacity = '1';
            lightbox.querySelector('.lightbox-content').style.transform = 'scale(1)';
        }, 10);
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.style.display = 'none';
        lightbox.querySelector('.lightbox-content').style.opacity = '0';
        lightbox.querySelector('.lightbox-content').style.transform = 'scale(0.8)';
    }
}

function navigateLightbox(direction) {
    const visibleImages = galleryImages.filter(img => {
        const activeFilter = document.querySelector('.gallery-filters .filter-btn.active');
        const filter = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';
        return filter === 'all' || img.category === filter;
    });
    
    if (visibleImages.length === 0) return;
    
    let newIndex = currentImageIndex + direction;
    
    if (newIndex < 0) {
        newIndex = visibleImages.length - 1;
    } else if (newIndex >= visibleImages.length) {
        newIndex = 0;
    }
    
    currentImageIndex = newIndex;
    openLightbox();
}

// ==================== FUNCIONES DE ZOOM ====================
let currentZoom = 1;
let currentTranslateX = 0;
let currentTranslateY = 0;

// Función para cargar imagen de alta resolución
function loadHighResImage(imageData, callback) {
    if (imageData.hdLoaded) {
        callback(imageData.hdSrc);
        return;
    }
    
    // Mostrar indicador de carga
    const hdIndicator = document.getElementById('hdLoadingIndicator');
    if (hdIndicator) {
        hdIndicator.classList.add('show');
    }
    
    const hdImg = new Image();
    hdImg.onload = function() {
        imageData.hdLoaded = true;
        callback(imageData.hdSrc);
        // Ocultar indicador
        if (hdIndicator) {
            setTimeout(() => {
                hdIndicator.classList.remove('show');
            }, 500);
        }
    };
    hdImg.onerror = function() {
        // Si no existe la versión HD, usar la original
        callback(imageData.src);
        // Ocultar indicador
        if (hdIndicator) {
            hdIndicator.classList.remove('show');
        }
    };
    hdImg.src = imageData.hdSrc;
}

function zoomImage(factor) {
    const lightboxImg = document.getElementById('lightboxImg');
    if (!lightboxImg) return;
    
    currentZoom *= factor;
    
    // Limitar el zoom entre 0.5 y 10 (aumentamos el rango máximo)
    currentZoom = Math.max(0.5, Math.min(10, currentZoom));
    
    // Si el zoom es muy cercano a 1, resetear posición
    if (Math.abs(currentZoom - 1) < 0.1) {
        currentZoom = 1;
        currentTranslateX = 0;
        currentTranslateY = 0;
    }
    
    // Cargar imagen HD si el zoom es mayor a 2x y no se ha cargado aún
    if (currentZoom > 2 && galleryImages[currentImageIndex] && !galleryImages[currentImageIndex].hdLoaded) {
        loadHighResImage(galleryImages[currentImageIndex], function(hdSrc) {
            if (lightboxImg.src !== hdSrc) {
                lightboxImg.src = hdSrc;
            }
        });
    }
    
    // Configurar propiedades para mejor calidad según el zoom
    if (currentZoom > 4) {
        lightboxImg.style.imageRendering = 'pixelated';
    } else if (currentZoom > 2) {
        lightboxImg.style.imageRendering = 'crisp-edges';
    } else {
        lightboxImg.style.imageRendering = 'auto';
    }
    
    // Aplicar transformación con interpolación mejorada
    lightboxImg.style.transform = `scale3d(${currentZoom}, ${currentZoom}, 1) translate3d(${currentTranslateX}px, ${currentTranslateY}px, 0)`;
    lightboxImg.style.transformOrigin = 'center center';
    lightboxImg.style.willChange = 'transform';
    
    // Cambiar cursor
    lightboxImg.style.cursor = currentZoom > 1 ? 'grab' : 'default';
    
    // Aplicar transición suave con mejor timing
    lightboxImg.style.transition = 'transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    setTimeout(() => {
        lightboxImg.style.transition = '';
    }, 150);
    
    // Optimizar renderizado y nitidez para zoom alto
    if (currentZoom > 3) {
        lightboxImg.style.filter = 'contrast(1.03) brightness(1.01) saturate(1.05)';
    } else {
        lightboxImg.style.filter = '';
    }
}

function resetZoom() {
    const lightboxImg = document.getElementById('lightboxImg');
    if (!lightboxImg) return;
    
    currentZoom = 1;
    currentTranslateX = 0;
    currentTranslateY = 0;
    
    // Resetear propiedades de calidad
    lightboxImg.style.imageRendering = 'auto';
    lightboxImg.style.filter = '';
    lightboxImg.style.transform = 'scale3d(1, 1, 1) translate3d(0px, 0px, 0)';
    lightboxImg.style.cursor = 'default';
    lightboxImg.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    lightboxImg.style.willChange = 'auto';
    
    setTimeout(() => {
        lightboxImg.style.transition = '';
    }, 300);
}

// ==================== EFECTOS ADICIONALES ====================
function showAddToCartAnimation(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i> AGREGADO';
    button.style.background = 'linear-gradient(45deg, #39ff14, #2dd644)';
    button.style.color = '#000';
    
    setTimeout(() => {
        button.innerHTML = originalText;
        button.style.background = '';
        button.style.color = '';
    }, 1500);
}

function showPurchaseAnimation() {
    const buyBtn = document.querySelector('.buy-btn');
    if (buyBtn) {
        buyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PROCESANDO...';
        buyBtn.style.background = '#ffff00';
        buyBtn.style.color = '#000';
    }
}

function showNotification(message) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    // Estilos inline para la notificación
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(45deg, #39ff14, #2dd644);
        color: #000;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        font-family: 'Black Ops One', cursive;
        font-size: 0.9rem;
        z-index: 9999;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        box-shadow: 0 0 20px rgba(57, 255, 20, 0.5);
    `;
    
    document.body.appendChild(notification);
    
    // Animación de entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function addSoundEffects() {
    // Simular efectos de sonido con vibraciones en dispositivos móviles
    const interactiveElements = document.querySelectorAll('button, .nav-link, .ticket-btn, .view-btn');
    
    interactiveElements.forEach(element => {
        element.addEventListener('click', function() {
            // Vibración en dispositivos compatibles
            if ('vibrate' in navigator) {
                navigator.vibrate(50);
            }
        });
    });
}

// ==================== EFECTOS VISUALES ADICIONALES ====================

// Efecto de parallax en elementos del hero
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const vinyl = document.querySelector('.vinyl-record');
    const amplifier = document.querySelector('.amplifier');
    
    if (vinyl) {
        vinyl.style.transform = `rotate(${scrolled * 0.5}deg)`;
    }
    
    if (amplifier) {
        amplifier.style.transform = `translateY(${scrolled * 0.2}px)`;
    }
});

// Animación de entrada para elementos
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observar elementos para animaciones
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.date-card, .release-card, .gallery-item, .product-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Efecto de glitch aleatorio en el título
setInterval(function() {
    const glitchElements = document.querySelectorAll('.glitch');
    glitchElements.forEach(element => {
        if (Math.random() < 0.1) { // 10% de probabilidad
            element.style.animation = 'none';
            setTimeout(() => {
                element.style.animation = 'glitch 500ms infinite';
            }, 50);
        }
    });
}, 3000);

// Función global para actualizar cantidad en carrito (necesaria para los event handlers inline)
window.updateItemQuantity = updateItemQuantity;
window.removeFromCart = removeFromCart;

// Procesar pagos con billeteras virtuales argentinas
function processWalletPayment(wallet, total) {
    const walletNames = {
        'mercadopago': 'Mercado Pago',
        'uala': 'Ualá',
        'cuentadni': 'Cuenta DNI',
        'modo': 'MODO',
        'naranjax': 'Naranja X',
        'personalpay': 'Personal Pay'
    };
    
    const walletName = walletNames[wallet] || wallet;
    
    // URLs de redirección simuladas (en producción, serían URLs reales de las APIs)
    const walletUrls = {
        'mercadopago': `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=ASOCIACION_ILICITA_${Date.now()}`,
        'uala': `https://uala.com.ar/pago?merchant=asociacion-ilicita&amount=${total}`,
        'cuentadni': `https://cuentadni.bna.com.ar/pagar?comercio=asociacion-ilicita&monto=${total}`,
        'modo': `https://modo.com.ar/pago?merchant=asociacion-ilicita&total=${total}`,
        'naranjax': `https://naranjax.com/pagar?merchant=asociacion-ilicita&importe=${total}`,
        'personalpay': `https://personalpay.com.ar/checkout?merchant=asociacion-ilicita&valor=${total}`
    };
    
    // Mostrar mensaje de procesamiento
    alert(`🎸 ¡ROCK & ROLL! 🎸\n\nProcesando pago con ${walletName}...\nTotal: $${total}\n\nEn unos segundos serás redirigido a ${walletName} para completar tu compra de merch de ASOCIACIÓN ILÍCITA.`);
    
    // Simular redirección (en producción, sería una redirección real)
    setTimeout(() => {
        const proceed = confirm(`¿Continuar con el pago de $${total} usando ${walletName}?\n\n(En una implementación real, serías redirigido a la app/web de ${walletName})`);
        
        if (proceed) {
            // Simular procesamiento exitoso
            setTimeout(() => {
                cart = [];
                updateCartDisplay();
                updateCartCount();
                alert(`🤘 ¡PAGO EXITOSO! 🤘\n\n✅ Pago de $${total} procesado con ${walletName}\n✅ Tu pedido de merch de ASOCIACIÓN ILÍCITA está confirmado\n✅ Recibirás un email con los detalles\n\n¡Gracias por apoyar la banda!`);
                
                // Cerrar modal del carrito
                const cartModal = document.getElementById('cartModal');
                if (cartModal) {
                    cartModal.style.display = 'none';
                }
            }, 2000);
        }
    }, 1000);
}

// ==================== MEJORAS PARA MÓVIL ====================
// Detectar dispositivo móvil
function isMobile() {
    return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Optimizar touch events para móvil
function initializeTouchOptimizations() {
    if (isMobile()) {
        // Mejorar el tapping en botones
        const buttons = document.querySelectorAll('button, .btn-primary, .btn-secondary, .filter-btn, .wallet-btn');
        buttons.forEach(button => {
            button.style.cursor = 'pointer';
            button.addEventListener('touchstart', function() {
                this.style.opacity = '0.8';
            });
            button.addEventListener('touchend', function() {
                this.style.opacity = '1';
            });
        });

        // Prevenir zoom accidental
        document.addEventListener('gesturestart', function (e) {
            e.preventDefault();
        });

        // Optimizar modales para móvil
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('touchmove', function(e) {
                e.stopPropagation();
            });
        });

        // Mejorar el scroll en iOS
        document.body.style.webkitOverflowScrolling = 'touch';
        
        // Ajustar viewport para evitar zoom en inputs
        const viewport = document.querySelector('meta[name=viewport]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
        }
    }
}

// Optimizar rendimiento en dispositivos lentos
function initializePerformanceOptimizations() {
    // Lazy loading para imágenes en móvil
    if ('IntersectionObserver' in window && isMobile()) {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    // Reducir animaciones en dispositivos lentos
    if (isMobile() && navigator.hardwareConcurrency <= 2) {
        document.body.classList.add('reduced-motion');
        const style = document.createElement('style');
        style.textContent = `
            .reduced-motion * {
                animation-duration: 0.1s !important;
                transition-duration: 0.1s !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// Inicializar optimizaciones móviles
document.addEventListener('DOMContentLoaded', function() {
    initializeTouchOptimizations();
    initializePerformanceOptimizations();
});

// Ajustar en cambio de orientación
window.addEventListener('orientationchange', function() {
    setTimeout(() => {
        // Recalcular dimensiones
        window.scrollTo(0, 1);
        
        // Reajustar modales si están abiertos
        const openModal = document.querySelector('.modal[style*="block"]');
        if (openModal) {
            const content = openModal.querySelector('.modal-content, .cart-content, .lightbox-content');
            if (content) {
                content.style.transform = 'none';
                setTimeout(() => {
                    content.style.transform = '';
                }, 100);
            }
        }
    }, 500);
});

// ==================== MODAL DE IMAGEN ====================
function initializeImageModal() {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const captionText = document.getElementById('imageCaption');
    const closeBtn = document.querySelector('.image-modal-close');
    
    // Solo inicializar si todos los elementos existen (están en merch.html)
    if (!modal || !modalImg || !captionText) {
        console.log('Modal de imagen no encontrado - probablemente no estamos en la página de merch');
        return;
    }
    
    // Agregar event listener a todas las imágenes de productos
    const productImages = document.querySelectorAll('.product-img');
    
    productImages.forEach(img => {
        img.addEventListener('click', function() {
            modal.style.display = 'block';
            modalImg.src = this.src;
            captionText.textContent = this.alt;
            
            // Prevenir scroll del body
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Cerrar modal con el botón X
    if (closeBtn) {
        closeBtn.addEventListener('click', closeImageModal);
    }
    
    // Cerrar modal clickeando fuera de la imagen
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeImageModal();
            }
        });
    }
    
    // Cerrar modal con la tecla ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal && modal.style.display === 'block') {
            closeImageModal();
        }
    });
    
    function closeImageModal() {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
}

// ==================== REPRODUCTOR DE AUDIO ====================
function initializeAudioPlayer() {
    console.log('Inicializando reproductor de audio...');
    
    const listenBtn = document.getElementById('listenNowBtn');
    const audio = document.getElementById('mainAudio');
    
    console.log('Botón encontrado:', !!listenBtn);
    console.log('Audio encontrado:', !!audio);
    
    if (listenBtn && audio) {
        let isPlaying = false;
        
        // Agregar atributos de control de audio
        audio.volume = 0.7; // Volumen al 70%
        
        listenBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Click en botón LISTEN NOW, isPlaying:', isPlaying);
            
            if (!isPlaying) {
                console.log('Intentando reproducir audio...');
                // Resetear el audio al inicio
                audio.currentTime = 0;
                
                // Reproducir audio
                const playPromise = audio.play();
                
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        console.log('Audio reproduciéndose correctamente');
                        isPlaying = true;
                        // Cambiar el icono y texto del botón
                        listenBtn.innerHTML = '<i class="fas fa-pause"></i> PAUSE';
                    }).catch(error => {
                        console.error('Error al reproducir audio:', error);
                        alert('Error al reproducir audio. Es posible que el archivo 1.mp3 no exista o no se pueda reproducir.');
                    });
                }
            } else {
                console.log('Pausando audio...');
                // Pausar audio
                audio.pause();
                isPlaying = false;
                // Cambiar el icono y texto del botón
                listenBtn.innerHTML = '<i class="fas fa-play"></i> LISTEN NOW';
            }
        });
        
        // Cuando termine la canción, resetear el botón
        audio.addEventListener('ended', function() {
            console.log('Audio terminado');
            isPlaying = false;
            listenBtn.innerHTML = '<i class="fas fa-play"></i> LISTEN NOW';
        });
        
        // Manejar errores de carga
        audio.addEventListener('error', function(e) {
            console.error('Error al cargar el audio:', e);
            console.error('Tipo de error:', e.target.error);
            alert('No se pudo cargar el archivo 1.mp3. Verifica que el archivo exista en la carpeta del proyecto.');
        });
        
        // Debug: verificar si el audio se puede cargar
        audio.addEventListener('loadstart', function() {
            console.log('Iniciando carga del audio...');
        });
        
        audio.addEventListener('canplay', function() {
            console.log('Audio listo para reproducir');
        });
        
        audio.addEventListener('loadeddata', function() {
            console.log('Datos del audio cargados');
        });
        
    } else {
        console.error('No se encontraron los elementos necesarios para el reproductor de audio');
        if (!listenBtn) console.error('Botón listenNowBtn no encontrado');
        if (!audio) console.error('Elemento audio mainAudio no encontrado');
    }
}

// ==================== IMAGE MODAL FOR EVENTS WITH IMAGES ====================
function initializeEventImageModal() {
    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const closeBtn = document.querySelector('.image-close');
    
    // Buscar solo los botones de tickets que tienen data-image
    const imageButtons = document.querySelectorAll('.ticket-btn[data-image]');
    
    if (imageButtons.length > 0 && imageModal && modalImage) {
        console.log('Inicializando modal de imagen para eventos con imágenes');
        console.log('Botones encontrados:', imageButtons.length);
        
        // Event listener para todos los botones con data-image
        imageButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                // Solo procesar si es realmente un botón de ticket
                if (!this.classList.contains('ticket-btn')) {
                    return;
                }
                
                e.preventDefault();
                
                const venue = this.getAttribute('data-venue');
                const imagePath = this.getAttribute('data-image');
                
                console.log(`Click en botón de ${venue}`);
                
                // Validar que la imagen tenga extensión válida
                if (imagePath && (imagePath.endsWith('.png') || imagePath.endsWith('.jpg') || imagePath.endsWith('.jpeg') || imagePath.endsWith('.gif'))) {
                    console.log('Mostrando imagen:', imagePath);
                    modalImage.src = imagePath;
                    imageModal.style.display = 'block';
                    
                    // Prevenir scroll del body
                    document.body.style.overflow = 'hidden';
                } else {
                    console.error('Archivo de imagen no válido o no encontrado:', imagePath);
                }
            });
        });
        
        // Cerrar modal
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                console.log('Cerrando modal de imagen');
                imageModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            });
        }
        
        // Cerrar modal al hacer clic fuera de la imagen
        imageModal.addEventListener('click', function(e) {
            if (e.target === imageModal) {
                console.log('Cerrando modal (click fuera)');
                imageModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
        
        // Cerrar modal con tecla ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && imageModal.style.display === 'block') {
                console.log('Cerrando modal (ESC)');
                imageModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
        
        // Manejar errores de carga de imagen
        modalImage.addEventListener('error', function() {
            console.error('Error al cargar la imagen:', this.src);
            const imageName = this.src.split('/').pop();
            // Solo mostrar alerta si es realmente un archivo de imagen
            if (imageName && (imageName.endsWith('.png') || imageName.endsWith('.jpg') || imageName.endsWith('.jpeg') || imageName.endsWith('.gif'))) {
                alert(`No se pudo cargar la imagen ${imageName}. Verifica que el archivo exista en la carpeta del proyecto.`);
            }
        });
        
        modalImage.addEventListener('load', function() {
            console.log('Imagen cargada exitosamente:', this.src);
        });
        
    } else {
        console.log('Elementos del modal de imagen no encontrados en esta página');
        if (imageButtons.length === 0) console.log('No se encontraron botones con data-image');
        if (!imageModal) console.log('Modal de imagen no encontrado');
        if (!modalImage) console.log('Elemento de imagen modal no encontrado');
    }
}

// Agregar la inicialización del modal de imagen para eventos al DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeTicketModal();
    initializeGallery();
    initializeMerchStore();
    initializeCart();
    initializeLightbox();
    initializeImageModal();
    initializeAudioPlayer();
    initializeEventImageModal(); // Función actualizada para manejar todos los eventos con imágenes
    initializeReleaseAudioPlayers(); // Reproductores de audio para releases
    
    // Agregar efectos de sonido simulados
    addSoundEffects();
});

// ==================== AUDIO PLAYERS FOR RELEASES ====================
function initializeReleaseAudioPlayers() {
    const playButtons = document.querySelectorAll('.play-btn[data-audio]');
    let currentAudio = null;
    let currentButton = null;
    
    if (playButtons.length > 0) {
        console.log('Inicializando reproductores de releases:', playButtons.length);
        
        playButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                const audioFile = this.getAttribute('data-audio');
                const icon = this.querySelector('i');
                
                console.log('Botón clickeado, archivo:', audioFile);
                
                // Si hay un audio reproduciéndose y es diferente al actual, detenerlo
                if (currentAudio && currentButton !== this) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                    if (currentButton) {
                        const currentIcon = currentButton.querySelector('i');
                        currentIcon.className = 'fas fa-play';
                    }
                }
                
                // Si es el mismo botón y hay audio, alternar play/pause
                if (currentButton === this && currentAudio) {
                    if (currentAudio.paused) {
                        currentAudio.play().then(() => {
                            icon.className = 'fas fa-pause';
                            console.log('Reanudando:', audioFile);
                        }).catch(error => {
                            console.error('Error al reanudar:', error);
                        });
                    } else {
                        currentAudio.pause();
                        icon.className = 'fas fa-play';
                        console.log('Pausado:', audioFile);
                    }
                    return;
                }
                
                // Crear nuevo elemento audio si no existe o es diferente
                console.log('Creando nuevo audio para:', audioFile);
                
                // Resetear todos los botones a play
                playButtons.forEach(btn => {
                    const btnIcon = btn.querySelector('i');
                    btnIcon.className = 'fas fa-play';
                });
                
                currentAudio = new Audio(audioFile);
                currentButton = this;
                
                // Eventos del audio
                currentAudio.addEventListener('loadstart', function() {
                    console.log('Comenzando a cargar:', audioFile);
                });
                
                currentAudio.addEventListener('canplay', function() {
                    console.log('Audio listo para reproducir:', audioFile);
                });
                
                currentAudio.addEventListener('ended', function() {
                    icon.className = 'fas fa-play';
                    console.log('Audio terminado:', audioFile);
                    currentAudio = null;
                    currentButton = null;
                });
                
                currentAudio.addEventListener('error', function(e) {
                    console.error('Error al cargar audio:', e);
                    console.error('Archivo que falló:', audioFile);
                    icon.className = 'fas fa-play';
                    currentAudio = null;
                    currentButton = null;
                });
                
                // Reproducir inmediatamente
                currentAudio.play().then(() => {
                    icon.className = 'fas fa-pause';
                    console.log('Reproduciendo exitosamente:', audioFile);
                }).catch(error => {
                    console.error('Error al reproducir:', error);
                    icon.className = 'fas fa-play';
                    currentAudio = null;
                    currentButton = null;
                });
            });
        });
    } else {
        console.log('No se encontraron botones de play con audio');
    }
}