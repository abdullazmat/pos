import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Supplier from "@/lib/models/Supplier";
import { verifyToken } from "@/lib/utils/jwt";

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    await dbConnect();

    const { suppliers } = await request.json();

    if (!suppliers || !Array.isArray(suppliers) || suppliers.length === 0) {
      return NextResponse.json(
        { error: "Debe proporcionar un array de proveedores" },
        { status: 400 },
      );
    }

    // Validate each supplier has at least a name
    const validSuppliers = suppliers.filter((s) => s.name && s.name.trim());

    if (validSuppliers.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron proveedores válidos" },
        { status: 400 },
      );
    }

    // Prepare suppliers for bulk insert
    const suppliersToInsert = validSuppliers.map((s) => ({
      ...s,
      business: decoded.businessId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Insert all suppliers
    const result = await Supplier.insertMany(suppliersToInsert, {
      ordered: false, // Continue inserting even if some fail
    });

    return NextResponse.json({
      message: "Proveedores importados exitosamente",
      count: result.length,
      suppliers: result,
    });
  } catch (error: any) {
    console.error("Bulk supplier import error:", error);

    // If some inserts succeeded but others failed
    if (error.writeErrors) {
      const successCount = error.insertedDocs?.length || 0;
      return NextResponse.json({
        message: `${successCount} proveedores importados, algunos fallaron`,
        count: successCount,
        errors: error.writeErrors.length,
      });
    }

    return NextResponse.json(
      { error: "Error al importar proveedores" },
      { status: 500 },
    );
  }
}
