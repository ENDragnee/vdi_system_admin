import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const faculty = await prisma.user.findMany({
      where: {
        role: 'FACULTY',
      },
      include: {
        lab: true,
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    return NextResponse.json({success: true, data: faculty});
  } catch (error) {
    console.error("Faculty Get Error", error);
    return NextResponse.json({success: false, error: "Failed to fetch faculty members!"}, {status: 500});
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, labId} = body;

    if (!email || !password) {
      return NextResponse.json({success: false, error: "Email and Password are Required!"}, {status: 400});
    }

    const existingFaculty = await prisma.user.findUnique({
      where: { email },
    })

    if (existingFaculty) {
      return NextResponse.json({success: false, error: "Email already exists!"}, {status: 409});
    }

    const newFaculty = await prisma.user.create({
      data: {
        name: name || email.split('@')[0],
        email,
        password,
        role: 'FACULTY',
        labId: labId || null,
      }, 
      include: {
        lab: true,
      },
    });

    return NextResponse.json({success: true, data: newFaculty}, { status: 201 });
  } catch (error) {
    console.error("Error creating faculty member: ",error);
    return NextResponse.json({ success: false, error: "Failed to create faculty member!"}, { status: 500 }); 
  }
}
