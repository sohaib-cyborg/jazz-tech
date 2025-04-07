require("dotenv").config();
const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 8002;

// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Configure Nodemailer transport with Hostinger SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true, // use true for port 465, false for port 587
  auth: {
    user: process.env.SMTP_USER, // your email address
    pass: process.env.SMTP_PASS, // your email password
  },
});

app.post("/contact", upload.single("file"), async (req, res) => {
  try {
    const { name, email, message, budget } = req.body;
    const file = req.file;

    if (!name || !email || !message || !budget) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    // Setup email data
    const mailOptions = {
      from: `"${name}" <${process.env.SMTP_USER}>`,
      to: ["ashrafsohaib19@gmail.com", "alijodat16@gmail.com","contactus@jastech.com"],
      subject: `New Contact Request from ${name}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Budget:</strong> ${budget}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
      attachments: file
        ? [
            {
              filename: file.originalname,
              content: file.buffer,
            },
          ]
        : [],
    };

    // Send the email
    const emailResponse = await transporter.sendMail(mailOptions);
    
    res.status(200).json({ success: true, emailResponse });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
