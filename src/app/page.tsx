import Loader from "@/components/Loader";
import ProjectSelector from "@/components/ProjectSelector";
import SprintSelector from "@/components/SprintSelector";
import UsersSelector from "@/components/UserSelector";
import { convertSecondsToHours } from "@/utils/convertSecondsToHours";
import Link from "next/link";
import { Suspense } from "react";

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

const AuthorizationHeader = {
  Authorization:
    "Basic " + btoa(`${process.env.API_USER_NAME}:${process.env.API_TOKEN}`),
};

const getDataFromApi = async (url: string) => {
  const data = await fetch(url, {
    headers: { ...AuthorizationHeader },
    cache: "no-cache",
  });
  const result = await data.json();
  return result;
}

export default async function Home({ searchParams }: Props) {
  const usersAssignedToProject = await getDataFromApi(`${process.env.API_REST_URL}user/search/query?query=is assignee of ${searchParams.project}`);
  const projects = await getDataFromApi(`${process.env.API_REST_URL}project/search`);

  const selectedUserName = searchParams?.user && usersAssignedToProject?.values?.find((u:any) => u.accountId === searchParams.user)?.displayName;

  const project = await getDataFromApi(`${process.env.API_REST_URL}search?jql=project = "${searchParams.project}" ${selectedUserName ? `and assignee = "${selectedUserName} "` : ""}and type = Subtask&fields=*all`);
  const boards = await getDataFromApi(`${process.env.API_AGILE_URL}board`);

  const currentBoardId = boards?.values?.find((b:any) => b?.location?.projectKey === searchParams.project)?.id;
  
  let sprintsInProject = null;

  if (currentBoardId) {
    sprintsInProject = await getDataFromApi(`${process.env.API_AGILE_URL}board/${currentBoardId}/sprint`)
  }

  const totalEstimatedTime = project?.issues?.reduce(
    (acc: number, issue: any) => {
      if (issue?.fields?.timetracking?.originalEstimateSeconds) {
        return acc + issue.fields.timetracking.originalEstimateSeconds;
      }
      return acc;
    },
    0
  ) as number;

  const totalProgressTime = project?.issues?.reduce(
    (acc: number, issue: any) => {
      if (issue?.fields?.progress?.progress) {
        return acc + issue.fields.progress.progress;
      }
      return acc;
    },
    0
  ) as number;

  return (
    <div className="min-h-full">
      <nav className="bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {/* <img className="h-8 w-8" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500" alt="Your Company"> */}
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <Link
                    href={"/"}
                    aria-current="page"
                    className="bg-gray-900 text-white rounded-md px-3 py-2 text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Dashboard
          </h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <ProjectSelector projects={projects.values} />
          <Suspense fallback={<Loader />}>
            {project?.issues?.length === 0 ? (
              <h4 className="text-xl my-8">No issues to display</h4>
            ) : (
              <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead>
                        <tr>
                          <th
                            scope="col"
                            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                          >
                            Name
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Details
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Assignee
                            {usersAssignedToProject?.values?.length && (
                              <div className="mt-1">
                                <UsersSelector users={usersAssignedToProject?.values} />
                              </div>
                            )}
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Sprint
                            {sprintsInProject?.values?.length && (
                              <div className="mt-1">
                                <SprintSelector sprints={sprintsInProject?.values} />
                              </div>
                            )}
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Status
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Estimated time
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Time spent
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Difference
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {project?.issues?.map((i: any) => (
                          <tr key={i.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                              {i.key}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {i?.fields?.parent?.fields?.summary}
                              <br />
                              {i.fields.parent.self}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {i?.fields?.assignee?.displayName}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {i?.fields?.customfield_10021[0]?.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {
                                i?.fields?.parent?.fields?.status
                                  ?.statusCategory?.name
                              }
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {i?.fields?.timetracking?.originalEstimate}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {typeof i?.fields?.progress?.progress === "number"
                                ? convertSecondsToHours(
                                    i.fields.progress.progress
                                  )
                                : i?.fields?.progress?.progress}{" "}
                              h
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                              <span
                                className={`w-3 h-3 rounded-full inline-block ${
                                  i?.fields?.timetracking
                                    ?.remainingEstimateSeconds > 0
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                              ></span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td
                            className="bg-gray-200 whitespace-nowrap px-3 py-4 text-sm"
                            colSpan={5}
                          >
                            Total
                          </td>
                          <td className="bg-gray-200 whitespace-nowrap px-3 py-4 text-sm">
                            {convertSecondsToHours(totalEstimatedTime)} h
                          </td>
                          <td className="bg-gray-200 whitespace-nowrap px-3 py-4 text-sm">
                            {convertSecondsToHours(totalProgressTime)} h
                          </td>
                          <td className="bg-gray-200"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </Suspense>
        </div>
      </main>
    </div>
  );
}
