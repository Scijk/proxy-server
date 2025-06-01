import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.use('/api-proxy/:subpath(*)', async (req, res) => {
  console.log('🔐 Header Authorization:', req.headers['authorization']);

  const token = req.headers['authorization'];
  const subPath = req.params.subpath;
  const API_BASE = 'https://www.clinicatecnologica.cl/ipss/tejelanasVivi/api/v1/';

  if (!subPath) {
    return res.status(400).json({ error: 'Ruta a la API de terceros no especificada' });
  }
  if (!token) {
    return res.status(401).json({ error: 'Token de autorización requerido' });
  }

  const apiUrl = `${API_BASE}${subPath}`;

  try {
    const options = {
      method: req.method,
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    };

    if (['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase())) {
      options.body = JSON.stringify(req.body);
    }

    console.log('🔁 Método:', req.method);
    console.log('🔗 URL completa:', apiUrl);
    console.log('🔐 Headers enviados:', options.headers);

    const response = await fetch(apiUrl, options);
    const data = await response.json();

    res.status(response.status).json(data);
  } catch (err) {
    console.error('Error en el proxy:', err);
    res.status(500).json({ error: 'Error interno en el proxy' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Proxy corriendo en http://localhost:${PORT}`);
});
