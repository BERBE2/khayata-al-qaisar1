// Image Viewer System
// نظام عرض تفاصيل الصور بشكل جذاب

class ImageViewer {
    constructor() {
        this.currentImage = null;
        this.images = [];
        this.currentIndex = 0;
        this.init();
    }

    init() {
        this.createViewerHTML();
        this.setupEventListeners();
    }

    createViewerHTML() {
        const viewerHTML = `
            <div id="imageViewer" class="image-viewer">
                <div class="viewer-overlay"></div>
                <div class="viewer-container">
                    <div class="viewer-header">
                        <h3 id="viewerTitle">عنوان الصورة</h3>
                        <button class="viewer-close" id="viewerClose">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="viewer-content">
                        <div class="viewer-image-container">
                            <img id="viewerImage" src="" alt="">
                            <button class="viewer-nav viewer-prev" id="viewerPrev">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                            <button class="viewer-nav viewer-next" id="viewerNext">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                        </div>
                        <div class="viewer-details">
                            <div class="detail-item">
                                <i class="fas fa-tag"></i>
                                <span id="viewerCategory">التصنيف</span>
                            </div>
                            <div class="detail-item" id="viewerPriceContainer" style="display: none;">
                                <i class="fas fa-dollar-sign"></i>
                                <span id="viewerPrice">السعر</span>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-calendar"></i>
                                <span id="viewerDate">التاريخ</span>
                            </div>
                        </div>
                        <div class="viewer-description">
                            <h4>الوصف</h4>
                            <p id="viewerDescription">وصف الصورة</p>
                        </div>
                        <div class="viewer-actions">
                            <button class="btn btn-primary" id="viewerContact">
                                <i class="fas fa-phone"></i>
                                اتصل للاستفسار
                            </button>
                            <button class="btn btn-success" id="viewerWhatsapp">
                                <i class="fab fa-whatsapp"></i>
                                واتساب
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', viewerHTML);
    }

    setupEventListeners() {
        const viewer = document.getElementById('imageViewer');
        const closeBtn = document.getElementById('viewerClose');
        const overlay = viewer.querySelector('.viewer-overlay');
        const prevBtn = document.getElementById('viewerPrev');
        const nextBtn = document.getElementById('viewerNext');
        const contactBtn = document.getElementById('viewerContact');
        const whatsappBtn = document.getElementById('viewerWhatsapp');

        // Close viewer
        closeBtn.addEventListener('click', () => this.close());
        overlay.addEventListener('click', () => this.close());

        // Navigation
        prevBtn.addEventListener('click', () => this.previousImage());
        nextBtn.addEventListener('click', () => this.nextImage());

        // Contact actions
        contactBtn.addEventListener('click', () => this.contact());
        whatsappBtn.addEventListener('click', () => this.whatsapp());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!viewer.classList.contains('active')) return;

            switch (e.key) {
                case 'Escape':
                    this.close();
                    break;
                case 'ArrowLeft':
                    this.nextImage();
                    break;
                case 'ArrowRight':
                    this.previousImage();
                    break;
            }
        });
    }

    showImage(imageData, allImages = []) {
        this.currentImage = imageData;
        this.images = allImages;
        this.currentIndex = allImages.findIndex(img => img.id === imageData.id);

        // Update viewer content
        document.getElementById('viewerImage').src = imageData.image;
        document.getElementById('viewerTitle').textContent = imageData.title;
        document.getElementById('viewerCategory').textContent = imageData.category;
        document.getElementById('viewerDescription').textContent = imageData.description || 'لا يوجد وصف متاح';
        document.getElementById('viewerDate').textContent = imageData.dateAdded || 'غير محدد';

        // Show/hide price
        const priceContainer = document.getElementById('viewerPriceContainer');
        const priceElement = document.getElementById('viewerPrice');
        if (imageData.price) {
            priceElement.textContent = imageData.price;
            priceContainer.style.display = 'flex';
        } else {
            priceContainer.style.display = 'none';
        }

        // Update navigation buttons
        const prevBtn = document.getElementById('viewerPrev');
        const nextBtn = document.getElementById('viewerNext');

        prevBtn.style.display = this.currentIndex > 0 ? 'flex' : 'none';
        nextBtn.style.display = this.currentIndex < this.images.length - 1 ? 'flex' : 'none';

        // Show viewer
        document.getElementById('imageViewer').classList.add('active');
        document.body.style.overflow = 'hidden';

        // Add animation
        setTimeout(() => {
            document.getElementById('imageViewer').classList.add('loaded');
        }, 10);
    }

    previousImage() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.showImage(this.images[this.currentIndex], this.images);
        }
    }

    nextImage() {
        if (this.currentIndex < this.images.length - 1) {
            this.currentIndex++;
            this.showImage(this.images[this.currentIndex], this.images);
        }
    }

    close() {
        const viewer = document.getElementById('imageViewer');
        viewer.classList.remove('loaded');

        setTimeout(() => {
            viewer.classList.remove('active');
            document.body.style.overflow = '';
        }, 300);
    }

    contact() {
        const phoneNumber = '+07769592080';
        window.open(`tel:${phoneNumber}`, '_self');
    }

    whatsapp() {
        const phoneNumber = '07769592080';
        const message = `مرحباً، أريد الاستفسار عن: ${this.currentImage.title}`;
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }
}

// Initialize image viewer
const imageViewer = new ImageViewer();

// Function to show image details
function showImageDetails(imageData, allImages = []) {
    imageViewer.showImage(imageData, allImages);
}

// Make function globally available
window.showImageDetails = showImageDetails;
