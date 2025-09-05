import { NextResponse } from "next/server"
import { getCollection } from "@/lib/db"
import { getUserRole, getUserEmail } from "@/lib/auth"
import { ObjectId } from "mongodb"

// Approve a pending user
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if user is admin
    const userRole = await getUserRole()
    if (userRole !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    const { role, area, position } = await request.json()

    // Validate required fields
    if (!role || !area || !position) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    const usersCollection = await getCollection("users")
    const adminEmail = await getUserEmail()

    // Update user status to active and set role, area, position
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          status: "active",
          role,
          area,
          position,
          activationDate: Date.now(),
          activatedBy: adminEmail,
        },
      },
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ success: false, message: "User not found or already approved" }, { status: 404 })
    }

    // Get the user to send notification
    const user = await usersCollection.findOne({ _id: new ObjectId(params.id) })

    if (user) {
      // Send notification email to user (implementation in next step)
      await notifyUserAboutApproval(user.email, user.name, role)
    }

    return NextResponse.json({
      success: true,
      message: "User approved successfully",
    })
  } catch (error) {
    console.error("Error approving user:", error)
    return NextResponse.json({ success: false, message: "Failed to approve user" }, { status: 500 })
  }
}

// Reject a pending user
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if user is admin
    const userRole = await getUserRole()
    if (userRole !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    const usersCollection = await getCollection("users")

    // Get user before deletion to send notification
    const user = await usersCollection.findOne({ _id: new ObjectId(params.id) })

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Delete the user
    const result = await usersCollection.deleteOne({ _id: new ObjectId(params.id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Send notification email to user about rejection
    await notifyUserAboutRejection(user.email, user.name)

    return NextResponse.json({
      success: true,
      message: "User rejected successfully",
    })
  } catch (error) {
    console.error("Error rejecting user:", error)
    return NextResponse.json({ success: false, message: "Failed to reject user" }, { status: 500 })
  }
}

// Function to notify user about approval
async function notifyUserAboutApproval(userEmail: string, userName: string, role: string) {
  try {
    // In a real application, you would send an email to the user

    // This would be implemented with your email service
    // await sendEmail({
    //   to: userEmail,
    //   subject: "Your SFQS Ticket System Account has been Approved",
    //   body: `Dear ${userName}, your account has been approved. You can now log in to the system.`,
    // })
  } catch (error) {
    console.error("Failed to send approval notification:", error)
  }
}

// Function to notify user about rejection
async function notifyUserAboutRejection(userEmail: string, userName: string) {
  try {
    // In a real application, you would send an email to the user

    // This would be implemented with your email service
    // await sendEmail({
    //   to: userEmail,
    //   subject: "Your SFQS Ticket System Registration Status",
    //   body: `Dear ${userName}, we regret to inform you that your registration request has been declined.`,
    // })
  } catch (error) {
    console.error("Failed to send rejection notification:", error)
  }
}
