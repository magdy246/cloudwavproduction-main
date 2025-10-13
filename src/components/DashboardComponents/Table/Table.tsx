import { ChangeEvent, ReactNode, useEffect, useState } from "react";
// import { useTranslation } from "react-i18next";
import { LuSearch as Search, LuLoader as Loader2 } from "react-icons/lu";
interface TTableOfContent<T> {
  title: string;
  dataHead: {
    label: string;
    name: string;
    select?: (e: any) => string | React.ReactNode;
  }[];
  dataBody: T[];
  isFetching: boolean;
  refetch: () => void;
  acceptRoute: string;
  otherRoute?: string;
  actions: { action: (id: number) => void; Icon: ReactNode }[];
}

export function TableOfContent<T>({
  dataBody,
  dataHead,
  title,
  isFetching,
  actions = [],
}: TTableOfContent<T>) {
  const [filterData, setFilterData] = useState<T[]>([]);

  // handle search
  function handleSearch(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.toLowerCase();
    setFilterData(
      dataBody.filter((el:any) =>
        Object.values(el).some((data: any) =>
          String(data).toLowerCase().includes(value)
        )
      )
    );
  }

  useEffect(() => {
    if (dataBody) {
      setFilterData(dataBody);
    }
  }, [dataBody]);

  return (
    <div className="bg-white shadow-lg border border-gray-100 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{title}</h2>
            <p className="text-sm text-gray-600">
              Showing {filterData?.length || 0} of {dataBody?.length || 0}{" "}
              entries
            </p>
          </div>
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
            {dataBody?.length || 0} Total
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 z-0">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search entries..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Table Header */}
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                #
              </th>
              {dataHead.map((dHead, index) => (
                <th
                  key={index}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  {dHead.label}
                </th>
              ))}
              {actions.length > 0 && <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {isFetching ? (
              <tr>
                <td colSpan={dataHead.length + 2} className="px-6 py-12">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-3" />
                    <p className="text-gray-500 text-sm">Loading data...</p>
                  </div>
                </td>
              </tr>
            ) : filterData.length === 0 ? (
              <tr>
                <td colSpan={dataHead.length + 2} className="px-6 py-12">
                  <div className="text-center">
                    <div className="mx-auto h-12 w-12 text-gray-300 mb-4">
                      <svg
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg font-medium mb-1">
                      No results found
                    </p>
                    <p className="text-gray-400 text-sm">
                      Try adjusting your search criteria
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filterData.map((dBody, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
                      {i + 1}
                    </div>
                  </td>
                  {dataHead.map((dHead, index) => {
                    const content = dBody[
                      dHead.name as keyof typeof dBody
                    ] as string;
                    return (
                      <td key={index} className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {dHead.select ? dHead.select(content) : content}
                        </div>
                      </td>
                    );
                  })}
                  {actions.length > 0 && <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      {actions.map((action, actionIndex) => (
                        <button
                          key={actionIndex}
                          onClick={() =>
                            action.action(
                              dBody["id" as keyof typeof dBody] as number
                            )
                          }
                          className="rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100  transition-all duration-200 ease-in-out transform hover:scale-105"
                        >
                          {action.Icon}
                        </button>
                      ))}
                    </div>
                  </td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {filterData.length > 0 && !isFetching && (
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Displaying {filterData.length} result
              {filterData.length !== 1 ? "s" : ""}
            </p>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
