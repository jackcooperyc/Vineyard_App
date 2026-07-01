import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EquipmentForm } from "@/components/equipment/equipment-form";

export default function NewEquipmentPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          render={<Link href="/equipment" aria-label="Back to equipment" />}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Add equipment</h2>
          <p className="text-sm text-muted-foreground">
            Register a vineyard asset for tracking and task assignment
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Equipment details</CardTitle>
        </CardHeader>
        <CardContent>
          <EquipmentForm />
        </CardContent>
      </Card>
    </div>
  );
}
