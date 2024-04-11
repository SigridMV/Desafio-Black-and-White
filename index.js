const http = require("http");
const fs = require("fs");
const url = require("url");
const yargs = require("yargs");
const jimp = require("jimp");

// node index.js levantar_servidor -k=123

// Clave que se usará como argumento del comando de Yargs
const key = 123;

// Se utiliza el módulo yargs para crear un comando (levantar_servidor) que levanta un servidor HTTP. 
//Este comando espera un argumento (key) que debe coincidir con la clave definida anteriormente
const argv = yargs
  .command(
    "levantar_servidor",
    "Comando para levantar servidor",
    {
      key: {
        describe: "Argumento para validar la clave de acceso",
        demand: true,
        alias: "k",
      },
    },
    // Creación del servidor en el cuarto parámetro de Yargs (<callback>)
    (args) => {
      // Verificación de la clave proporcionada con la clave definida
      args.key == key // Si es correcto
        ? http // crea un servidor HTTP
            .createServer((req, res) => {
              try {
                // Ruta raíz que devuelve formulario HTML
                if (req.url == "/") {
                  res.writeHead(200, { "Content-Type": "text/html" });
                  fs.readFile("index.html", "utf8", (err, html) => {
                    if (err) {
                      throw err; // Lanzar el error para que sea manejado por el catch
                    }
                    res.end(html);
                  });
                }

                //  Devuelve los estilos CSS
                else if (req.url == "/estilos") {
                  res.writeHead(200, { "Content-Type": "text/css" });
                  fs.readFile("estilos.css", (err, css) => {
                    if (err) {
                      throw err; // Lanzar el error para que sea manejado por el catch
                    }
                    res.end(css);
                  });
                }

                //  procesa una imagen proporcionada a través de la URL, 
                // la redimensiona, la convierte a escala de grises, 
                // la reduce su calidad y la devuelve como JPEG
                else if (req.url.includes("/imagen")) {
                  const params = url.parse(req.url, true).query;
                  const url_imagen = params.ruta;
                  jimp.read(url_imagen, (err, imagen) => {
                    if (err) {
                      throw err; // Lanzar el error para que sea manejado por el catch
                    }
                    imagen
                      .resize(600, jimp.AUTO)
                      .grayscale()
                      .quality(60)
                      .writeAsync("newImg.jpg")
                      .then(() => {
                        fs.readFile("newImg.jpg", (err, Imagen) => {
                          if (err) {
                            throw err; // Lanzar el error para que sea manejado por el catch
                          }
                          res.writeHead(200, { "Content-Type": "image/jpeg" });
                          res.end(Imagen);
                        });
                      })
                      .catch((err) => {
                        throw err; // Lanzar el error para que sea manejado por el catch
                      });
                  });
                }

                // Manejar rutas no encontradas
                else {
                  res.writeHead(404, { "Content-Type": "text/plain" });
                  res.end("404 Not Found");
                }
              } catch (err) {
                console.error("Error:", err.message);
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("500 Internal Server Error");
              }
            })
            .listen(3000, () => console.log("Escuchando el puerto 3000"))
            //clave incorrecta
        : console.log("Key incorrecta, intente nuevamente.");
    }
  )
  .help().argv;
