'use client';

import { useEffect, useRef, useState } from 'react';

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Props {
  title: string;
  category?: string;
}

export default function PriceChart({ title, category }: Props) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const [candles, setCandles] = useState<Candle[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch chart data
  useEffect(() => {
    async function fetchChart() {
      try {
        const params = new URLSearchParams({ title });
        if (category) params.set('category', category);
        const res = await fetch(`/api/chart?${params.toString()}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('skip');
            return;
          }
          throw new Error('Failed to load chart');
        }
        const data = await res.json();
        if (!data.candles || data.candles.length === 0) {
          setError('skip');
          return;
        }
        setCandles(data.candles);
      } catch {
        setError('Failed to load chart data');
      } finally {
        setLoading(false);
      }
    }
    fetchChart();
  }, [title, category]);

  // Render chart
  useEffect(() => {
    if (!candles || !chartContainerRef.current) return;

    let chart: any;

    async function renderChart() {
      const {
        createChart,
        AreaSeries,
        HistogramSeries,
        ColorType,
        LineStyle,
      } = await import('lightweight-charts');

      if (!chartContainerRef.current) return;

      chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 300,
        layout: {
          background: { type: ColorType.Solid, color: '#111111' },
          textColor: '#525252',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10,
        },
        grid: {
          vertLines: { color: '#1e1e1e' },
          horzLines: { color: '#1e1e1e' },
        },
        crosshair: {
          vertLine: { color: '#00e59f', width: 1, style: LineStyle.Dashed, labelBackgroundColor: '#00e59f' },
          horzLine: { color: '#00e59f', width: 1, style: LineStyle.Dashed, labelBackgroundColor: '#00e59f' },
        },
        rightPriceScale: {
          borderColor: '#1e1e1e',
          scaleMargins: { top: 0.1, bottom: 0.2 },
        },
        timeScale: {
          borderColor: '#1e1e1e',
          timeVisible: false,
        },
      });

      // Area series for the price line (v5 API)
      const areaSeries = chart.addSeries(AreaSeries, {
        topColor: 'rgba(0, 229, 159, 0.25)',
        bottomColor: 'rgba(0, 229, 159, 0.0)',
        lineColor: '#00e59f',
        lineWidth: 2,
        priceFormat: {
          type: 'price',
          precision: 2,
          minMove: 0.01,
        },
      });

      // Volume histogram (v5 API)
      const volumeSeries = chart.addSeries(HistogramSeries, {
        color: 'rgba(0, 229, 159, 0.15)',
        priceFormat: { type: 'volume' },
        priceScaleId: '',
      });

      volumeSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.85, bottom: 0 },
      });

      // Format candle timestamps to YYYY-MM-DD for lightweight-charts
      const priceData = candles!.map((c) => ({
        time: formatTime(c.time),
        value: c.close,
      }));

      const volumeData = candles!.map((c) => ({
        time: formatTime(c.time),
        value: c.volume,
        color: c.close >= c.open
          ? 'rgba(0, 229, 159, 0.2)'
          : 'rgba(255, 107, 107, 0.2)',
      }));

      areaSeries.setData(priceData);
      volumeSeries.setData(volumeData);
      chart.timeScale().fitContent();

      chartRef.current = chart;
    }

    renderChart().catch((err) => {
      console.error('Chart render error:', err);
    });

    // Resize handler
    const resizeHandler = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };
    window.addEventListener('resize', resizeHandler);

    return () => {
      window.removeEventListener('resize', resizeHandler);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [candles]);

  // Don't render anything for non-chartable markets
  if (error === 'skip') return null;
  if (!loading && error) return null;
  if (!loading && !candles) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="font-mono text-[9px] tracking-[2px] uppercase text-b4e-text-muted">
          Price Chart — 30D
        </span>
      </div>
      <div className="bg-b4e-surface border border-b4e-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-b4e-border border-t-b4e-accent rounded-full animate-spin" />
              <span className="font-mono text-[11px] text-b4e-text-muted">Loading chart...</span>
            </div>
          </div>
        ) : (
          <div ref={chartContainerRef} />
        )}
      </div>
    </div>
  );
}

function formatTime(ts: number): string {
  // Tokens API may return seconds or milliseconds
  const ms = ts > 1e12 ? ts : ts * 1000;
  const d = new Date(ms);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
