const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const fs = require("fs");
const path = require("path");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Load users database
const USERS_DB = path.join(__dirname, "users.json");

// Create users.json if missing
if (!fs.existsSync(USERS_DB)) {
    fs.writeFileSync(USERS_DB, JSON.stringify([]));
}

// Read users
function getUsers() {
    return JSON.parse(fs.readFileSync(USERS_DB));
}

// Save users
function saveUsers(data) {
    fs.writeFileSync(USERS_DB, JSON.stringify(data, null, 2));
}

// ----------------------
// LOGIN ENDPOINT
// ----------------------
app.post("/login", (req, res) => {
    const { phone, password } = req.body;

    const users = getUsers();
    const user = users.find(
        (u) => u.phone === phone && u.password === password
    );

    if (!user) {
        return res.json({ success: false, message: "Invalid login" });
    }

    res.json({ success: true, name: user.name });
});

// ----------------------
// ADMIN — ADD USER
// ----------------------
app.post("/admin/add-user", (req, res) => {
    const { adminKey, name, phone, password } = req.body;

    // Only YOU can add users
    if (adminKey !== "STEELBURG-ADMIN-2024") {
        return res.json({ success: false, message: "Unauthorized" });
    }

    const users = getUsers();

    if (users.find((u) => u.phone === phone)) {
        return res.json({ success: false, message: "Phone already exists" });
    }

    users.push({ name, phone, password });
    saveUsers(users);

    res.json({ success: true, message: "User added successfully" });
});

// ----------------------
// CHAT SOCKET
// ----------------------
io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("chatMessage", (msg) => {
        socket.broadcast.emit("chatMessage", msg);
    });

    socket.on("typing", () => {
        socket.broadcast.emit("typing");
    });
});

// ----------------------
// START SERVER
// ----------------------
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
