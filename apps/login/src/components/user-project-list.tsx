
import Link from "next/link";

export type Project = {
  projectName: string;
  id: string;
};


export function UserProjectList({
  projects,
  loginName,
}: {
  projects: Project[];
  loginName: string;
}) {

  return (
    <div className="grid grid-flow-col grid-rows-3 gap-4">
        {projects.map((item, index) => {
          return (
            <ProjectButton
              project={item}
              key={"projects-" + index}
              loginName={loginName}
            />
          );
        })}
    </div>
  );
}

const ProjectButton = ({
  project,
  loginName,
}: {
  project: Project;
  loginName: string;
}) => {
  const projectColors: { [key: string]: string } = {
    "Infinity"            : 'bg-green-600',
    "Infinity Deploy Tool": 'bg-emerald-400',
    "Pulse"               : 'bg-purple-400',
  }
  // Todo: Open Project
  let link = 'https://ise.dev.eight9.net/demo/?page=User_OpenAuthLogin';
  if (loginName) link += `&login_hint=${loginName}`;
  const name = project.projectName;
  const color = projectColors[name];
  return (
    <Link
      prefetch={false}
      href={link}
      className={`row-start-1 row-end-4 grid place-content-center rounded-lg p-4 sm:p-12 ${color}`}
    >
      {name}
    </Link>
  );
};
