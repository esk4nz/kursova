import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import type { Session } from "next-auth";

function Header({ session }: { session: Session | null }) {
  const role = session?.user.userRole;

  return (
    <header className="bg-myDark text-myHighlight p-4">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        {/* Логотип */}
        <Link href="/" className="text-xl font-bold flex-shrink-0 mb-2 md:mb-0">
          🍴 Oleksandr's kitchen
        </Link>

        {/* Меню навігації */}
        <nav className="w-full md:w-auto flex-grow">
          <ul className="flex flex-col md:flex-row items-center md:items-center justify-center md:justify-center space-y-2 md:space-y-0 md:space-x-4">
            <li>
              <Link href="/menu" className="hover:underline">
                Меню
              </Link>
            </li>
            <li>
              <Link href="/reservations" className="hover:underline">
                Бронювання столику
              </Link>
            </li>
            <li>
              <Link href="/reviews" className="hover:underline">
                Відгуки
              </Link>
            </li>
            {(role === "Manager" || role === "Admin") && (
              <>
                <li>
                  <Link href="/manager/users-list" className="hover:underline">
                    Список користувачів
                  </Link>
                </li>
                <li>
                  <Link href="/manager/restaurant" className="hover:underline">
                    Ресторан
                  </Link>
                </li>
                <li>
                  <Link
                    href="/manager/reservations-list"
                    className="hover:underline"
                  >
                    Резервації
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* Кнопка профілю/логіну */}
        <div className="mt-2 md:mt-0 flex-shrink-0">
          {session ? (
            <Link
              href="/user-profile"
              className={buttonVariants({ variant: "secondary" })}
            >
              Профіль
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className={buttonVariants({ variant: "secondary" })}
            >
              Логін
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
