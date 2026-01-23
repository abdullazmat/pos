import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connect";
import User from "@/lib/models/User";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "@/lib/utils/helpers";
import bcrypt from "bcryptjs";

// GET - Fetch all users for the business
export async function GET(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId, role } = authResult.user!;

    // Only admins can view users
    if (role !== "admin") {
      return generateErrorResponse("Access denied", 403);
    }

    await dbConnect();

    const users = await User.find({ businessId, isActive: true })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return generateSuccessResponse({ users });
  } catch (error) {
    console.error("Get users error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

// POST - Create a new user
export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId, role } = authResult.user!;

    // Only admins can create users
    if (role !== "admin") {
      return generateErrorResponse("Access denied", 403);
    }

    const body = await req.json();
    const { email, password, fullName, username, phone, role: userRole } = body;

    // Validation
    if (!email || !password || !fullName || !username) {
      return generateErrorResponse(
        "Email, password, full name, and username are required",
        400,
      );
    }

    if (password.length < 6) {
      return generateErrorResponse(
        "Password must be at least 6 characters",
        400,
      );
    }

    await dbConnect();

    // Check if email or username already exists (unique across all businesses)
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() },
      ],
    });

    if (existingUser) {
      // Check which field is duplicate
      if (
        existingUser.email === email.toLowerCase() &&
        existingUser.username === username.toLowerCase()
      ) {
        return generateErrorResponse(
          "El email y nombre de usuario ya están en uso",
          400,
        );
      } else if (existingUser.email === email.toLowerCase()) {
        return generateErrorResponse("El email ya está en uso", 400);
      } else {
        return generateErrorResponse(
          "El nombre de usuario ya está en uso",
          400,
        );
      }
    }

    // Check if user existed before in this business (for reactivation)
    const deletedUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() },
      ],
      businessId,
      isActive: false,
    });

    if (deletedUser) {
      // Reactivate soft-deleted user instead of creating a new one to avoid duplicate key
      const hashedPassword = await bcrypt.hash(password, 10);
      deletedUser.email = email.toLowerCase();
      deletedUser.username = username.toLowerCase();
      deletedUser.fullName = fullName;
      deletedUser.phone = phone;
      deletedUser.role = userRole || "cashier";
      deletedUser.password = hashedPassword;
      deletedUser.isActive = true;
      await deletedUser.save();

      const userResponse = {
        _id: deletedUser._id,
        email: deletedUser.email,
        fullName: deletedUser.fullName,
        username: deletedUser.username,
        phone: deletedUser.phone,
        role: deletedUser.role,
        isActive: deletedUser.isActive,
        createdAt: deletedUser.createdAt,
      };

      return generateSuccessResponse({ user: userResponse }, 200);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      fullName,
      username: username.toLowerCase(),
      phone,
      role: userRole || "cashier",
      businessId,
      isActive: true,
    });

    // Return user without password
    const userResponse = {
      _id: newUser._id,
      email: newUser.email,
      fullName: newUser.fullName,
      username: newUser.username,
      phone: newUser.phone,
      role: newUser.role,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt,
    };

    return generateSuccessResponse({ user: userResponse }, 201);
  } catch (error) {
    console.error("Create user error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

// DELETE - Delete a user
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId, role, userId } = authResult.user!;

    // Only admins can delete users
    if (role !== "admin") {
      return generateErrorResponse("Access denied", 403);
    }

    const { searchParams } = new URL(req.url);
    const userIdToDelete = searchParams.get("id");

    if (!userIdToDelete) {
      return generateErrorResponse("User ID is required", 400);
    }

    // Prevent deleting yourself
    if (userIdToDelete === userId) {
      return generateErrorResponse("You cannot delete yourself", 400);
    }

    await dbConnect();

    const userToDelete = await User.findOne({
      _id: userIdToDelete,
      businessId,
    });

    if (!userToDelete) {
      return generateErrorResponse("User not found", 404);
    }

    // Soft delete by setting isActive to false
    userToDelete.isActive = false;
    await userToDelete.save();

    return generateSuccessResponse(null);
  } catch (error) {
    console.error("Delete user error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}

// PATCH - Update a user
export async function PATCH(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.authorized) {
      return generateErrorResponse(authResult.error || "Unauthorized", 401);
    }

    const { businessId, role } = authResult.user!;

    // Only admins can update users
    if (role !== "admin") {
      return generateErrorResponse("Access denied", 403);
    }

    const body = await req.json();
    const {
      userId,
      email,
      fullName,
      username,
      phone,
      role: userRole,
      password,
    } = body;

    if (!userId) {
      return generateErrorResponse("User ID is required", 400);
    }

    await dbConnect();

    const userToUpdate = await User.findOne({
      _id: userId,
      businessId,
      isActive: true,
    });

    if (!userToUpdate) {
      return generateErrorResponse("User not found", 404);
    }

    // Update fields
    if (email) userToUpdate.email = email.toLowerCase();
    if (fullName) userToUpdate.fullName = fullName;
    if (username) userToUpdate.username = username.toLowerCase();
    if (phone !== undefined) userToUpdate.phone = phone;
    if (userRole) userToUpdate.role = userRole;
    if (password && password.length >= 6) {
      userToUpdate.password = await bcrypt.hash(password, 10);
    }

    await userToUpdate.save();

    const userResponse = {
      _id: userToUpdate._id,
      email: userToUpdate.email,
      fullName: userToUpdate.fullName,
      username: userToUpdate.username,
      phone: userToUpdate.phone,
      role: userToUpdate.role,
      isActive: userToUpdate.isActive,
      createdAt: userToUpdate.createdAt,
    };

    return generateSuccessResponse({ user: userResponse });
  } catch (error) {
    console.error("Update user error:", error);
    return generateErrorResponse("Internal server error", 500);
  }
}
