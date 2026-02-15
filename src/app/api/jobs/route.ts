import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/utils/jwt";
import { jobQueue } from "@/lib/services/jobQueue";

// GET /api/jobs?id=... — Check status of a specific job or list recent jobs
export async function GET(request: Request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("id");

    if (jobId) {
      const job = jobQueue.getJob(jobId);
      if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }
      return NextResponse.json({ job });
    }

    // List recent jobs
    const type = searchParams.get("type") || undefined;
    const status = (searchParams.get("status") as any) || undefined;
    const jobs = jobQueue.getJobs({ type, status });

    return NextResponse.json({
      jobs: jobs.slice(-50).reverse(),
      total: jobs.length,
    });
  } catch (error) {
    console.error("Get jobs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 },
    );
  }
}
