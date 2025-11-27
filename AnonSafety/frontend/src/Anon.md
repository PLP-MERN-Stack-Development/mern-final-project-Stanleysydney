This is the **Final, Aligned, and Capstone-Ready `README.md`**.

I have updated it to reflect the **intensive data collection features**, the **email notification system**, the **expanded coordinator network**, and the **interactive grants portal** we actually built.

You can copy and paste this directly into your root `README.md` file.

***

# 🛡️ AnonSafety | Digital Fortress for GBV Victims

> **"Empowering Silence. Ensuring Justice."**

## 🌍 The Context: Why AnonSafety?
In 2025, Kenya witnessed an alarming and heartbreaking surge in Gender-Based Violence (GBV) cases. Despite increased awareness, a vast majority of victims remain silent due to stigma, fear of retaliation, and lack of trust in traditional reporting channels. Furthermore, **a lack of accurate, granular data** has hindered effective policy-making.

**AnonSafety** was born out of this necessity. It is a **High-Performance MERN Web Application** designed specifically for the timid and anonymous victim. It serves as a bridge between silent suffering and active justice, allowing users to report incidents with **forensic-level detail**, attach evidence, and access aid without ever revealing their identity unless they choose to.

---

## 🚀 Key Features

### 🔒 For the Victim (Frontend)
*   **100% Anonymity:** Users report as "Guest" by default. No account required.
*   **Granular Data Collection:** specialized forms capturing **Date, Time, Location, and Perpetrator Description** to ensure police have actionable intelligence.
*   **Zero-Knowledge Evidence Vault:** Secure upload for videos and images (Multer integration) to preserve proof.
*   **Empathetic Chatbot:** A 3-Step Logic assistant (Acknowledge → Empathize → Action) that guides trauma victims.
*   **Email Status Updates:** An optional, secure channel for anonymous users to receive case progress via `Nodemailer`.
*   **Panic & Safety UI:** "Twitter Dim" (Dark Theme) for low-light usage and discreet browsing.

### 👮 For Justice & Aid (Partnerships)
*   **Expanded Regional Network:** Direct routing to Gender Desks in **12+ regions** (Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, etc.).
*   **Interactive Grants Portal:**
    *   **Medical Waivers:** Digital application form for RedCross hospital bill support.
    *   **Legal Directory:** Searchable list of Pro-Bono lawyers (FIDA, Kituo Cha Sheria) with direct contact links.
*   **Real-Time Dashboard:** Socket.io-powered feed that updates instantly when a report is filed.

---

## 🛠️ Technical Architecture
This project utilizes a robust **MERN Architecture** designed for scalability and data integrity.

### Frontend (`/frontend`)
*   **Framework:** React.js (Hooks, Context API).
*   **Styling:** Custom CSS Variables (Dark/Light Mode Switch).
*   **Typography:** DM Sans (High readability).
*   **Real-Time:** `socket.io-client` for live feed updates.
*   **Motion:** `framer-motion` for smooth, calming transitions.

### Backend (`/backend`)
*   **Runtime:** Node.js & Express.js.
*   **Database:** MongoDB (Mongoose ODM) with schemas for **Reports** (Geo-tagged) and **Users**.
*   **Communication:** `Nodemailer` (SMTP) for email alerts and `Socket.io` for bi-directional events.
*   **Security:** JWT Auth, Helmet headers, Bcrypt hashing.
*   **Storage:** Local storage (expandable to AWS S3) for evidence handling.

---

## 📦 Installation & Setup
Follow these steps to deploy the digital fortress locally.

### Prerequisites
*   Node.js (v16+)
*   MongoDB (Local or Atlas)

### Step 1: Clone & Install
```bash
git clone https://github.com/yourusername/anonsafety.git
cd AnonSafety
```

### Step 2: Backend Configuration
```bash
cd backend
npm install

# CRITICAL: Create the uploads directory for evidence
mkdir uploads
```

**Create a `.env` file in the `backend` folder:**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/anonsafety
JWT_SECRET=ANON_SAFETY_SECURE_KEY_2025

# Email Configuration (for Case Updates)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-google-app-password
```

**Start the server:**
```bash
npm run dev
# Output: 🛡️ AnonSafety Server running on port 5000
```

### Step 3: Frontend Configuration
```bash
cd ../frontend
npm install
npm start
```
Visit **http://localhost:3000** to access the application.

### Step 4: Running Tests (Capstone Requirement)
To ensure system stability, run the backend integration tests:
```bash
cd backend
npm test
```

---

## 📱 User Journey
1.  **Arrival:** The user lands on a secure, dim-lit dashboard showing recent anonymous reports.
2.  **The Chatbot:** The user interacts with the bot.
    *   *Bot:* "Hello. I see you. You are safe here."
    *   *Bot:* "I have forwarded your details..."
3.  **Detailed Reporting:** The user clicks **Report Case**. They fill in the **Incident Date**, **Time**, and **Perpetrator Details** (Height, Vehicle, Scars). They upload video evidence.
4.  **Updates:** The user opts-in to receive status updates via email (without creating an account).
5.  **Aid:** The user navigates to **Grants**, selects **"Apply for Waiver"**, and submits a request for medical funding.

---

## 🤝 Sustainability & Partnerships
AnonSafety is a **Social Enterprise**.
At this stage (MVP & Initial Rollout), our primary focus is Impact over Profit.

**Future Revenue Streams:**
*   **Government Partnerships:** Licensing dashboard analytics to the Ministry of Gender for data-driven policy making.
*   **Corporate CSR:** Partnerships with Safaricom/Banks for "Safe Space" digital badges.
*   **Grant Funding:** Global funding from UN Women and Human Rights foundations.

---

## 📜 Acknowledgements
We acknowledge the critical role of our operational partners:
*   **The National Police Service** (Gender Desks)
*   **KNCHR** (Kenya National Commission on Human Rights)
*   **RedCross Kenya**
*   **FIDA Kenya**

---

## 📞 Contact & Support
*   **Emergency:** 999 / 112
*   **GBV Hotline:** 1195

**Crafted by Barongo**