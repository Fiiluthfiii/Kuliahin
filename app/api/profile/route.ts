import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return user data safely
    return NextResponse.json({ 
      user: {
        id: user.id,
        name: user.name || '',
        email: user.email || '',
        image: user.image || null,
        nim: user.nim || '',
        major: user.major || '',
        ipk: user.ipk || null,
        ips: user.ips || null,
        whatsapp: user.whatsapp || '',
        nickname: user.nickname || '',
        bio: user.bio || '',
        yearEnrolled: user.yearEnrolled || '',
        currentSemester: user.currentSemester || '',
        academicAdvisor: user.academicAdvisor || '',
        targetIps: user.targetIps || null,
        faculty: user.faculty || '',
        university: user.university || ''
      }
    });
  } catch (error) {
    console.error('❌ Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.error('❌ No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('📝 Received update request:', JSON.stringify(body, null, 2));

    // Build update data - only include fields that exist in schema
    const updateData: Record<string, any> = {};
    
    // Helper function to safely add string field
    const addStringField = (key: string, value: any) => {
      if (value !== undefined && value !== null) {
        const trimmed = String(value).trim();
        updateData[key] = trimmed || null;
      }
    };

    // Helper function to safely add number field
    const addNumberField = (key: string, value: any) => {
      if (value !== undefined && value !== null) {
        const trimmed = String(value).trim();
        if (trimmed === '' || trimmed === 'null') {
          updateData[key] = null;
        } else {
          const parsed = parseFloat(trimmed);
          if (!isNaN(parsed) && isFinite(parsed)) {
            updateData[key] = parsed;
          }
        }
      }
    };

    // Basic fields
    addStringField('name', body.name);
    if (body.image !== undefined) {
      updateData.image = body.image;
    }
    
    // Academic text fields
    addStringField('nim', body.nim);
    addStringField('major', body.major);
    addStringField('whatsapp', body.whatsapp);
    addStringField('nickname', body.nickname);
    addStringField('bio', body.bio);
    addStringField('yearEnrolled', body.yearEnrolled);
    addStringField('currentSemester', body.currentSemester);
    addStringField('academicAdvisor', body.academicAdvisor);
    addStringField('faculty', body.faculty);
    addStringField('university', body.university);
    
    // Numeric fields
    addNumberField('ipk', body.ipk);
    addNumberField('ips', body.ips);
    addNumberField('targetIps', body.targetIps);

    console.log('💾 Will update with:', JSON.stringify(updateData, null, 2));

    // Check if there's data to update
    if (Object.keys(updateData).length === 0) {
      console.log('⚠️  No data to update');
      return NextResponse.json({ 
        success: true,
        message: 'No changes to save'
      });
    }

    // Perform the update
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData
    });

    console.log('✅ User updated successfully:', updatedUser.email);

    // Return updated user data
    return NextResponse.json({ 
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
        nim: updatedUser.nim,
        major: updatedUser.major,
        ipk: updatedUser.ipk,
        ips: updatedUser.ips,
        whatsapp: updatedUser.whatsapp,
        nickname: updatedUser.nickname,
        bio: updatedUser.bio,
        yearEnrolled: updatedUser.yearEnrolled,
        currentSemester: updatedUser.currentSemester,
        academicAdvisor: updatedUser.academicAdvisor,
        targetIps: updatedUser.targetIps,
        faculty: updatedUser.faculty,
        university: updatedUser.university
      }
    });

  } catch (error: any) {
    console.error('❌ FULL ERROR:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error code:', error.code);
    
    // Detailed error messages
    let errorMessage = 'Failed to update profile';
    
    if (error.code === 'P2002') {
      errorMessage = 'Duplicate entry - email or NIM already exists';
    } else if (error.code === 'P2025') {
      errorMessage = 'User not found';
    } else if (error.code === 'P2003') {
      errorMessage = 'Invalid reference';
    } else if (error.message?.includes('column') || error.message?.includes('Unknown arg')) {
      errorMessage = 'Database schema mismatch - please run: node run-migration.js';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      code: error.code,
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 });
  }
}

