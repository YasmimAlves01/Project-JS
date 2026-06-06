const BASE_URL = 'https://openlibrary.org';

async function getBooks(query) {
  const url = `${BASE_URL}/search.json?q=${encodeURIComponent(query)}&limit=12&fields=key,title,author_name,first_publish_year,subject,ratings_average,ratings_count,cover_i`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Falha ao buscar livros');
  return response.json();
}

async function getBookById(olid) {
  const url = `${BASE_URL}/works/${olid}.json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Falha ao buscar livro');
  return response.json();
}

export { getBooks, getBookById };
