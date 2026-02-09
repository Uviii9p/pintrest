import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    // Simple auth check: require a user identifier header set by the client
    const userId = request.headers.get('x-user-id');
    if (!userId) {
        return new NextResponse('Unauthorized', { status: 401 });
    }
    const url = searchParams.get('url');
    const filename = searchParams.get('filename') || 'download';

    if (!url) {
        return new NextResponse('Missing URL', { status: 400 });
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch media');

        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        const buffer = await response.arrayBuffer();

        // Determine extension
        let ext = 'jpg';
        if (contentType.includes('video/mp4')) ext = 'mp4';
        else if (contentType.includes('image/png')) ext = 'png';
        else if (contentType.includes('image/webp')) ext = 'webp';
        else if (contentType.includes('image/gif')) ext = 'gif';

        const finalFilename = filename.endsWith(`.${ext}`) ? filename : `${filename}.${ext}`;

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${finalFilename}"`,
            },
        });
    } catch (error) {
        console.error('Download error:', error);
        return NextResponse.redirect(url); // Fallback to opening directly
    }
}
