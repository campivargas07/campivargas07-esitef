import { notFound } from "next/navigation";
import { FormacionHubContent } from "@/components/formaciones/FormacionHubContent";
import {
  FORMATION_HUB_SLUGS,
  getFormacionHub,
} from "@/lib/formaciones-online";

export const dynamicParams = false;

export function generateStaticParams() {
  return FORMATION_HUB_SLUGS.map((hub) => ({ hub }));
}

export default async function FormacionHubPage({
  params,
}: {
  params: Promise<{ hub: string }>;
}) {
  const { hub: slug } = await params;
  const hub = getFormacionHub(slug);
  if (!hub) notFound();

  return <FormacionHubContent hub={hub} slug={slug} />;
}
