'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';

interface QRCodeOptions {
  text: string;
  foregroundColor: string;
  backgroundColor: string;
  size: number;
}

export default function QRCodeGenerator() {
  const [text, setText] = useState('https://nextjs.org');
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [size, setSize] = useState(256);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [svgString, setSvgString] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const generateQRCode = useCallback(async (options: QRCodeOptions) => {
    if (!options.text.trim()) {
      setQrCodeUrl('');
      setSvgString('');
      setError(null);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const canvas = document.createElement('canvas');

      await QRCode.toCanvas(canvas, options.text, {
        width: options.size,
        margin: 2,
        color: {
          dark: options.foregroundColor,
          light: options.backgroundColor,
        },
        errorCorrectionLevel: 'M',
      });

      const url = canvas.toDataURL('image/png');
      setQrCodeUrl(url);

      // Generate SVG version
      const svg = await QRCode.toString(options.text, {
        type: 'svg',
        width: options.size,
        margin: 2,
        color: {
          dark: options.foregroundColor,
          light: options.backgroundColor,
        },
        errorCorrectionLevel: 'M',
      });
      setSvgString(svg);

      if (canvasRef.current) {
        canvasRef.current.width = options.size;
        canvasRef.current.height = options.size;
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.drawImage(canvas, 0, 0);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate QR code');
      setQrCodeUrl('');
      setSvgString('');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      generateQRCode({ text, foregroundColor, backgroundColor, size });
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [text, foregroundColor, backgroundColor, size, generateQRCode]);

  const handleDownloadPng = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.download = `qrcode-${Date.now()}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  const handleDownloadSvg = () => {
    if (!svgString) return;

    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `qrcode-${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8 sm:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white text-center">
            QR Code Generator
          </h1>
          <p className="mt-2 text-blue-50 text-center text-sm sm:text-base">
            Create custom QR codes instantly
          </p>
        </div>

        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls Section */}
          <div className="space-y-6">
            <div>
              <label
                htmlFor="text-input"
                className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2"
              >
                Text or URL
              </label>
              <input
                id="text-input"
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text or URL"
                className="w-full px-4 py-3 rounded-lg border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
                aria-label="Text or URL to encode in QR code"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="fg-color"
                  className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2"
                >
                  Foreground Color
                </label>
                <div className="relative">
                  <input
                    id="fg-color"
                    type="color"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border-2 [&::-webkit-color-swatch]:border-zinc-300 [&::-moz-color-swatch]:rounded [&::-moz-color-swatch]:border-2 [&::-moz-color-swatch]:border-zinc-300"
                    aria-label="QR code foreground color"
                  />
                  <input
                    type="text"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="w-full pl-12 pr-3 py-3 rounded-lg border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm font-mono focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    aria-label="Foreground color hex value"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="bg-color"
                  className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2"
                >
                  Background Color
                </label>
                <div className="relative">
                  <input
                    id="bg-color"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border-2 [&::-webkit-color-swatch]:border-zinc-300 [&::-moz-color-swatch]:rounded [&::-moz-color-swatch]:border-2 [&::-moz-color-swatch]:border-zinc-300"
                    aria-label="QR code background color"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-full pl-12 pr-3 py-3 rounded-lg border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm font-mono focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    aria-label="Background color hex value"
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="size-slider"
                className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2"
              >
                Size: {size}px
              </label>
              <input
                id="size-slider"
                type="range"
                min="128"
                max="512"
                step="32"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-zinc-200 dark:bg-zinc-700 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:bg-blue-600 [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:hover:bg-blue-600"
                aria-label="QR code size in pixels"
              />
              <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                <span>128px</span>
                <span>512px</span>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              {isGenerating && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 rounded-xl z-10">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
                         role="status"
                         aria-label="Generating QR code">
                    </div>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Generating...</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-red-600 dark:text-red-400 text-sm text-center" role="alert">
                    {error}
                  </p>
                </div>
              )}

              {!error && qrCodeUrl && (
                <div
                  className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 shadow-lg"
                  style={{ width: 'fit-content' }}
                >
                  <canvas
                    ref={canvasRef}
                    className="rounded-lg"
                    aria-label="Generated QR code"
                  />
                </div>
              )}

              {!error && !qrCodeUrl && !text.trim() && (
                <div className="flex items-center justify-center w-64 h-64 bg-zinc-50 dark:bg-zinc-800 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-600">
                  <p className="text-zinc-400 dark:text-zinc-500 text-sm text-center px-4">
                    Enter text or URL to generate QR code
                  </p>
                </div>
              )}
            </div>

            {qrCodeUrl && !error && (
              <div className="mt-6 flex gap-3 w-full max-w-xs">
                <button
                  onClick={handleDownloadPng}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                  aria-label="Download QR code as PNG"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    PNG
                  </span>
                </button>
                <button
                  onClick={handleDownloadSvg}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/50"
                  aria-label="Download QR code as SVG"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    SVG
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Presets */}
        <div className="px-6 pb-6 sm:px-8 sm:pb-8">
          <div className="border-t-2 border-zinc-100 dark:border-zinc-800 pt-6">
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
              Quick Color Presets
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => {
                  setForegroundColor('#000000');
                  setBackgroundColor('#ffffff');
                }}
                className="p-3 rounded-lg border-2 border-zinc-200 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                aria-label="Set classic black and white colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-black border border-zinc-300"></div>
                  <div className="w-6 h-6 rounded bg-white border border-zinc-300"></div>
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 ml-1">Classic</span>
                </div>
              </button>
              <button
                onClick={() => {
                  setForegroundColor('#3b82f6');
                  setBackgroundColor('#eff6ff');
                }}
                className="p-3 rounded-lg border-2 border-zinc-200 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                aria-label="Set blue theme colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-blue-500 border border-zinc-300"></div>
                  <div className="w-6 h-6 rounded bg-blue-50 border border-zinc-300"></div>
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 ml-1">Blue</span>
                </div>
              </button>
              <button
                onClick={() => {
                  setForegroundColor('#10b981');
                  setBackgroundColor('#ecfdf5');
                }}
                className="p-3 rounded-lg border-2 border-zinc-200 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                aria-label="Set green theme colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-emerald-500 border border-zinc-300"></div>
                  <div className="w-6 h-6 rounded bg-emerald-50 border border-zinc-300"></div>
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 ml-1">Green</span>
                </div>
              </button>
              <button
                onClick={() => {
                  setForegroundColor('#a855f7');
                  setBackgroundColor('#faf5ff');
                }}
                className="p-3 rounded-lg border-2 border-zinc-200 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                aria-label="Set purple theme colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-purple-500 border border-zinc-300"></div>
                  <div className="w-6 h-6 rounded bg-purple-50 border border-zinc-300"></div>
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 ml-1">Purple</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Footer */}
      <div className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
        <p>Features: Real-time generation • Custom colors • Adjustable size • PNG & SVG download</p>
      </div>
    </div>
  );
}
