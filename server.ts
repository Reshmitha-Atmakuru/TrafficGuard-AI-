import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import {
  initializeDatabase,
  getUsers,
  addUser,
  getViolations,
  getViolationById,
  addViolation,
  updateViolation,
  deleteViolation,
  getVehicleOwner,
  addVehicleOwner,
  updateVehicleOwnerViolations,
  getHotspots,
  incrementHotspotCount
} from "./src/db/mysql-client";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" })); // Support base64 image uploads

// Lazy initialised Gemini client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// -------------------------------------------------------------
// REST API Endpoints
// -------------------------------------------------------------

// POST /login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    const users = await getUsers();
    const user = users.find(
      (u: any) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /signup (New traffic officers or admin accounts)
app.post("/api/signup", async (req, res) => {
  const { username, password, name, badgeNumber, role, district } = req.body;
  if (!username || !password || !name || !badgeNumber || !role || !district) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const users = await getUsers();
    const existingUser = users.find(
      (u: any) => u.username.toLowerCase() === username.toLowerCase()
    );

    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const newUser = {
      id: "u_" + Date.now(),
      username,
      password,
      name,
      badgeNumber,
      role,
      district,
    };

    await addUser(newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /violations (Filters based on officer role)
app.get("/api/violations", async (req, res) => {
  const { officerId, role } = req.query;
  try {
    const violationsList = await getViolations(officerId as string, role as string);
    res.json(violationsList);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /violations/:id
app.get("/api/violations/:id", async (req, res) => {
  try {
    const violation = await getViolationById(req.params.id);
    if (!violation) {
      return res.status(404).json({ error: "Violation not found" });
    }
    res.json(violation);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /violations
app.post("/api/violations", async (req, res) => {
  const {
    vehicleNumber,
    ownerName,
    violationType,
    fineAmount,
    location,
    district,
    dateTime,
    status,
    description,
    evidenceImage,
    officerId,
    officerName,
  } = req.body;

  if (!vehicleNumber || !violationType || !fineAmount || !location || !district || !officerId) {
    return res.status(400).json({ error: "Missing required violation details" });
  }

  try {
    // Check if vehicle has previous violations to flag as repeat offender
    const allViolations = await getViolations();
    const existingViolationsCount = allViolations.filter(
      (v: any) => v.vehicleNumber.toUpperCase() === vehicleNumber.toUpperCase()
    ).length;

    const isRepeatOffender = existingViolationsCount > 0;

    // Get or create vehicle owner record
    let owner = await getVehicleOwner(vehicleNumber);

    if (!owner) {
      owner = {
        vehicleNumber: vehicleNumber.toUpperCase(),
        ownerName: ownerName || "Unknown Owner",
        phone: "+91 9000000000",
        email: "owner." + vehicleNumber.toLowerCase() + "@gmail.com",
        address: `Andhra Pradesh Registered, ${district}`,
        licenseNumber: "AP" + Math.floor(1000000000 + Math.random() * 9000000000),
        vehicleModel: "Motor Vehicle",
        previousViolations: existingViolationsCount,
      };
      await addVehicleOwner(owner);
    } else {
      const updatedCount = existingViolationsCount + 1;
      await updateVehicleOwnerViolations(vehicleNumber, updatedCount, ownerName);
      owner.previousViolations = updatedCount;
      if (ownerName) {
        owner.ownerName = ownerName;
      }
    }

    // Choose default high-quality stock photo if no evidence image is provided
    let defaultImage = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600&auto=format&fit=crop";
    if (violationType === "No Helmet") {
      defaultImage = "https://images.unsplash.com/photo-1444491741275-3747c53c99b4?q=80&w=600&auto=format&fit=crop";
    } else if (violationType === "Red Light Jump") {
      defaultImage = "https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=600&auto=format&fit=crop";
    } else if (violationType === "Triple Riding") {
      defaultImage = "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=600&auto=format&fit=crop";
    } else if (violationType === "Drunk Driving") {
      defaultImage = "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=600&auto=format&fit=crop";
    } else if (violationType === "Using Mobile while Driving") {
      defaultImage = "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?q=80&w=600&auto=format&fit=crop";
    }

    const newViolation = {
      id: "v" + Date.now(),
      vehicleNumber: vehicleNumber.toUpperCase(),
      ownerName: owner.ownerName,
      violationType,
      fineAmount: Number(fineAmount),
      location,
      district,
      dateTime: dateTime || new Date().toISOString(),
      status: status || "Pending",
      evidenceImage: evidenceImage || defaultImage,
      officerId,
      officerName: officerName || "Traffic Officer",
      description: description || `Violation: ${violationType} reported at ${location}`,
      repeatOffender: isRepeatOffender,
    };

    await addViolation(newViolation);

    // Update relevant hotspot violation count if matching district or location
    await incrementHotspotCount(district, location);

    res.status(201).json(newViolation);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /violations/:id
app.put("/api/violations/:id", async (req, res) => {
  try {
    const updatedViolation = await updateViolation(req.params.id, req.body);
    if (!updatedViolation) {
      return res.status(404).json({ error: "Violation record not found" });
    }
    res.json(updatedViolation);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /violations/:id
app.delete("/api/violations/:id", async (req, res) => {
  try {
    const deleted = await deleteViolation(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Violation record not found" });
    }
    res.json({ message: "Violation record deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /owners/:vehicleNumber
app.get("/api/owners/:vehicleNumber", async (req, res) => {
  const vehicleNumber = req.params.vehicleNumber.toUpperCase();
  const { officerId, role } = req.query;

  try {
    const owner = await getVehicleOwner(vehicleNumber);

    if (!owner) {
      return res.status(404).json({ error: `Owner details not found for vehicle ${vehicleNumber}` });
    }

    // Fetch recent violations for this vehicle to show owner history
    const allViolations = await getViolations(officerId as string, role as string);
    const history = allViolations.filter((v: any) => v.vehicleNumber.toUpperCase() === vehicleNumber);

    res.json({
      ...owner,
      violationsHistory: history,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /reports/weekly
app.get("/api/reports/weekly", async (req, res) => {
  const { officerId, role } = req.query;
  
  try {
    const violations = await getViolations(officerId as string, role as string);

    // Let's group last 7 days from today
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const result: any[] = [];

    // Generate last 7 days keys
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = weekdays[d.getDay()];
      const dateStr = d.toISOString().split("T")[0];

      const violationsOfDay = violations.filter((v: any) => v.dateTime.startsWith(dateStr));
      const count = violationsOfDay.length;
      const fine = violationsOfDay.reduce((sum: number, v: any) => sum + Number(v.fineAmount), 0);

      result.push({
        day: dayName,
        date: dateStr,
        violations: count,
        fineCollected: fine,
      });
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /reports/monthly
app.get("/api/reports/monthly", async (req, res) => {
  const { officerId, role } = req.query;
  
  try {
    const violations = await getViolations(officerId as string, role as string);

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const currentYear = new Date().getFullYear();
    const result: any[] = [];

    // Generate months of current year up to current month
    const currentMonthIdx = new Date().getMonth();
    for (let i = 0; i <= currentMonthIdx; i++) {
      const monthPrefix = `${currentYear}-${String(i + 1).padStart(2, "0")}`;

      const violationsOfMonth = violations.filter((v: any) => v.dateTime.startsWith(monthPrefix));
      const count = violationsOfMonth.length;
      const fine = violationsOfMonth.reduce((sum: number, v: any) => sum + Number(v.fineAmount), 0);

      result.push({
        month: months[i],
        violations: count,
        fineCollected: fine,
      });
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /hotspots
app.get("/api/hotspots", async (req, res) => {
  try {
    const hotspotsList = await getHotspots();
    res.json(hotspotsList);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai-recommendations
app.post("/api/ai-recommendations", async (req, res) => {
  try {
    const violations = await getViolations();
    const hotspots = await getHotspots();

    // Build statistics
    const totalViolations = violations.length;
    const unpaidViolations = violations.filter((v: any) => v.status === "Pending").length;
    const totalFines = violations.reduce((sum: number, v: any) => sum + Number(v.fineAmount), 0);

    // Group types
    const typeCounts: Record<string, number> = {};
    violations.forEach((v: any) => {
      typeCounts[v.violationType] = (typeCounts[v.violationType] || 0) + 1;
    });

    const vehicleCounts: Record<string, number> = {};
    violations.forEach((v: any) => {
      vehicleCounts[v.vehicleNumber] = (vehicleCounts[v.vehicleNumber] || 0) + 1;
    });
    const repeatOffendersCount = Object.values(vehicleCounts).filter((count) => count >= 2).length;

    const ai = getAIClient();
    if (!ai) {
      return res.json({
        recommendation: `### AI Traffic Safety Recommendations
        
**System Status:** Offline Mode. Setup a Gemini API key to receive intelligent personalized analysis.

**Current Live Safety Insights:**
1. **High Speed Sectors:** Velocity guns and radar checks should be increased along **Kanaka Durga Varadhi Highway** and **Benz Circle Crossing, Vijayawada** due to elevated counts of Over Speeding.
2. **Pedestrian Safety Interventions:** Heavy pedestrian crossing volume near **Lodge Centre Crossing, Guntur** requires immediate pedestrian flyovers or signal re-phasing to counter Red Light Jumping.
3. **Targeted Campaigns:** With ${typeCounts["No Helmet"] || 0} No Helmet cases and ${typeCounts["Triple Riding"] || 0} Triple Riding counts reported, helmet checkpoints should be deployed on Alipiri Bypass, Tirupati.
4. **Repeat Offender Alerts:** There are currently ${repeatOffendersCount} flagged vehicles with recurring offenses. Automated camera alerts should trigger SMS notifications immediately.`,
      });
    }

    const prompt = `You are the TrafficGuard AI Traffic Analyst Core. Analyse the following actual traffic logs in Andhra Pradesh, India, and generate 4 structured, highly actionable, localized safety recommendations.
    
    STATISTICS:
    - Total Traffic Violations Registered: ${totalViolations}
    - Total Fine Levied: ₹${totalFines}
    - Pending Fines Unpaid: ${unpaidViolations}
    - Violation Categories Breakdowns: ${JSON.stringify(typeCounts)}
    - Active High-risk Hotspots: ${JSON.stringify(
      hotspots.map((h: any) => ({
        location: h.locationName,
        district: h.district,
        risk: h.riskLevel,
        accidents: h.accidentCount,
        violations: h.violationCount,
      }))
    )}
    - Flagged Repeat Offenders (Vehicles with multiple offenses): ${repeatOffendersCount}
    
    Please provide your expert output in beautiful Markdown with exact localized focus for cities like Vijayawada, Guntur, Visakhapatnam, and Tirupati. Recommend specific patrol adjustments, penalty policy amendments, physical safety barricades, or smart camera deployments. Keep the analysis professional, crisp, and objective. Limit to about 250 words. Do not praise yourself.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert AI traffic safety analyst and highway traffic engineer.",
      },
    });

    res.json({ recommendation: response.text });
  } catch (err: any) {
    console.error("Gemini AI API Error", err);
    res.status(500).json({ error: "AI recommendation failed: " + err.message });
  }
});

// -------------------------------------------------------------
// Dev & Production Integration for Vite SPA
// -------------------------------------------------------------

async function startServer() {
  // Initialize the database (MySQL setup + seeding or Fallback)
  await initializeDatabase();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server mounted");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TrafficGuard AI Server running at http://localhost:${PORT}`);
  });
}

startServer();
