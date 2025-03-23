const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
const mockEmails = [
    {
        id: 1,
        sender: "Jane Doe",
        subject: "schedule",
        preview: "here is my availability",
        time: "9:00 pm",
        isRead: false,
        isStarred: false,
    },
    {
        id: 2,
        sender: "John Doe",
        subject: "confirm",
        preview: "lets meet",
        time: "8:20 am",
        isRead: false,
        isStarred: true,
    },
];
app.get("/api/emails", (req, res) => {
    res.json(mockEmails);
});
app.put("/api/emails/:id/markasRead", (req, res) => {
    const emailId = parseInt(req.params.id);
    const email = mockEmails.find((e) => e.id === emailId);
    if (email) {
        email.isRead = true;
        res.json(email);
    } else {
        res.status(404).json({message: "Email not found" });
    }
});
app.put("/api/emails/:id/toggleStar", (req, res) => {
    const emailId = parseInt(req.params.id);
    const email = mockEmails.find((e) => e.id === emailId);
    if (email) {
        email.isStarred = !email.isStarred;
        res.json(email);
    } else {
        res.status(404).json({ message: "Email not found" });
    }
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
})