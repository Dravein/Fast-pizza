import { useSelector } from "react-redux";

function Username() {
  //Redux Store-ban való State változást figyeli akkor frissül.
  const username = useSelector((state) => state.user.username);

  if (!username) return null;

  return (
    <div className="hidden text-sm font-semibold md:block">{username}</div>
  );
}

export default Username;
