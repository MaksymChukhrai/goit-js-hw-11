import axios from 'axios';
import Notiflix from 'notiflix';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const messageContainer = document.querySelector('.message');

let currentPage = 1; // Початкова сторінка
const perPage = 40; // Кількість зображень на сторінці

// Функція для виконання HTTP-запиту до API Pixabay з пагінацією
async function fetchImages(query, page = 1) {
  const apiKey = '36686199-3af1daf12518f9079ef45ad7e';
  const url = `https://pixabay.com/api/?key=${apiKey}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching images:', error);
    return null;
  }
}

// Функція для відображення карток із зображеннями
function displayImages(images) {
  const cardsHTML = images.hits.map((image) => createCardHTML(image)).join('');
  gallery.innerHTML += cardsHTML;

  // Оновлюємо SimpleLightbox
  gallery.querySelectorAll('.photo-link').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      SimpleLightbox.open({ items: [event.target.getAttribute('href')] });
    });
  });
}

// Функція для створення HTML-розмітки картки із зображенням
function createCardHTML(image) {
  return `
    <div class="photo-card">
      <a href="${image.largeImageURL}" class="photo-link">
        <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
      </a>
      <div class="info">
        <div class="info-item">
          <b>Likes:</b> <span>${image.likes}</span>
        </div>
        <div class="info-item">
          <b>Views:</b> <span>${image.views}</span>
        </div>
        <div class="info-item">
          <b>Comments:</b> <span>${image.comments}</span>
        </div>
        <div class="info-item">
          <b>Downloads:</b> <span>${image.downloads}</span>
        </div>
      </div>
    </div>
  `;
}

// Функція для очищення галереї
function clearGallery() {
  gallery.innerHTML = '';
}

// Функція для обробки події відправлення форми пошуку
async function handleSearchFormSubmit(event) {
  event.preventDefault();

  const searchQuery = event.target.elements.searchQuery.value.trim();

  if (searchQuery === '') {
    return;
  }

  clearGallery();
  currentPage = 1; // Повертаємо сторінку до початкового значення

  const data = await fetchImages(searchQuery);
  if (data) {
    displayImages(data);
    if (data.hits.length === perPage) {
      loadMoreBtn.style.display = 'block';
    } else {
      loadMoreBtn.style.display = 'none';
      Notiflix.Notify.warning("We're sorry, but you've reached the end of search results.");
    }

    showMessage(data.totalHits);
  }
}

// Функція для відображення повідомлення про кількість знайдених зображень
function showMessage(totalHits) {
  messageContainer.textContent = `Hooray! We found ${totalHits} images.`;
}

// Функція для виконання запиту на завантаження наступної порції зображень
async function loadMoreImages() {
  currentPage += 1; // Збільшуємо значення поточної сторінки

  const searchQuery = searchForm.elements.searchQuery.value.trim();
  const data = await fetchImages(searchQuery, currentPage);

  if (data) {
    displayImages(data);
    if (data.hits.length !== perPage) {
      loadMoreBtn.style.display = 'none';
      Notiflix.Notify.warning("We're sorry, but you've reached the end of search results.");
    }

    showMessage(data.totalHits);
  }
}

searchForm.addEventListener('submit', handleSearchFormSubmit);
loadMoreBtn.addEventListener('click', loadMoreImages);

// Ініціалізація SimpleLightbox
const lightbox = new SimpleLightbox('.photo-link');
