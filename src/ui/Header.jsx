import { Link } from "react-router-dom";
import SearchOrder from "../features/order/SearchOrder";
import Username from "../features/user/Username";

function Header() {
  return (
    <header className=" font-pizza flex items-center justify-between border-b-2 border-stone-200 bg-yellow-400 px-4 py-3 uppercase sm:px-6">
      {/* // "tracking-[2rem]" [] között bármilyen értéket megadhatok nem csak az előre beállítottat. */}
      <Link to="/" className="tracking-widest">
        Fast React Pizza Co.
      </Link>

      <SearchOrder />
      <Username />
    </header>
  );
}

export default Header;
