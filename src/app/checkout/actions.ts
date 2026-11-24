"use server";

import { redirect } from "next/navigation";
import { placeBooking } from "@/lib/desk";
import { parseCartLines } from "@/lib/pricing";

export type CheckoutState = {
  errors: Record<string, string>;
  formError: string;
};

function field(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function submitDemoCheckout(
  _previous: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const errors: Record<string, string> = {};
  const name = field(formData, "name");
  const phone = field(formData, "phone");
  const email = field(formData, "email");
  const address = field(formData, "address");
  const notes = field(formData, "notes");
  const areaId = field(formData, "area");

  if (name.length < 2 || name.length > 80) {
    errors.name = "Enter the full name for this delivery.";
  }
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 9 || digits.length > 15) {
    errors.phone = "Enter a mobile number with 9 to 15 digits.";
  }
  if (email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter an email address like name@example.com.";
  }
  if (address.length < 8 || address.length > 200) {
    errors.address = "Enter the estate, street, and a landmark (at least 8 characters).";
  }
  if (notes.length > 300) {
    errors.notes = "Keep the delivery note under 300 characters.";
  }
  if (formData.get("age") !== "yes") {
    errors.age = "Confirm that you are 18 or older. Wine cannot be supplied to anyone under 18.";
  }
  if (formData.get("handover") !== "yes") {
    errors.handover =
      "Confirm that the adult who receives the wine can show a Kenyan national ID or a passport.";
  }
  if (formData.get("request") !== "yes") {
    errors.request =
      "Confirm that this sends a booking request. TwinCO confirms it after checking the bottles are still available.";
  }

  let lines = [] as ReturnType<typeof parseCartLines>;
  try {
    lines = parseCartLines(JSON.parse(field(formData, "lines") || "[]"));
  } catch {
    errors.cart = "The cart could not be read. Go back to the cart and try again.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors, formError: "The booking was not sent. Check the messages below." };
  }

  const result = await placeBooking({
    name,
    phone,
    email,
    address,
    notes,
    areaId,
    payment: field(formData, "payment") || "M-Pesa",
    promotion: field(formData, "promotion") || "None",
    lines,
  });

  if (!result.ok) {
    return { errors: { ...errors, ...result.errors }, formError: result.formError };
  }

  redirect(`/order-confirmation?ref=${encodeURIComponent(result.reference)}`);
}
