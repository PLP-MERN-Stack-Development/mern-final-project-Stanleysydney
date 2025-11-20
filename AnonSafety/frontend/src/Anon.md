🛡️ AnonSafety | Digital Fortress for GBV Victims

"Empowering Silence. Ensuring Justice."
🌍 The Context: Why AnonSafety?
In 2025, Kenya witnessed an alarming and heartbreaking surge in Gender-Based Violence (GBV) cases. Despite increased awareness, a vast majority of victims remain silent due to stigma, fear of retaliation, and lack of trust in traditional reporting channels.
AnonSafety was born out of this necessity. It is a millions-Scale, High-Performance MERN Web Application designed specifically for the timid and anonymous victim. It serves as a bridge between silent suffering and active justice, allowing users to report incidents, attach evidence, and access aid without ever revealing their identity unless they choose to.
🚀 Key Features
🔒 For the Victim (Frontend)
100% Anonymity: Users can report cases as "Guest" without account creation.
Encrypted Reporting: Zero-knowledge submission forms for GBV, Assault, and Harassment.
Evidence Vault: Secure upload for videos and images (Multer integration) to preserve proof.
Empathetic Chatbot: A Socket.io-powered assistant that recognizes users, offers empathy, and routes cases to humans within 5 minutes.
Panic & Safety UI: Twitter-like "Dim Mode" (Dark Theme) for low-light usage and discreet browsing.
Real-Time Notifications: Toast notifications for case updates ("Case Forwarded to Police").
👮 For Justice & Aid (Partnerships)
Regional Coordinators: Direct routing to Gender Desks in Nairobi, Mombasa, Kisumu, Eldoret, etc.
Grant Applications: Integrated portals for RedCross Medical Funds and NGAAF Enterprise Grants.
Legal Aid: One-click connection to FIDA Kenya and KNCHR pro-bono lawyers.
Live Dashboard: Real-time feed of anonymized cases to track regional trends and deploy resources.
🛠️ Technical Architecture
This project utilizes a robust Monolithic MERN Architecture designed for scalability to millions of users.
Frontend (/frontend)
Framework: React.js (Hooks & Context API).
Styling: Custom CSS Variables (No Tailwind) implementing the "Safety Amber" & "Twitter Dim" aesthetic.
Typography: DM Sans (Instagram-like readability).
Real-Time: socket.io-client for live chat and feed updates.
Motion: framer-motion for intuitive page transitions.
Backend (/backend)
Runtime: Node.js & Express.js.
Database: MongoDB (Mongoose ODM) with complex schemas for Reports, Users, and Comments.
Security: JWT Auth, Helmet headers, Bcrypt hashing.
Socket: socket.io for bi-directional communication.
Storage: Local/Cloud storage for evidence handling.
📦 Installation & Setup
Follow these steps to deploy the digital fortress locally.
Prerequisites
Node.js (v16+)
MongoDB (Local or Atlas)
Step 1: Clone & Install
code
Bash
git clone 
cd AnonSafety
Step 2: Backend Configuration
code
Bash
cd backend
npm install
Create a .env file in the backend folder:
code
Env
PORT=5000
MONGO_URI=mongodb://localhost:27017/anonsafety
JWT_SECRET=ANON_SAFETY_SECURE_KEY_2025
Start the server:
code
Bash
npm run dev
Step 3: Frontend Configuration
code
Bash
cd ../frontend
npm install
npm start
Visit http://localhost:3000 to access the application.
📱 User Journey
Arrival: The user lands on a secure, dim-lit dashboard showing recent anonymous reports (building community trust).
The Chatbot: The user interacts with the bot. "I am scared." The bot responds with empathy: "Hello [Name], we are here for you. Help is coming."
Reporting: The user clicks Report Case. Selects "Nairobi". Uploads video evidence.
Success: A "Green Check" confirms the report is encrypted and sent to the Regional Coordinator.
Aid: The user navigates to Grants and applies for a medical bill waiver from RedCross.
🤝 Sustainability & Partnerships
AnonSafety is a Social Enterprise.
At this stage (MVP & Initial Rollout), our primary focus is Impact over Profit. We are dedicated to saving lives and reducing the GBV statistics in Kenya.
Future Monetization & Sustainability Model:
While the app is free for victims, future revenue streams to sustain the technology will include:
Government Partnerships: Licensing the dashboard analytics to the Ministry of Gender for data-driven policy making.
Corporate CSR: Partnerships with Safaricom/Banks for "Safe Space" digital badges.
Grant Funding: Global funding from UN Women and Human Rights foundations.
📜 Acknowledgements
We acknowledge the critical role of our operational partners in making this code a reality:
The National Police Service (Gender Desks)
KNCHR (Kenya National Commission on Human Rights)
RedCross Kenya
FIDA Kenya
📞 Contact & Support
Emergency: 999 / 112
GBV Hotline: 1195
Crafted by Barongo