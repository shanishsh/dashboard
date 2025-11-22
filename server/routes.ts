import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import * as XLSX from "xlsx";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

function parseExcelFile(buffer: Buffer): { columns: string[]; data: Record<string, any>[] } {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null });
  
  if (jsonData.length === 0) {
    return { columns: [], data: [] };
  }
  
  const columns = Object.keys(jsonData[0] as Record<string, any>);
  
  return {
    columns,
    data: jsonData as Record<string, any>[],
  };
}

function parseCSVFile(buffer: Buffer): { columns: string[]; data: Record<string, any>[] } {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null });
  
  if (jsonData.length === 0) {
    return { columns: [], data: [] };
  }
  
  const columns = Object.keys(jsonData[0] as Record<string, any>);
  
  return {
    columns,
    data: jsonData as Record<string, any>[],
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileName = req.file.originalname;
      let parsedData: { columns: string[]; data: Record<string, any>[] };

      if (fileName.endsWith(".csv")) {
        parsedData = parseCSVFile(req.file.buffer);
      } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        parsedData = parseExcelFile(req.file.buffer);
      } else {
        return res.status(400).json({ error: "Unsupported file type" });
      }

      if (parsedData.data.length === 0) {
        return res.status(400).json({ error: "File is empty or could not be parsed" });
      }

      const dataset = await storage.saveDataset({
        name: fileName,
        uploadedAt: new Date(),
        rowCount: parsedData.data.length,
        columnCount: parsedData.columns.length,
        columns: parsedData.columns,
        data: parsedData.data,
      });

      res.json({
        id: dataset.id,
        name: dataset.name,
        rowCount: dataset.rowCount,
        columnCount: dataset.columnCount,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        error: "Failed to process file",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get("/api/datasets", async (req, res) => {
    try {
      const datasets = await storage.getAllDatasets();
      res.json(datasets);
    } catch (error) {
      console.error("Get datasets error:", error);
      res.status(500).json({ error: "Failed to retrieve datasets" });
    }
  });

  app.get("/api/datasets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const dataset = await storage.getDataset(id);

      if (!dataset) {
        return res.status(404).json({ error: "Dataset not found" });
      }

      res.json(dataset);
    } catch (error) {
      console.error("Get dataset error:", error);
      res.status(500).json({ error: "Failed to retrieve dataset" });
    }
  });

  app.delete("/api/datasets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteDataset(id);

      if (!deleted) {
        return res.status(404).json({ error: "Dataset not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Delete dataset error:", error);
      res.status(500).json({ error: "Failed to delete dataset" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
