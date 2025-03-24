import { HomeIcon, ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { getMostRecentSessionCookie, getAllSessionCookieIds } from "@/lib/cookies";



export const UserNavLinks = async () => {
  let session = null;
  let session_ids = [];
  try {
    session_ids = await getAllSessionCookieIds();
    if (session_ids.length > 0) {
      session = await getMostRecentSessionCookie();
    }
  } catch (error) {
    console.error(error);
  }

  if (!session || !session.loginName) {
    return undefined;
  }

  return (
    <div>

      <a
        href="/dashboard"
        className="inline-flex space-x-2 rounded-lg bg-gray-700 px-3 py-1 text-sm font-medium text-gray-100 hover:bg-gray-500 hover:text-white mx-2"
      >
        <HomeIcon className="block w-4" />
        <div>Dashboard</div>
      </a>

      <a
        href="/logout"
        className="inline-flex space-x-2 rounded-lg bg-gray-700 px-3 py-1 text-sm font-medium text-gray-100 hover:bg-gray-500 hover:text-white mx-2"
      >
        <ArrowRightStartOnRectangleIcon className="block w-4" />
        <div>Logout</div>
      </a>

    </div>
  );
};
