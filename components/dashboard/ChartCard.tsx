import { Card, CardBody, CardHeader } from "@/components/ui/Card";

export function ChartCard({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader title={title} subtitle={subtitle} action={action} />
      <CardBody className="flex-1">{children}</CardBody>
    </Card>
  );
}
