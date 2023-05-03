Copy
const fs = require('fs');
const axios = require('axios');

// Читаем содержимое файла test.http
const testContent = fs.readFileSync('test.http', 'utf8');

// Разбиваем содержимое на строки и получаем набор запросов
const requests = testContent.split(/\r?\n/);

// Выполняем каждый запрос последовательно
requests.forEach(async (request) => {
  if (request.trim().startsWith('GET')) {
    const url = request.trim().substring(4).trim();
    try {
      const response = await axios.get(url);
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  }
  // Другие методы HTTP можно обработать аналогично
});