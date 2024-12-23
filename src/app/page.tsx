import Link from "next/link";
export default function Home() {
  return (
    <div className="shadow-inner">
      <section
        className="bg-cover bg-center h-96 flex items-center justify-center text-white"
        style={{ backgroundImage: "url('/background-image.jpg')" }}
      >
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            Ласкаво просимо до MyRestaurant
          </h1>
          <p className="text-lg">Найкращі страви, приготовані з любов'ю</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Про нас</h2>
          <p className="text-lg text-center mb-6">
            MyRestaurant — це ідеальне місце для гурманів, де ви знайдете
            найкращі страви, приготовлені з найсвіжіших інгредієнтів. Ми цінуємо
            кожного гостя і прагнемо зробити ваш візит незабутнім.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <img
              src="/about-us-image.jpg"
              alt="About Us"
              className="rounded-lg shadow-lg"
            />
            <div>
              <h3 className="text-2xl font-semibold mb-4">Наша історія</h3>
              <p className="text-lg">
                Ми почали свій шлях у 2010 році, прагнучи створити ресторан,
                який дарує радість кожному гостю. Наші кухарі мають багаторічний
                досвід і пристрасть до своєї справи.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Чому ми?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <img
                src="/vegetables.jpg"
                alt="Fresh Ingredients"
                className="w-44 h-44 mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold">Свіжі інгредієнти</h3>
              <p>
                Ми використовуємо тільки найкращі інгредієнти для приготування
                ваших страв.
              </p>
            </div>
            <div>
              <img
                src="/vibe.jpg"
                alt="Cozy Atmosphere"
                className="w-44 h-44 mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold">Затишна атмосфера</h3>
              <p>Розслабтесь і насолоджуйтесь атмосферою, створеною для вас.</p>
            </div>
            <div>
              <img
                src="/cook.jpg"
                alt="Top Chefs"
                className="w-44 h-44 mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold">Професійні кухарі</h3>
              <p>Наші кухарі — справжні майстри своєї справи.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-800 shadow-lg text-white text-center rounded">
        <h2 className="text-3xl font-bold mb-4">
          Готові до незабутнього досвіду?
        </h2>
        <p className="mb-6">
          Забронюйте столик і насолоджуйтесь найкращими стравами прямо зараз!
        </p>
        <Link
          href="/reservations"
          className="bg-yellow-500 text-black px-6 py-3 rounded-lg text-lg font-semibold hover:bg-yellow-400"
        >
          Забронювати столик
        </Link>
      </section>
    </div>
  );
}
