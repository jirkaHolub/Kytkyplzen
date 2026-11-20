import { Card, Notice } from "@/components/ui";

export function NoDatabase() {
  return (
    <div className="px-4 py-8">
      <Card>
        <h1 className="text-[18px] font-extrabold">Web ještě není napojený na databázi</h1>
        <Notice tone="warn">Chybí proměnná prostředí DATABASE_URL.</Notice>
        <p className="text-[14px] text-muted">
          Ve Vercelu otevřete projekt, záložku Storage, vytvořte databázi Neon a propojte ji s projektem. Potom proveďte
          nové nasazení a otevřete /admin/setup.
        </p>
      </Card>
    </div>
  );
}
