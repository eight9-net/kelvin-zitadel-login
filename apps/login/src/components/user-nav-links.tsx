"use client";

import { HomeIcon, ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { getMostRecentCookieWithLoginname } from "@/lib/cookies";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";


export const UserNavLinks = () => {
  let [session, setSession] = useState<any>([]);
  const searchParams = useSearchParams();
  const loginName = searchParams.get("loginName");

  useEffect(() => {
    const loadCookies = async () => {
      if (loginName) {
        try {
          const result = await getMostRecentCookieWithLoginname({ loginName });
          setSession(result);
        } catch (e) {
          console.error('Err', e)
        }
      }
    };

    loadCookies();
  }, [loginName]);

  if (!session || !session.loginName) {
    return undefined;
  }

  let dashboard_link = "/dashboard";
  if (loginName) {
    dashboard_link += `?loginName=${loginName}`;
  }

  return (
    <div>
      <Link
        prefetch={false}
        href={dashboard_link}
        className="inline-flex space-x-2 rounded-lg bg-gray-700 px-3 py-1 text-sm font-medium text-gray-100 hover:bg-gray-500 hover:text-white mx-2"
      >
        <HomeIcon className="block w-4" />
        <div>Dashboard</div>
      </Link>

      <Link
        prefetch={false}
        href="/logout"
        className="inline-flex space-x-2 rounded-lg bg-gray-700 px-3 py-1 text-sm font-medium text-gray-100 hover:bg-gray-500 hover:text-white mx-2"
      >
        <ArrowRightStartOnRectangleIcon className="block w-4" />
        <div>Logout</div>
      </Link>

    </div>
  );
};
