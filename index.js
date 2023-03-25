const express = require("express");
const app = express();
const PORT = process.env.port || 3001;
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const meme = require("./meme");
const cors = require("cors");
//const website = "https://news.sky.com";
const liquipediaURL =
  "https://liquipedia.net/counterstrike/Qualifier_Tournaments";
const cheerio = require("cheerio");
const { response } = require("express");

let content = [];
let cachedPartidas = "";

function getPartidas(json) {
  var content = [];
  const partidas = JSON.parse(json);
  partidas.map((partida) => {
    content.push(partida);
  });
  return content;
}

function getData(html) {
  content = [];
  const $ = cheerio.load(html);
  $(".divRow", html).each(function () {
    const local = $(this)
      .find(".EventDetails.Location.Header")
      .find("a")
      .attr("title");
    const titulo = $(this).find("b").text();
    const data = trataDate($(this).find(".EventDetails.Date.Header").text());
    content.push({
      titulo,
      local,
      data,
    });
  });
}

function carregaObjData(data, isInicio, isMesmoMes, ano) {
  if (isInicio) {
    console.log("testando inicio");
    return new Date(`${data[0]} ${data[1]} ${ano}`);
  }
  if (isMesmoMes) {
    return new Date(`${data[3]} ${data[4]} ${ano}`);
  } else {
    return new Date(`${data[0]} ${data[6]} ${ano}`);
  }
}

function trataDate(date) {
  var ano = date.split(", ")[1];
  var dataPeriodoCamp = date.split(",")[0].split(" ");
  if (dataPeriodoCamp.length > 2) {
  } else if (dataPeriodoCamp.length > 17) {
  } else {
  }
}

async function fetchDataCampeonatos() {
  try {
    axios.get(liquipediaURL).then((response) => {
      html = response.data;
      fs.writeFile(
        path.resolve(__dirname, "cacheData", "data.html"),
        html,
        function (err) {
          if (err) {
            return console.log(err);
          }
        }
      );
    });
    return "";
  } catch (error) {
    console.log(error, error.message);
  }
}

async function fetchDataPartidas(req, res) {
  meme.getData(req, res).then(() => {
    res.json({ mensagem: "Terminei de getData, cache atualizado com sucesso" });
  });
}
app.use(express.static(path.resolve(__dirname, "../frontend/build")));
app.use(cors({
  origin: '*'
}))
app.listen(process.env.PORT || 3000, function () {
  console.log(
    "Express server listening on port %d in %s mode",
    this.address().port,
    app.settings.env
  );
});

app.get('/'), (req, res) => {
  res.send("OI")
}

app.get("/liquipedia", (req, res) => {
  cachedPartidas = fs.readFileSync(
    path.resolve(__dirname, "cacheData", "data.html"),
    "utf8"
  );
  getData(cachedPartidas);
  res.json(content);
  //console.log(content);
});

app.get("/fetchData", async (req, res) => {
  fetchDataCampeonatos();
  fetchDataPartidas(req, res);
});

app.get("/partidas", async (req, res) => {
  cachedPartidas = fs.readFileSync(
    path.resolve(__dirname, "cacheData", "partidas.json"),
    "utf8"
  );
  res.json({ partidas: getPartidas(cachedPartidas) });
  //console.log(content);
});

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/build", "index.html"));
});

module.exports = app;
