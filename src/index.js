// import axios from 'axios';
// import Notiflix from 'notiflix';

// Отримуємо посилання на необхідні елементи
const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

// Функція для виконання HTTP-запиту до API Pixabay
async function fetchImages(query, page = 1) {
  const apiKey = '36686199-3af1daf12518f9079ef45ad7e'; // API ключ
  const perPage = 40; // Кількість зображень на сторінці

  const url = `https://pixabay.com/api/?key=${apiKey}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`;

  try {
    const response = await axios.get(url);
    return response.data.hits; // Повертаємо тільки масив з результатами зображень
  } catch (error) {
    console.error('Error fetching images:', error);
    return []; // У разі помилки повертаємо порожній масив
  }
}

// Функція для відображення карток із зображеннями
function displayImages(images) {
  const cardsHTML = images.map((image) => createCardHTML(image)).join('');
  gallery.innerHTML += cardsHTML;
}

// Функція для створення HTML-розмітки картки із зображенням
function createCardHTML(image) {
  return `
    <div class="photo-card">
      <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
      <div class="info">
        <p class="info-item"><b>Likes:</b> ${image.likes}</p>
        <p class="info-item"><b>Views:</b> ${image.views}</p>
        <p class="info-item"><b>Comments:</b> ${image.comments}</p>
        <p class="info-item"><b>Downloads:</b> ${image.downloads}</p>
      </div>
    </div>
  `;
}

// Функція для очищення галереї
function clearGallery() {
  gallery.innerHTML = '';
}

// Функція для обробки події відправлення форми пошуку
function handleSearchFormSubmit(event) {
  event.preventDefault();
  
  const searchQuery = event.target.elements.searchQuery.value.trim();
  
  // Якщо пошуковий запит порожній, не виконуємо пошук
  if (searchQuery === '') {
    return;
  }
  
  clearGallery();
  
  fetchAndDisplayImages(searchQuery);
}

// Функція для завантаження та відображення зображень
async function fetchAndDisplayImages(query) {
  let page = 1;
  
 // Функція для завантаження наступної порції зображень
  async function loadMoreImages() {
    page++;
    const images = await fetchImages(query, page);
    
    if (images.length > 0) {
      displayImages(images);
    } else {
      loadMoreBtn.style.display = 'none';
      Notiflix.Notify.warning("We're sorry, but you've reached the end of search results.");
    }
  }
  
  // Виконуємо перший запит для відображення зображень
  const images = await fetchImages(query, page);

  if (images.length > 0) {
    displayImages(images);
    loadMoreBtn.style.display = 'block';
    loadMoreBtn.addEventListener('click', loadMoreImages);
  } else {
    loadMoreBtn.style.display = 'none';
    Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
  }
}

// Обробник події відправлення форми пошуку
searchForm.addEventListener('submit', handleSearchFormSubmit);
