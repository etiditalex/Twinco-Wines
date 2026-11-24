import { createDeskAdminAction, setDeskAdminActiveAction } from "@/app/admin/actions";
import { adminRoleLabel, adminRoles, listDeskAdmins, type DeskAdminRow } from "@/lib/admin-accounts";
import { superiorAdminEmail } from "@/lib/admin-session";

const fieldClass = "h-10 rounded-lg border border-slate-200 px-3 outline-none focus:border-[#ea2027]";

export async function AdminRoster() {
  const roster = await listDeskAdmins();
  return (
    <div className="grid gap-4">
      <section className="rounded-xl bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
        <h2 className="text-[15px] font-semibold text-slate-900">Admins</h2>
        <p className="mt-1 text-[12px] leading-5 text-slate-500">
          The superior admin creates the other levels. New accounts are stored in Supabase and sign in with their own email and password.
        </p>
        {roster.error ? <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">{roster.error}</p> : null}
        <form action={createDeskAdminAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Name
            <input name="name" required className={fieldClass} />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Email
            <input name="email" type="email" autoComplete="off" required className={fieldClass} />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Password
            <input name="password" type="password" autoComplete="new-password" minLength={8} required className={fieldClass} />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Level
            <select name="role" defaultValue="admin" className={fieldClass}>
              {adminRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="h-10 w-fit rounded-lg bg-[#ea2027] px-4 text-sm font-semibold text-white sm:col-span-2">
            Create admin
          </button>
        </form>
      </section>
      <section className="rounded-xl bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
        <h2 className="text-[15px] font-semibold text-slate-900">Desk access</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-[11px] tracking-wide text-slate-400 uppercase">
              <tr>
                <th className="py-2 pr-3 font-medium">Name</th>
                <th className="py-2 pr-3 font-medium">Email</th>
                <th className="py-2 pr-3 font-medium">Level</th>
                <th className="py-2 font-medium">Access</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-100">
                <td className="py-3 pr-3 font-semibold text-slate-900">Superior admin</td>
                <td className="py-3 pr-3">{superiorAdminEmail()}</td>
                <td className="py-3 pr-3">Super admin</td>
                <td className="py-3 text-emerald-700">On</td>
              </tr>
              {roster.rows.map((row) => (
                <AdminRow key={row.id} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function AdminRow({ row }: { row: DeskAdminRow }) {
  return (
    <tr className="border-t border-slate-100">
      <td className="py-3 pr-3 font-semibold text-slate-900">{row.name}</td>
      <td className="py-3 pr-3">{row.email}</td>
      <td className="py-3 pr-3">{adminRoleLabel(row.role)}</td>
      <td className="py-3">
        <form action={setDeskAdminActiveAction} className="flex items-center gap-2">
          <input type="hidden" name="id" value={row.id} />
          <input type="hidden" name="active" value={row.active ? "no" : "yes"} />
          <span className={row.active ? "text-emerald-700" : "text-slate-400"}>{row.active ? "On" : "Off"}</span>
          <button type="submit" className="rounded-md border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700">
            {row.active ? "Turn off" : "Turn on"}
          </button>
        </form>
      </td>
    </tr>
  );
}
