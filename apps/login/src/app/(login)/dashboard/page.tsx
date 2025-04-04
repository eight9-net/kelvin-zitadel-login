import { Button, ButtonVariants } from "@/components/button";
import { DynamicTheme } from "@/components/dynamic-theme";
import { SelfServiceMenu } from "@/components/self-service-menu";
import { UserAvatar } from "@/components/user-avatar";
import { getMostRecentCookieWithLoginname } from "@/lib/cookies";
import { getServiceUrlFromHeaders } from "@/lib/service";
import {
  createCallback,
  createResponse,
  getBrandingSettings,
  getLoginSettings,
  getSession,
  listUserGrants,
  ListUserMetadata,
} from "@/lib/zitadel";
import { create } from "@zitadel/client";
import {
  CreateCallbackRequestSchema,
  SessionSchema,
} from "@zitadel/proto/zitadel/oidc/v2/oidc_service_pb";
import { CreateResponseRequestSchema } from "@zitadel/proto/zitadel/saml/v2/saml_service_pb";
import { getLocale, getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UserProjectList } from "@/components/user-project-list";

async function loadSession(
  serviceUrl: string,

  loginName: string,
  requestId?: string,
) {
  let recent: (any) = undefined;
  try {
    recent = await getMostRecentCookieWithLoginname({ loginName });
  } catch (e) {
    return redirect('loginname');
  }

  return getSession({
    serviceUrl,

    sessionId: recent.id,
    sessionToken: recent.token,
  }).then((response) => {
    if (response?.session) {
      return response.session;
    }
  });
}

export default async function Page(props: { searchParams: Promise<any> }) {
  const searchParams = await props.searchParams;
  const locale = getLocale();
  const t = await getTranslations({ locale, namespace: "dashboard" });

  const _headers = await headers();
  const { serviceUrl } = getServiceUrlFromHeaders(_headers);

  const { loginName, requestId, organization } = searchParams;

  const errorMessage = searchParams?.error;

  const sessionFactors = await loadSession(
    serviceUrl,

    loginName,
    requestId,
  );

  if (!sessionFactors?.factors?.user?.loginName) {
    redirect("/loginname");
  }

  const branding = await getBrandingSettings({
    serviceUrl,

    organization,
  });

  const loginNameParam = loginName ?? sessionFactors?.factors?.user?.loginName;
  const userId         = sessionFactors?.factors?.user.id;
  const orgId          = sessionFactors?.factors?.user?.organizationId;


  const loginSettings = await getLoginSettings({
    serviceUrl,

    organization: orgId,
  });


  let is_idp = false;
  if (sessionFactors?.factors?.intent) {
    is_idp = true;
  }

  // Fetch User's Projects
  const userProjects = await listUserGrants({
    serviceUrl,
    userId: userId,
    orgId: orgId,
  });
  console.log('USER PROJECT GRANTS', userProjects);

  const userMetadata = await ListUserMetadata({
    serviceUrl,
    userId: userId,
  });
  console.log('USER METADATA', userMetadata);

  if (userMetadata.infinity_instances) {
    let infinity_instances = JSON.parse(userMetadata.infinity_instances);
    infinity_instances = infinity_instances.instances;
    console.log('Infinity Instances', infinity_instances);
  }


  return (
    <DynamicTheme branding={branding}>

      <div className="flex flex-col items-center space-y-4">
        <h1>
          {t("title", { user: sessionFactors?.factors?.user?.displayName })}
        </h1>
        <p className="ztdl-p mb-6 block">{t("description")}</p>

        {errorMessage && <p className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert" >{errorMessage}</p>}

        <UserAvatar
          loginName={loginName ?? sessionFactors?.factors?.user?.loginName}
          displayName={sessionFactors?.factors?.user?.displayName}
          showDropdown
          searchParams={searchParams}
        />

        {sessionFactors?.id && (
          <SelfServiceMenu sessionId={sessionFactors?.id} canChangePassword={loginSettings?.allowUsernamePassword??false} loginName={loginNameParam} isIdp={is_idp} />
        )}

        <UserProjectList projects={userProjects} loginName={loginName ?? sessionFactors?.factors?.user?.loginName} />

      </div>
    </DynamicTheme>
  );
}
