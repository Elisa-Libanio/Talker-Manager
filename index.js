const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});
 const file = './talker.json';
// req 1
app.get('/talker', async (_req, res, _next) => {
  const readTalker = await fs.readFile(file);
  const result = await JSON.parse(readTalker);
  return res.status(200).send(result);
});

// req3 

const validEmail = (req, res, next) => {
  const { email } = req.body;
  const regex = /^[a-z0-9_.]+@[a-z0-9]+\.[a-z]{2,3}(?:\.[a-z]{2})?$/;
  if (!email) return res.status(400).json({ message: 'O campo "email" é obrigatório' });
  if (!regex.test(email)) {
   return res.status(400).json({ message: 'O "email" deve ter o formato "email@email.com"' }); 
  } 
next();
};

const validPassword = (req, res, next) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ message: 'O campo "password" é obrigatório' });
  if (password.length < 6) {
   return res.status(400).json({ message: 'O "password" deve ter pelo menos 6 caracteres' }); 
  }
next();
};
const createToken = () => {
const token = crypto.randomBytes(8).toString('hex');
    return token;
  };  

 app.post('/login', validEmail, validPassword, (_req, res) => {
   const token = createToken();

   res.status(200).json({ token });
});
 
// req4 

const validateName = (req, res, next) => {
  const { name } = req.body;
  if (!name) return res.status(400).send({ message: 'O campo "name" é obrigatório' });
  if (name.length < 3) {
 return res.status(400).json({
    message: 'O "name" deve ter pelo menos 3 caracteres',
  }); 
}
next();
};
const validateAge = (req, res, next) => {
  const { age } = req.body;
  if (!age) {
 return res.status(400).json({
    message: 'O campo "age" é obrigatório',
  }); 
}
  if (age < 18) {
 return res.status(400).json({
    message: 'A pessoa palestrante deve ser maior de idade',
  }); 
}
 next();
};

const validateObjTalk = (req, res, next) => {
  const { talk } = req.body;
  if (!talk) {
 return res.status(400).json({
  message: 'O campo "talk" é obrigatório e "watchedAt" e "rate" não podem ser vazios',

 });
}
const { watchedAt, rate } = talk;
if (!watchedAt || typeof rate === 'undefined') {
return res.status(400).json({
  message: 'O campo "talk" é obrigatório e "watchedAt" e "rate" não podem ser vazios',

 });
}
next();
};

const validateFormat = (req, res, next) => {
  const { talk } = req.body; 
const { watchedAt } = talk;
const dataFormat = /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/;
if (!dataFormat.test(watchedAt)) {
return res.status(400).json({
  message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"',
});
}
 return next();
};

const validateRate = (req, res, next) => {
  const { talk } = req.body; 
  const { rate } = talk;
  if (rate < 1 || rate > 5) {
  return res.status(400).json({
    message: 'O campo "rate" deve ser um inteiro de 1 à 5',
  });
  }
 return next();
};

const validateToken = (req, res, next) => {
  const { authorization } = req.headers;
  console.log(authorization, 'auth');
  if (!authorization) return res.status(401).json({ message: 'Token não encontrado' });
  if (authorization.length !== 16) return res.status(401).json({ message: 'Token inválido' });

  next();
};

app.post('/talker', validateToken, validateName, validateAge, validateObjTalk, validateFormat, 
validateRate, async (req, res) => {
    const { name, age, talk } = req.body;
    const readTalker = await fs.readFile(file);
    const talkers = await JSON.parse(readTalker);
    const talk1 = { name, age, talk, id: talkers.length + 1 };
    talkers.push(talk1);
    await fs.writeFile(file, JSON.stringify(talkers));
    return res.status(201).json(talk1);
});
// req5
app.put('/talker/:id', validateToken, validateName, 
validateAge, validateObjTalk, validateFormat, validateRate, async (req, res) => {
  const readTalker = await fs.readFile(file);
  const talkers = await JSON.parse(readTalker);
  const { id } = req.params;
  const { name, age, talk } = req.body;
  const talker = { name, age, talk, id: +id };

  talkers.find((val) => val.id === +id);
  const idTalker = talkers.findIndex((val) => val.id === +id);
  talkers[idTalker] = talker;
  await fs.writeFile(file, JSON.stringify(talkers));
  return res.status(200).json(talker);
});

// req6
 app.delete('/talker/:id', validateToken, async (req, res) => {
  const readTalker = await fs.readFile(file);
 const talkers = await JSON.parse(readTalker);
  const { id } = req.params;

  const idTalke = talkers.findIndex((val) => val.id === +id);
talkers.splice(idTalke, 1);
 fs.writeFile(file, JSON.stringify(talkers));
  res.status(200).json({ message: 'Pessoa palestrante deletada com sucesso' });
 });

// req7
app.get('/talker/search', validateToken, async (req, res) => {
  const readTalker = await fs.readFile(file);
  const talkers = await JSON.parse(readTalker);
  const { q } = req.query;

  const talkerData = talkers.filter((t) => t.name.includes(q));
  if (!talkerData) return res.status(200).json(talkerData);
  return res.status(200).json(talkerData); 
});

// req2
app.get('/talker/:id', async (req, res, _next) => {
  const readTalker = await fs.readFile(file);
  const talkers = await JSON.parse(readTalker);
  const { id } = req.params;
const result = talkers.find((talker) => talker.id === parseInt(id, 10));
 if (!result) {
 return res.status(404).send({
    message: 'Pessoa palestrante não encontrada',
  }); 
}

  return res.status(200).send(result);
});

app.listen(PORT, () => {
  console.log('Online');
});
