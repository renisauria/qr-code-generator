import QRCodeGenerator from '@/components/QRCodeGenerator';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-blue-50 to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="container mx-auto py-8 sm:py-12">
        <QRCodeGenerator />
      </div>
    </div>
  );
}
