"use strict";
// ===================================
// Shop page filter and sort logic
// TypeScript migration for src/pages/shoppage.js
// ===================================
class ProductFilter {
    constructor() {
        this.productCards = [];
        this.categoryLinks = [];
        this.priceCheckboxes = [];
        this.shopTitle = null;
        this.grid = null;
        this.sortDropdowns = [];
        this.activeCategory = 'all';
        this.activePrices = new Set(['all']);
        this.activeSortOption = 'default';
        this.originalOrder = [];
        this.productCards = Array.from(document.querySelectorAll('.product-card'));
        this.categoryLinks = Array.from(document.querySelectorAll('.category-link'));
        this.priceCheckboxes = Array.from(document.querySelectorAll('.price-checkbox'));
        this.shopTitle = document.querySelector('.shop-head h2');
        this.grid = document.querySelector('.products-grid');
        this.sortDropdowns = Array.from(document.querySelectorAll('.sort-dropdown'));
        this.originalOrder = this.grid
            ? Array.from(this.grid.children)
            : [];
    }
    init() {
        this.attachEventListeners();
        this.resetPriceCheckboxes();
        this.activateDefaultCategory();
        this.filterProducts();
    }
    filterByCategory(category) {
        this.activeCategory = category;
        this.filterProducts();
    }
    filterByPrice(prices) {
        this.activePrices = prices;
        this.filterProducts();
    }
    sortProducts(sortOption) {
        this.activeSortOption = sortOption;
        this.sortProductsInternal();
    }
    attachEventListeners() {
        this.categoryLinks.forEach((link) => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                this.categoryLinks.forEach((categoryLink) => categoryLink.classList.remove('active'));
                link.classList.add('active');
                this.activeCategory = link.dataset.category || 'all';
                this.filterProducts();
            });
        });
        this.priceCheckboxes.forEach((checkbox) => {
            checkbox.addEventListener('change', () => {
                this.handlePriceCheckbox(checkbox);
                this.filterProducts();
            });
        });
        this.sortDropdowns.forEach((dropdown) => {
            const sortBtn = dropdown.querySelector('.sort-btn');
            const sortMenu = dropdown.querySelector('.sort-menu');
            const sortOptions = Array.from(dropdown.querySelectorAll('.sort-option'));
            if (!sortBtn || !sortMenu)
                return;
            const iconMarkup = sortBtn.querySelector('span')?.innerHTML || '&#x25BC;';
            sortBtn.addEventListener('click', (event) => {
                event.preventDefault();
                this.sortDropdowns.forEach((otherDropdown) => {
                    const otherMenu = otherDropdown.querySelector('.sort-menu');
                    if (otherMenu && otherMenu !== sortMenu) {
                        otherMenu.classList.remove('active');
                    }
                });
                sortMenu.classList.toggle('active');
            });
            sortOptions.forEach((option) => {
                option.addEventListener('click', (event) => {
                    event.preventDefault();
                    this.activeSortOption = option.getAttribute('data-sort') || 'default';
                    this.updateSortButtons(option.textContent?.trim() || 'Default', iconMarkup);
                    sortMenu.classList.remove('active');
                    this.filterProducts();
                });
            });
        });
        document.addEventListener('click', (event) => {
            if (event.target.closest('.sort-dropdown'))
                return;
            this.sortDropdowns.forEach((dropdown) => {
                const sortMenu = dropdown.querySelector('.sort-menu');
                if (sortMenu) {
                    sortMenu.classList.remove('active');
                }
            });
        });
    }
    handlePriceCheckbox(checkbox) {
        const priceRange = checkbox.dataset.price || 'all';
        if (priceRange === 'all') {
            if (checkbox.checked) {
                this.activePrices.clear();
                this.activePrices.add('all');
                this.priceCheckboxes.forEach((cb) => {
                    cb.checked = cb === checkbox;
                });
            }
            else if (this.activePrices.size === 1 && this.activePrices.has('all')) {
                checkbox.checked = true;
            }
            return;
        }
        if (checkbox.checked) {
            this.activePrices.delete('all');
            this.activePrices.add(priceRange);
            const allCheckbox = this.priceCheckboxes.find((cb) => cb.dataset.price === 'all');
            if (allCheckbox) {
                allCheckbox.checked = false;
            }
        }
        else {
            this.activePrices.delete(priceRange);
        }
        if (this.activePrices.size === 0) {
            this.activePrices.add('all');
            const allCheckbox = this.priceCheckboxes.find((cb) => cb.dataset.price === 'all');
            if (allCheckbox) {
                allCheckbox.checked = true;
            }
        }
    }
    filterProducts() {
        this.productCards.forEach((card) => {
            const productCategory = card.dataset.category || 'all';
            const productPrice = parseFloat(card.dataset.price || '0');
            const categoryMatch = this.activeCategory === 'all' || productCategory === this.activeCategory;
            const priceMatch = this.activePrices.has('all')
                ? true
                : this.getPriceRanges(productPrice).some((range) => this.activePrices.has(range));
            if (categoryMatch && priceMatch) {
                card.style.display = '';
                card.classList.add('fade-in');
            }
            else {
                card.style.display = 'none';
                card.classList.remove('fade-in');
            }
        });
        this.updateHeading();
        this.sortProductsInternal();
        this.updateProductCount();
    }
    getVisibleCards() {
        return this.productCards.filter((card) => card.style.display !== 'none');
    }
    sortProductsInternal() {
        if (!this.grid)
            return;
        const cards = this.getVisibleCards();
        switch (this.activeSortOption) {
            case 'price-low':
                cards.sort((a, b) => parseFloat(a.dataset.price || '0') - parseFloat(b.dataset.price || '0'));
                break;
            case 'price-high':
                cards.sort((a, b) => parseFloat(b.dataset.price || '0') - parseFloat(a.dataset.price || '0'));
                break;
            case 'newest':
                cards.sort((a, b) => this.originalOrder.indexOf(b) - this.originalOrder.indexOf(a));
                break;
            default:
                cards.sort((a, b) => this.originalOrder.indexOf(a) - this.originalOrder.indexOf(b));
                break;
        }
        cards.forEach((card) => this.grid?.appendChild(card));
    }
    updateHeading() {
        if (!this.shopTitle)
            return;
        const activeLink = document.querySelector('.category-link.active');
        this.shopTitle.textContent = activeLink ? activeLink.textContent?.trim() || 'All Rooms' : 'All Rooms';
    }
    updateProductCount() {
        const visibleProducts = this.getVisibleCards().length;
        console.log(`Showing ${visibleProducts} of ${this.productCards.length} products`);
    }
    updateSortButtons(label, iconMarkup) {
        this.sortDropdowns.forEach((dropdown) => {
            const button = dropdown.querySelector('.sort-btn');
            if (!button)
                return;
            button.innerHTML = `${label}<span>${iconMarkup}</span>`;
        });
    }
    getPriceRanges(price) {
        const ranges = [];
        if (price >= 0 && price < 100)
            ranges.push('0-99');
        if (price >= 100 && price < 200)
            ranges.push('100-199');
        if (price >= 200 && price < 300)
            ranges.push('200-299');
        if (price >= 300 && price < 400)
            ranges.push('300-399');
        if (price >= 400)
            ranges.push('400-plus');
        return ranges;
    }
    resetPriceCheckboxes() {
        this.priceCheckboxes.forEach((checkbox) => {
            checkbox.checked = checkbox.dataset.price === 'all';
        });
    }
    activateDefaultCategory() {
        this.categoryLinks.forEach((link) => link.classList.remove('active'));
        const allRoomsLink = this.categoryLinks.find((link) => link.dataset.category === 'all');
        if (allRoomsLink) {
            allRoomsLink.classList.add('active');
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const productFilter = new ProductFilter();
    productFilter.init();
});
//# sourceMappingURL=shoppage.js.map