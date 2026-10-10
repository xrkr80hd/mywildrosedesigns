import Link from "next/link";
import Image from "next/image";
import { AdminImageUploadField } from "@/components/admin-image-upload-field";
import { getMediaRegistry, mediaSlotUrl } from "@/lib/media-management";
import { updateMedia } from "./actions";
export const dynamic = "force-dynamic";
export default async function AdminMediaPage({ searchParams }: { searchParams: Promise<{ message?: string; error?: string }> }) {
  const params = await searchParams;
  const registry = await getMediaRegistry(true).catch(() => null);
  if (!registry) return <main className="admin-content mx-auto max-w-6xl p-8"><h1 className="text-3xl">Media Manager</h1><p role="alert" className="mt-4">Media storage is unavailable. No changes can be saved. Try again when the connection is restored.</p><Link href="/admin">Back to Admin</Link></main>;
  return <main className="admin-content mx-auto w-full max-w-6xl px-4 py-8">
    <h1 className="text-3xl text-forest">Media Manager</h1>
    <p className="mt-2">Upload and preview images, then choose where they appear.</p>
    <Link href="/admin" className="mt-4 inline-block border border-forest px-4 py-2">Back to Admin</Link>
    {params.message ? <p role="status" className="mt-4 border border-green-600 p-3">{params.message}</p> : null}
    {params.error ? <p role="alert" className="mt-4 border border-red-600 p-3">{params.error}</p> : null}
    <details className="mt-6 border border-rose/30 bg-white p-4" open><summary className="cursor-pointer text-xl font-semibold">Add Image</summary>
      <form action={updateMedia} className="mt-4 grid gap-4"><input type="hidden" name="operation" value="add" />
        <label>Image name<input required maxLength={120} name="name" className="mt-1 block w-full border p-2" /></label>
        <AdminImageUploadField showPreview name="url" label="Image" recommendedSize="Logo: square; homepage image: wide or square" helperText="Upload an image. Save it to the collection, then assign it below." />
        <button className="border border-forest bg-forest px-4 py-2 text-white">Save Image to Collection</button>
      </form>
    </details>
    <details open className="mt-6 border border-rose/30 bg-white p-4"><summary className="cursor-pointer text-xl font-semibold">Website Image Slots</summary>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">{(["logo", "hero"] as const).map(slot => <form key={slot} action={updateMedia} className="border p-4">
        <h2 className="font-semibold">{slot === "logo" ? "Header Logo" : "Homepage Main Image"}</h2>
        <Image src={mediaSlotUrl(registry, slot)} alt={`${slot} preview`} width={400} height={240} className="my-3 h-40 w-full object-contain" />
        <input type="hidden" name="operation" value="assign" /><input type="hidden" name="slot" value={slot} />
        <label>Choose image<select name="id" defaultValue={registry[slot] ?? ""} className="my-2 block w-full border p-2"><option value="">Original image (reset)</option>{registry.items.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <button className="border border-forest px-4 py-2">Save Assignment</button>
      </form>)}</div>
    </details>
    <details open className="mt-6 border border-rose/30 bg-white p-4"><summary className="cursor-pointer text-xl font-semibold">Image Collection ({registry.items.length})</summary>
      <p className="mt-2 text-sm">Removing an image resets its assigned slots. Uploaded files stay available to products and other pages.</p>
      {registry.items.length === 0 ? <p className="mt-4">No images added yet.</p> : <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{registry.items.map(item => <article key={item.id} className="border p-3">
        <Image src={item.url} alt={item.name} width={400} height={300} className="h-44 w-full object-contain" /><p className="my-2 break-words font-semibold">{item.name}</p>
        <p className="mb-2 text-sm">Used: {[registry.logo === item.id ? "Header Logo" : "", registry.hero === item.id ? "Homepage Main Image" : ""].filter(Boolean).join(", ") || "Unassigned"}</p>
        <details className="my-3 border p-2"><summary className="cursor-pointer">Replace Image</summary><form action={updateMedia} className="mt-3 grid gap-3"><input type="hidden" name="operation" value="replace" /><input type="hidden" name="id" value={item.id} /><label>Image name<input name="name" required maxLength={120} defaultValue={item.name} className="block w-full border p-2" /></label><AdminImageUploadField showPreview name="url" defaultValue={item.url} helperText="Upload a replacement. Existing slot assignments are preserved." /><button className="border border-forest px-3 py-2">Save Replacement</button></form></details>
        <a href={item.url} target="_blank" rel="noreferrer" className="underline">View Full Image</a>
        <form action={updateMedia} className="mt-3"><input type="hidden" name="operation" value="remove" /><input type="hidden" name="id" value={item.id} /><button className="border border-red-700 px-3 py-2 text-red-700">Remove from Collection</button></form>
      </article>)}</div>}
    </details>
  </main>;
}
