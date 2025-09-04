import { NextResponse } from "next/server"
import { getCollection } from "@/lib/db"

export async function GET() {
  try {
    const usersCollection = await getCollection("users")
    const count = await usersCollection.countDocuments()

    return NextResponse.json({
      success: true,
      message: `Database connection successful. Found ${count} users.`,
      env: {
        hasMongoUri: !!process.env.MONGODB_URI,
        hasMongoDb: !!process.env.MONGODB_DB,
        nodeEnv: process.env.NODE_ENV,
      },
    })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        env: {
          hasMongoUri: !!process.env.MONGODB_URI,
          hasMongoDb: !!process.env.MONGODB_DB,
          nodeEnv: process.env.NODE_ENV,
        },
      },
      { status: 500 },
    )
  }
}
