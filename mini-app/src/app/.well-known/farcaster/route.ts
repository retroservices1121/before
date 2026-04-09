import { NextResponse } from 'next/server';
import config from '../../../../minikit.config';

export async function GET() {
  return NextResponse.json({
    accountAssociation: config.accountAssociation,
    frame: config.miniapp,
  });
}
