import { confirmBookingAction, declineBookingAction } from "@/app/admin/actions";
import type { DeskBooking } from "@/lib/desk";
import { formatKes, formatSize } from "@/lib/format";

export function BookingTable({ bookings, back, empty = "No booking requests in this view." }: { bookings: DeskBooking[]; back: string; empty?: string }) {
  if (bookings.length === 0) {
    return <p className="text-sm text-slate-500">{empty}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-[12px]">
        <thead className="text-[11px] tracking-wide text-slate-400 uppercase">
          <tr>
            <th className="py-2 pr-3 font-medium">Request</th>
            <th className="py-2 pr-3 font-medium">Customer</th>
            <th className="py-2 pr-3 font-medium">Location</th>
            <th className="py-2 pr-3 font-medium">Drinks</th>
            <th className="py-2 pr-3 font-medium">Total</th>
            <th className="py-2 pr-3 font-medium">Availability</th>
            <th className="py-2 font-medium">Desk</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id} className="border-t border-slate-100 align-top">
              <td className="py-3 pr-3">
                <span className="font-semibold text-slate-900">{booking.reference}</span>
                <span className="mt-1 block text-slate-400">{new Date(booking.createdAt).toLocaleString("en-KE")}</span>
                <Status status={booking.status} />
              </td>
              <td className="py-3 pr-3">
                <span className="font-medium">{booking.customerName}</span>
                <span className="mt-1 block text-slate-500">{booking.phone}</span>
                <span className="block text-slate-500">{booking.email}</span>
              </td>
              <td className="py-3 pr-3">
                {booking.locationName}
                <span className="mt-1 block text-slate-500">{booking.province}</span>
                <span className="block text-slate-500">{booking.address}</span>
              </td>
              <td className="py-3 pr-3">
                {booking.lines.map((line) => (
                  <span key={`${line.slug}-${line.variantId}`} className="block">
                    {line.quantity} × {line.name}
                    <span className="text-slate-400"> · {formatSize(line.sizeMl)}</span>
                  </span>
                ))}
              </td>
              <td className="py-3 pr-3 font-semibold">{formatKes(booking.totalKes)}</td>
              <td className={`py-3 pr-3 ${booking.canConfirm || booking.status !== "pending" ? "text-emerald-700" : "text-[#ea2027]"}`}>
                {booking.status === "pending" ? booking.availabilityNote : booking.status === "confirmed" ? "Confirmed" : "Declined"}
              </td>
              <td className="py-3">
                {booking.status === "pending" ? (
                  <div className="flex gap-2">
                    <form action={confirmBookingAction}>
                      <input type="hidden" name="id" value={booking.id} />
                      <input type="hidden" name="back" value={back} />
                      <button
                        type="submit"
                        disabled={!booking.canConfirm}
                        className="rounded-md bg-[#ea2027] px-2.5 py-1.5 text-[11px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                      >
                        Confirm
                      </button>
                    </form>
                    <form action={declineBookingAction}>
                      <input type="hidden" name="id" value={booking.id} />
                      <input type="hidden" name="back" value={back} />
                      <button type="submit" className="rounded-md border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700">
                        Decline
                      </button>
                    </form>
                  </div>
                ) : (
                  <span className="text-slate-400">Closed</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Status({ status }: { status: DeskBooking["status"] }) {
  const styles = {
    pending: "bg-amber-50 text-amber-800",
    confirmed: "bg-emerald-50 text-emerald-700",
    declined: "bg-red-50 text-[#ea2027]",
  };
  return <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${styles[status]}`}>{status}</span>;
}
