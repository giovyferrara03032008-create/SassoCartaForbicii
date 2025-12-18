import express from "express";
import path from "path";

const port =  process.env.PORT || 3000;
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("img"));
app.use(express.static("pagina"));
app.use(express.static("suoni"));

// Impostazioni view
app.set("view engine", "ejs");
app.set("views", "views");

// Variabili globali
let puntiGiocatore = 0;
let puntiMacchina = 0;
let vittoriaGiocatore = 0;
let vittoriaMacchina = 0;
let numeroPartita = 1;

let gioco = null;
let nomeGiocatore = "";

// Avvio server
app.listen(port, () => {
    console.log("Server in ascolto sulla porta " + port);
});

// Pagina iniziale
app.get("/", (req, res) => {
    gioco = [];
    puntiGiocatore = 0;
    puntiMacchina = 0;
    vittoriaGiocatore = 0;
    vittoriaMacchina = 0;
    numeroPartita = 1;

    res.render("pagina1");
});

// Pagina 2 (gioco)
app.get("/pagina2", (req, res) => {
    if (!gioco) {
        gioco = { giocatore: null, computer: null };
    }

    if (req.query.nome) {
        nomeGiocatore = req.query.nome;
    }

    res.render("pagina2", {
        gioco,
        puntiGiocatore,
        puntiMacchina,
        numeroPartita,
        vittoriaGiocatore,
        vittoriaMacchina,
        nomeGiocatore
    });
});

// Pagina 3 (fine partita)
app.get("/pagina3", (req, res) => {

    // Scegli il file audio giusto
    let audioFile = "";
    if (puntiGiocatore === 3) {
        audioFile = "vittoria.mp3";
    } else {
        audioFile = "perdita.mp3"; // correzione: corrisponde al tuo file
    }

    res.render("pagina3", {
        gioco,
        puntiGiocatore,
        puntiMacchina,
        numeroPartita,
        vittoriaGiocatore,
        vittoriaMacchina,
        nomeGiocatore,
        audioFile
    });

    puntiGiocatore = 0;
    puntiMacchina = 0;
    numeroPartita++;
    gioco = null;
});

// Gioco (POST)
app.post("/gioco", (req, res) => {
    if (puntiGiocatore >= 3 || puntiMacchina >= 3) {
        return res.redirect("/pagina3");
    }

    if (req.body.nome) {
        nomeGiocatore = req.body.nome;
    }

   if (!req.body.scelta) {
    return res.redirect("/pagina2"); // non ha cliccato nulla → torna alla pagina
}

const scelta = req.body.scelta;
    const valoreNumerico =
        scelta === "sasso" ? 1 :
        scelta === "carta" ? 2 : 3;

    const sceltaComputerValore = Math.floor(Math.random() * 3) + 1;
    const sceltaComputer =
        sceltaComputerValore === 1 ? "sasso" :
        sceltaComputerValore === 2 ? "carta" : "forbici";

    if (
        (scelta === "sasso" && sceltaComputer === "forbici") ||
        (scelta === "carta" && sceltaComputer === "sasso") ||
        (scelta === "forbici" && sceltaComputer === "carta")
    ) {
        puntiGiocatore++;
    } else if (scelta !== sceltaComputer) {
        puntiMacchina++;
    }

    gioco = {
        giocatore: { nomeGiocatore, scelta, valore: valoreNumerico, punti: puntiGiocatore },
        computer: { scelta: sceltaComputer, valore: sceltaComputerValore, punti: puntiMacchina }
    };

    if (puntiGiocatore === 3) vittoriaGiocatore++;
    if (puntiMacchina === 3) vittoriaMacchina++;

    if (puntiGiocatore === 3 || puntiMacchina === 3) {
        return res.redirect("/pagina3");
    } else {
        return res.redirect("/pagina2");
    }
});