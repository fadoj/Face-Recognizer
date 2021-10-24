// Módulos para o servidor
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var path = require('path');
var bodyParser = require('body-parser');

// Módulos para o Arduino
var SerialPort = require('serialport'); // include the serialport library
var myPort = new SerialPort('COM3', { baudRate: 9600 });// open the port

//COnfigurações servidor
app.use(bodyParser.json({limit: '50mb', extended: true}))
app.use(bodyParser.text({limit: '50mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))
app.use(express.static('C:/Users/ponto frio/OneDrive/Documentos/FaceRecognizer' + '/node_modules'));
app.use(express.static("C:/Users/ponto frio/OneDrive/Documentos/FaceRecognizer/photos"));
app.use(express.static("C:/Users/ponto frio/OneDrive/Documentos/FaceRecognizer/face-api"));
app.use(express.static("C:/Users/ponto frio/OneDrive/Documentos/FaceRecognizer/"));
app.get('/', function(req, res) {
    res.sendFile(path.join("C:/Users/ponto frio/OneDrive/Documentos/FaceRecognizer" + "/index.html"));
});
server.listen(9000);
console.log("Static file server running at http://localhost:" + 9000 + "/\nCTRL + C to shutdown");

//Função enviar comando arduino
function wr() {
  // Recebe nome reconhecido
  console.log("open");
  setTimeout(function(){ myPort.write('1'); }, 2000);
}


// Registra eventos de "conexão" no WebSocket
io.on("connection", function(socket) {
  // Registra eventos "join" no WebSocket, vindos do client
  socket.on("join", function (room) {
    // Entra no canal provido pelo client
    socket.join(room)
    console.log("joined room")
    // Registra eventos de "imagem", vindos do client
    socket.on("image", function(msg) {
      // Envia foto do cel pro pc
      console.log("image");
      socket.broadcast.to(room).emit("image", msg);
    });
    socket.on("another", function(msg) {
      // Pede outra foto
      console.log("another");
      socket.broadcast.to(room).emit("another", msg);
    });
    socket.on("image2", function(image2) {
      // Recebe face reconhecida
      console.log("face");
      socket.broadcast.to(room).emit("image2", image2);
    });
    socket.on("name", function(name) {
      // Recebe nome reconhecido
      console.log("name");
      if (name != "Desconhecido") {
        wr();
      }
      socket.broadcast.to(room).emit("name", name);
    });
    socket.on("redirect", function(msg) {
      // Pede outra foto
      console.log("redirect");
      socket.broadcast.to(room).emit("redirect", msg);
    });
  })
}); 