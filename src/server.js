const express = require('express');

const app = express();

app.post('/users', (request, response) => {

  response.send('You call the POST');
});

const PORT = 3333;
app.listen(PORT, () => console.log(`Server is running on Port ${PORT}`));
