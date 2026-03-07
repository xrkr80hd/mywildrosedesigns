"use client";

import { useEffect } from "react";

const CART_KEY = "wild-rose-cart";

export function ClearCartOnSuccess() {
  useEffect(() => {
    window.localStorage.removeItem(CART_KEY);
  }, []);

  return null;
}
