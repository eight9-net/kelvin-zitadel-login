import { Alert } from "@/components/alert";
import { BackButton } from "@/components/back-button";
import { ChooseSecondFactorToChange } from "@/components/choose-second-factor-to-change";
import { DynamicTheme } from "@/components/dynamic-theme";
import { UserAvatar } from "@/components/user-avatar";
import { getSessionCookieById } from "@/lib/cookies";
import { getServiceUrlFromHeaders } from "@/lib/service";
import { loadMostRecentSession } from "@/lib/session";
import {
  getBrandingSettings,
  getLoginSettings,
  getSession,
  getUserByID,
  listAuthenticationMethodTypes,
  listAuthenticationFactors,
} from "@/lib/zitadel";
import { Timestamp, timestampDate } from "@zitadel/client";
import { Session } from "@zitadel/proto/zitadel/session/v2/session_pb";
import { AuthFactorOTP, AuthFactorU2F } from "@zitadel/proto/zitadel/user/v2/user_pb";
import { getLocale, getTranslations } from "next-intl/server";
import { headers } from "next/headers";

function isSessionValid(session: Partial<Session>): {
  valid: boolean;
  verifiedAt?: Timestamp;
} {
  const validPassword = session?.factors?.password?.verifiedAt;
  const validPasskey = session?.factors?.webAuthN?.verifiedAt;
  const stillValid = session.expirationDate
    ? timestampDate(session.expirationDate) > new Date()
    : true;

  const verifiedAt = validPassword || validPasskey;
  const valid = !!((validPassword || validPasskey) && stillValid);

  return { valid, verifiedAt };
}

export default async function Page(props: {
  searchParams: Promise<Record<string | number | symbol, string | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const locale = getLocale();
  const t = await getTranslations({ locale, namespace: "mfa" });
  const tError = await getTranslations({ locale, namespace: "error" });

  const { loginName, checkAfter, force, requestId, organization, sessionId } =
    searchParams;

  const _headers = await headers();
  const { serviceUrl } = getServiceUrlFromHeaders(_headers);

  const sessionWithData = sessionId
    ? await loadSessionById(sessionId, organization)
    : await loadSessionByLoginname(loginName, organization);

  async function getAuthMethodsAndUser(session?: Session) {
    const userId = session?.factors?.user?.id;

    if (!userId) {
      throw Error("Could not get user id from session");
    }

    return listAuthenticationMethodTypes({
      serviceUrl,

      userId,
    }).then((methods) => {

      return listAuthenticationFactors({
        serviceUrl,
        userId
      }).then((authFactors) => {
        const authFactorsArr: (AuthFactorOTP | AuthFactorU2F)[] = [];
        for (const af of authFactors.result) {
          if (af.type.case === 'otp' || af.type.case === 'u2f') {
            authFactorsArr.push(af.type.value);
          }
        }

        return getUserByID({ serviceUrl, userId }).then((user) => {
          const humanUser =
            user.user?.type.case === "human" ? user.user?.type.value : undefined;

          return {
            authFactors: authFactorsArr,
            factors: session?.factors,
            authMethods: methods.authMethodTypes ?? [],
            phoneVerified: humanUser?.phone?.isVerified ?? false,
            emailVerified: humanUser?.email?.isVerified ?? false,
            expirationDate: session?.expirationDate,
          };
        });
      });
    });
  }

  async function loadSessionByLoginname(
    loginName?: string,
    organization?: string,
  ) {
    return loadMostRecentSession({
      serviceUrl,

      sessionParams: {
        loginName,
        organization,
      },
    }).then((session) => {
      return getAuthMethodsAndUser(session);
    });
  }

  async function loadSessionById(sessionId: string, organization?: string) {
    const recent = await getSessionCookieById({ sessionId, organization });
    return getSession({
      serviceUrl,
      sessionId: recent.id,
      sessionToken: recent.token,
    }).then((sessionResponse) => {
      return getAuthMethodsAndUser(sessionResponse.session);
    });
  }

  const branding = await getBrandingSettings({
    serviceUrl,

    organization,
  });
  const loginSettings = await getLoginSettings({
    serviceUrl,

    organization: sessionWithData.factors?.user?.organizationId,
  });

  console.log('AUTH', sessionWithData);

  const { valid } = isSessionValid(sessionWithData);

  return (
    <DynamicTheme branding={branding}>
      <div className="flex flex-col items-center space-y-4">
        <h1>{t("set.title")}</h1>

        <p className="ztdl-p">{t("set.description")}</p>

        {sessionWithData && (
          <UserAvatar
            loginName={loginName ?? sessionWithData.factors?.user?.loginName}
            displayName={sessionWithData.factors?.user?.displayName}
            showDropdown
            searchParams={searchParams}
          ></UserAvatar>
        )}

        {!(loginName || sessionId) && <Alert>{tError("unknownContext")}</Alert>}

        {!valid && <Alert>{tError("sessionExpired")}</Alert>}

        {isSessionValid(sessionWithData).valid &&
          loginSettings &&
          sessionWithData &&
          sessionWithData.factors?.user?.id && (
            <ChooseSecondFactorToChange
              userId={sessionWithData.factors?.user?.id}
              loginName={loginName}
              sessionId={sessionId}
              requestId={requestId}
              organization={organization}
              loginSettings={loginSettings}
              userMethods={sessionWithData.authMethods ?? []}
              phoneVerified={sessionWithData.phoneVerified ?? false}
              emailVerified={sessionWithData.emailVerified ?? false}
              checkAfter={checkAfter === "true"}
              force={force === "true"}
              authFactors={sessionWithData.authFactors}
            ></ChooseSecondFactorToChange>
          )}

        <div className="mt-8 flex w-full flex-row items-center">
          <BackButton />
          <span className="flex-grow"></span>
        </div>
      </div>
    </DynamicTheme>
  );
}
