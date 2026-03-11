import express from "express";
import { createServer as createViteServer } from "vite";
import cookieSession from "cookie-session";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(
    cookieSession({
      name: "session",
      keys: [process.env.SESSION_SECRET || "default-secret"],
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: true,
      sameSite: "none",
    })
  );

  // Mock Auth API
  app.get("/api/auth/me", (req, res) => {
    if (req.session?.user) {
      res.json({ user: req.session.user });
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    // Simple mock login
    if (email && password) {
      const user = { id: 1, email, name: email.split("@")[0] };
      req.session!.user = user;
      res.json({ user });
    } else {
      res.status(400).json({ error: "Email and password required" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session = null;
    res.json({ success: true });
  });

  // OAuth URL generation (Mock)
  app.get("/api/auth/google/url", (req, res) => {
    // In a real app, this would be the Google OAuth URL
    // For this demo, we'll redirect back to a mock callback
    const redirectUri = `${req.protocol}://${req.get("host")}/auth/callback?provider=google`;
    res.json({ url: redirectUri });
  });

  app.get("/api/auth/github/url", (req, res) => {
    const redirectUri = `${req.protocol}://${req.get("host")}/auth/callback?provider=github`;
    res.json({ url: redirectUri });
  });

  // OAuth Callback
  app.get("/auth/callback", (req, res) => {
    const { provider } = req.query;
    // Mock user creation from OAuth
    const user = { 
      id: Math.floor(Math.random() * 1000), 
      email: `${provider}-user@example.com`, 
      name: `${provider} User`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`
    };
    req.session!.user = user;

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', user: ${JSON.stringify(user)} }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
