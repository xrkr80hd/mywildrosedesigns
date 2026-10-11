export function PickupLocationField() {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-semibold text-forest">Pickup location</span>
      <select name="pickupLocation" required defaultValue="" className="w-full border border-rose/20 bg-white px-3 py-3 text-sm focus:border-rose">
        <option value="" disabled>Choose a location</option>
        <option value="Alexandria">Alexandria</option>
        <option value="Pineville">Pineville</option>
        <option value="Simpson">Simpson</option>
      </select>
    </label>
  );
}
