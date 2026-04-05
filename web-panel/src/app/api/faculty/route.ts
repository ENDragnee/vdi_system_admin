import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash_password} from "@/lib/password-utils";

export async function GET() {
  try {
    const faculty = await prisma.user.findMany({
      where: {
        roleUsers: {
          some: {
            roles: {
              name: 'faculty',
            },
          },
        },
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
    let facultyRole = await prisma.role.findFirst({
      where: {
        name: 'faculty',
      }
    });
    
    if (!facultyRole) {
      facultyRole = await prisma.role.create({
        data: {
          name: 'faculty',
          guardName: 'FACULTY',
        }
      })
    }

    const body = await request.json();
    const { name, email, password, labId} = body;

    if (!email || !password) {
      return NextResponse.json({success: false, error: "Email and Password are Required!"}, {status: 400});
    }

    const hashed_passwd = await hash_password(password); 
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
        password: hashed_passwd, 
        labId: labId || null,

        roleUsers: {
          create: {
            roleId: facultyRole.id,
          }
        }
      }, 
      include: {
        lab: true,
        roleUsers: {
          include: {
            roles: true,
          }
        }
      },
    });

    return NextResponse.json({success: true, data: newFaculty}, { status: 201 });
  } catch (error) {
    console.error("Error creating faculty member: ",error);
    return NextResponse.json({ success: false, error: "Failed to create faculty member!"}, { status: 500 }); 
  }
}
