const express = require('express');
const { Pool } = require('pg');
const shortid = require('shortid');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
    connectionString: 'postgres://postgres:postL1g;gresQL@localhost:5432/urldb',
});

app.use(express.json());
app.use(bodyParser.text())
app.use(cors({ origin: 'http://localhost:3001' }));



app.post('/acortar', async (req, res) => {
    try {
        const { original_url } = req.body;
        const urlCorta = shortid.generate();

        console.log('URL Original:', original_url);
        console.log('URL Corta Generada:', urlCorta);

        const insertQuery = 'INSERT INTO url (original_url, shortened_url) VALUES ($1, $2)';
        const result = await pool.query(insertQuery, [original_url, urlCorta]);

        console.log('Resultado de la inserción en la base de datos:', result);

        console.log('Solicitud POST recibida:', req.body); 

        res.json(urlCorta);
    } catch (error) {
        console.error('Error al acortar la URL:', error);
        res.status(500).json({ error: 'Hubo un error al acortar la URL' });
    }
});



app.get('/:urlCorta', async (req, res) => {
    try {
        const { urlCorta } = req.params;

        const selectQuery = 'SELECT original_url FROM url WHERE shortened_url = $1';
        const result = await pool.query(selectQuery, [urlCorta]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'URL corta no encontrada', urlCorta: `${urlCorta}` });
        }

        const original_url = result.rows[0].original_url;
        res.redirect(original_url);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Hubo un error al redirigir a la URL original' });
    }
});

app.listen(port, () => {
    console.log(`La API está escuchando en el puerto ${port}`);
});
