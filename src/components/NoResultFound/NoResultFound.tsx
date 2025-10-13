import { ReactNode } from "react";

export default function NoResultFound({ children }: { children: ReactNode }) {
  return (
    <div className="text-center">
      <div className="mx-auto h-12 w-12 text-gray-300 mb-4">{children}</div>
      <p className="text-gray-500 text-lg font-medium mb-1">No results found</p>
      <p className="text-gray-400 text-sm">
        Try adjusting your search criteria
      </p>
    </div>
  );
}