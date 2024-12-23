import React from "react";

function Footer() {
  return (
    <footer className="bg-myDark text-myHighlight p-4">
      <div className="container mx-auto flex flex-col items-center">
        <p className="mb-2">Працюємо без вихідних з 10:00 до 24:00</p>

        <p className="mb-1">Контактний номер: +380 123 456 789</p>
        <p>Електронна адреса: info@oleksandrs-kitchen.com</p>
      </div>
    </footer>
  );
}

export default Footer;
