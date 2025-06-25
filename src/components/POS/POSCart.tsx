"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  TrashIcon,
  ShoppingCartIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { Btn, SelectWithAdd } from "@/components/atoms";
import { Client } from "@/types/client";
import CartItem from "./CartItem";
import { useRouter } from "next/navigation";
import { useCart } from '@/context/CartContext';

interface POSCartProps {
  clients: Client[];
  onAddClient: () => void;
  onCheckout: () => void;
}

const POSCart = (
  {
    clients,
    onAddClient,
    onCheckout,
  }: POSCartProps) => {
    const t = useTranslations("pages.pos");
    const locale = useLocale();
    const router = useRouter();
    const { cart, selectedClient, updateQuantity, updatePrice, removeFromCart, clearCart, getTotal, getTotalQuantity, setSelectedClient } = useCart();

    const handleBackToDashboard = () => {
      router.push(`/${locale}/dashboard`);
    };

    const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedClient(e.target.value);
    };

    const handleClearCart = () => {
      clearCart();
    };

    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <Btn
              variant="ghost"
              onClick={handleBackToDashboard}
              leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
            >
              {t("backToDashboard")}
            </Btn>
            <h2 className="text-lg font-semibold">{t("cart.title")}</h2>
            <Btn
              variant="ghost"
              size="sm"
              onClick={handleClearCart}
              leftIcon={<TrashIcon className="h-4 w-4" />}
            >
              {t("cart.clear")}
            </Btn>
          </div>
        </div>

        <div className="p-6">
          {/* Cliente */}
          <div className="mb-6">
            <SelectWithAdd
              id="client"
              label={t("cart.client")}
              placeholder={t("cart.selectClient")}
              value={selectedClient}
              onChange={handleClientChange}
              options={clients.map((client) => ({
                value: client.id,
                label: client.name,
              }))}
              showAddButton
              onAddClick={onAddClient}
              addButtonTitle={t("cart.createNewClient")}
            />
          </div>

          {/* Items del carrito */}
          <div
            className="space-y-4 mb-6 overflow-y-auto pr-4"
            style={{ height: "calc(100vh - 420px)" }}
          >
            {cart.map((item) => (
              <CartItem
                key={item.product.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onUpdatePrice={updatePrice}
                onRemove={removeFromCart}
              />
            ))}

            {cart.length === 0 && (
              <div className="text-center py-8">
                <ShoppingCartIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">{t("cart.empty")}</p>
              </div>
            )}
          </div>

          {/* Total y botón de pago */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <Btn
                    onClick={onCheckout}
                    disabled={cart.length === 0 || !selectedClient}
                    className="w-full"
                  >
                    {t("cart.checkout")}
                  </Btn>
                  <div className="flex justify-between items-center">
                    <div className="flex mr-4">
                      <span className="text-gray-500"> {t("cart.selectedProducts")}</span>:
                      <span className="font-bold ml-2"> {getTotalQuantity()}</span>
                    </div>
                    <span className="text-lg font-semibold">
                      {t("cart.total")}:
                    </span>
                    <span
                      className="text-2xl font-bold ml-4"
                      style={{ color: `rgb(var(--color-primary-600))` }}
                    >
                      ${getTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

export default POSCart;
