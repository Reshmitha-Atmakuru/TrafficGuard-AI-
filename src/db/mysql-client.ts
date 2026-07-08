import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

// Configuration from environment variables
const DB_HOST = process.env.DB_HOST || "";
const DB_USER = process.env.DB_USER || "";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || "";
const DB_PORT = Number(process.env.DB_PORT) || 3306;

const isMySQLConfigured = !!(DB_HOST && DB_USER && DB_NAME);

let pool: mysql.Pool | null = null;

const dbJsonPath = path.join(process.cwd(), "src", "db", "data-store.json");

// Helper to read local JSON file (fallback database)
function getLocalDB() {
  try {
    if (fs.existsSync(dbJsonPath)) {
      return JSON.parse(fs.readFileSync(dbJsonPath, "utf-8"));
    }
  } catch (e) {
    console.error("Failed to read local fallback database", e);
  }
  return { users: [], violations: [], vehicle_owners: [], hotspots: [] };
}

// Helper to write local JSON file (fallback database)
function saveLocalDB(data: any) {
  try {
    fs.writeFileSync(dbJsonPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to save local fallback database", e);
  }
}

// Initialize MySQL pool and create tables if configured
export async function initializeDatabase() {
  if (!isMySQLConfigured) {
    console.log("ℹ️ MySQL not configured (DB_HOST, DB_USER, DB_NAME are required). Falling back to JSON file storage.");
    return;
  }

  try {
    console.log(`🔌 Attempting to connect to MySQL database at ${DB_HOST}:${DB_PORT}...`);
    
    // First, connect without DB name to check/create the database
    const initialConnection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      port: DB_PORT,
    });
    
    await initialConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
    await initialConnection.end();

    // Now initialize the pool
    pool = mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      port: DB_PORT,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Create tables
    await createTablesIfNotExist();
    
    // Seed database if empty
    await seedDatabaseIfEmpty();

    console.log("✅ MySQL database initialized, tables verified, and default data seeded successfully.");
  } catch (err) {
    console.error("❌ Failed to initialize MySQL database. App will fall back to local JSON storage.", err);
    pool = null;
  }
}

async function createTablesIfNotExist() {
  if (!pool) return;

  const usersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(50) PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(100) NOT NULL,
      name VARCHAR(100) NOT NULL,
      badgeNumber VARCHAR(50) NOT NULL,
      role VARCHAR(20) NOT NULL,
      district VARCHAR(100) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const ownersTable = `
    CREATE TABLE IF NOT EXISTS vehicle_owners (
      vehicleNumber VARCHAR(20) PRIMARY KEY,
      ownerName VARCHAR(100) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      email VARCHAR(100) NOT NULL,
      address VARCHAR(255) NOT NULL,
      licenseNumber VARCHAR(50) NOT NULL,
      vehicleModel VARCHAR(100) NOT NULL,
      previousViolations INT DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const violationsTable = `
    CREATE TABLE IF NOT EXISTS violations (
      id VARCHAR(50) PRIMARY KEY,
      vehicleNumber VARCHAR(20) NOT NULL,
      ownerName VARCHAR(100) NOT NULL,
      violationType VARCHAR(100) NOT NULL,
      fineAmount DECIMAL(10, 2) NOT NULL,
      location VARCHAR(255) NOT NULL,
      district VARCHAR(100) NOT NULL,
      dateTime VARCHAR(100) NOT NULL,
      status VARCHAR(50) NOT NULL,
      evidenceImage LONGTEXT NOT NULL,
      officerId VARCHAR(50) NOT NULL,
      officerName VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      repeatOffender BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (vehicleNumber) REFERENCES vehicle_owners(vehicleNumber) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const hotspotsTable = `
    CREATE TABLE IF NOT EXISTS hotspots (
      id VARCHAR(50) PRIMARY KEY,
      locationName VARCHAR(255) NOT NULL,
      district VARCHAR(100) NOT NULL,
      riskLevel VARCHAR(50) NOT NULL,
      accidentCount INT DEFAULT 0,
      violationCount INT DEFAULT 0,
      lat DOUBLE NOT NULL,
      lng DOUBLE NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  await pool.query(usersTable);
  await pool.query(ownersTable);
  await pool.query(violationsTable);
  await pool.query(hotspotsTable);
}

async function seedDatabaseIfEmpty() {
  if (!pool) return;

  try {
    const localDb = getLocalDB();

    // Check users
    const [userRows]: any = await pool.query("SELECT COUNT(*) as count FROM users");
    if (userRows[0].count === 0 && localDb.users.length > 0) {
      console.log("🌱 Seeding users into MySQL...");
      for (const u of localDb.users) {
        await pool.query(
          "INSERT IGNORE INTO users (id, username, password, name, badgeNumber, role, district) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [u.id, u.username, u.password, u.name, u.badgeNumber, u.role, u.district]
        );
      }
    }

    // Check vehicle owners
    const [ownerRows]: any = await pool.query("SELECT COUNT(*) as count FROM vehicle_owners");
    if (ownerRows[0].count === 0 && localDb.vehicle_owners.length > 0) {
      console.log("🌱 Seeding vehicle_owners into MySQL...");
      for (const o of localDb.vehicle_owners) {
        await pool.query(
          "INSERT IGNORE INTO vehicle_owners (vehicleNumber, ownerName, phone, email, address, licenseNumber, vehicleModel, previousViolations) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [o.vehicleNumber, o.ownerName, o.phone, o.email, o.address, o.licenseNumber, o.vehicleModel, o.previousViolations]
        );
      }
    }

    // Check violations
    const [violationRows]: any = await pool.query("SELECT COUNT(*) as count FROM violations");
    if (violationRows[0].count === 0 && localDb.violations.length > 0) {
      console.log("🌱 Seeding violations into MySQL...");
      for (const v of localDb.violations) {
        await pool.query(
          "INSERT IGNORE INTO violations (id, vehicleNumber, ownerName, violationType, fineAmount, location, district, dateTime, status, evidenceImage, officerId, officerName, description, repeatOffender) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [v.id, v.vehicleNumber, v.ownerName, v.violationType, v.fineAmount, v.location, v.district, v.dateTime, v.status, v.evidenceImage, v.officerId, v.officerName, v.description, v.repeatOffender ? 1 : 0]
        );
      }
    }

    // Check hotspots
    const [hotspotRows]: any = await pool.query("SELECT COUNT(*) as count FROM hotspots");
    if (hotspotRows[0].count === 0 && localDb.hotspots.length > 0) {
      console.log("🌱 Seeding hotspots into MySQL...");
      for (const h of localDb.hotspots) {
        await pool.query(
          "INSERT IGNORE INTO hotspots (id, locationName, district, riskLevel, accidentCount, violationCount, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [h.id, h.locationName, h.district, h.riskLevel, h.accidentCount, h.violationCount, h.coordinates.lat, h.coordinates.lng]
        );
      }
    }
  } catch (err) {
    console.error("⚠️ Failed to seed MySQL database", err);
  }
}

// DATABASE ACCESSORS

// 1. Users
export async function getUsers(): Promise<any[]> {
  if (pool) {
    try {
      const [rows] = await pool.query("SELECT * FROM users");
      return rows as any[];
    } catch (err) {
      console.error("MySQL getUsers error, falling back to JSON:", err);
    }
  }
  return getLocalDB().users;
}

export async function addUser(user: any): Promise<void> {
  if (pool) {
    try {
      await pool.query(
        "INSERT INTO users (id, username, password, name, badgeNumber, role, district) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [user.id, user.username, user.password, user.name, user.badgeNumber, user.role, user.district]
      );
      return;
    } catch (err) {
      console.error("MySQL addUser error, falling back to JSON:", err);
    }
  }
  const db = getLocalDB();
  db.users.push(user);
  saveLocalDB(db);
}

// 2. Violations
export async function getViolations(officerId?: string, role?: string): Promise<any[]> {
  if (pool) {
    try {
      let query = "SELECT * FROM violations ORDER BY dateTime DESC";
      let params: any[] = [];
      if (role === "officer" && officerId) {
        query = "SELECT * FROM violations WHERE officerId = ? ORDER BY dateTime DESC";
        params = [officerId];
      }
      const [rows]: any = await pool.query(query, params);
      return rows.map((r: any) => ({
        ...r,
        repeatOffender: !!r.repeatOffender,
        fineAmount: Number(r.fineAmount),
      }));
    } catch (err) {
      console.error("MySQL getViolations error, falling back to JSON:", err);
    }
  }

  let list = getLocalDB().violations;
  if (role === "officer" && officerId) {
    list = list.filter((v: any) => v.officerId === officerId);
  }
  return list;
}

export async function getViolationById(id: string): Promise<any | null> {
  if (pool) {
    try {
      const [rows]: any = await pool.query("SELECT * FROM violations WHERE id = ?", [id]);
      if (rows.length > 0) {
        const r = rows[0];
        return {
          ...r,
          repeatOffender: !!r.repeatOffender,
          fineAmount: Number(r.fineAmount),
        };
      }
      return null;
    } catch (err) {
      console.error("MySQL getViolationById error, falling back to JSON:", err);
    }
  }
  const item = getLocalDB().violations.find((v: any) => v.id === id);
  return item || null;
}

export async function addViolation(v: any): Promise<void> {
  if (pool) {
    try {
      await pool.query(
        "INSERT INTO violations (id, vehicleNumber, ownerName, violationType, fineAmount, location, district, dateTime, status, evidenceImage, officerId, officerName, description, repeatOffender) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [v.id, v.vehicleNumber, v.ownerName, v.violationType, v.fineAmount, v.location, v.district, v.dateTime, v.status, v.evidenceImage, v.officerId, v.officerName, v.description, v.repeatOffender ? 1 : 0]
      );
      return;
    } catch (err) {
      console.error("MySQL addViolation error, falling back to JSON:", err);
    }
  }
  const db = getLocalDB();
  db.violations.unshift(v);
  saveLocalDB(db);
}

export async function updateViolation(id: string, updates: any): Promise<any | null> {
  if (pool) {
    try {
      // Fetch current
      const current = await getViolationById(id);
      if (!current) return null;

      const merged = { ...current, ...updates };
      
      await pool.query(
        "UPDATE violations SET vehicleNumber = ?, ownerName = ?, violationType = ?, fineAmount = ?, location = ?, district = ?, dateTime = ?, status = ?, evidenceImage = ?, officerId = ?, officerName = ?, description = ?, repeatOffender = ? WHERE id = ?",
        [
          merged.vehicleNumber,
          merged.ownerName,
          merged.violationType,
          Number(merged.fineAmount),
          merged.location,
          merged.district,
          merged.dateTime,
          merged.status,
          merged.evidenceImage,
          merged.officerId,
          merged.officerName,
          merged.description,
          merged.repeatOffender ? 1 : 0,
          id
        ]
      );
      return merged;
    } catch (err) {
      console.error("MySQL updateViolation error, falling back to JSON:", err);
    }
  }

  const db = getLocalDB();
  const idx = db.violations.findIndex((v: any) => v.id === id);
  if (idx === -1) return null;

  const current = db.violations[idx];
  const merged = {
    ...current,
    ...updates,
    fineAmount: updates.fineAmount ? Number(updates.fineAmount) : current.fineAmount,
  };
  db.violations[idx] = merged;
  saveLocalDB(db);
  return merged;
}

export async function deleteViolation(id: string): Promise<boolean> {
  if (pool) {
    try {
      const [res]: any = await pool.query("DELETE FROM violations WHERE id = ?", [id]);
      return res.affectedRows > 0;
    } catch (err) {
      console.error("MySQL deleteViolation error, falling back to JSON:", err);
    }
  }

  const db = getLocalDB();
  const filtered = db.violations.filter((v: any) => v.id !== id);
  if (filtered.length === db.violations.length) return false;

  db.violations = filtered;
  saveLocalDB(db);
  return true;
}

// 3. Vehicle Owners
export async function getVehicleOwner(vehicleNumber: string): Promise<any | null> {
  const cleanNumber = vehicleNumber.toUpperCase();
  if (pool) {
    try {
      const [rows]: any = await pool.query("SELECT * FROM vehicle_owners WHERE vehicleNumber = ?", [cleanNumber]);
      if (rows.length > 0) {
        return rows[0];
      }
      return null;
    } catch (err) {
      console.error("MySQL getVehicleOwner error, falling back to JSON:", err);
    }
  }
  const owner = getLocalDB().vehicle_owners.find((o: any) => o.vehicleNumber === cleanNumber);
  return owner || null;
}

export async function addVehicleOwner(o: any): Promise<void> {
  if (pool) {
    try {
      await pool.query(
        "INSERT INTO vehicle_owners (vehicleNumber, ownerName, phone, email, address, licenseNumber, vehicleModel, previousViolations) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [o.vehicleNumber, o.ownerName, o.phone, o.email, o.address, o.licenseNumber, o.vehicleModel, o.previousViolations]
      );
      return;
    } catch (err) {
      console.error("MySQL addVehicleOwner error, falling back to JSON:", err);
    }
  }
  const db = getLocalDB();
  db.vehicle_owners.push(o);
  saveLocalDB(db);
}

export async function updateVehicleOwnerViolations(vehicleNumber: string, count: number, ownerName?: string): Promise<void> {
  const cleanNumber = vehicleNumber.toUpperCase();
  if (pool) {
    try {
      if (ownerName) {
        await pool.query(
          "UPDATE vehicle_owners SET previousViolations = ?, ownerName = ? WHERE vehicleNumber = ?",
          [count, ownerName, cleanNumber]
        );
      } else {
        await pool.query(
          "UPDATE vehicle_owners SET previousViolations = ? WHERE vehicleNumber = ?",
          [count, cleanNumber]
        );
      }
      return;
    } catch (err) {
      console.error("MySQL updateVehicleOwnerViolations error, falling back to JSON:", err);
    }
  }

  const db = getLocalDB();
  const owner = db.vehicle_owners.find((o: any) => o.vehicleNumber === cleanNumber);
  if (owner) {
    owner.previousViolations = count;
    if (ownerName) {
      owner.ownerName = ownerName;
    }
    saveLocalDB(db);
  }
}

// 4. Hotspots
export async function getHotspots(): Promise<any[]> {
  if (pool) {
    try {
      const [rows]: any = await pool.query("SELECT * FROM hotspots");
      return rows.map((r: any) => ({
        id: r.id,
        locationName: r.locationName,
        district: r.district,
        riskLevel: r.riskLevel,
        accidentCount: r.accidentCount,
        violationCount: r.violationCount,
        coordinates: { lat: r.lat, lng: r.lng },
      }));
    } catch (err) {
      console.error("MySQL getHotspots error, falling back to JSON:", err);
    }
  }
  return getLocalDB().hotspots;
}

export async function incrementHotspotCount(district: string, location: string): Promise<void> {
  if (pool) {
    try {
      const lowerLocation = location.toLowerCase();
      
      // Find matching hotspot in database
      const hotspotsList = await getHotspots();
      const match = hotspotsList.find(
        (h: any) =>
          lowerLocation.includes(h.locationName.toLowerCase()) ||
          h.district.toLowerCase() === district.toLowerCase()
      );
      
      if (match) {
        await pool.query(
          "UPDATE hotspots SET violationCount = violationCount + 1 WHERE id = ?",
          [match.id]
        );
      }
      return;
    } catch (err) {
      console.error("MySQL incrementHotspotCount error, falling back to JSON:", err);
    }
  }

  const db = getLocalDB();
  const lowerLocation = location.toLowerCase();
  const hotspot = db.hotspots.find(
    (h: any) =>
      lowerLocation.includes(h.locationName.toLowerCase()) ||
      h.district.toLowerCase() === district.toLowerCase()
  );
  if (hotspot) {
    hotspot.violationCount += 1;
    saveLocalDB(db);
  }
}
