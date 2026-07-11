import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { app, activeSessions, DB_FILE } from "./server";
import fs from "fs";

// Simple test client using standard fetch API or manual trigger since app is an Express instance
// Let's create a custom dispatcher or helper to run supertest-like assertions against express
import { Server } from "http";

describe("Vaakai Customer Support Hub - Backend API Unit Tests", () => {
  let server: Server;
  const baseUrl = "http://localhost:3001"; // run on test port to avoid collision

  beforeAll(async () => {
    // Delete any test database if present
    if (fs.existsSync(DB_FILE)) {
      try {
        fs.unlinkSync(DB_FILE);
      } catch (e) {}
    }
    // Boot the server on 3001 for test separation
    server = app.listen(3001, "0.0.0.0");
  });

  afterAll(() => {
    server.close();
    if (fs.existsSync(DB_FILE)) {
      try {
        fs.unlinkSync(DB_FILE);
      } catch (e) {}
    }
  });

  it("should return ok status from API Health endpoint", async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("ok");
    expect(data).toHaveProperty("timestamp");
  });

  it("should register a new user successfully", async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Engineer",
        email: "test@aether.ai",
        password: "securepassword123"
      })
    });

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.message).toContain("successful");
    expect(data.user).toHaveProperty("id");
    expect(data.user.name).toBe("Test Engineer");
    expect(data.user.email).toBe("test@aether.ai");
    expect(data.user).toHaveProperty("otpSecret");
  });

  it("should block registration with duplicate email", async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Another Engineer",
        email: "test@aether.ai", // duplicate email
        password: "somepassword"
      })
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("already registered");
  });

  it("should initiate login and request 2FA verification code", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@aether.ai",
        password: "securepassword123"
      })
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.otpRequired).toBe(true);
    expect(data).toHaveProperty("debugOtpCode");
    expect(data.message).toContain("2-Step Verification code requested");
  });

  it("should fail 2FA login with incorrect verification code", async () => {
    const res = await fetch(`${baseUrl}/api/auth/verify-2fa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@aether.ai",
        code: "999999" // wrong code
      })
    });

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toContain("Invalid 2FA security code");
  });

  it("should complete 2FA login with correct code and receive session token", async () => {
    // 1. Get the code first
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@aether.ai",
        password: "securepassword123"
      })
    });
    const loginData = await loginRes.json();
    const correctCode = loginData.debugOtpCode;

    // 2. Submit verify request
    const verifyRes = await fetch(`${baseUrl}/api/auth/verify-2fa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@aether.ai",
        code: correctCode
      })
    });

    expect(verifyRes.status).toBe(200);
    const verifyData = await verifyRes.json();
    expect(verifyData).toHaveProperty("token");
    expect(verifyData.user.name).toBe("Test Engineer");
    expect(verifyData.user.email).toBe("test@aether.ai");
  });

  it("should deny access to protected endpoints without token", async () => {
    const res = await fetch(`${baseUrl}/api/analytics`);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toContain("Unauthorized");
  });

  it("should resolve customer service queries through chat and log feedback", async () => {
    // 1. Login to get token
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@aether.ai",
        password: "securepassword123"
      })
    });
    const loginData = await loginRes.json();
    const verifyRes = await fetch(`${baseUrl}/api/auth/verify-2fa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@aether.ai",
        code: loginData.debugOtpCode
      })
    });
    const { token } = await verifyRes.json();

    // 2. Run chat query
    const chatRes = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        message: "Tell me about my invoice overage.",
        language: "en"
      })
    });

    expect(chatRes.status).toBe(200);
    const chatData = await chatRes.json();
    expect(chatData).toHaveProperty("sessionId");
    expect(chatData).toHaveProperty("response");
    expect(chatData.messages.length).toBeGreaterThanOrEqual(2);

    const sessionId = chatData.sessionId;

    // 3. Submit customer feedback rating
    const feedbackRes = await fetch(`${baseUrl}/api/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        sessionId,
        rating: 5,
        comment: "Excellent precision and immediate reply!",
        category: "Billing"
      })
    });

    expect(feedbackRes.status).toBe(200);
    const feedbackData = await feedbackRes.json();
    expect(feedbackData.message).toContain("Feedback submitted successfully");

    // 4. Check that analytics updates with the feedback
    const analyticsRes = await fetch(`${baseUrl}/api/analytics`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    expect(analyticsRes.status).toBe(200);
    const analyticsData = await analyticsRes.json();
    expect(analyticsData.totalSessions).toBeGreaterThanOrEqual(1);
    expect(analyticsData.avgRating).toBeGreaterThanOrEqual(1);
    expect(analyticsData.categoryCounts).toHaveProperty("Billing");
  });
});
