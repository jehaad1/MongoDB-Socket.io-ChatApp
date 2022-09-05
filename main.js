const express = require("express");
const app = express();
const http = require("http");
const httpServer = http.createServer(app);
const { Database } = require("quickmongo");
const { Server } = require("socket.io");
const io = new Server(httpServer);
const db = new Database("mongodb+srv://jehaadd:jehaad100jehaad@cluster0.g5yiodx.mongodb.net/Data");

db.on("ready", () => console.log("ready"));

app.get("/", (request, response) => {
    response.sendFile(__dirname + "/index.html");
});

app.use("/assets", express.static(__dirname + "/assets"));

let users = {};

io.on("connection", (socket) => {
    socket.on("user-connect", (data) => {
        users[socket.id] = data;
    db.get("messages").then((dats) => socket.emit("view-messages", dats));

    socket.broadcast.emit("user-connected", {
        name: data
    });
    });
    socket.on("send-message", (data) => {
        db.push("messages", data);
        console.log(data);
        socket.broadcast.emit("view-message", data);
    })
    socket.on("disconnect", () => {
        socket.broadcast.emit("user-disconnected", users[socket.id]);
        delete users[socket.id];
    });
});

httpServer.listen(3000, (error) => {
    if (error) return console.error(error);
    console.log("Server Started");
});