import { getServiceUrlFromHeaders } from "@/lib/service";
import { loadMostRecentSession } from "@/lib/session";
import {
  getBrandingSettings,
  getLoginSettings,
  removeTOTP,
  removeU2F,
} from "@/lib/zitadel";
import { RemoveTOTPResponse, RemoveU2FResponse } from "@zitadel/proto/zitadel/user/v2/user_service_pb";
import { getLocale, getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page(props: {
  searchParams: Promise<Record<string | number | symbol, string | undefined>>;
  params: Promise<Record<string | number | symbol, string | undefined>>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const locale = getLocale();
  const t = await getTranslations({ locale, namespace: "otp" });
  const tError = await getTranslations({ locale, namespace: "error" });

  const { loginName, organization, sessionId, requestId, checkAfter } =
    searchParams;
  const { method } = params;

  const _headers = await headers();
  const { serviceUrl } = getServiceUrlFromHeaders(_headers);

  const branding = await getBrandingSettings({
    serviceUrl,

    organization,
  });
  const loginSettings = await getLoginSettings({
    serviceUrl,

    organization,
  });

  const session = await loadMostRecentSession({
    serviceUrl,

    sessionParams: {
      loginName,
      organization,
    },
  });

  let totpResponse: RemoveTOTPResponse | RemoveU2FResponse | undefined, error: Error | undefined;

  if (session && session.factors?.user?.id) {
    if (method === "time-based") {
      await removeTOTP({
        serviceUrl,

        userId: session.factors.user.id,
      })
        .then((resp) => {
          if (resp) {
            totpResponse = resp;
          }
        })
        .catch((err) => {
          error = err;
        });
    } else if (method === "u2f") {

      if (searchParams.id) {
        await removeU2F({
          serviceUrl,
          userId: session.factors.user.id,
          u2fId: searchParams.id,
        }).then((resp) => {
          if (resp) {
            totpResponse = resp;
          }
        }).catch((error) => {
          error = new Error("Could not remove U2F");
        });
      }
    } else {
      throw new Error("Invalid method");
    }
  } else {
    throw new Error("No session found");
  }



  const paramsToContinue = new URLSearchParams({});
  let urlToContinue = "/mfa/change?";

  if (loginName) {
    paramsToContinue.append("loginName", loginName);
  }

  urlToContinue = urlToContinue + paramsToContinue;

  return redirect(urlToContinue);

}
