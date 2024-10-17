const { Client } = require('pg');
const readline = require('readline');

const client = new Client({
  user: 'colocar-usuario-db',
  host: 'localhost',
  database: 'colocar-nombre-basedatos',
  password: '1234',
  port: 5432,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function conectarDB() {
  try {
    await client.connect();
    console.log('Conexión a la base de datos establecida.');
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    process.exit(1);
  }
}

async function cerrarDB() {
  try {
    await client.end();
    console.log('Conexión a la base de datos cerrada.');
  } catch (error) {
    console.error('Error al cerrar la conexión con la base de datos:', error);
  }
}

function validarClave(clave) {
  const regexInyeccion = /['"\\;]+|--/;
  return !regexInyeccion.test(clave);
}

function solicitarDatos() {
  return new Promise((resolve) => {
    rl.question('Ingrese el nombre de usuario: ', (nombreUsuario) => {
      rl.question('Ingrese la clave: ', (claveUsuario) => {
        resolve({ nombreUsuario, claveUsuario });
      });
    });
  });
}

async function consultarUsuario(nombreUsuario, claveUsuario) {
  const query = 'SELECT * FROM usuario WHERE nombre = $1 AND clave = $2';

  try {
    const res = await client.query(query, [nombreUsuario, claveUsuario]);
    return res.rows;
  } catch (error) {
    console.error('Error al ejecutar la consulta:', error);
    return null;
  }
}

async function main() {
  await conectarDB();

  const { nombreUsuario, claveUsuario } = await solicitarDatos();

  if (!validarClave(claveUsuario)) {
    console.error('Error: La clave contiene caracteres no permitidos que podrían ser peligrosos.');
    await cerrarDB();
    rl.close();
    return;
  }

  const usuario = await consultarUsuario(nombreUsuario, claveUsuario);
  if (usuario && usuario.length > 0) {
    console.log('Datos del usuario:', usuario);
  } else {
    console.log('No se encontraron registros para este usuario y clave.');
  }

  await cerrarDB();
  rl.close();
}

main();
