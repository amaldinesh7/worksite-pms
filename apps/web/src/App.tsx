import { Layout, PageContent, Header } from '@/components/layout';

export default function App() {
  return (
    <Layout>
      {/* Header */}
      <Header
        title="Dashboard Overview"
        subtitle="Welcome back, John"
        searchPlaceholder="Search projects..."
        primaryActionLabel="New Project"
        onPrimaryAction={() => console.log('New project clicked')}
      />

      {/* Main Content Area - Ready for other sections */}
      <PageContent>{/* Content goes here */}</PageContent>
    </Layout>
  );
}
