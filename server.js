import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let emails = [
    {
        id: 1,
        sender: "John Doe",
        subject: "Meeting Reminder",
        preview: "Don't forget our meeting at 3 PM...",
        time: "10:30 AM",
        isRead: false,
        isStarred: false
    },
    {
        id: 2,
        sender: "Jane Smith",
        subject: "Project Update",
        preview: "Here is the latest update on the project...",
        time: "11:15 AM",
        isRead: false,
        isStarred: false
    }
];
app.get('/api/emails', (req, res) => {
    res.json(emails);
});
app.put('/api/emails/:id/markAsRead', (req, res) => {
    const emailId = parseInt(req.params.id);
    const email = emails.find(e => e.id === emailId);
    if (email) {
        email.isRead = true;
        res.json(email);
    } else {
        res.status(404).json({ message: "Email not found" });
    }
});
app.put('/api/emails/:id/toggleStar', (req, res) => {
    const emailId = parseInt(req.params.id);
    const email = emails.find(e => e.id === emailId);
    if (email) {
        email.isStarred = !email.isStarred;
        res.json(email);
    } else {
        res.status(404).json({ message: "Email not found" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
