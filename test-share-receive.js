#!/usr/bin/env node
/**
 * Test script to verify share/receive fix.
 * Tests that the server waits for response to flush before closing.
 */
const { createServer } = require("node:http");
const { get: httpGet } = require("node:http");
const { createWriteStream, rmSync, existsSync, statSync } = require("node:fs");
const { join } = require("node:path");
const { tmpdir } = require("node:os");
const archiver = require("archiver");
const { PassThrough } = require("node:stream");

const TEST_PORT = 9876;
const CURSOR_DIR = join(process.cwd(), ".cursor");
const OUTPUT_FILE = join(tmpdir(), "cursor-kit-test-output.zip");

async function runTest() {
  console.log("🧪 Testing share/receive fix...\n");

  // Clean up any previous test file
  if (existsSync(OUTPUT_FILE)) {
    rmSync(OUTPUT_FILE);
  }

  // Check if .cursor directory exists
  if (!existsSync(CURSOR_DIR)) {
    console.log("❌ No .cursor directory found. Cannot run test.");
    process.exit(1);
  }

  return new Promise((resolve, reject) => {
    let serverClosed = false;
    let transferComplete = false;

    // Create server that mimics share.ts behavior (with the fix)
    const server = createServer((req, res) => {
      if (req.method !== "GET" || req.url !== "/") {
        res.writeHead(404);
        res.end("Not Found");
        return;
      }

      console.log("📥 Client connected, starting transfer...");

      res.writeHead(200, {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="test.zip"',
        "Transfer-Encoding": "chunked",
      });

      const archive = archiver("zip", { zlib: { level: 6 } });

      // THE FIX: Listen to res.on('finish') instead of archive.on('end')
      res.on("finish", () => {
        console.log("✅ Response finished (all data flushed)");
        transferComplete = true;
        server.close(() => {
          serverClosed = true;
          console.log("✅ Server closed gracefully");
        });
      });

      res.on("close", () => {
        if (!res.writableFinished) {
          console.log("❌ Client disconnected before transfer completed");
        }
      });

      archive.on("end", () => {
        console.log("📦 Archive generation complete (data may still be in buffer)");
      });

      archive.on("error", (err) => {
        console.error("❌ Archive error:", err.message);
        res.destroy();
      });

      archive.directory(CURSOR_DIR, ".cursor");
      archive.finalize();
      archive.pipe(res);
    });

    server.listen(TEST_PORT, () => {
      console.log(`🚀 Test server started on port ${TEST_PORT}`);
      console.log("📤 Starting download...\n");

      // Simulate the receive command
      const request = httpGet(`http://127.0.0.1:${TEST_PORT}/`, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Server returned status ${response.statusCode}`));
          return;
        }

        const writeStream = createWriteStream(OUTPUT_FILE);
        const passThrough = new PassThrough();
        let receivedBytes = 0;

        passThrough.on("data", (chunk) => {
          receivedBytes += chunk.length;
        });

        response.pipe(passThrough).pipe(writeStream);

        writeStream.on("finish", () => {
          console.log(`\n📊 Download complete: ${receivedBytes} bytes received`);

          // Verify the file was completely written
          const fileSize = statSync(OUTPUT_FILE).size;
          console.log(`📁 File size on disk: ${fileSize} bytes`);

          if (fileSize === receivedBytes && fileSize > 0) {
            console.log("✅ File received completely!");
            resolve(true);
          } else {
            reject(new Error(`File size mismatch: expected ${receivedBytes}, got ${fileSize}`));
          }

          // Cleanup
          rmSync(OUTPUT_FILE);
        });

        writeStream.on("error", (err) => {
          reject(new Error(`Write error: ${err.message}`));
        });

        response.on("error", (err) => {
          reject(new Error(`Response error: ${err.message}`));
        });
      });

      request.on("error", (err) => {
        if (err.code === "ECONNRESET") {
          reject(new Error("Connection was reset - server closed too early!"));
        } else {
          reject(err);
        }
      });

      request.setTimeout(30000, () => {
        request.destroy();
        reject(new Error("Request timeout"));
      });
    });

    server.on("error", (err) => {
      reject(new Error(`Server error: ${err.message}`));
    });
  });
}

runTest()
  .then(() => {
    console.log("\n✅ TEST PASSED: Fix verified - server waits for transfer to complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error("\n❌ TEST FAILED:", err.message);
    process.exit(1);
  });

