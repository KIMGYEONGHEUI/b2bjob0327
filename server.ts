import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  app.use(express.json());

  // Mock Data
  const experts = [
    { id: "e1", name: "Dr. Sarah Chen", skills: ["AI", "Machine Learning", "Python"], experience: 12, rate: 150, rating: 4.9, bio: "Ex-Google AI researcher specializing in NLP." },
    { id: "e2", name: "Mark Johnson", skills: ["Data Analysis", "SQL", "Tableau"], experience: 8, rate: 90, rating: 4.7, bio: "Expert data strategist for Fortune 500 companies." },
    { id: "e3", name: "Elena Rodriguez", skills: ["Python", "Cloud Computing", "AWS"], experience: 10, rate: 130, rating: 4.8, bio: "Cloud architect with extensive experience in scaling startups." },
    { id: "e4", name: "James Wilson", skills: ["UI/UX", "Figma", "React"], experience: 6, rate: 85, rating: 4.6, bio: "Product designer focused on conversion-driven interfaces." },
  ];

  // API Routes
  app.get("/api/experts", (req, res) => {
    res.json(experts);
  });

  app.post("/api/match", (req, res) => {
    const { skills_required, budget } = req.body;
    
    const results = experts.map(expert => {
      const skillMatch = expert.skills.filter(s => skills_required.includes(s)).length;
      const skillScore = skillMatch / Math.max(skills_required.length, 1);
      const budgetScore = expert.rate <= budget ? 1 : budget / expert.rate;
      const ratingScore = expert.rating / 5;
      
      const totalScore = (skillScore * 0.5) + (budgetScore * 0.2) + (ratingScore * 0.3);
      
      return { expert, score: totalScore };
    }).sort((a, b) => b.score - a.score);

    res.json(results);
  });

  // Socket.io logic
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_room", (room) => {
      socket.join(room);
      console.log(`User ${socket.id} joined room ${room}`);
    });

    socket.on("send_message", (data) => {
      io.to(data.room).emit("receive_message", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const PORT = 3000;
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
