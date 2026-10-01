import type { Metadata } from "next";
import { SecurityProvider } from "@/components/security-provider";
import { Shell } from "@/components/shell";
import "./globals.css";
export const metadata: Metadata = {
  title: "Sentinel — Security workspace",
  description:
    "Demo de un espacio de trabajo de ciberseguridad. Prioriza alertas, conoce tus activos y entiende el riesgo.",
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <SecurityProvider>
          <Shell>{children}</Shell>
        </SecurityProvider>
      </body>
    </html>
  );
}
