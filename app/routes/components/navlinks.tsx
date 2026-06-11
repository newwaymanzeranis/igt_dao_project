import {Link} from "react-router";
export default function NavLinks() {
  return (
    <nav className="flex items-center justify-center gap-4">
      <Link to="/dashboard" className="text-md text-gray-900 dark:text-gray-100 bg-blue-500 text-white px-4 py-2 rounded-md">Dashboard</Link>
      <Link to="/proposels" className="text-md text-gray-900 dark:text-gray-100 bg-blue-500 text-white px-4 py-2 rounded-md">Proposels</Link>     
      <Link to="/create_proposels" className="text-md text-gray-900 dark:text-gray-100 bg-blue-500 text-white px-4 py-2 rounded-md">Create Propsels</Link>    
      <Link to="/history" className="text-md text-gray-900 dark:text-gray-100 bg-blue-500 text-white px-4 py-2 rounded-md">History</Link> 
      <Link to="/profile" className="text-md text-gray-900 dark:text-gray-100 bg-blue-500 text-white px-4 py-2 rounded-md ">Profile </Link>
    </nav>
  );
}