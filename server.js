const express = require('express');
const path = require('path');
const fs = require('fs').promises; // usa le promesse di fs per async/await
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000; // Usa variabile di ambiente per la porta

app.use(cors()); // Abilita CORS per richieste cross-origin
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint API per ottenere gli spettacoli
app.get('/api/shows', async (req, res) => {
    try {
        const data = await fs.readFile(path.join(__dirname, 'data.json'), 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error("Errore di lettura di data.json:", err);
        res.status(500).json({ error: 'Errore di lettura dei dati' });
    }
});

// Endpoint API per aggiungere nuovi spettacoli
app.post('/api/shows', async (req, res) => {
    try {
        const data = await fs.readFile(path.join(__dirname, 'data.json'), 'utf8');
        const shows = JSON.parse(data);
        const newShows = req.body;
        shows.push(...newShows);

        await fs.writeFile(path.join(__dirname, 'data.json'), JSON.stringify(shows, null, 2));
        res.status(200).json({ message: 'Spettacoli aggiunti con successo' });
    } catch (err) {
        console.error("Errore di scrittura di data.json:", err);
        res.status(500).json({ error: 'Errore di scrittura dei dati' });
    }
});

// Endpoint per aggiornare lo stato dell'intervallo
app.put('/api/shows/:id/interval', async (req, res) => {
    const showId = req.params.id;
    const intervalDone = req.body.intervalDone;

    try {
        const data = await fs.readFile(path.join(__dirname, 'data.json'), 'utf8');
        const shows = JSON.parse(data);
        const show = shows.find(s => s.id === showId);

        if (show) {
            show.intervalDone = intervalDone;
            await fs.writeFile(path.join(__dirname, 'data.json'), JSON.stringify(shows, null, 2));
            io.emit('updateInterval', { showId, intervalDone });
            res.status(200).json({ message: 'Stato intervallo aggiornato con successo' });
        } else {
            res.status(404).json({ error: 'Spettacolo non trovato' });
        }
    } catch (err) {
        console.error("Errore:", err);
        res.status(500).json({ error: 'Errore durante l\'aggiornamento' });
    }
});

// Endpoint per aggiornare lo stato venduto
app.put('/api/shows/:id/sold', async (req, res) => {
    const showId = req.params.id;
    const sold = req.body.sold;

    try {
        const data = await fs.readFile(path.join(__dirname, 'data.json'), 'utf8');
        const shows = JSON.parse(data);
        const show = shows.find(s => s.id === showId);

        if (show) {
            show.sold = sold;
            await fs.writeFile(path.join(__dirname, 'data.json'), JSON.stringify(shows, null, 2));
            io.emit('updateSold', { showId, sold });
            res.status(200).json({ message: 'Stato venduto aggiornato con successo' });
        } else {
            res.status(404).json({ error: 'Spettacolo non trovato' });
        }
    } catch (err) {
        console.error("Errore:", err);
        res.status(500).json({ error: 'Errore durante l\'aggiornamento' });
    }
});

// Endpoint per aggiornare lo stato della sala pronta
app.put('/api/shows/:id/ready', async (req, res) => {
    const showId = req.params.id;
    const ready = req.body.ready;

    try {
        const data = await fs.readFile(path.join(__dirname, 'data.json'), 'utf8');
        const shows = JSON.parse(data);
        const show = shows.find(s => s.id === showId);

        if (show) {
            show.ready = ready;
            await fs.writeFile(path.join(__dirname, 'data.json'), JSON.stringify(shows, null, 2));
            io.emit('updateReady', { showId, ready });
            res.status(200).json({ message: 'Stato sala pronta aggiornato con successo' });
        } else {
            res.status(404).json({ error: 'Spettacolo non trovato' });
        }
    } catch (err) {
        console.error("Errore:", err);
        res.status(500).json({ error: 'Errore durante l\'aggiornamento' });
    }
});

// Endpoint per cancellare tutti gli spettacoli
app.delete('/api/shows', async (req, res) => {
    try {
        await fs.writeFile(path.join(__dirname, 'data.json'), JSON.stringify([], null, 2));
        io.emit('clearShows');
        res.status(200).json({ message: 'Tutti gli spettacoli cancellati con successo' });
    } catch (err) {
        console.error("Errore:", err);
        res.status(500).json({ error: 'Errore di cancellazione dei dati' });
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
});
