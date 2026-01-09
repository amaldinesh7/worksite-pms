import { Button } from '@/components/ui/button';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4">
      <h1 className="text-3xl font-bold text-foreground">
        Welcome to Worksite Web
      </h1>
      <p className="text-foreground-secondary">
        Your universal app is running!
      </p>
      <Button onClick={() => alert('Hello from Worksite!')}>Click Me</Button>
    </div>
  );
}
