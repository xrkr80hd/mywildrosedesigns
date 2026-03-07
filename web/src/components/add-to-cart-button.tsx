"use client";

import { useState } from "react";

type AddToCartButtonProps = {
  id: string;
  title: string;
  price: number;
  label?: string;
  addedLabel?: string;
  className?: string;
  onAdded?: () => void;
};

type CartItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
};

const CART_KEY = "wild-rose-cart";

export function AddToCartButton({
  id,
  title,
  price,
  label = "Add to Cart",
  addedLabel = "Added",
  className,
  onAdded,
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    const raw = window.localStorage.getItem(CART_KEY);
    const cart = (raw ? JSON.parse(raw) : []) as CartItem[];
    const existing = cart.find((item) => item.id === id);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ id, title, price, quantity: 1 });
    }

    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    setAdded(true);
    onAdded?.();
    window.setTimeout(() => setAdded(false), 1000);
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      className={
        className ??
        "rounded-xl bg-rose px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose/90"
      }
    >
      {added ? addedLabel : label}
    </button>
  );
}
