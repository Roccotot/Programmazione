const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 5000; // Usa la porta 5000

// Middleware per interpretare il corpo delle richieste in JSON
app.use(express.json());

// Assicurati che la directory 'documenti' esista
const documentiPath = path.join(__dirname, 'documenti');
if (!fs.existsSync(documentiPath)) {
    fs.mkdirSync(documentiPath);
}

// Configura la directory per caricare i file PDF
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, documentiPath); // Salva i file nella directory "documenti"
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Serve i file statici
app.use('/documenti', express.static(path.join(__dirname, 'documenti')));
app.use(express.static(__dirname));

// Rotta per caricare i file
app.post('/upload', upload.single('pdfFile'), (req, res) => {
    if (req.file) {
        const filePath = `/documenti/${req.file.filename}`;
        res.json({ 
            message: 'File caricato con successo!', 
            filename: req.file.filename, 
            filePath: filePath 
        });
    } else {
        res.status(400).json({ message: 'Errore nel caricamento del file.' });
    }
});

// Rotta per ottenere la lista di tutti i PDF nella cartella "documenti"
app.get('/get-pdf-list', (req, res) => {
    fs.readdir(documentiPath, (err, files) => {
        if (err) {
            return res.status(500).json({ message: 'Errore durante la lettura della directory.' });
        }
        // Filtra solo i file con estensione .pdf
        const pdfFiles = files.filter(file => file.endsWith('.pdf')).map(file => `/documenti/${file}`);
        res.json({ pdfFiles });
    });
});

// Rotta per eliminare un file PDF
app.post('/delete-pdf', (req, res) => {
    const { filePath } = req.body;
    if (!filePath) {
        return res.status(400).json({ success: false, error: 'Nessun percorso specificato' });
    }

    const fileName = path.basename(filePath);
    const fullPath = path.join(documentiPath, fileName);

    fs.unlink(fullPath, (err) => {
        if (err) {
            console.error(`Errore durante l'eliminazione del file ${fullPath}:`, err);
            return res.status(500).json({ success: false, error: 'Impossibile eliminare il file' });
        }
        res.json({ success: true });
    });
});

// Avvia il server sulla porta 5000
app.listen(port, () => {
    console.log(`Server avviato su http://localhost:${port}`);
});
