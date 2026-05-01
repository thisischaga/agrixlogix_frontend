import React, { useState, useEffect } from "react";

//  Dashboard principal des coopératives 
export default function Dashboard() {

  // Stockage local 
  const [cooperatives, setCooperatives] = useState(() => {
    const saved = localStorage.getItem("coops");
    return saved ? JSON.parse(saved) : [];
  });

  //  Gestion ouverture modal
  const [isOpen, setIsOpen] = useState(false);

  // 🔥 Formulaire (adapté blockchain + site vitrine)
  const [form, setForm] = useState({
    name: "",
    location: "",
    members: "",
    budget: "",
    walletAddress: "", // 🔥 IMPORTANT (blockchain)
    status: "active"
  });

  // 🔥 Sauvegarde automatique dans le navigateur
  useEffect(() => {
    localStorage.setItem("coops", JSON.stringify(cooperatives));
  }, [cooperatives]);

  // 🔥 Mise à jour des champs du formulaire
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔥 Ajouter une coopérative
  const handleSubmit = (e) => {
    e.preventDefault();

    // ⚠️ Validation minimale
    if (!form.name || !form.location || !form.walletAddress) {
      alert("Veuillez remplir les champs obligatoires");
      return;
    }

    const newCoop = {
      id: Date.now(),
      ...form,
      createdAt: new Date().toISOString() // 🔥 traçabilité (important blockchain)
    };

    // 🔥 Ajout en tête de liste
    setCooperatives([newCoop, ...cooperatives]);

    // 🔄 Reset formulaire
    setForm({
      name: "",
      location: "",
      members: "",
      budget: "",
      walletAddress: "",
      status: "active"
    });

    setIsOpen(false);
  };

  // ❌ Supprimer une coopérative
  const deleteCoop = (id) => {
    setCooperatives(cooperatives.filter(c => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* 🔷 HEADER (style dashboard moderne comme ton site vitrine) */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Coopératives</h1>

        <button
          onClick={() => setIsOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700"
        >
          + Nouvelle coopérative
        </button>
      </div>

      {/* 🔷 LISTE DES COOPERATIVES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cooperatives.map((coop) => (
          <div key={coop.id} className="bg-white p-4 rounded-2xl shadow">

            {/* Nom */}
            <h3 className="font-bold text-lg">{coop.name}</h3>

            {/* Localisation */}
            <p className="text-gray-500">📍 {coop.location}</p>

            {/* Infos principales */}
            <p>👥 {coop.members || 0} membres</p>
            <p>💰 {coop.budget || 0} FCFA</p>

            {/* 🔥 Wallet blockchain */}
            <p className="text-xs text-gray-400 break-all">
              Wallet: {coop.walletAddress}
            </p>

            {/* 🔥 Statut */}
            <span className={`text-xs px-2 py-1 rounded inline-block mt-2
              ${coop.status === "active" 
                ? "bg-green-100 text-green-600" 
                : "bg-yellow-100 text-yellow-600"}`}>
              {coop.status}
            </span>

            {/* 🔥 Date de création */}
            <p className="text-xs text-gray-400 mt-2">
              Créé le: {new Date(coop.createdAt).toLocaleDateString()}
            </p>

            {/* Bouton suppression */}
            <button
              onClick={() => deleteCoop(coop.id)}
              className="text-red-500 text-sm mt-3"
            >
              Supprimer
            </button>
          </div>
        ))}
      </div>

      {/* 🔷 MODAL AJOUT COOPERATIVE */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md">

            <h2 className="font-bold text-lg mb-4">
              Ajouter une coopérative
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">

              {/* Nom */}
              <input
                name="name"
                placeholder="Nom de la coopérative"
                value={form.name}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />

              {/* Localisation */}
              <input
                name="location"
                placeholder="Localisation"
                value={form.location}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />

              {/* Membres */}
              <input
                type="number"
                name="members"
                placeholder="Nombre de membres"
                value={form.members}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />

              {/* Budget */}
              <input
                type="number"
                name="budget"
                placeholder="Budget (FCFA)"
                value={form.budget}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />

              {/* 🔥 Wallet blockchain (obligatoire dans ton projet) */}
              <input
                name="walletAddress"
                placeholder="Adresse Wallet (0x...)"
                value={form.walletAddress}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />

              {/* Statut */}
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              >
                <option value="active">Active</option>
                <option value="pending">En attente</option>
              </select>

              {/* Actions */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border rounded"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  Ajouter
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
