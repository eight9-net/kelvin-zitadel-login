import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/solid";
import { headers } from "next/headers";0
import Link from "next/link";
import { getServiceUrlFromHeaders } from "@/lib/service";
import { getAllSessionCookieIds } from "@/lib/cookies";


async function loadSessions({ serviceUrl }: { serviceUrl: string }) {
  const ids: (string | undefined)[] = await getAllSessionCookieIds();
  return ids;
}


export const LogoutLink = async () => {
  const _headers = await headers();
  const { serviceUrl } = getServiceUrlFromHeaders(_headers);
  let sessions = await loadSessions({ serviceUrl });
  if (sessions.length == 0) {
    return undefined;
  }

  return (
    <a
      href="/logout"
      className="inline-flex space-x-2 rounded-lg bg-gray-700 px-3 py-1 text-sm font-medium text-gray-100 hover:bg-gray-500 hover:text-white"
    >
      <div>Logout</div>

      <ArrowRightStartOnRectangleIcon className="block w-4" />
    </a>
  );
};
