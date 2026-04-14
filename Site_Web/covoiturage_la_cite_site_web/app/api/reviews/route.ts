import { NextResponse } from 'next/server';
import { ReviewService } from '@/server/services/SocialService';
import { withAuth } from '@/server/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const revieweeId = searchParams.get('revieweeId');
    const auth = await withAuth(req);

    if (revieweeId) {
      const result = await ReviewService.getReceived(auth);
      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 500 });
      }
      return NextResponse.json(result.data);
    }

    // reviewerId → avis donnés
    const reviewerId = searchParams.get('reviewerId');
    if (reviewerId) {
      const result = await ReviewService.getGiven(auth);
      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 500 });
      }
      return NextResponse.json(result.data);
    }

    return NextResponse.json({ error: 'revieweeId ou reviewerId requis' }, { status: 400 });
  } catch (err) {
    console.error('[api/reviews]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const auth = await withAuth(req);

    const result = await ReviewService.create(body, auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (err) {
    console.error('[api/reviews]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
