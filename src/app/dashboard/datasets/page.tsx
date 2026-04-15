import type { Metadata } from "next";
import DatasetsClient from "@/components/datasets/DatasetsClient";

export const metadata: Metadata = { title: "Datasets" };

export default function DatasetsPage() {
  return <DatasetsClient />;
}
