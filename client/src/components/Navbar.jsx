
const Navbar = ({section}) => {

 

  const date = new Date();

  const month = date.toLocaleString('default', { month: 'long' }); // e.g., "September"
  const weekday = date.toLocaleString('default', { weekday: 'long' }); // e.g., "Friday"
  const day = date.getDate(); // e.g., 14

  const fullDate = date.toISOString().split('T')[0]; // e.g., "2025-09-14"
  const monthDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // "2025-09"
  const weekdayDate = fullDate; // Same as fullDate for simplicity

  return (
    <nav className="w-full bg-white border-b-3 border-gray-200 text-black h-full flex items-center justify-between px-5 rounded-tr-xl">
      <h1 className="text-xl poppins">{section}</h1>
      <div className="flex gap-5 items-center">
       
        <div className="flex items-center gap-2">
          <div>
            <time dateTime={monthDate}>
              <p>{month}</p>
            </time>
            <time dateTime={weekdayDate}>
              <p>{weekday}</p>
            </time>
          </div>
          <time dateTime={fullDate} className="bg-blue-500 text-white p-3 rounded-full">
            {day}
          </time>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;