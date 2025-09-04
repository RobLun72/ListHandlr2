// "use client";

// import {
//   useUser,
//   useCurrentUser,
//   useIsAuthenticated,
//   useUserPermissions,
// } from "@/contexts/UserContext";

// export function UserProfile() {
//   const { user, isLoading, error, refreshUser } = useUser();
//   const isAuthenticated = useIsAuthenticated();
//   const permissions = useUserPermissions();

//   if (isLoading) {
//     return <div>Loading user...</div>;
//   }

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   if (!isAuthenticated || !user) {
//     return <div>Not authenticated</div>;
//   }

//   return (
//     <div className="p-4 border rounded-lg">
//       <h2 className="text-xl font-bold mb-4">User Profile</h2>

//       <div className="space-y-2">
//         <div>
//           <strong>Name:</strong> {user.given_name} {user.family_name}
//         </div>
//         <div>
//           <strong>Email:</strong> {user.email}
//         </div>
//         <div>
//           <strong>ID:</strong> {user.id}
//         </div>

//         {/* {user.picture && (
//           <div>
//             <strong>Picture:</strong>
//             <img
//               src={user.picture}
//               alt="User"
//               className="w-16 h-16 rounded-full ml-2"
//             />
//           </div>
//         )} */}

//         {user.organizations && user.organizations.length > 0 && (
//           <div>
//             <strong>Organizations:</strong> {user.organizations.join(", ")}
//           </div>
//         )}

//         {user.roles && user.roles.length > 0 && (
//           <div>
//             <strong>Roles:</strong> {user.roles.join(", ")}
//           </div>
//         )}

//         {permissions.length > 0 && (
//           <div>
//             <strong>Permissions:</strong> {permissions.join(", ")}
//           </div>
//         )}
//       </div>

//       <button
//         onClick={refreshUser}
//         className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//       >
//         Refresh User Data
//       </button>
//     </div>
//   );
// }

// // Example of a component that uses the convenience hooks
// export function UserGreeting() {
//   const user = useCurrentUser();
//   const isAuthenticated = useIsAuthenticated();

//   if (!isAuthenticated || !user) {
//     return <div>Hello, Guest!</div>;
//   }

//   return <div>Hello, {user.given_name || user.email}!</div>;
// }

// // Example of a component that checks permissions
// interface ProtectedComponentProps {
//   requiredPermission: string;
//   children: React.ReactNode;
// }

// export function ProtectedComponent({
//   requiredPermission,
//   children,
// }: ProtectedComponentProps) {
//   const permissions = useUserPermissions();
//   const hasPermission = permissions.includes(requiredPermission);

//   if (!hasPermission) {
//     return <div>You do not have permission to view this content.</div>;
//   }

//   return <>{children}</>;
// }
