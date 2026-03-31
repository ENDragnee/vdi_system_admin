
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const faculty = await prisma.user.findUnique({
      where: { 
        id,
        roleUsers: {
          some: {
            roles: {
              guardName: 'FACULTY',
            },
          },
        },
      },
      include: {
        lab: true,
      },
    });

    if (!faculty) {
      return NextResponse.json(
        { success: false, error: 'Faculty member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: faculty });
  } catch (error) {
    console.error('Faculty GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch faculty member' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, email, labId } = body;

    // Check if faculty exists
    const existingFaculty = await prisma.user.findUnique({
      where: {
        id,
        roleUsers: {
          some: {
            roles: {
              guardName: 'FACULTY',
            },
          },
        },
      },
    });

    if (!existingFaculty) {
      return NextResponse.json(
        { success: false, error: 'Faculty member not found' },
        { status: 404 }
      );
    }

    // Check if email is being changed and if it already exists
    if (email && email !== existingFaculty.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return NextResponse.json(
          { success: false, error: 'Email already exists' },
          { status: 409 }
        );
      }
    }

    // Update faculty member
    const updatedFaculty = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(labId !== undefined && { labId: labId || null }),
      },
      include: {
        lab: true,
      },
    });

    return NextResponse.json({ success: true, data: updatedFaculty });
  } catch (error) {
    console.error('Faculty PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update faculty member' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    // Check if faculty exists
    const existingFaculty = await prisma.user.findFirst({
      where: {
        id,
        roleUsers: {
          some: {
            roles: {
              guardName: 'FACULTY',
            },
          },
        },
      },
    });

    if (!existingFaculty) {
      return NextResponse.json(
        { success: false, error: 'Faculty member not found' },
        { status: 404 }
      );
    }

    // Delete faculty member
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: 'Faculty member deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Faculty DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete faculty member' },
      { status: 500 }
    );
  }
}
