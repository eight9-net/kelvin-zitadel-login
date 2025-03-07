import { DynamicTheme } from "@/components/dynamic-theme";
import { getAllSessions } from "@/lib/cookies";
import { cleanupSession } from "@/lib/server/session";
import { getServiceUrlFromHeaders } from "@/lib/service";
import {
  getBrandingSettings,
  getDefaultOrg,
  listSessions,
} from "@/lib/zitadel";
import { Organization } from "@zitadel/proto/zitadel/org/v2/org_pb";
import { getLocale, getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { Session } from "@zitadel/proto/zitadel/session/v2/session_pb";

import { ReactNode, Suspense } from "react";
import { Spinner } from "@/components/spinner";
import { redirect } from "next/navigation";


async function loadSessions({
  serviceUrl,
  ids,
}: {
  serviceUrl: string;
  ids: string[];
}): Promise<Session[]> {
  const response = await listSessions({
    serviceUrl,
    ids: ids.filter((id: string | undefined) => !!id),
  });

  return response?.sessions ?? [];
}


export default async function Page(props: {
  searchParams: Promise<Record<string | number | symbol, string | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const locale = getLocale();
  const t = await getTranslations({ locale, namespace: "dashboard" });

  const requestId = searchParams?.requestId;
  const organization = searchParams?.organization;

  const _headers = await headers();
  const { serviceUrl } = getServiceUrlFromHeaders(_headers);

  let defaultOrganization;
  if (!organization) {
    const org: Organization | null = await getDefaultOrg({
      serviceUrl,
    });
    if (org) {
      defaultOrganization = org.id;
    }
  }


  const sessionCookies = await getAllSessions();
  const ids = sessionCookies.map((s) => s.id);
  let sessions: Session[] = [];
  if (ids && ids.length) {
    sessions = await loadSessions({ serviceUrl, ids });
  }

  for (let i = 0; i < sessions.length; i++) {
    const response = await cleanupSession({sessionId: sessions[i].id})
      .finally(() => {
        return redirect('/loginname');
      });
  }

  const branding = await getBrandingSettings({
    serviceUrl,

    organization: organization ?? defaultOrganization,
  });


  return (
    <DynamicTheme branding={branding}>
      <div className="flex flex-col items-center space-y-4">
        <h1>{t("title")}</h1>
        <p className="ztdl-p mb-6 block">{t("description")}</p>

        <Suspense
          fallback={<Spinner className="h-5 w-5 mr-2" />}
        >
          <Spinner className="h-5 w-5 mr-2" />
          Logging Out
        </Suspense>

      </div>
    </DynamicTheme>
  );
}
