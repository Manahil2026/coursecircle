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

export default function handler(req, res) {
    const { method, query } = req;

    if (method === "GET") {
        res.status(200).json(emails);
    } 
    else if (method === "PUT" && query.id) {
        const emailId = parseInt(query.id);
        const email = emails.find(e => e.id === emailId);

        if (!email) {
            return res.status(404).json({ message: "Email not found" });
        }

        if (query.action === "markAsRead") {
            email.isRead = true;
        } 
        else if (query.action === "toggleStar") {
            email.isStarred = !email.isStarred;
        } 
        else {
            return res.status(400).json({ message: "Invalid action" });
        }

        res.status(200).json(email);
    } 
    else {
        res.status(405).json({ message: "Method Not Allowed" });
    }
}
