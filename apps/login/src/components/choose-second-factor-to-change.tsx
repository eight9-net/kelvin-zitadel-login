"use client";

import {
  LoginSettings,
  SecondFactorType,
} from "@zitadel/proto/zitadel/settings/v2/login_settings_pb";
import { AuthenticationMethodType } from "@zitadel/proto/zitadel/user/v2/user_service_pb";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { EMAIL, SMS, TOTP, U2F } from "./auth-methods";
import { AuthFactorOTP, AuthFactorU2F } from "@zitadel/proto/zitadel/user/v2/user_pb";

import Link from "next/link";

type Props = {
  userId: string;
  loginName?: string;
  sessionId?: string;
  requestId?: string;
  organization?: string;
  loginSettings: LoginSettings;
  userMethods: AuthenticationMethodType[];
  checkAfter: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
  force: boolean;
  authFactors: (AuthFactorOTP | AuthFactorU2F)[];
};

export function ChooseSecondFactorToChange({
  userId,
  loginName,
  sessionId,
  requestId,
  organization,
  loginSettings,
  userMethods,
  checkAfter,
  phoneVerified,
  emailVerified,
  force,
  authFactors,
}: Props) {
  const t = useTranslations("mfa");
  const router = useRouter();
  const params = new URLSearchParams({});

  if (loginName) {
    params.append("loginName", loginName);
  }
  if (sessionId) {
    params.append("sessionId", sessionId);
  }
  if (requestId) {
    params.append("requestId", requestId);
  }
  if (organization) {
    params.append("organization", organization);
  }
  if (checkAfter) {
    params.append("checkAfter", "true");
  }


const DELSF = (alreadyAdded: boolean, af_type: number, link: string, authFactors: (AuthFactorOTP | AuthFactorU2F)[]) => {
  if (af_type == AuthenticationMethodType.U2F) {
    for (const af of authFactors) {
      if (af.$typeName === "zitadel.user.v2.AuthFactorU2F") {
        link += `&id=${af.id}`;
      }
    }
  }
  return (
    <div key={link}>
      {alreadyAdded && (
        <>
          <Link
            prefetch={false}
            href={link}
            className="w-full group flex flex-row items-center bg-background-light-400 dark:bg-background-dark-400  border border-divider-light hover:shadow-lg dark:hover:bg-white/10 py-2 px-4 text-red-700 rounded-md transition-all mt-3 mb-6"
          >
            Remove
          </Link>
        </>
      )}
    </div>
  );
};


  return (
    <>
      <div className="grid grid-cols-1 w-full pt-4">
        {loginSettings.secondFactors.map((factor) => {
          switch (factor) {
            case SecondFactorType.OTP:
              return <div className="mb-6" key="otp">
                {
                TOTP(
                  userMethods.includes(AuthenticationMethodType.TOTP),
                  "/otp/time-based/set?" + params,
                )
                }
                {
                DELSF(userMethods.includes(AuthenticationMethodType.TOTP), AuthenticationMethodType.TOTP, "/otp/time-based/remove?" + params, authFactors)
                }
              </div>;
            case SecondFactorType.U2F:
              return <div className="mb-6" key="u2f">
                {
                  U2F(
                    userMethods.includes(AuthenticationMethodType.U2F),
                    "/u2f/set?" + params,
                  )
                }
                {
                  DELSF(userMethods.includes(AuthenticationMethodType.U2F), AuthenticationMethodType.U2F, "/otp/u2f/remove?" + params, authFactors)
                }
              </div>
            case SecondFactorType.OTP_EMAIL:
              return (
                emailVerified &&
                EMAIL(
                  userMethods.includes(AuthenticationMethodType.OTP_EMAIL),
                  "/otp/email/set?" + params,
                )
              );
            case SecondFactorType.OTP_SMS:
              return (
                phoneVerified &&
                SMS(
                  userMethods.includes(AuthenticationMethodType.OTP_SMS),
                  "/otp/sms/set?" + params,
                )
              );
            default:
              return null;
          }
        })}
      </div>
    </>
  );
}
