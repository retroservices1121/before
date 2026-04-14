import { NextRequest, NextResponse } from 'next/server';
import { getBalance, addCredits, CREDIT_PACKAGES, type PackageId } from '@/lib/credits';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { base } from 'viem/chains';

const client = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_RPC_URL || 'https://mainnet.base.org'),
});

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;
const PAY_TO = (process.env.EVM_ADDRESS || '').toLowerCase();

// GET /api/credits?address=0x...
export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address');
  if (!address) {
    return NextResponse.json({ error: 'Missing address' }, { status: 400 });
  }

  const balance = getBalance(address);
  return NextResponse.json({ balance, packages: CREDIT_PACKAGES });
}

// POST /api/credits { address, packageId, txHash }
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.address || !body?.packageId || !body?.txHash) {
    return NextResponse.json(
      { error: 'Missing address, packageId, or txHash' },
      { status: 400 }
    );
  }

  const { address, packageId, txHash } = body as {
    address: string;
    packageId: PackageId;
    txHash: string;
  };

  const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId);
  if (!pkg) {
    return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
  }

  // Verify the transaction on-chain
  try {
    const receipt = await client.getTransactionReceipt({ hash: txHash as `0x${string}` });

    if (receipt.status !== 'success') {
      return NextResponse.json({ error: 'Transaction failed' }, { status: 400 });
    }

    // Find the USDC Transfer event in the logs
    const transferEvent = parseAbiItem(
      'event Transfer(address indexed from, address indexed to, uint256 value)'
    );

    const usdcTransfer = receipt.logs.find((log) => {
      return (
        log.address.toLowerCase() === USDC_ADDRESS.toLowerCase() &&
        log.topics[2] &&
        log.topics[2].toLowerCase().includes(PAY_TO.slice(2))
      );
    });

    if (!usdcTransfer) {
      return NextResponse.json(
        { error: 'No USDC transfer to our wallet found in transaction' },
        { status: 400 }
      );
    }

    // Verify amount (USDC has 6 decimals)
    const rawAmount = BigInt(usdcTransfer.data);
    const expectedAmount = BigInt(Math.round(pkg.price * 1_000_000));

    if (rawAmount < expectedAmount) {
      return NextResponse.json(
        { error: 'Insufficient payment amount' },
        { status: 400 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Could not verify transaction: ' + err.message },
      { status: 400 }
    );
  }

  const result = addCredits(address, packageId, txHash);
  return NextResponse.json(result);
}
